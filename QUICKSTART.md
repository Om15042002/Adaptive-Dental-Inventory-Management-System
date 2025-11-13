# Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### Step 1: Start the Backend

```powershell
cd "c:\MAC Course\Sem 3\Internship Project 1\Adaptive Dental Inventory Management System\Backend\APIs"
npm install
npm start
```

Backend will run on `http://localhost:3000`

### Step 2: Start the Frontend

Open a new terminal:

```powershell
cd "c:\MAC Course\Sem 3\Internship Project 1\Adaptive Dental Inventory Management System\Frontend"
npm install
npm run dev
```

Frontend will run on `http://localhost:3001`

### Step 3: Login

Open your browser and navigate to `http://localhost:3001`

**Default Admin Credentials:**
- Email: `admin@dentalclinic.com`
- Password: `admin123`

**Default Staff Credentials:**
- Email: `staff@dentalclinic.com`
- Password: `staff123`

## ✅ What You Can Do

### Dashboard
- View total inventory items: **159 products**
- Check low stock alerts
- See expiring items
- View inventory consumption trends

### Inventory Management
- Browse all 159 dental products across 14 categories
- Filter by storage area (Clinical, Sterilization, Storage, Office)
- Filter by frequency of use (Daily, Weekly, Monthly, Quarterly)
- Update stock levels
- View stock status (In Stock, Low Stock, Out of Stock)

### Reports
- Generate usage trend reports
- Analyze costs over time
- View interactive charts
- Export data as CSV

## 📊 Sample Data Available

- **159 Products** across 14 categories
- **6 Suppliers** configured
- **14 Categories**:
  - Clinical Consumables
  - Sterilization Supplies
  - PPE and Safety Equipment
  - Dental Burs and Tools
  - Impression Materials
  - Clinical Instruments
  - Endodontic Supplies
  - Orthodontic Supplies
  - Restorative Materials
  - Preventive Care Products
  - Medications and Anesthetics
  - Radiographic Supplies
  - Laboratory Materials
  - Office and Administrative Supplies

## 🎯 Next Steps

1. **Explore the Dashboard**: Check real-time statistics and charts
2. **Manage Inventory**: Update stock levels, add new items
3. **Generate Reports**: View usage trends and cost analysis
4. **Configure Notifications**: Set up low stock alerts
5. **Manage Users**: Add team members with appropriate roles

## 🔧 Troubleshooting

**Backend not starting?**
- Check if MySQL is running
- Verify `.env` file has correct database credentials
- Run `npm install` in Backend/APIs folder

**Frontend not loading?**
- Make sure backend is running first
- Check if port 3001 is available
- Clear browser cache and reload

**Can't login?**
- Verify backend is running on port 3000
- Check browser console for errors
- Try clearing localStorage: `localStorage.clear()`

## 📱 Features Overview

### ✅ Implemented (Phase 1 & 2)
- JWT Authentication
- Dashboard with statistics
- Inventory management
- Reports and analytics
- User management
- Category and supplier management
- Stock movement tracking

### 🚧 Coming Soon (Phase 3)
- AI-powered reorder predictions
- Barcode scanning
- Offline mode
- Advanced analytics
- Mobile app
- Email notifications

## 🎨 Color Coding

- **Green (#10B981)**: In Stock, Success actions
- **Orange (#F59E0B)**: Low Stock warnings
- **Red (#EF4444)**: Out of Stock, Critical alerts
- **Blue (#3B82F6)**: Information, Secondary actions

## 💡 Tips

1. Use the **search bar** in Inventory to quickly find items
2. **Filter by area** to manage specific storage locations
3. Check the **Dashboard alerts** daily for low stock items
4. **Export reports** for record-keeping and analysis
5. Use **different user roles** (Admin/Staff) to test permissions

## 🔐 Security Notes

- Passwords are hashed with bcrypt
- JWT tokens expire after 24 hours
- Protected routes require authentication
- CORS configured for localhost development
- Rate limiting enabled on API endpoints

## 📈 Performance

- React Query caching reduces API calls
- Lazy loading for components
- Optimized Material-UI bundle
- Vite for fast development and builds
- Responsive design for all screen sizes

---

**Happy Inventory Management! 🦷✨**
