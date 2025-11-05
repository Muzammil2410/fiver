import React from 'react'
import Badge from '../ui/Badge'

export default function OrderTimeline({ order }) {
  const milestones = [
    {
      id: 'created',
      label: 'Order Created',
      status: order.createdAt ? 'completed' : 'pending',
      date: order.createdAt,
      by: order.buyer,
    },
    {
      id: 'payment_uploaded',
      label: 'Payment Uploaded',
      status: order.paymentUploadedAt ? 'completed' : 'pending',
      date: order.paymentUploadedAt,
      by: order.buyer,
    },
    {
      id: 'payment_verified',
      label: 'Payment Verified',
      status: order.paymentVerifiedAt ? 'completed' : 'pending',
      date: order.paymentVerifiedAt,
      by: 'Admin',
    },
    {
      id: 'work_started',
      label: 'Work Started',
      status: order.workStartedAt ? 'completed' : 'pending',
      date: order.workStartedAt,
      by: order.seller,
    },
    {
      id: 'delivery_submitted',
      label: 'Delivery Submitted',
      status: order.deliverySubmittedAt ? 'completed' : 'pending',
      date: order.deliverySubmittedAt,
      by: order.seller,
    },
    {
      id: 'client_accepted',
      label: 'Client Accepted',
      status: order.clientAcceptedAt ? 'completed' : 'pending',
      date: order.clientAcceptedAt,
      by: order.buyer,
    },
    {
      id: 'completed',
      label: 'Completed',
      status: order.completedAt ? 'completed' : 'pending',
      date: order.completedAt,
      by: 'System',
    },
  ]
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">Order Timeline</h3>
      
      <div className="relative">
        {milestones.map((milestone, index) => (
          <div key={milestone.id} className="flex gap-4 pb-6">
            {/* Line */}
            {index < milestones.length - 1 && (
              <div
                className={`absolute left-4 top-8 w-0.5 h-full ${
                  milestone.status === 'completed'
                    ? 'bg-primary-600'
                    : 'bg-neutral-200'
                }`}
              />
            )}
            
            {/* Dot */}
            <div
              className={`relative z-10 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                milestone.status === 'completed'
                  ? 'bg-primary-600'
                  : 'bg-neutral-200'
              }`}
            >
              {milestone.status === 'completed' && (
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
            </div>
            
            {/* Content */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium">{milestone.label}</h4>
                {milestone.status === 'completed' && (
                  <Badge variant="success" size="sm">
                    Completed
                  </Badge>
                )}
              </div>
              {milestone.date && (
                <p className="text-sm text-neutral-600">
                  {new Date(milestone.date).toLocaleString()}
                </p>
              )}
              {milestone.by && (
                <p className="text-sm text-neutral-500">By {milestone.by}</p>
              )}
              {milestone.attachments && milestone.attachments.length > 0 && (
                <div className="mt-2">
                  {milestone.attachments.map((att, idx) => (
                    <a
                      key={idx}
                      href={att.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary-600 hover:underline"
                    >
                      {att.name}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

