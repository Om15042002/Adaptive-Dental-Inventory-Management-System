# 🦷 Adaptive Dental Inventory Management System

A comprehensive, full-stack web application for managing dental practice inventory with real-time tracking, AI-powered insights, and automated reorder recommendations.

![Project Status](https://img.shields.io/badge/Status-Phase%202%20Complete-success)
![Frontend](https://img.shields.io/badge/Frontend-React%2018.2-blue)
![Backend](https://img.shields.io/badge/Backend-Node.js%2020-green)
![Database](https://img.shields.io/badge/Database-MySQL%208.0-orange)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Documentation](#documentation)
- [Team](#team)
- [License](#license)

## 🎯 Overview

This system provides a modern, efficient solution for dental practices to manage their inventory, track usage patterns, predict reorder needs, and optimize costs. Built with industry-standard technologies and following best practices for security, scalability, and maintainability.

### Key Objectives

- **Real-time Inventory Tracking**: Monitor stock levels across multiple storage areas
- **Automated Alerts**: Get notified about low stock, expiring items, and reorder needs
- **Usage Analytics**: Understand consumption patterns and optimize inventory
- **Cost Management**: Track expenses and identify cost-saving opportunities
- **AI-Powered Insights**: Predictive analytics for smarter inventory decisions
- **Multi-User Support**: Role-based access for admins and staff members

## ✨ Features

### Phase 1 - Core Backend (✅ Complete)
- ✅ RESTful API with 50+ endpoints
- ✅ MySQL database with normalized schema
- ✅ JWT-based authentication and authorization
- ✅ CRUD operations for all entities
- ✅ Advanced filtering and search
- ✅ Stock movement tracking
- ✅ Report generation APIs
- ✅ Comprehensive error handling
- ✅ Input validation and sanitization
- ✅ Unit and integration tests (80%+ coverage)

### Phase 2 - Frontend Development (✅ Complete)
- ✅ React-based responsive UI
- ✅ Material-UI component library
- ✅ Dashboard with real-time statistics
- ✅ Inventory management interface
- ✅ Reports and analytics pages
- ✅ User authentication flow
- ✅ Protected routes
- ✅ API integration with React Query
- ✅ Toast notifications for user feedback
- ✅ Interactive charts and data visualization

### Phase 3 - Advanced Features (🚧 Planned)
- 🔄 AI-powered reorder predictions
- 🔄 Barcode scanning capability
- 🔄 Offline mode for basic operations
- 🔄 Email notifications
- 🔄 Advanced analytics dashboard
- 🔄 Mobile application
- 🔄 Export functionality (PDF, Excel)
- 🔄 Supplier performance tracking

## 🛠️ Tech Stack

### Frontend
- **React** 18.2.0 - UI library
- **Material-UI** 5.14.0 - Component framework
- **React Router** 6.16.0 - Client-side routing
- **React Query** 3.39.3 - Server state management
- **Axios** 1.5.0 - HTTP client
- **Recharts** 2.8.0 - Data visualization
- **Vite** 4.4.9 - Build tool and dev server

### Backend
- **Node.js** 20.x - Runtime environment
- **Express.js** 4.18.2 - Web framework
- **MySQL** 8.0 - Relational database
- **JWT** - Authentication tokens
- **bcrypt** - Password hashing
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing
- **Express Validator** - Input validation

### Testing & Development
- **Jest** 29.6.4 - Testing framework
- **Supertest** 6.3.3 - API testing
- **ESLint** - Code linting
- **Nodemon** - Development auto-reload

## 🚀 Quick Start

### Prerequisites

- Node.js 16.0.0 or higher
- MySQL 8.0 or higher
- npm 7.0.0 or higher

### Installation

1. **Clone the repository**
   ```powershell
   git clone <repository-url>
   cd "Adaptive Dental Inventory Management System"
   ```

2. **Set up the Backend**
   ```powershell
   cd Backend\APIs
   npm install
   
   # Create .env file with your database credentials
   # See Backend/APIs/.env.example for template
   
   # Initialize database
   npm run db:init
   
   # Start the server
   npm start
   ```
   Backend runs on `http://localhost:3000`

3. **Set up the Frontend**
   ```powershell
   cd ..\..\Frontend
   npm install
   
   # Create .env file
   # VITE_API_URL=http://localhost:3000/api
   
   # Start the development server
   npm run dev
   ```
   Frontend runs on `http://localhost:3001`

4. **Access the Application**
   
   Open `http://localhost:3001` in your browser
   
   **Default Admin Login:**
   - Email: `admin@dentalclinic.com`
   - Password: `admin123`

For detailed setup instructions, see [QUICKSTART.md](./QUICKSTART.md)

## 📁 Project Structure

```
Adaptive Dental Inventory Management System/
├── Backend/
│   └── APIs/
│       ├── src/
│       │   ├── controllers/      # Request handlers
│       │   ├── models/           # Database models
│       │   ├── routes/           # API routes
│       │   ├── middleware/       # Auth, validation
│       │   ├── config/           # Configuration files
│       │   └── utils/            # Helper functions
│       ├── tests/                # Test suites
│       ├── docs/                 # API documentation
│       ├── scripts/              # Utility scripts
│       ├── package.json
│       ├── phase1_schema.sql     # Database schema
│       └── README.md
│
├── Frontend/
│   ├── src/
│   │   ├── components/           # React components
│   │   │   └── Layout/           # Layout components
│   │   ├── pages/                # Page components
│   │   ├── services/             # API services
│   │   ├── context/              # React context
│   │   ├── App.jsx               # Main app component
│   │   └── main.jsx              # Entry point
│   ├── public/                   # Static assets
│   ├── package.json
│   ├── vite.config.js
│   └── README.md
│
├── QUICKSTART.md                 # Quick start guide
└── README.md                     # This file
```

## 📚 Documentation

### Backend Documentation
- [Complete API Documentation](./Backend/APIs/docs/README.md)
- [Phase 1 Compliance Report](./Backend/APIs/PHASE1_COMPLIANCE.md)
- [Database Schema](./Backend/APIs/phase1_schema.sql)
- [Testing Strategy](./Backend/APIs/docs/06_TESTING_STRATEGY.md)

### Frontend Documentation
- [Frontend README](./Frontend/README.md)
- [Component Structure](./Frontend/src/components/)
- [API Service Layer](./Frontend/src/services/)

### API Endpoints

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

#### Inventory
- `GET /api/inventory` - Get all inventory items
- `GET /api/inventory/:id` - Get inventory item by ID
- `PUT /api/inventory/:id/stock` - Update stock level
- `GET /api/inventory/low-stock` - Get low stock items
- `GET /api/inventory/dashboard` - Get dashboard statistics

#### Products
- `GET /api/products` - Get all products
- `POST /api/products` - Create new product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

#### Reports
- `GET /api/reports/usage` - Get usage report
- `GET /api/reports/costs` - Get cost analysis
- `GET /api/reports/stock-value` - Get stock value report

[See full API documentation](./Backend/APIs/docs/03_API_ENDPOINTS_AUTH.md)

## 🗄️ Database Schema

The system uses a normalized MySQL database with the following tables:

- **users** - User accounts and authentication
- **categories** - Product categories
- **suppliers** - Supplier information
- **products** - Product catalog
- **inventory** - Current stock levels and metadata
- **stock_movements** - Historical stock changes

[View complete schema](./Backend/APIs/phase1_schema.sql)

## 🧪 Testing

### Backend Tests

```powershell
cd Backend\APIs

# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Validate Phase 1 compliance
npm run validate:phase1
```

### Test Coverage
- Target: 80%+ code coverage
- Unit tests for all controllers
- Integration tests for API endpoints
- Validation tests for all schemas

## 🔐 Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Authentication**: Secure token-based auth
- **Input Validation**: Express Validator for all inputs
- **SQL Injection Protection**: Parameterized queries
- **CORS Configuration**: Controlled cross-origin access
- **Rate Limiting**: Prevent abuse
- **Security Headers**: Helmet.js middleware
- **XSS Protection**: Input sanitization

## 📊 Sample Data

The system comes pre-loaded with realistic sample data:

- **159 Products** across 14 categories
- **6 Suppliers** with contact information
- **14 Product Categories**
- **Sample Users** (Admin and Staff)
- **Historical Stock Movements**

## 👥 Team

This project was developed as part of Internship Project 1 (Semester 3).

### Team Members
- **Backend Development**: Node.js, Express.js, MySQL
- **Frontend Development**: React, Material-UI
- **Database Design**: Schema design and optimization
- **Testing**: Unit and integration tests
- **Documentation**: Technical and user documentation

## 🎯 Project Phases

### ✅ Phase 1 - Backend API (Complete)
- Database schema design
- RESTful API development
- Authentication system
- Testing framework
- Documentation

### ✅ Phase 2 - Frontend Development (Complete)
- React application setup
- Material-UI integration
- Page components
- API integration
- Responsive design

### 🚧 Phase 3 - Advanced Features (Upcoming)
- AI/ML predictions
- Mobile application
- Advanced analytics
- Performance optimization
- Production deployment

## 🤝 Contributing

This is an academic project. For any questions or suggestions:

1. Review the documentation
2. Check existing issues
3. Follow coding standards
4. Write tests for new features
5. Update documentation

## 📄 License

This project is part of an academic internship program.

## 🙏 Acknowledgments

- Material-UI for the component library
- React community for excellent tools and libraries
- MySQL for reliable database system
- All open-source contributors

## 📞 Support

For technical support or questions:
- Review the [Quick Start Guide](./QUICKSTART.md)
- Check the [Backend Documentation](./Backend/APIs/README.md)
- Check the [Frontend Documentation](./Frontend/README.md)
- Review API endpoints in [documentation](./Backend/APIs/docs/)

---

**Made with ❤️ for efficient dental practice management**
