import GigCard from './GigCard'

export default {
  title: 'Components/GigCard',
  component: GigCard,
  tags: ['autodocs'],
}

export const Default = {
  args: {
    gig: {
      id: 1,
      title: 'I will design a modern logo for your brand',
      price: 5000,
      rating: 4.5,
      deliveryTime: 3,
      seller: {
        name: 'John Doe',
        avatar: null,
        level: 'Expert',
      },
      images: ['https://via.placeholder.com/400x300'],
      skills: ['Logo Design', 'Branding', 'Illustration'],
    },
  },
}

export const LongTitle = {
  args: {
    gig: {
      id: 2,
      title: 'I will create a comprehensive full-stack web application with React, Node.js, MongoDB, and deploy it to production with Docker and CI/CD pipeline',
      price: 50000,
      rating: 5.0,
      deliveryTime: 14,
      seller: {
        name: 'Jane Smith',
        avatar: null,
        level: 'Expert',
      },
      images: ['https://via.placeholder.com/400x300'],
      skills: ['React', 'Node.js', 'MongoDB', 'Docker'],
    },
  },
}

export const NoImage = {
  args: {
    gig: {
      id: 3,
      title: 'I will write SEO-optimized blog posts',
      price: 2500,
      rating: 4.0,
      deliveryTime: 7,
      seller: {
        name: 'Writer Pro',
        avatar: null,
        level: 'Intermediate',
      },
      images: [],
      skills: ['Content Writing', 'SEO'],
    },
  },
}

