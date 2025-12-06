import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import Button from '../components/ui/Button'

export default function JoinPage() {
  return (
    <MainLayout>
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-8 px-4">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-neutral-900 mb-2">
              Create a new account
            </h1>
            <p className="text-sm text-neutral-600">
              Already have an account?{' '}
              <Link to="/client-login" className="text-primary-600 hover:text-primary-700 font-semibold underline">
                Sign in
              </Link>
            </p>
          </div>

          {/* Social Login Buttons */}
          <div className="space-y-3 mb-4">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                // TODO: Implement Google OAuth
                console.log('Google login')
              }}
              className="w-full py-3 px-4 rounded-lg border border-neutral-300 bg-white hover:bg-neutral-50 transition-colors flex items-center justify-center gap-3 text-base font-medium text-neutral-900 cursor-pointer"
            >
              <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>Continue with Google</span>
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                // TODO: Implement email signup
                console.log('Continue with email')
              }}
              className="w-full py-3 px-4 rounded-lg border border-neutral-300 bg-neutral-50 hover:bg-neutral-100 transition-colors flex items-center justify-center gap-3 text-base font-medium text-neutral-900 cursor-pointer"
            >
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>Continue with email</span>
            </button>
          </div>

          {/* OR Separator */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-neutral-300"></div>
            <span className="text-neutral-500 text-sm uppercase">OR</span>
            <div className="flex-1 h-px bg-neutral-300"></div>
          </div>

          {/* Additional Social Buttons */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                // TODO: Implement Apple OAuth
                console.log('Apple login')
              }}
              className="w-full py-3 px-4 rounded-lg border border-neutral-300 bg-white hover:bg-neutral-50 transition-colors flex items-center justify-center gap-3 text-base font-medium text-neutral-900 cursor-pointer"
            >
              <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
              <span>Apple</span>
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                // TODO: Implement Facebook OAuth
                console.log('Facebook login')
              }}
              className="w-full py-3 px-4 rounded-lg border border-neutral-300 bg-white hover:bg-neutral-50 transition-colors flex items-center justify-center gap-3 text-base font-medium text-neutral-900 cursor-pointer"
            >
              <svg className="w-5 h-5 flex-shrink-0" fill="#1877F2" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span>Facebook</span>
            </button>
          </div>

          {/* Terms and Privacy */}
          <p className="text-xs text-neutral-500 text-center">
            By joining, you agree to the{' '}
            <Link to="/terms" className="text-primary-600 hover:underline">
              Terms of Service
            </Link>
            {' '}and to occasionally receive emails from us. Please read our{' '}
            <Link to="/privacy" className="text-primary-600 hover:underline">
              Privacy Policy
            </Link>
            {' '}to learn how we use your personal data.
          </p>
        </div>
      </div>
    </MainLayout>
  )
}

