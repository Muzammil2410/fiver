import React from 'react'
import MainLayout from '../layouts/MainLayout'
import AuthForm from '../components/auth/AuthForm'

export default function Login() {
  return (
    <MainLayout>
      <AuthForm mode="login" />
    </MainLayout>
  )
}

