import React from 'react'
import { Link } from 'react-router-dom'
import Card from '../ui/Card'
import Badge from '../ui/Badge'
import Button from '../ui/Button'

export default function ProjectCard({ project }) {
  return (
    <Card>
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <Link
            to={`/projects/${project.id}`}
            className="text-lg font-semibold text-primary-600 hover:underline"
          >
            {project.title}
          </Link>
          <p className="text-sm text-neutral-600 mt-1">
            Posted {new Date(project.createdAt).toLocaleDateString()}
          </p>
        </div>
        <Badge variant="default">{project.status}</Badge>
      </div>
      
      <p className="text-neutral-700 mb-4 line-clamp-3">{project.description}</p>
      
      <div className="flex items-center justify-between">
        <div className="text-sm">
          <p className="font-semibold">
            Budget: PKR {project.budgetMin} - PKR {project.budgetMax}
          </p>
          <p className="text-neutral-600">
            {project.bidsCount || 0} bids
          </p>
        </div>
        <Link to={`/projects/${project.id}`}>
          <Button variant="secondary" size="sm">
            View Details
          </Button>
        </Link>
      </div>
    </Card>
  )
}

