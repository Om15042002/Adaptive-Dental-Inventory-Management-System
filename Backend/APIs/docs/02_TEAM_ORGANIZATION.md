# Team Organization & Module Assignment

## Team Distribution & Module Assignment

### Team Member 1: [Om Siddhapura] - Project Lead & Authentication Module
**Primary Responsibilities:**
- Project coordination and leadership
- Authentication system implementation
- User management and authorization
- Security middleware development

**Assigned Modules:**
- `src/controllers/authController.js`
- `src/controllers/userController.js`
- `src/middleware/auth.js`
- `src/models/User.js`
- `src/routes/auth.js`
- `src/routes/users.js`

**Key Features:**
- JWT-based authentication
- Role-based access control (Admin/Staff)
- User registration and profile management
- Password security and validation

---

### Team Member 2 (safan): Product & Category Management Module
**Primary Responsibilities:**
- Product lifecycle management
- Category organization system
- Product search and filtering
- Bulk operations implementation

**Assigned Modules:**
- `src/controllers/productController.js`
- `src/controllers/categorySupplierController.js` (Categories part)
- `src/models/Product.js`
- `src/models/Category.js`
- `src/routes/products.js`
- `src/routes/categories.js`

**Key Features:**
- Complete CRUD operations for products
- Advanced search and filtering capabilities
- Category management with statistics
- Product-category relationships

---

### Team Member 3 (Meet Gujrati): Inventory & Stock Management Module
**Primary Responsibilities:**
- Real-time inventory tracking
- Stock level monitoring
- Low stock alerts and notifications
- Inventory valuation calculations

**Assigned Modules:**
- `src/controllers/inventoryController.js`
- `src/models/Inventory.js`
- `src/routes/inventory.js`
- Integration with stock movement tracking

**Key Features:**
- Real-time stock level updates
- Automated low stock detection
- Inventory value calculations
- Dashboard statistics for inventory

---

### Team Member 4:(Jainil Patel) Stock Movement & Tracking Module
**Primary Responsibilities:**
- Stock movement recording and history
- Movement analytics and reporting
- Cost tracking and analysis
- Audit trail maintenance

**Assigned Modules:**
- `src/controllers/stockMovementController.js`
- `src/models/StockMovement.js`
- `src/routes/stockMovements.js`
- Movement analytics implementation

**Key Features:**
- Comprehensive movement tracking
- Historical data analysis
- Cost analysis and trends
- Movement type categorization

---

### Team Member 5(Yash Kikani): Supplier Management & Reporting Module
**Primary Responsibilities:**
- Supplier relationship management
- Advanced reporting and analytics
- Business intelligence features
- Data export capabilities

**Assigned Modules:**
- `src/controllers/categorySupplierController.js` (Suppliers part)
- `src/controllers/reportsController.js`
- `src/models/Supplier.js`
- `src/routes/suppliers.js`
- `src/routes/reports.js`

**Key Features:**
- Supplier management and statistics
- Usage analytics and insights
- Cost analysis reports
- Dashboard and summary reports

## Shared Responsibilities

### Infrastructure & Configuration (All Team Members)
- `src/app.js` - Main application setup
- `src/config/database.js` - Database configuration
- `src/middleware/validation.js` - Validation middleware
- `src/utils/helpers.js` - Utility functions
- `package.json` - Dependencies management
- Testing files in `tests/` directory

## Code Review Assignments

| Reviewer | Reviews Code From |
|----------|-------------------|
| **Project Lead** | All team members |
| **Member 2** | Member 3, Member 4 |
| **Member 3** | Member 4, Member 5 |
| **Member 4** | Member 5, Member 2 |
| **Member 5** | Member 2, Member 3 |

## Communication & Collaboration

### Communication Channels
- **Daily Standups:** In-person/video calls
- **Code Reviews:** GitHub pull requests
- **Documentation:** Shared repository wiki
- **Issues Tracking:** GitHub issues

### Collaboration Tools
- **Version Control:** Git with GitHub
- **Project Management:** GitHub Projects/Jira
- **Documentation:** Markdown files in repository
- **Communication:** Slack/Discord for quick updates

## Git Workflow

### Branching Strategy
- **main** - Production-ready code
- **develop** - Integration branch for features
- **staging** - Pre-production testing branch

### Feature Branches
- **feature/auth-system** - Authentication module
- **feature/product-management** - Product & category management
- **feature/inventory-tracking** - Inventory management
- **feature/stock-movements** - Stock movement tracking
- **feature/supplier-reports** - Supplier management & reporting

### Commit Convention
```
type(scope): description

Examples:
feat(auth): implement JWT authentication
fix(inventory): resolve stock calculation bug
docs(api): update endpoint documentation
test(products): add unit tests for product controller
```