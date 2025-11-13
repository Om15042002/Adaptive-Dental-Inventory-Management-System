# Dental Inventory Frontend

A modern React.js application for managing dental practice inventory with real-time analytics and comprehensive reporting.

## 🚀 Features

### Dashboard

- **Real-time inventory metrics** with visual indicators
- **Low stock alerts** with priority-based notifications
- **Recent transactions** tracking
- **Total inventory value** calculation
- **Interactive charts** for quick insights

### Product Management

- **Full CRUD operations** (Create, Read, Update, Delete)
- **Bulk operations** for multiple products
- **Advanced search and filtering** by category, supplier, stock level
- **Product categorization** by dental specialties
- **SKU management** and tracking

### Inventory Control

- **Real-time stock levels** with visual indicators
- **Stock adjustment** with reason tracking
- **Reorder point management** with automated alerts
- **Location tracking** for organized storage
- **Stock history** and movement logs

### Categories Management

- **Dental specialty categories** (Consumables, Clinical Instruments, etc.)
- **Category-based organization** for easy navigation
- **Product count tracking** per category
- **Custom category creation** and management

### Reports & Analytics

- **Usage trends analysis** with interactive charts
- **Cost analysis** by category and time period
- **Reorder recommendations** with priority ranking
- **Inventory value tracking** over time
- **Export functionality** for external analysis

### Responsive Design

- **Mobile-first approach** for tablet and phone access
- **Desktop optimization** for administrative tasks
- **Touch-friendly interface** for all device types
- **Adaptive layouts** that work on any screen size

## 🛠️ Technology Stack

- **React.js 18+** - Modern React with hooks
- **Material-UI (MUI)** - Google's Material Design components
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls
- **Recharts** - Responsive chart library
- **React Toastify** - Toast notifications
- **CSS-in-JS** - Styled components with emotion

## 📦 Installation

1. **Navigate to the frontend directory:**

   ```bash
   cd Frontend/dental-inventory-frontend
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Set up environment variables:**

   ```bash
   cp .env.example .env
   ```

   Update `.env` with your API URL:

   ```
   REACT_APP_API_URL=http://localhost:3000/api
   ```

4. **Start the development server:**

   ```bash
   npm start
   ```

5. **Open your browser:**
   Navigate to `http://localhost:3000`

## 🔧 Configuration

### Environment Variables

```env
# API Configuration
REACT_APP_API_URL=http://localhost:3000/api

# App Configuration
REACT_APP_NAME=Adaptive Dental Inventory Management System
REACT_APP_VERSION=1.0.0

# Feature Flags
REACT_APP_ENABLE_NOTIFICATIONS=true
REACT_APP_ENABLE_EXPORT=true
REACT_APP_ENABLE_BULK_OPERATIONS=true
```

### API Integration

The frontend communicates with the backend API through:

- **RESTful endpoints** for all CRUD operations
- **Real-time updates** for inventory changes
- **Authentication tokens** for secure access
- **Error handling** with user-friendly messages

Built with ❤️ for dental practices to efficiently manage their inventory and improve patient care.

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
