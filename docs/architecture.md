# 🏗️ Frontend Architecture Documentation

## Overview

This document provides a comprehensive overview of the SubSentry frontend architecture, including component structure, state management, routing, and technical implementation details.

## 🎯 Application Architecture

### High-Level Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   User         │    │   React App     │    │   Backend API   │
│   Interface    │◄──►│   (Frontend)    │◄──►│   (Node.js)     │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Technology Stack

- **Framework**: React 18 with Hooks
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Charts**: Recharts
- **Package Manager**: npm

## 🧩 Component Architecture

### Component Hierarchy

```
App
├── Router
│   ├── Login Page
│   ├── Register Page
│   ├── Dashboard Page
│   ├── Subscriptions Page
│   └── Categories Page
├── Shared Components
│   ├── Card
│   ├── Input
│   ├── Modal
│   ├── Table
│   ├── Pagination
│   └── Select
└── Layout Components
    ├── Navigation
    └── Protected Routes
```

### 1. Core Components (`/components/`)

#### Card Component (`Card.jsx`)

**Purpose**: Reusable container component for content sections
**Features**:

- Flexible sizing and styling
- Consistent visual design
- Responsive behavior
- Customizable className support

#### Input Component (`Input.jsx`)

**Purpose**: Form input field with validation and accessibility
**Features**:

- Multiple input types support
- Real-time validation states
- Accessibility features (ARIA attributes)
- Error message display
- Focus management

#### Modal Component (`Modal.jsx`)

**Purpose**: Overlay dialogs for forms and content display
**Features**:

- Portal rendering for proper z-index
- Smooth animations and transitions
- Keyboard navigation support
- Focus trapping and management
- Backdrop click handling

#### Table Component (`Table.jsx`)

**Purpose**: Dynamic data table with pagination and filtering
**Features**:

- Configurable columns and renderers
- Search and filter functionality
- Sorting capabilities
- Pagination support
- Responsive design
- Loading and empty states

#### Pagination Component (`Pagination.jsx`)

**Purpose**: Navigation controls for paginated data
**Features**:

- Page navigation controls
- Page size selection
- Current page indication
- Total pages display
- Responsive design

#### Select Component (`Select.jsx`)

**Purpose**: Dropdown selection component
**Features**:

- Customizable options
- Search functionality
- Multi-select support
- Keyboard navigation
- Accessibility compliance

### 2. Page Components (`/pages/`)

#### Login Page (`Login.jsx`)

**Purpose**: User authentication interface
**Features**:

- Username and password inputs
- Form validation
- Error handling
- Loading states
- Redirect after login

#### Register Page (`Register.jsx`)

**Purpose**: User registration interface
**Features**:

- User registration form
- Password confirmation
- Validation feedback
- Success handling
- Login redirect

#### Dashboard Page (`Dashboard.jsx`)

**Purpose**: Main application overview and metrics
**Features**:

- Financial overview cards
- Interactive charts and graphs
- Upcoming renewals display
- Quick action buttons
- Real-time data updates

#### Subscriptions Page (`Subscriptions.jsx`)

**Purpose**: Subscription management interface
**Features**:

- Subscription list with table
- Add/edit/delete operations
- Search and filtering
- Pagination
- Category management
- Cost calculations

#### Categories Page (`Categories.jsx`)

**Purpose**: Category analysis and management
**Features**:

- Category overview
- Spending breakdown charts
- Subscription counts
- Visual analytics
- Category insights

### 3. Layout Components

#### Protected Route Wrapper

**Purpose**: Route protection for authenticated users
**Features**:

- Authentication checking
- Redirect to login if unauthenticated
- Loading states during auth check

#### Navigation Component

**Purpose**: Application navigation and user menu
**Features**:

- Responsive navigation
- User authentication status
- Logout functionality
- Mobile menu support

## 🗃️ State Management Architecture

### Zustand Store Structure

#### Authentication Store (`/store/auth.js`)

**State**:

- `token`: JWT authentication token
- `user`: Current user information
- `isAuthenticated`: Authentication status
- `isLoading`: Loading state for operations
- `error`: Error messages

**Actions**:

- `setToken`: Set authentication token
- `setUser`: Set user information
- `login`: Complete login process
- `logout`: Clear authentication data
- `setLoading`: Update loading state
- `setError`: Set error messages
- `clearError`: Clear error state

**Persistence**:

- Local storage persistence
- Partial state persistence
- Automatic rehydration

### State Flow Patterns

#### 1. Authentication Flow

```
User Input → Form Validation → API Call → Store Update → UI Update → Redirect
```

#### 2. Data Fetching Flow

```
Component Mount → Check Auth → API Call → Store Update → UI Re-render
```

#### 3. Form Submission Flow

```
User Input → Validation → API Call → Success/Error → Store Update → UI Feedback
```

## 🛣️ Routing Architecture

### Route Structure

```javascript
/                    → Public landing (redirects to login if not authenticated)
/login               → Login page
/register            → Registration page
/dashboard           → Main dashboard (protected)
/subscriptions       → Subscription management (protected)
/categories          → Category analysis (protected)
```

### Route Protection

- **Public Routes**: Login, Register
- **Protected Routes**: Dashboard, Subscriptions, Categories
- **Authentication Guard**: Automatic redirect to login for unauthenticated users
- **Route Guards**: HOC pattern for route protection

## 🔌 API Integration Architecture

### HTTP Client Configuration (`/lib/api.js`)

