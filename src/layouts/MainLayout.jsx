import React, { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function MainLayout({ children, showSidebar = false, sidebarRight, fullWidth = false }) {
  const location = useLocation()
  const mainRef = useRef(null)
  
  useEffect(() => {
    // Scroll to top on route change
    window.scrollTo(0, 0)
    
    // Focus first h1 in main
    const firstH1 = mainRef.current?.querySelector('h1')
    if (firstH1) {
      firstH1.focus()
    }
  }, [location.pathname])
  
  // For home page, don't wrap in container
  if (fullWidth || location.pathname === '/') {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main ref={mainRef} role="main" aria-live="polite">
          {children}
        </main>
        <Footer />
      </div>
    )
  }
  
  // Check if we're on the dashboard route
  const isDashboardRoute = location.pathname === '/dashboard'
  
  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <Navbar />
      <main
        ref={mainRef}
        className={`flex-1 pt-4 sm:pt-6 px-4 sm:px-6 mx-auto pb-6 ${isDashboardRoute ? 'max-w-[1440px]' : 'container-main'}`}
        role="main"
        aria-live="polite"
      >
        {showSidebar && sidebarRight ? (
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1 lg:w-[70%]">{children}</div>
            <aside className="lg:w-[30%]">{sidebarRight}</aside>
          </div>
        ) : (
          children
        )}
      </main>
      <Footer />
    </div>
  )
}

