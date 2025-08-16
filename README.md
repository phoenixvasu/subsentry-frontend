# 🎨 SubSentry Frontend

A modern, responsive React application for managing subscriptions and tracking recurring expenses. Built with React 18, Vite, and Tailwind CSS for a beautiful user experience.

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Quick Start](#-quick-start)
- [Project Structure](#-project-structure)
- [Components](#-components)
- [Pages](#-pages)
- [State Management](#-state-management)
- [API Integration](#-api-integration)
- [Styling](#-styling)
- [Development](#-development)
- [Building](#-building)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

- 🔐 **User Authentication** - Secure login/register with JWT
- 📱 **Responsive Design** - Mobile-first, responsive UI
- 📊 **Dashboard Analytics** - Beautiful charts and insights
- 🏷️ **Category Management** - Organize subscriptions by categories
- 📈 **Financial Tracking** - Monitor spending and costs
- ⏰ **Renewal Alerts** - Track upcoming renewals
- 🔍 **Search & Filter** - Advanced filtering and search capabilities
- 📱 **Modern UI/UX** - Clean, intuitive interface
- 🚀 **Fast Performance** - Optimized with Vite and React 18
- 🎨 **Beautiful Charts** - Interactive data visualization

## 🛠️ Tech Stack

- **Framework**: React 18 with Hooks
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Charts**: Recharts
- **Icons**: Emoji and custom icons
- **Forms**: Custom form components
- **Validation**: Built-in form validation

## 📋 Prerequisites

Before running this project, ensure you have:

- **Node.js** 18.0.0 or higher
- **npm** or **yarn** package manager
- **Git** for version control
- **Backend API** running (see backend README)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd subsentry-frontend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

```bash
# Copy the example environment file
cp env.example .env.local

# Edit .env.local with your configuration
nano .env.local
```

### 4. Start Development Server

```bash
npm run dev
```

Your app will be running at `http://localhost:5173`

## 📁 Project Structure

```
subsentry-frontend/
├── src/                          # Source code
│   ├── components/              # Reusable UI components
│   │   ├── Card.jsx            # Card component
│   │   ├── Input.jsx           # Input field component
│   │   ├── Modal.jsx           # Modal component
│   │   ├── Pagination.jsx      # Pagination component
│   │   ├── Select.jsx          # Select dropdown component
│   │   └── Table.jsx           # Data table component
│   ├── hooks/                  # Custom React hooks
│   │   └── useAuthGuard.js     # Authentication guard hook
│   ├── lib/                    # Utility libraries
│   │   └── api.js              # API client configuration
│   ├── pages/                  # Application pages
│   │   ├── Dashboard.jsx       # Main dashboard
│   │   ├── Login.jsx           # Login page
│   │   ├── Register.jsx        # Registration page
│   │   ├── Subscriptions.jsx   # Subscriptions management
│   │   └── Categories.jsx      # Categories management
│   ├── store/                  # State management
│   │   └── auth.js             # Authentication store
│   ├── App.jsx                 # Main application component
│   ├── main.jsx                # Application entry point
│   └── index.css               # Global styles
├── public/                      # Static assets
├── package.json                 # Dependencies and scripts
├── vite.config.js              # Vite configuration
├── tailwind.config.js          # Tailwind CSS configuration
├── postcss.config.js           # PostCSS configuration
└── README.md                   # This file
```

## 🧩 Components

### Core Components

#### Card Component

```jsx
import Card from "../components/Card";

<Card className="bg-blue-50">
  <h2>Your Content</h2>
  <p>Card content goes here</p>
</Card>;
```

#### Input Component

```jsx
import Input from "../components/Input";

<Input
  id="username"
  type="text"
  placeholder="Enter username"
  value={username}
  onChange={(e) => setUsername(e.target.value)}
/>;
```

#### Table Component

```jsx
import Table from "../components/Table";

const columns = [
  { header: "Name", accessor: "name" },
  { header: "Cost", render: (row) => `₹${row.cost}` },
];

<Table columns={columns} data={data} />;
```

#### Pagination Component

```jsx
import Pagination from "../components/Pagination";

<Pagination
  currentPage={page}
  totalPages={totalPages}
  onPageChange={handlePageChange}
/>;
```

## 📱 Pages

### Dashboard (`/dashboard`)

- **Financial Overview** - Key metrics and insights
- **Charts & Graphs** - Spending trends and category breakdown
- **Upcoming Renewals** - Renewal tracking and alerts
- **Quick Actions** - Navigation to key features

### Subscriptions (`/subscriptions`)

- **Subscription List** - View all subscriptions
- **Add/Edit** - Create and modify subscriptions
- **Search & Filter** - Advanced filtering capabilities
- **Pagination** - Handle large datasets

### Categories (`/categories`)

- **Category Overview** - Spending by category
- **Visual Analytics** - Charts and insights
- **Category Details** - Subscription breakdowns

### Authentication (`/login`, `/register`)

- **User Registration** - Create new accounts
- **Secure Login** - JWT-based authentication
- **Form Validation** - Input validation and error handling

## 🗃️ State Management

### Zustand Store

```jsx
import { useAuthStore } from "../store/auth";

const { token, user, isAuthenticated, login, logout } = useAuthStore();
```

### Store Structure

```javascript
// Authentication Store
{
  token: null,
  user: null,
  isAuthenticated: false,

  // Actions
  setToken: (token) => void,
  setUser: (user) => void,
  login: (userData, token) => void,
  logout: () => void
}
```

## 🌐 API Integration

### API Client

```jsx
import api from "../lib/api";

// GET request
const response = await api.get("/subscriptions");

// POST request
const response = await api.post("/subscriptions", data);

// PUT request
const response = await api.put(`/subscriptions/${id}`, data);

// DELETE request
const response = await api.delete(`/subscriptions/${id}`);
```

### Interceptors

- **Request Interceptor** - Automatically adds JWT token
- **Response Interceptor** - Handles authentication errors
- **Error Handling** - Global error management

### API Endpoints

```javascript
// Authentication
authAPI.login(credentials);
authAPI.register(userData);

// Subscriptions
subscriptionsAPI.getAll();
subscriptionsAPI.create(data);
subscriptionsAPI.update(id, data);
subscriptionsAPI.delete(id);

// Categories
categoriesAPI.getAll();
categoriesAPI.create(data);
categoriesAPI.update(id, data);
categoriesAPI.delete(id);

// Metrics
metricsAPI.getMetrics();

// Renewals
renewalsAPI.getUpcomingRenewals();
```

## 🎨 Styling

### Tailwind CSS

- **Utility-First** - Rapid UI development
- **Responsive Design** - Mobile-first approach
- **Custom Components** - Reusable styled components
- **Dark Mode Ready** - Easy theme switching

### Design System

```css
/* Color Palette */
--primary: #3b82f6 (blue-500)
--success: #10b981 (emerald-500)
--warning: #f59e0b (amber-500)
--danger: #ef4444 (red-500)
--info: #8b5cf6 (violet-500)

/* Spacing */
--spacing-xs: 0.25rem (4px)
--spacing-sm: 0.5rem (8px)
--spacing-md: 1rem (16px)
--spacing-lg: 1.5rem (24px)
--spacing-xl: 2rem (32px)

/* Typography */
--font-sans: Inter, system-ui, sans-serif
--font-mono: 'JetBrains Mono', monospace
```

### Component Styling

```jsx
// Responsive classes
className = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3";

// Hover effects
className = "hover:bg-blue-50 hover:shadow-lg transition-all duration-200";

// Gradients
className = "bg-gradient-to-r from-blue-500 to-blue-600";
```

## 🚀 Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Development Workflow

1. **Create Feature Branch**

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes**

   - Follow React best practices
   - Use functional components with hooks
   - Maintain consistent styling
   - Add proper error handling

3. **Test Your Changes**

   - Test on different screen sizes
   - Verify all interactions work
   - Check for console errors
   - Test API integration

4. **Commit and Push**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   git push origin feature/your-feature-name
   ```

### Code Style Guidelines

- Use functional components with hooks
- Follow consistent naming conventions
- Add PropTypes or TypeScript types
- Handle loading and error states
- Use semantic HTML elements
- Maintain accessibility standards

### Hot Reload

The development server includes:

- **Fast Refresh** - Instant component updates
- **Hot Module Replacement** - Preserve component state
- **Error Overlay** - Clear error messages
- **Source Maps** - Easy debugging

## 🏗️ Building

### Production Build

```bash
npm run build
```

This creates a `dist/` folder with:

- **Optimized JavaScript** - Minified and bundled
- **CSS Assets** - Purged and optimized
- **Static Assets** - Images and fonts
- **Index HTML** - Entry point

### Build Configuration

```javascript
// vite.config.js
export default {
  build: {
    outDir: "dist",
    sourcemap: false,
    minify: "terser",
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          charts: ["recharts"],
        },
      },
    },
  },
};
```

## 🚀 Deployment

### Vercel Deployment

1. **Connect Repository**

   - Link your GitHub repository
   - Select the `subsentry-frontend` folder

2. **Configure Project**

   - Framework Preset: Vite
   - Root Directory: `subsentry-frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

3. **Set Environment Variables**

   ```bash
   VITE_APP_NAME=SubSentry
   VITE_APP_VERSION=1.0.0
   VITE_API_BASE_URL=https://your-backend.onrender.com/api
   VITE_NODE_ENV=production
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait for deployment (2-3 minutes)

### Environment Variables

```bash
# Development (.env.local)
VITE_API_BASE_URL=http://localhost:4000/api
VITE_APP_NAME=SubSentry
VITE_APP_VERSION=1.0.0

# Production (Vercel)
VITE_API_BASE_URL=https://your-backend.onrender.com/api
VITE_APP_NAME=SubSentry
VITE_APP_VERSION=1.0.0
VITE_NODE_ENV=production
```

### Build Optimization

- **Code Splitting** - Automatic route-based splitting
- **Tree Shaking** - Remove unused code
- **Asset Optimization** - Compressed images and fonts
- **Caching** - Long-term caching for static assets

## 🔒 Security Features

- **JWT Authentication** - Secure token-based auth
- **CORS Protection** - Backend CORS configuration
- **Input Validation** - Form validation and sanitization
- **XSS Protection** - React's built-in XSS protection
- **HTTPS Only** - Production HTTPS enforcement

## 📱 Responsive Design

### Breakpoints

```css
/* Mobile First */
sm: 640px   /* Small devices */
md: 768px   /* Medium devices */
lg: 1024px  /* Large devices */
xl: 1280px  /* Extra large devices */
2xl: 1536px /* 2X large devices */
```

### Responsive Patterns

```jsx
// Grid layouts
className = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3";

// Text sizing
className = "text-lg md:text-xl lg:text-2xl";

// Spacing
className = "p-4 md:p-6 lg:p-8";
```

## 🧪 Testing

### Manual Testing

- **Cross-browser Testing** - Chrome, Firefox, Safari, Edge
- **Mobile Testing** - iOS Safari, Chrome Mobile
- **Responsive Testing** - Different screen sizes
- **Accessibility Testing** - Keyboard navigation, screen readers

### Testing Checklist

- [ ] All pages load correctly
- [ ] Forms submit successfully
- [ ] Navigation works properly
- [ ] Responsive design functions
- [ ] API calls complete
- [ ] Error handling works
- [ ] Loading states display

## 🐛 Troubleshooting

### Common Issues

#### Build Failures

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check Node.js version
node --version  # Should be 18+

# Verify dependencies
npm audit
```

#### Development Server Issues

```bash
# Check if port is in use
lsof -i :5173

# Kill process
kill -9 <PID>

# Clear Vite cache
rm -rf node_modules/.vite
```

#### API Connection Issues

```bash
# Verify backend is running
curl http://localhost:4000/api/health

# Check environment variables
echo $VITE_API_BASE_URL

# Test API endpoint
curl http://localhost:4000/api/subscriptions
```

### Debug Mode

```bash
# Enable debug logging
DEBUG=* npm run dev

# Check environment variables
node -e "console.log(import.meta.env)"
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Contribution Guidelines

- Follow React best practices
- Maintain consistent styling
- Add proper error handling
- Test on multiple devices
- Update documentation

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter issues:

1. **Check the console** - Look for error messages
2. **Verify configuration** - Check environment variables
3. **Test API connection** - Ensure backend is running
4. **Check network tab** - Monitor API requests
5. **Review documentation** - Check this README

### Getting Help

- Create an issue on GitHub
- Check existing issues for solutions
- Review the deployment guide
- Test with the provided examples

## 🎯 Roadmap

- [ ] Add dark mode theme
- [ ] Implement offline support
- [ ] Add push notifications
- [ ] Include data export features
- [ ] Add multi-language support
- [ ] Implement advanced charts
- [ ] Add keyboard shortcuts
- [ ] Include accessibility improvements

---

**Happy Coding! 🚀**

For deployment instructions, see the main [DEPLOYMENT.md](../DEPLOYMENT.md)
