// LocalStorage service - mimics API calls for frontend-only development

// Initialize default data if not exists
const initializeData = () => {
  if (!localStorage.getItem('gigs')) {
    // Sample gigs data
    const sampleGigs = [
      {
        id: '1',
        title: 'I will design a modern logo for your brand',
        description: 'Professional logo design with unlimited revisions. Fast delivery and high quality.',
        price: 5000,
        rating: 4.5,
        reviewCount: 23,
        deliveryTime: 3,
        category: 'design',
        coverImage: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&h=600&fit=crop',
        seller: {
          id: '1',
          name: 'John Doe',
          avatar: null,
          level: 'Expert',
          title: 'Logo Designer',
        },
        images: [],
        skills: ['Logo Design', 'Branding'],
        packages: [
          {
            name: 'Basic',
            price: 3000,
            description: 'Simple logo design',
            deliveryTime: 5,
            revisions: 2,
          },
          {
            name: 'Standard',
            price: 5000,
            description: 'Professional logo with variations',
            deliveryTime: 3,
            revisions: 3,
          },
          {
            name: 'Premium',
            price: 8000,
            description: 'Complete branding package',
            deliveryTime: 2,
            revisions: 5,
          },
        ],
        requirements: ['Brand name', 'Industry', 'Color preferences'],
        createdAt: new Date().toISOString(),
      },
      {
        id: '2',
        title: 'I will create a full-stack web application',
        description: 'Complete web application with React frontend and Node.js backend.',
        price: 50000,
        rating: 5.0,
        reviewCount: 12,
        deliveryTime: 14,
        category: 'development',
        coverImage: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=600&fit=crop',
        seller: {
          id: '2',
          name: 'Jane Smith',
          avatar: null,
          level: 'Expert',
          title: 'Full Stack Developer',
        },
        images: [],
        skills: ['React', 'Node.js', 'MongoDB'],
        createdAt: new Date().toISOString(),
      },
    ]
    localStorage.setItem('gigs', JSON.stringify(sampleGigs))
  }

  if (!localStorage.getItem('orders')) {
    localStorage.setItem('orders', JSON.stringify([]))
  }

  if (!localStorage.getItem('projects')) {
    localStorage.setItem('projects', JSON.stringify([]))
  }

  if (!localStorage.getItem('messages')) {
    localStorage.setItem('messages', JSON.stringify([]))
  }

  if (!localStorage.getItem('payments')) {
    localStorage.setItem('payments', JSON.stringify([]))
  }

  if (!localStorage.getItem('reviews')) {
    localStorage.setItem('reviews', JSON.stringify([]))
  }

  if (!localStorage.getItem('withdrawals')) {
    localStorage.setItem('withdrawals', JSON.stringify([]))
  }
}

// Initialize on import (with error handling)
try {
  if (typeof window !== 'undefined') {
    initializeData()
  }
} catch (error) {
  console.warn('Failed to initialize localStorage data:', error)
}

// Helper to get data
const getData = (key) => {
  const data = localStorage.getItem(key)
  return data ? JSON.parse(data) : []
}

// Helper to set data
const setData = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data))
}

