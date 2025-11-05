import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import ProjectCard from '../components/projects/ProjectCard'
import Button from '../components/ui/Button'
import localStorageService from '../utils/localStorage'

export default function Projects() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    fetchProjects()
  }, [])
  
  const fetchProjects = async () => {
    try {
      const response = await localStorageService.projects.getAll()
      setProjects(response.data.projects || [])
    } catch (error) {
      console.error('Error fetching projects:', error)
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <MainLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Projects</h1>
        <Link to="/projects/create">
          <Button>Post a Project</Button>
        </Link>
      </div>
      
      {loading ? (
        <div>Loading...</div>
      ) : projects.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-neutral-600 mb-4">No projects found.</p>
          <Link to="/projects/create">
            <Button>Post Your First Project</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </MainLayout>
  )
}

