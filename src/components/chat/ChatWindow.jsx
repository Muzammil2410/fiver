import React, { useState, useEffect, useRef } from 'react'
import ChatInput from './ChatInput'
import Avatar from '../ui/Avatar'
import localStorageService from '../../utils/localStorage'

export default function ChatWindow({ orderId }) {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef(null)
  const pollIntervalRef = useRef(null)
  
  useEffect(() => {
    fetchMessages()
    
    // Poll for new messages every 5 seconds
    pollIntervalRef.current = setInterval(() => {
      fetchMessages()
    }, 5000)
    
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current)
      }
    }
  }, [orderId])
  
  useEffect(() => {
    scrollToBottom()
  }, [messages])
  
  const fetchMessages = async () => {
    try {
      const response = await localStorageService.messages.getByOrderId(orderId)
      setMessages(response.data.messages || [])
    } catch (error) {
      console.error('Error fetching messages:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }
  
  const handleSendMessage = async (text, attachments) => {
    try {
      await localStorageService.messages.create(orderId, {
        text: text,
        attachments: attachments || [],
      })
      
      // Refresh messages
      fetchMessages()
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }
  
  if (loading) {
    return <div className="p-4 text-center">Loading messages...</div>
  }
  
  return (
    <div className="flex flex-col h-[600px] border border-neutral-200 rounded-lg">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-neutral-500 py-8">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.senderType === 'buyer' ? 'flex-row' : 'flex-row-reverse'
              }`}
            >
              <Avatar
                src={message.senderAvatar}
                name={message.senderName}
                size="sm"
              />
              <div
                className={`flex-1 max-w-[70%] ${
                  message.senderType === 'buyer'
                    ? 'items-start'
                    : 'items-end'
                }`}
              >
                <div
                  className={`rounded-lg p-3 ${
                    message.senderType === 'buyer'
                      ? 'bg-neutral-100 text-neutral-900'
                      : 'bg-primary-600 text-white'
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                  {message.attachments && message.attachments.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {message.attachments.map((att, idx) => (
                        <a
                          key={idx}
                          href={att.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm underline"
                        >
                          {att.name}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-xs text-neutral-500 mt-1">
                  {new Date(message.createdAt).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input */}
      <div className="border-t border-neutral-200 p-4">
        <ChatInput onSend={handleSendMessage} />
      </div>
    </div>
  )
}