// Gigs
export const gigsService = {
  getAll: (params = {}) => {
    // Ensure data is initialized
    try {
      initializeData()
    } catch (e) {
      console.warn('Failed to initialize data:', e)
    }
    
    let gigs = getData('gigs')
    
    // Ensure we have an array
    if (!Array.isArray(gigs)) {
      gigs = []
    }
    
    // Filter by sellerId (for sellers viewing their own gigs)
    // If sellerId is provided, filter; otherwise show all gigs (for clients)
    if (params.sellerId) {
      gigs = gigs.filter((g) => {
        const sellerId = g.seller?.id || g.sellerId
        return String(sellerId) === String(params.sellerId)
      })
    }
    // If no sellerId, show all gigs (for clients)
    
    // Filter by search query
    if (params.q) {
      const query = params.q.toLowerCase()
      gigs = gigs.filter(
        (g) =>
          g.title.toLowerCase().includes(query) ||
          g.description?.toLowerCase().includes(query)
      )
    }
    
    // Filter by category
    if (params.category) {
      gigs = gigs.filter((g) => g.category === params.category)
    }
    
    // Filter by price (use lowest package price if packages exist)
    if (params.minPrice) {
      gigs = gigs.filter((g) => {
        const minPrice = g.packages && g.packages.length > 0
          ? Math.min(...g.packages.map(p => p.price || 0))
          : g.price || 0
        return minPrice >= parseInt(params.minPrice)
      })
    }
    if (params.maxPrice) {
      gigs = gigs.filter((g) => {
        const minPrice = g.packages && g.packages.length > 0
          ? Math.min(...g.packages.map(p => p.price || 0))
          : g.price || 0
        return minPrice <= parseInt(params.maxPrice)
      })
    }
    
    // Filter by delivery time
    if (params.deliveryTime) {
      gigs = gigs.filter((g) => {
        const deliveryTime = g.packages && g.packages.length > 0
          ? Math.min(...g.packages.map(p => p.deliveryTime || 0))
          : g.deliveryTime || 0
        return deliveryTime <= parseInt(params.deliveryTime)
      })
    }
    
    // Filter by experience level
    if (params.level) {
      const levelMap = {
        beginner: 'Beginner',
        intermediate: 'Intermediate',
        expert: 'Expert',
      }
      gigs = gigs.filter((g) => g.seller?.level === levelMap[params.level])
    }
    
    // Sort
    if (params.sort) {
      switch (params.sort) {
        case 'newest':
          gigs.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
          break
        case 'price_asc':
          gigs.sort((a, b) => {
            const priceA = a.packages && a.packages.length > 0
              ? Math.min(...a.packages.map(p => p.price || 0))
              : a.price || 0
            const priceB = b.packages && b.packages.length > 0
              ? Math.min(...b.packages.map(p => p.price || 0))
              : b.price || 0
            return priceA - priceB
          })
          break
        case 'price_desc':
          gigs.sort((a, b) => {
            const priceA = a.packages && a.packages.length > 0
              ? Math.min(...a.packages.map(p => p.price || 0))
              : a.price || 0
            const priceB = b.packages && b.packages.length > 0
              ? Math.min(...b.packages.map(p => p.price || 0))
              : b.price || 0
            return priceB - priceA
          })
          break
        case 'best':
        default:
          gigs.sort((a, b) => (b.rating || 0) - (a.rating || 0))
          break
      }
    } else {
      // Default sort by newest
      gigs.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    }
    
    // Always return consistent structure
    return Promise.resolve({ 
      data: { 
        gigs: Array.isArray(gigs) ? gigs : [], 
        pagination: {
          hasMore: false,
          page: params.page || 1,
          total: Array.isArray(gigs) ? gigs.length : 0
        }
      } 
    })
  },
  
  getById: (id) => {
    const gigs = getData('gigs')
    // Handle both id and _id formats (MongoDB)
    const gig = gigs.find((g) => 
      g.id === id || 
      g._id === id || 
      String(g.id) === String(id) || 
      String(g._id) === String(id)
    )
    return Promise.resolve({ data: gig || null })
  },
  
  create: (gigData) => {
    const gigs = getData('gigs')
    const currentUser = JSON.parse(localStorage.getItem('auth-storage') || '{}')
    const user = currentUser.state?.user
    
    // Use seller from gigData if provided, otherwise use current user
    const seller = gigData.seller || {
      id: user?.id || '1',
      name: user?.name || 'Seller',
      avatar: user?.avatar || null,
      level: 'Intermediate',
      title: gigData.category || 'Freelancer',
    }
    
    const newGig = {
      id: Date.now().toString(),
      ...gigData,
      seller: seller,
      rating: 0,
      reviewCount: 0,
      images: gigData.images || [],
      skills: gigData.skills || [],
      createdAt: new Date().toISOString(),
    }
    
    gigs.push(newGig)
    setData('gigs', gigs)
    return Promise.resolve({ data: newGig })
  },
  
  update: (id, gigData) => {
    const gigs = getData('gigs')
    const index = gigs.findIndex((g) => g.id === id)
    if (index > -1) {
      gigs[index] = { ...gigs[index], ...gigData }
      setData('gigs', gigs)
      return Promise.resolve({ data: gigs[index] })
    }
    return Promise.reject(new Error('Gig not found'))
  },
  
  delete: (id) => {
    const gigs = getData('gigs')
    const filtered = gigs.filter((g) => g.id !== id)
    setData('gigs', filtered)
    return Promise.resolve({ data: { success: true } })
  },
}

