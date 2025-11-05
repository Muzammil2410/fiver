import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import MainLayout from '../../layouts/MainLayout'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Textarea from '../../components/ui/Textarea'
import localStorageService from '../../utils/localStorage'
import { toast } from '../../utils/toast'

export default function CreateProject() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    budgetMin: '',
    budgetMax: '',
    deliveryTime: '',
    attachments: [],
  })
  const [loading, setLoading] = useState(false)
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      await localStorageService.projects.create(formData)
      toast.success('Project created successfully!')
      navigate('/projects')
    } catch (error) {
      console.error('Error creating project:', error)
      toast.error('Failed to create project')
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <MainLayout>
      <Card className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Post a Project</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Project Title *"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            required
          />
          
          <Textarea
            label="Description *"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            rows={8}
            required
          />
          
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Min Budget (PKR) *"
              type="number"
              value={formData.budgetMin}
              onChange={(e) =>
                setFormData({ ...formData, budgetMin: e.target.value })
              }
              required
            />
            
            <Input
              label="Max Budget (PKR) *"
              type="number"
              value={formData.budgetMax}
              onChange={(e) =>
                setFormData({ ...formData, budgetMax: e.target.value })
              }
              required
            />
          </div>
          
          <Input
            label="Delivery Time (days) *"
            type="number"
            value={formData.deliveryTime}
            onChange={(e) =>
              setFormData({ ...formData, deliveryTime: e.target.value })
            }
            required
          />
          
          <div className="flex gap-2">
            <Button type="submit" loading={loading}>
              Post Project
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/projects')}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </MainLayout>
  )
}

