import React, { useState } from 'react'
import Button from '../ui/Button'

export default function ChatInput({ onSend }) {
  const [message, setMessage] = useState('')
  const [attachments, setAttachments] = useState([])
  
  const handleSubmit = (e) => {
    e.preventDefault()
    if (message.trim() || attachments.length > 0) {
      onSend(message, attachments)
      setMessage('')
      setAttachments([])
    }
  }
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }
  
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files)
    setAttachments([...attachments, ...files])
  }
  
  const removeAttachment = (index) => {
    setAttachments(attachments.filter((_, i) => i !== index))
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {attachments.map((file, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 bg-neutral-100 px-2 py-1 rounded text-sm"
            >
              <span className="truncate max-w-xs">{file.name}</span>
              <button
                type="button"
                onClick={() => removeAttachment(idx)}
                className="text-danger-600 hover:text-danger-700"
                aria-label="Remove attachment"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
      
      <div className="flex gap-2">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message... (Press Enter to send, Shift+Enter for new line)"
          className="flex-1 px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
          rows={2}
          aria-label="Message input"
        />
        <div className="flex flex-col gap-2">
          <label className="cursor-pointer">
            <input
              type="file"
              multiple
              onChange={handleFileChange}
              className="hidden"
              aria-label="Attach file"
            />
            <span className="px-3 py-2 bg-neutral-100 rounded-md hover:bg-neutral-200 inline-block">
              📎
            </span>
          </label>
          <Button type="submit" disabled={!message.trim() && attachments.length === 0}>
            Send
          </Button>
        </div>
      </div>
    </form>
  )
}