// Orders
export const ordersService = {
  getAll: (params = {}) => {
    const orders = getData('orders')
    const currentUser = JSON.parse(localStorage.getItem('auth-storage') || '{}')
    const userId = currentUser.state?.user?.id
    
    // Filter by current user
    let userOrders = orders.filter((o) => o.buyerId === userId || o.sellerId === userId)
    
    return Promise.resolve({ data: { orders: userOrders } })
  },
  
  getById: (id) => {
    const orders = getData('orders')
    const order = orders.find((o) => o.id === id)
    return Promise.resolve({ data: order || null })
  },
  
  create: (orderData) => {
    const orders = getData('orders')
    const gigs = getData('gigs')
    const currentUser = JSON.parse(localStorage.getItem('auth-storage') || '{}')
    const user = currentUser.state?.user
    
    const gig = gigs.find((g) => g.id === orderData.gigId)
    if (!gig) {
      return Promise.reject(new Error('Gig not found'))
    }
    
    const selectedPackage = gig.packages?.find((p) => p.name === orderData.package) || {
      price: gig.price,
      deliveryTime: gig.deliveryTime,
    }
    
    const newOrder = {
      id: Date.now().toString(),
      gigId: orderData.gigId,
      gigTitle: gig.title,
      buyerId: user?.id,
      buyerName: user?.name,
      sellerId: gig.seller?.id,
      sellerName: gig.seller?.name,
      amount: selectedPackage.price,
      package: orderData.package || 'standard',
      status: orderData.paymentScreenshot ? 'Payment pending verify' : 'Pending payment',
      createdAt: new Date().toISOString(),
      paymentScreenshot: orderData.paymentScreenshot || null,
      paymentUploadedAt: orderData.paymentScreenshot ? new Date().toISOString() : null,
      paymentVerifiedAt: null,
      workStartedAt: null,
      deliverySubmittedAt: null,
      clientAcceptedAt: null,
      completedAt: null,
      requirements: orderData.requirements || '',
      deliveryTime: selectedPackage.deliveryTime || gig.deliveryTime || 0,
    }
    
    orders.push(newOrder)
    setData('orders', orders)
    return Promise.resolve({ data: newOrder })
  },
  
  update: (id, updateData) => {
    const orders = getData('orders')
    const index = orders.findIndex((o) => o.id === id || o._id === id)
    if (index > -1) {
      // If status is being updated to 'Payment confirmed', change to 'Active'
      if (updateData.status === 'Payment confirmed') {
        updateData.status = 'Active'
        updateData.workStartedAt = updateData.workStartedAt || new Date().toISOString()
      }
      // If status is being updated to 'Completed', set completedAt
      if (updateData.status === 'Completed') {
        updateData.completedAt = updateData.completedAt || new Date().toISOString()
      }
      orders[index] = { ...orders[index], ...updateData }
      setData('orders', orders)
      return Promise.resolve({ data: orders[index] })
    }
    return Promise.reject(new Error('Order not found'))
  },
}

// Messages
export const messagesService = {
  getByOrderId: (orderId) => {
    const messages = getData('messages')
    const orderMessages = messages.filter((m) => m.orderId === orderId)
    return Promise.resolve({ data: { messages: orderMessages } })
  },
  
  create: (orderId, messageData) => {
    const messages = getData('messages')
    const currentUser = JSON.parse(localStorage.getItem('auth-storage') || '{}')
    const user = currentUser.state?.user
    
    // Determine sender type based on order
    const order = orders.find((o) => o.id === orderId)
    const senderType = order?.buyerId === user?.id ? 'buyer' : 'seller'
    
    const newMessage = {
      id: Date.now().toString(),
      orderId,
      text: messageData.text || messageData.message || '',
      senderId: user?.id,
      senderName: user?.name,
      senderAvatar: user?.avatar,
      senderType,
      attachments: messageData.attachments || [],
      createdAt: new Date().toISOString(),
    }
    
    messages.push(newMessage)
    setData('messages', messages)
    return Promise.resolve({ data: newMessage })
  },
}

// Payments
export const paymentsService = {
  create: (paymentData) => {
    const payments = getData('payments')
    const newPayment = {
      id: Date.now().toString(),
      ...paymentData,
      status: 'pending',
      createdAt: new Date().toISOString(),
    }
    payments.push(newPayment)
    setData('payments', payments)
    
    // Update order status
    if (paymentData.orderId) {
      const orders = getData('orders')
      const order = orders.find((o) => o.id === paymentData.orderId)
      if (order) {
        order.status = 'Payment pending verify'
        order.paymentUploadedAt = new Date().toISOString()
        setData('orders', orders)
      }
    }
    
    return Promise.resolve({ data: newPayment })
  },
  
  uploadFile: (file) => {
    // Simulate file upload - in real app, this would upload to server
    const fileUrl = URL.createObjectURL(file)
    return Promise.resolve({
      data: {
        url: fileUrl,
        name: file.name,
      },
    })
  },
}

