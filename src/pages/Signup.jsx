import React from 'react'
import { useSearchParams } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import AuthForm from '../components/auth/AuthForm'

export default function Signup() {
  const [searchParams] = useSearchParams()
  const role = searchParams.get('role') || 'client' // Default to 'client' for "Join" button
  
  return (
    <MainLayout>
      <AuthForm mode="signup" userRole={role} />
    </MainLayout>
  )
}

