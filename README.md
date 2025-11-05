# Project Fiver - React Freelance Marketplace

A modern React frontend application for a freelance marketplace built with Vite, TailwindCSS, React Router, Zustand, and Storybook.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run Storybook
npm run storybook

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # UI primitives (Button, Input, Modal, etc.)
│   ├── auth/           # Authentication components
│   ├── gigs/           # Gig-related components
│   ├── orders/         # Order components
│   ├── chat/           # Chat components
│   ├── payments/       # Payment components
│   ├── wallet/         # Wallet components
│   ├── reviews/        # Review components
│   ├── projects/       # Project components
│   └── notifications/  # Notification/toast components
├── layouts/            # Layout components
├── pages/              # Page components
├── services/           # API services
├── store/              # Zustand stores
├── utils/              # Utility functions
└── routes/             # Route definitions
```

## 🛠️ Tech Stack

- **React 19** - UI library
- **Vite** - Build tool and dev server
- **TailwindCSS** - Utility-first CSS framework
- **React Router v6** - Routing
- **Zustand** - State management
- **Axios** - HTTP client
- **ESLint + Prettier** - Code quality
- **Husky + lint-staged** - Git hooks
- **Storybook** - Component documentation
- **Recharts** - Charts and graphs

## 📝 Features

### Authentication
- Login/Signup with email or phone
- Protected routes with RequireAuth
- Admin-only routes with RequireAdmin
- Token-based authentication with Zustand persistence

### Gigs
- Browse gigs with filters (category, price, delivery time, experience level)
- Gig detail page with packages, reviews, and seller info
- Create new gigs

### Orders
- Order list with status badges
- Order timeline showing milestones
- In-platform chat for order communication

### Payments
- Manual payment upload (JazzCash, Easypaisa, Bank Transfer, USDT)
- Payment verification flow
- Transaction history

### Wallet
- View balance (available, pending, total earned)
- Request withdrawals
- Transaction history

### Dashboards
- Seller dashboard with stats and earnings chart
- Client dashboard with projects and orders
- Role-based rendering

### Admin Panel
- Payment verification queue
- Withdrawal request management
- User and order management
- Categories & Skills management
- CMS for static content

### Additional Features
- Reviews and ratings system
- Dispute management
- Project posting and bidding
- Real-time notifications
- Toast notifications
- Responsive design

## 🔧 Configuration

### Environment Variables

Create a `.env` file based on `.env.example`:

```env
REACT_APP_API_BASE=http://localhost:3000/api
REACT_APP_ENV=development
```

### API Integration

API calls are made through `src/services/api.js` which uses Axios with:
- Base URL from environment variables
- Automatic token injection from Zustand store
- Error handling and 401 redirects

Example API call:

```javascript
import api from './services/api'

// GET request
const response = await api.get('/gigs', { params: { q: 'search' } })

// POST request with auth token (automatically added)
const response = await api.post('/orders', { gigId: 123 })
```

## 🎨 Styling

The project uses TailwindCSS with custom design tokens:

- **Primary Colors**: Blue shades
- **Secondary Colors**: Purple shades
- **Neutral Colors**: Gray shades
- **Status Colors**: Success (green), Warning (yellow), Danger (red)

CSS variables are defined in `src/index.css` for theme tokens.

## 📚 Storybook

View and test components in isolation:

```bash
npm run storybook
```

Stories are located alongside components with `.stories.jsx` extension.

## 🧪 Testing

Example test setup with React Testing Library is included. Run tests with:

```bash
npm test
```

## 📦 Build

Build for production:

```bash
npm run build
```

Output will be in the `dist/` directory.

## 🎯 Code Quality

- **ESLint**: Linting with React and Prettier plugins
- **Prettier**: Code formatting
- **Husky**: Git hooks
- **lint-staged**: Pre-commit linting

## 🚦 Routes

- `/` - Home page
- `/login` - Login page
- `/signup` - Signup page
- `/gigs` - Browse gigs
- `/gigs/:id` - Gig detail
- `/create-gig` - Create new gig (protected)
- `/projects` - Projects list (protected)
- `/orders` - Orders list (protected)
- `/wallet` - Wallet page (protected)
- `/dashboard` - Seller dashboard (protected)
- `/admin` - Admin panel (admin only)

## 🤝 Contributing

1. Follow the code style (ESLint + Prettier)
2. Write component stories for Storybook
3. Ensure accessibility (ARIA labels, keyboard navigation)
4. Test on mobile and desktop

## 📄 License

This project is private and proprietary.

---

Built with ❤️ using React + Vite