// Projects
export const projectsService = {
  getAll: () => {
    const projects = getData('projects')
    return Promise.resolve({ data: { projects } })
  },
  
  create: (projectData) => {
    const projects = getData('projects')
    const currentUser = JSON.parse(localStorage.getItem('auth-storage') || '{}')
    const user = currentUser.state?.user
    
    const newProject = {
      id: Date.now().toString(),
      ...projectData,
      creatorId: user?.id,
      creatorName: user?.name,
      status: 'Open',
      bidsCount: 0,
      createdAt: new Date().toISOString(),
    }
    
    projects.push(newProject)
    setData('projects', projects)
    return Promise.resolve({ data: newProject })
  },
}

// Reviews
export const reviewsService = {
  getByGigId: (gigId) => {
    const reviews = getData('reviews')
    // Handle both id and _id formats, and filter only public reviews
    const gigReviews = reviews.filter((r) => {
      const matchesGig = 
        r.gigId === gigId || 
        String(r.gigId) === String(gigId) ||
        (r.gigId && String(r.gigId) === String(gigId))
      // Only return public reviews or all reviews if isPublic is not set (backward compatibility)
      return matchesGig && (r.isPublic !== false)
    })
    
    const averageRating =
      gigReviews.length > 0
        ? gigReviews.reduce((sum, r) => sum + r.rating, 0) / gigReviews.length
        : 0
    
    return Promise.resolve({
      data: {
        reviews: gigReviews,
        averageRating,
      },
    })
  },
  
  getByOrderId: (orderId) => {
    const reviews = getData('reviews')
    // Handle both id and _id formats
    const orderReview = reviews.find((r) => 
      r.orderId === orderId || 
      String(r.orderId) === String(orderId)
    )
    return Promise.resolve({ data: orderReview || null })
  },
  
  create: async (orderId, reviewData) => {
    // This method is deprecated - use createWithOrder instead
    // But keep for backward compatibility
    return this.createWithOrder(orderId, null, reviewData)
  },
  
  createWithOrder: async (orderId, order, reviewData) => {
    // If order is not provided, try to get it from localStorage as fallback
    if (!order) {
      const orders = getData('orders')
      // Try to find order by both id and _id (handle MongoDB _id format)
      order = orders.find((o) => {
        const oId = o.id || o._id
        const oIdStr = String(oId || '')
        const orderIdStr = String(orderId || '')
        return oId === orderId || 
               oIdStr === orderIdStr ||
               oIdStr.includes(orderIdStr) ||
               orderIdStr.includes(oIdStr)
      })
    }
    
    if (!order || !order.gigId) {
      console.error('Order not found or missing gigId. OrderId:', orderId, 'Order:', order)
      return Promise.reject(new Error('Order not found or invalid. Please ensure the order exists and is completed.'))
    }
    
    const currentUser = JSON.parse(localStorage.getItem('auth-storage') || '{}')
    const user = currentUser.state?.user
    
    const newReview = {
      id: Date.now().toString(),
      orderId: orderId, // Store the original orderId
      gigId: order.gigId,
      rating: reviewData.rating,
      comment: reviewData.comment || '',
      isPublic: reviewData.isPublic !== false,
      reviewerId: user?.id,
      reviewerName: user?.name,
      reviewerAvatar: user?.avatar,
      sellerResponse: null,
      createdAt: new Date().toISOString(),
    }
    
    const reviews = getData('reviews')
    reviews.push(newReview)
    setData('reviews', reviews)
    
    // Update gig rating - handle both id and _id formats
    const gigs = getData('gigs')
    const gig = gigs.find((g) => 
      g.id === order.gigId || 
      g._id === order.gigId || 
      String(g.id) === String(order.gigId) || 
      String(g._id) === String(order.gigId)
    )
    
    if (gig) {
      // Get all reviews for this gig (handle both id formats)
      const gigReviews = reviews.filter((r) => 
        r.gigId === order.gigId || 
        String(r.gigId) === String(order.gigId) ||
        (gig.id && r.gigId === gig.id) ||
        (gig._id && r.gigId === gig._id)
      )
      
      gig.rating =
        gigReviews.length > 0
          ? gigReviews.reduce((sum, r) => sum + r.rating, 0) / gigReviews.length
          : 0
      gig.reviewCount = gigReviews.length
      setData('gigs', gigs)
    }
    
    return Promise.resolve({ data: newReview })
  },
}

