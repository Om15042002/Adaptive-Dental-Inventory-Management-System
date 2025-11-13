# Dental Inventory Management System

A comprehensive full-stack application for managing dental clinic inventory, products, suppliers, and generating AI-powered reports.

## 🌟 Features

### Core Functionality

- **Product Management**: Complete CRUD operations for dental products with image support
- **Inventory Tracking**: Real-time inventory monitoring with stock levels and alerts
- **Category Management**: Organize products by categories for better organization
- **Supplier Management**: Maintain supplier information and relationships
- **Stock Movements**: Track all inventory transactions (in/out movements)
- **User Management**: Role-based access control (Admin, Staff)
- **Reports & Analytics**: Comprehensive reporting with visual charts

### Advanced Features

- **Excel Export**: Export data from Products, Inventory, and Reports pages to Excel format
- **AI-Powered Insights**: Generate intelligent reports using Google Gemini AI
  - Inventory Analysis
  - Usage Trends
  - Cost Analysis
  - Reorder Recommendations
  - Comprehensive Reports
- **Image Management**: Upload, view, and remove product images
- **Dark/Light Theme**: User preference-based theme switching
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Data Caching**: Improved performance with intelligent caching

## 🛠️ Technology Stack

### Frontend

- **React** 18.x - UI library
- **Material-UI** 5.x - Component library
- **Recharts** - Data visualization
- **Axios** - HTTP client
- **React Router** - Navigation
- **React Hot Toast** - Notifications
- **XLSX** - Excel export functionality
- **@google/generative-ai** - AI integration

### Backend

- **Node.js** - Runtime environment
- **Express** - Web framework
- **MySQL** 9.4 - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Multer** - File upload handling

## 📋 Prerequisites

- **Node.js** 14.x or higher
- **MySQL** 8.x or higher
- **npm** or **yarn** package manager
- **Google Gemini API Key** (free tier available) for AI features

## 🚀 Installation

### Automated Installation (Recommended)

#### Windows

```powershell
.\install.bat
```

#### Linux/Mac

```bash
chmod +x install.sh
./install.sh
```

### Manual Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd "Sem 3\project\1\1"
```

2. **Install Backend Dependencies**

```bash
cd Backend
npm install
```

3. **Install Frontend Dependencies**

```bash
cd ../Frontend
npm install
```

4. **Database Setup**

Create a MySQL database and import the schema:

```sql
CREATE DATABASE business4;
USE business4;
```

Import the schema files:

- `dental_inventory_schema_complete.sql`
- `dental_inventory_data_complete.sql` (optional - sample data)

Or use the migration script:

```bash
cd Backend
mysql -u root -p business4 < database_migration.sql
```

5. **Environment Configuration**

Create `.env` file in the `Backend` directory:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=business4
DB_PORT=3306

# Server Configuration
PORT=3000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d

# Google Gemini AI Configuration (for AI features)
GEMINI_API_KEY=your_gemini_api_key_here
```

**Getting a Google Gemini API Key (Free):**

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Get API Key"
4. Create a new key or use an existing one
5. Copy the API key to your `.env` file

## 🎮 Running the Application

### Start Backend Server

```bash
cd Backend
npm start
```

Backend will run on `http://localhost:3000`

### Start Frontend Development Server

```bash
cd Frontend
npm start
```

Frontend will run on `http://localhost:3002`

## 👤 Default Admin Account

After database setup, create an admin account using the script:

```bash
cd Backend/scripts
node create-admin.js
```

Or use these credentials if sample data was imported:

- **Username**: admin
- **Password**: admin123

## 📁 Project Structure

