import React, { useState, useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import ChatInput from './ChatInput'
import Avatar from '../ui/Avatar'
import * as chatService from '../../services/chat'
import { useAuthStore } from '../../store/useAuthStore'

export default function ChatWindow({ orderId }) {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [connected, setConnected] = useState(false)
  const messagesEndRef = useRef(null)
  const socketRef = useRef(null)
  const { token, user } = useAuthStore()

  useEffect(() => {
    if (!orderId || !token) return

    // Initialize Socket.io connection
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://freelancer-services-platform-backend.onrender.com/api'
    const socket = io(API_BASE_URL, {
      auth: {
        token: token
      },
      transports: ['websocket', 'polling']
    })

    socketRef.current = socket

    // Connection events
    socket.on('connect', () => {
      console.log('✅ Connected to chat server')
      setConnected(true)

      // Join the order room
      socket.emit('join_order', orderId)
    })

    socket.on('disconnect', () => {
      console.log('❌ Disconnected from chat server')
      setConnected(false)
    })

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error)
      setConnected(false)
    })

    // Listen for new messages
    socket.on('new_message', (message) => {
      setMessages((prev) => [...prev, message])
    })

    socket.on('error', (error) => {
      console.error('Socket error:', error)
    })

    // Fetch initial messages
    fetchMessages()

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.emit('leave_order', orderId)
        socketRef.current.disconnect()
      }
    }
  }, [orderId, token])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const fetchMessages = async () => {
    try {
      const response = await chatService.getMessages(orderId)
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
    if (!socketRef.current || !connected) {
      console.error('Socket not connected')
      return
    }

    try {
      // Emit message through socket for real-time delivery
      socketRef.current.emit('send_message', {
        orderId,
        text,
        attachments: attachments || []
      })
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  if (loading) {
    return <div className="p-4 text-center">Loading messages...</div>
  }

  return (
    <div className="flex flex-col h-[600px] border border-neutral-200 rounded-lg">
      {/* Connection status indicator */}
      <div className={`px-4 py-2 border-b border-neutral-200 flex items-center gap-2 ${connected ? 'bg-green-50' : 'bg-yellow-50'
        }`}>
        <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-yellow-500'}`} />
        <span className="text-xs text-neutral-600">
          {connected ? 'Connected' : 'Connecting...'}
        </span>
      </div>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-neutral-500 py-8">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((message) => {
            // Check if message is from current user (outgoing) or from others (incoming)
            const currentUserId = user?._id || user?.id
            const messageSenderId = message.senderId?.toString()
            const isOutgoing = currentUserId && messageSenderId && (
              messageSenderId === currentUserId.toString() ||
              messageSenderId === String(currentUserId)
            )

            return (
              <div
                key={message._id || message.id}
                className={`flex gap-3 ${isOutgoing ? 'flex-row-reverse' : 'flex-row'
                  }`}
              >
                <Avatar
                  src={message.senderAvatar}
                  name={message.senderName}
                  size="sm"
                />
                <div
                  className={`flex-1 max-w-[70%] ${isOutgoing
                    ? 'items-end'
                    : 'items-start'
                    }`}
                >
                  <div
                    className={`rounded-lg p-3 ${isOutgoing
                      ? 'bg-primary-600 text-white'
                      : 'bg-neutral-100 text-neutral-900'
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
            )
          })
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