// Wallet
export const walletService = {
  get: () => {
    const currentUser = JSON.parse(localStorage.getItem('auth-storage') || '{}')
    const userId = currentUser.state?.user?.id
    
    // Get transactions from orders and withdrawals
    const orders = getData('orders')
    const withdrawals = getData('withdrawals')
    
    const userOrders = orders.filter((o) => o.sellerId === userId && o.status === 'Completed')
    const userWithdrawals = withdrawals.filter((w) => w.userId === userId)
    
    const transactions = []
    
    // Add earnings from orders
    userOrders.forEach((order) => {
      transactions.push({
        id: `order-${order.id}`,
        date: order.completedAt || order.createdAt,
        description: `Order: ${order.gigTitle}`,
        amount: order.amount,
        type: 'incoming',
        status: 'Completed',
      })
    })
    
    // Add withdrawals
    userWithdrawals.forEach((withdrawal) => {
      transactions.push({
        id: `withdrawal-${withdrawal.id}`,
        date: withdrawal.createdAt,
        description: `Withdrawal: ${withdrawal.method}`,
        amount: withdrawal.amount,
        type: 'withdrawal',
        status: withdrawal.status,
      })
    })
    
    // Sort by date
    transactions.sort((a, b) => new Date(b.date) - new Date(a.date))
    
    const totalEarned = userOrders.reduce((sum, o) => sum + o.amount, 0)
    const totalWithdrawn = userWithdrawals
      .filter((w) => w.status === 'Completed')
      .reduce((sum, w) => sum + w.amount, 0)
    const pendingWithdrawals = userWithdrawals
      .filter((w) => w.status === 'pending')
      .reduce((sum, w) => sum + w.amount, 0)
    
    return Promise.resolve({
      data: {
        balance: totalEarned - totalWithdrawn - pendingWithdrawals,
        pendingBalance: pendingWithdrawals,
        totalEarned,
        transactions,
      },
    })
  },
}

// Withdrawals
export const withdrawalsService = {
  create: (withdrawalData) => {
    const withdrawals = getData('withdrawals')
    const currentUser = JSON.parse(localStorage.getItem('auth-storage') || '{}')
    const user = currentUser.state?.user
    
    const newWithdrawal = {
      id: Date.now().toString(),
      ...withdrawalData,
      userId: user?.id,
      status: 'pending',
      createdAt: new Date().toISOString(),
    }
    
    withdrawals.push(newWithdrawal)
    setData('withdrawals', withdrawals)
    return Promise.resolve({ data: newWithdrawal })
  },
}

// Dashboard
export const dashboardService = {
  getSeller: () => {
    const currentUser = JSON.parse(localStorage.getItem('auth-storage') || '{}')
    const userId = currentUser.state?.user?.id
    
    const orders = getData('orders')
    const userOrders = orders.filter((o) => o.sellerId === userId)
    
    const activeOrders = userOrders.filter((o) => o.status === 'Active').length
    const completedOrders = userOrders.filter((o) => o.status === 'Completed').length
    const earnings = userOrders
      .filter((o) => o.status === 'Completed')
      .reduce((sum, o) => sum + o.amount, 0)
    
    const withdrawals = getData('withdrawals')
    const pendingWithdrawals = withdrawals
      .filter((w) => w.userId === userId && w.status === 'pending')
      .reduce((sum, w) => sum + w.amount, 0)
    
    const reviews = getData('reviews')
    const userGigs = getData('gigs').filter((g) => g.seller?.id === userId)
    const gigIds = userGigs.map((g) => g.id)
    const gigReviews = reviews.filter((r) => gigIds.includes(r.gigId))
    const averageRating =
      gigReviews.length > 0
        ? gigReviews.reduce((sum, r) => sum + r.rating, 0) / gigReviews.length
        : 0
    
    // Sample earnings chart data
    const earningsData = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      earningsData.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        earnings: Math.floor(Math.random() * 5000) + 1000,
      })
    }
    
    const recentOrders = userOrders
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
    
    return Promise.resolve({
      data: {
        stats: {
          activeOrders,
          completedOrders,
          earnings,
          pendingWithdrawals,
          averageRating,
        },
        recentOrders,
        earningsChart: earningsData,
      },
    })
  },
}

export default {
  gigs: gigsService,
  orders: ordersService,
  messages: messagesService,
  payments: paymentsService,
  projects: projectsService,
  reviews: reviewsService,
  wallet: walletService,
  withdrawals: withdrawalsService,
  dashboard: dashboardService,
}