```
.
├── Backend/
│   ├── src/
│   │   ├── app.js              # Express app setup
│   │   ├── config/
│   │   │   └── database.js     # Database configuration
│   │   ├── middleware/
│   │   │   └── auth.js         # Authentication middleware
│   │   ├── routes/             # API routes
│   │   └── utils/
│   │       └── helpers.js      # Utility functions
│   ├── scripts/
│   │   └── create-admin.js     # Admin creation script
│   └── package.json
│
├── Frontend/
│   ├── src/
│   │   ├── App.js              # Main application component
│   │   ├── components/
│   │   │   ├── Admin/          # Admin dashboard components
│   │   │   ├── Auth/           # Authentication components
│   │   │   ├── Categories/     # Category management
│   │   │   ├── Common/         # Shared components
│   │   │   ├── Dashboard/      # Main dashboard
│   │   │   ├── Inventory/      # Inventory management
│   │   │   ├── ProductManagement/  # Product CRUD
│   │   │   └── Reports/        # Reports & analytics
│   │   ├── contexts/
│   │   │   └── AuthContext.js  # Authentication context
│   │   ├── services/
│   │   │   ├── api.js          # API service layer
│   │   │   └── aiService.js    # AI integration service
│   │   └── utils/
│   │       ├── helpers.js      # Utility functions
│   │       └── excelExport.js  # Excel export utilities
│   └── package.json
│
├── dental_inventory_schema_complete.sql
├── dental_inventory_data_complete.sql
└── README.md
```

## 🔑 Key Features Guide

### Excel Export

1. Navigate to **Products**, **Inventory**, or **Reports** page
2. Click the **Export to Excel** button in the top right
3. Excel file will be downloaded with timestamp

### AI Report Generation

1. Navigate to the **Reports** page
2. Select a report type (Inventory Analysis, Usage Trends, etc.)
3. Click **Generate AI Insights** button
4. View formatted insights in the dialog
5. Click **Copy to Clipboard** to save the report

### Product Management

1. **Add Product**: Click "Add Product" button, fill form, submit
2. **Edit Product**: Click product name, then "Edit" button in detail view
3. **Upload Image**: Click camera icon, select image file
4. **Remove Image**: In image dialog, click "Remove Image"
5. **View Details**: Click product name to see full details with charts

### Stock Management

1. **Record Movement**: Go to Inventory, click "Record Movement"
2. **View History**: Click product to see stock movement history
3. **Set Alerts**: Configure min/max stock levels in product edit

## 🎨 UI Features

- **Theme Toggle**: Switch between light and dark mode (top right corner)
- **Responsive Design**: Optimized for mobile, tablet, and desktop
- **Data Caching**: Automatic caching for improved performance
- **Smooth Animations**: Professional transitions and hover effects
- **Toast Notifications**: Real-time feedback for all actions

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcryptjs
- Protected API routes
- Role-based access control
- Secure session management

## 📊 API Endpoints

### Authentication

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration (admin only)
- `GET /api/auth/me` - Get current user

### Products

- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create new product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Inventory

- `GET /api/inventory` - Get inventory overview
- `GET /api/inventory/low-stock` - Get low stock items

### Categories

- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

### Suppliers

- `GET /api/suppliers` - Get all suppliers
- `POST /api/suppliers` - Create supplier
- `PUT /api/suppliers/:id` - Update supplier
- `DELETE /api/suppliers/:id` - Delete supplier

### Stock Movements

- `GET /api/stock-movements` - Get all movements
- `POST /api/stock-movements` - Record movement

### Reports

- `GET /api/reports/inventory-summary` - Inventory summary
- `GET /api/reports/usage-trends` - Usage trends
- `GET /api/reports/low-stock` - Low stock report

### Users (Admin only)

- `GET /api/users` - Get all users
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

## 🐛 Troubleshooting

### Database Connection Issues

- Verify MySQL service is running
- Check database credentials in `.env`
- Ensure database `business4` exists

### Frontend Not Connecting to Backend

- Confirm backend is running on port 3000
- Check CORS settings in `Backend/src/app.js`
- Verify API base URL in `Frontend/src/services/api.js`

### AI Features Not Working

- Verify `GEMINI_API_KEY` is set in `.env`
- Check API key is valid at [Google AI Studio](https://makersuite.google.com/app/apikey)
- Ensure internet connection is active

### Excel Export Not Working

- Clear browser cache
- Check browser console for errors
- Verify `xlsx` package is installed: `npm list xlsx`

## 📝 Development

### Backend Development

```bash
cd Backend
npm run dev  # with nodemon for auto-restart
```

### Frontend Development

```bash
cd Frontend
npm start  # with hot-reload
```

### Build for Production

```bash
cd Frontend
npm run build
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Authors

- **Om Siddhapura** - Initial work

## 🙏 Acknowledgments

- Material-UI for the component library
- Recharts for data visualization
- Google Gemini AI for intelligent insights
- The open-source community

## 📞 Support

For support, email your-email@example.com or open an issue in the repository.

---

**Made with ❤️ for Dental Clinics**