#### Axios Instance

- Base URL configuration
- Request/response interceptors
- Error handling
- Authentication token injection

#### API Endpoints

- **Authentication**: `/auth/login`, `/auth/register`
- **Subscriptions**: `/subscriptions` (CRUD operations)
- **Categories**: `/categories` (CRUD operations)
- **Metrics**: `/metrics` (financial data)
- **Renewals**: `/renewals` (upcoming renewals)

#### Interceptor Pattern

- **Request Interceptor**: Add authentication headers
- **Response Interceptor**: Handle authentication errors
- **Error Interceptor**: Global error handling

### Data Flow Architecture

#### 1. API Request Flow

```
Component → Hook → API Call → Axios → Backend → Response → Store → UI
```

#### 2. Error Handling Flow

```
API Error → Interceptor → Error Handler → Store Update → UI Error Display
```

#### 3. Authentication Flow

```
Token Expiry → Interceptor → Logout → Redirect to Login
```

## 🎨 Styling Architecture

### Tailwind CSS Implementation

#### Design System

- **Color Palette**: Consistent color scheme
- **Typography**: Font hierarchy and sizing
- **Spacing**: Standardized spacing scale
- **Components**: Reusable component classes

#### Responsive Design

- **Mobile-First**: Base styles for mobile
- **Breakpoints**: sm, md, lg, xl, 2xl
- **Flexible Layouts**: Grid and flexbox systems
- **Adaptive Components**: Responsive component behavior

#### Component Styling

- **Utility Classes**: Tailwind utility-first approach
- **Custom Components**: Extended component styles
- **Theme Consistency**: Consistent visual design
- **Accessibility**: High contrast and readable text

## 📱 Responsive Design Architecture

### Breakpoint Strategy

- **Mobile**: 320px - 639px (default)
- **Small**: 640px - 767px
- **Medium**: 768px - 1023px
- **Large**: 1024px - 1279px
- **Extra Large**: 1280px - 1535px
- **2XL**: 1536px+

### Responsive Patterns

#### 1. Mobile-First Approach

- Base styles for mobile devices
- Progressive enhancement for larger screens
- Touch-friendly interface design
- Optimized mobile performance

#### 2. Adaptive Layouts

- Flexible grid systems
- Responsive navigation
- Adaptive component sizing
- Mobile-optimized interactions

#### 3. Performance Optimization

- Lazy loading for images
- Conditional rendering for complex components
- Optimized bundle sizes
- Efficient re-renders

## 🔒 Security Architecture

### Frontend Security Measures

#### 1. Authentication Security

- JWT token storage in memory
- Secure token handling
- Automatic token refresh
- Secure logout process

#### 2. Input Validation

- Client-side validation
- XSS prevention
- Input sanitization
- Form validation feedback

#### 3. Route Protection

- Authentication guards
- Route-level security
- Redirect handling
- Session management

## 🚀 Performance Architecture

### Optimization Strategies

#### 1. React Optimization

- **useMemo**: Expensive calculations
- **useCallback**: Function memoization
- **React.memo**: Component memoization
- **Lazy Loading**: Route-based code splitting

#### 2. Bundle Optimization

- **Vite Build**: Fast development and optimized builds
- **Tree Shaking**: Remove unused code
- **Code Splitting**: Route-based splitting
- **Asset Optimization**: Image and font optimization

#### 3. Runtime Performance

- **Efficient Re-renders**: Minimize unnecessary updates
- **Virtual Scrolling**: Large dataset handling
- **Debounced Input**: Search input optimization
- **Optimized State**: Minimal state updates

## 📊 Data Visualization Architecture

### Chart Implementation

#### Recharts Integration

- **Responsive Charts**: Mobile-friendly chart components
- **Interactive Elements**: Tooltips, legends, zoom
- **Data Transformation**: Real-time data processing
- **Performance**: Optimized rendering for large datasets

#### Chart Types

- **Pie Charts**: Category spending breakdown
- **Line Charts**: Spending trends over time
- **Bar Charts**: Cost comparisons
- **Area Charts**: Cumulative spending

## 🔧 Development Architecture

### Development Workflow

#### 1. Component Development

- **Atomic Design**: Component hierarchy
- **Props Interface**: Clear component contracts
- **State Management**: Local vs global state
- **Testing**: Component testing strategy

#### 2. State Management

- **Store Design**: Zustand store architecture
- **Data Flow**: Unidirectional data flow
- **Performance**: Optimized state updates
- **Debugging**: State inspection tools

#### 3. API Integration

- **Service Layer**: API service abstraction
- **Error Handling**: Comprehensive error management
- **Loading States**: User feedback during operations
- **Caching**: Response caching strategy

## 🔮 Future Architecture Considerations

### 1. Advanced Features

- **Real-time Updates**: WebSocket integration
- **Offline Support**: Service worker implementation
- **Progressive Web App**: PWA capabilities
- **Advanced Caching**: Intelligent caching strategies

### 2. Scalability

- **Micro-frontends**: Modular frontend architecture
- **Component Library**: Reusable component system
- **Design System**: Comprehensive design tokens
- **Performance Monitoring**: Real-time performance tracking

### 3. Developer Experience

- **TypeScript**: Type safety implementation
- **Testing**: Comprehensive testing strategy
- **Documentation**: Auto-generated documentation
- **Code Quality**: Linting and formatting tools

---

_This architecture documentation provides a comprehensive overview of the SubSentry frontend system design and implementation._
