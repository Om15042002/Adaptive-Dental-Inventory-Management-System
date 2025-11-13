# Application Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                          │
│                    (Browser - Port 3001)                        │
└─────────────────────────────────────────────────────────────────┘
                              ▲ │
                              │ │
                    HTTP Requests/Responses (JSON)
                              │ │
                              │ ▼
┌─────────────────────────────────────────────────────────────────┐
│                      REACT FRONTEND                             │
│                                                                 │
│  ┌───────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │   Components  │  │   Services   │  │  State Mgmt      │   │
│  │               │  │              │  │                  │   │
│  │ - Layout      │  │ - authService│  │ - AuthContext    │   │
│  │ - Sidebar     │  │ - productSvc │  │ - React Query    │   │
│  │ - Header      │  │ - inventorySvc│ │ - Local State    │   │
│  │ - Pages       │  │ - reportSvc  │  │                  │   │
│  └───────────────┘  └──────────────┘  └──────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │              Pages (Routes)                             │  │
│  │                                                         │  │
│  │  /login  /dashboard  /inventory  /products  /reports   │  │
│  │  /orders  /suppliers  /analytics  /notifications        │  │
│  └─────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ▲ │
                              │ │
                       Axios HTTP Client
                       (JWT Token in Headers)
                              │ │
                              │ ▼
┌─────────────────────────────────────────────────────────────────┐
│                     EXPRESS.JS SERVER                           │
│                      (Port 3000)                                │
│                                                                 │
│  ┌───────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │  Middleware   │  │    Routes    │  │   Controllers    │   │
│  │               │  │              │  │                  │   │
│  │ - CORS        │  │ /auth        │  │ authController   │   │
│  │ - Helmet      │  │ /products    │  │ productCtrl      │   │
│  │ - JWT Auth    │  │ /inventory   │  │ inventoryCtrl    │   │
│  │ - Validation  │  │ /reports     │  │ reportsCtrl      │   │
│  │ - RateLimit   │  │ /users       │  │ userController   │   │
│  └───────────────┘  └──────────────┘  └──────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │              Models (Business Logic)                    │  │
│  │                                                         │  │
│  │  Product  Inventory  StockMovement  Category  Supplier │  │
│  │  User                                                   │  │
│  └─────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ▲ │
                              │ │
                     MySQL2 Connection Pool
                              │ │
                              │ ▼
┌─────────────────────────────────────────────────────────────────┐
│                       MySQL DATABASE                            │
│                                                                 │
│  ┌──────────┐  ┌───────────┐  ┌────────────────┐             │
│  │  users   │  │ products  │  │   inventory    │             │
│  │          │  │           │  │                │             │
│  │ - id     │  │ - id      │  │ - id           │             │
│  │ - email  │  │ - name    │  │ - product_id   │             │
│  │ - role   │  │ - category│  │ - quantity     │             │
│  └──────────┘  └───────────┘  │ - reorder_point│             │
│                                └────────────────┘             │
│  ┌──────────┐  ┌───────────┐  ┌────────────────┐             │
│  │categories│  │ suppliers │  │ stock_movements│             │
│  │          │  │           │  │                │             │
│  │ - id     │  │ - id      │  │ - id           │             │
│  │ - name   │  │ - name    │  │ - product_id   │             │
│  └──────────┘  └───────────┘  │ - movement_type│             │
│                                │ - quantity     │             │
│                                └────────────────┘             │
└─────────────────────────────────────────────────────────────────┘
```

## Request Flow

### Authentication Flow
```
1. User enters credentials
   ↓
2. Frontend: authService.login(email, password)
   ↓
3. POST /api/auth/login
   ↓
4. Backend: authController.login
   ↓
5. User.findByEmail(email)
   ↓
6. bcrypt.compare(password, hashedPassword)
   ↓
7. Generate JWT token
   ↓
8. Return { token, user }
   ↓
9. Frontend: Store token in localStorage
   ↓
10. Update AuthContext state
   ↓
11. Redirect to /dashboard
```

### Data Fetching Flow (React Query)
```
1. Component mounts
   ↓
2. useQuery('inventory', inventoryService.getAll)
   ↓
3. Check React Query cache
   ↓ (if not cached or stale)
4. GET /api/inventory (with JWT in headers)
   ↓
5. Backend: auth middleware verifies token
   ↓
6. inventoryController.getAll
   ↓
7. Inventory.findAll() - Query MySQL
   ↓
8. Return inventory data
   ↓
9. React Query caches result
   ↓
10. Component re-renders with data
```

### Update Flow
```
1. User clicks "Update Stock"
   ↓
2. useMutation(inventoryService.updateStock)
   ↓
3. PUT /api/inventory/:id/stock (with JWT)
   ↓
4. Backend: auth + validation middleware
   ↓
5. inventoryController.updateStock
   ↓
6. Inventory.updateStock(id, data)
   ↓
7. MySQL transaction: UPDATE inventory
   ↓
8. Create stock movement record
   ↓
9. Return updated inventory
   ↓
10. React Query invalidates cache
   ↓
11. Re-fetch inventory data
   ↓
12. Toast success notification
   ↓
13. UI updates automatically
```

## Technology Stack Details

### Frontend Layer
```
┌─────────────────────────────────────┐
│         React 18.2.0                │
│                                     │
│  ┌─────────────────────────────┐   │
│  │   Material-UI 5.14.0        │   │
│  │   - Components              │   │
│  │   - Theme System            │   │
│  │   - Icons                   │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │   React Router 6.16.0       │   │
│  │   - Client-side routing     │   │
│  │   - Protected routes        │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │   React Query 3.39.3        │   │
│  │   - Server state mgmt       │   │
│  │   - Caching strategy        │   │
│  │   - Auto re-fetching        │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │   Axios 1.5.0               │   │
│  │   - HTTP client             │   │
│  │   - Interceptors            │   │
│  │   - Request/Response        │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │   Recharts 2.8.0            │   │
│  │   - Data visualization      │   │
│  │   - Interactive charts      │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

### Backend Layer
```
┌─────────────────────────────────────┐
│      Express.js 4.18.2              │
│                                     │
│  ┌─────────────────────────────┐   │
│  │   Security Middleware       │   │
│  │   - Helmet.js               │   │
│  │   - CORS                    │   │
│  │   - Rate Limiting           │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │   Authentication            │   │
│  │   - JWT (jsonwebtoken)      │   │
│  │   - bcrypt (hashing)        │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │   Validation                │   │
│  │   - express-validator       │   │
│  │   - Custom validators       │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │   Database Layer            │   │
│  │   - mysql2 (driver)         │   │
│  │   - Connection pooling      │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

### Database Layer
```
┌─────────────────────────────────────┐
│         MySQL 8.0                   │
│                                     │
│  Schema Features:                   │
│  - Normalized design (3NF)          │
│  - Foreign key constraints          │
│  - Indexes on key columns           │
│  - AUTO_INCREMENT primary keys      │
│  - TIMESTAMP with ON UPDATE         │
│  - ENUM for status fields           │
│                                     │
│  6 Tables:                          │
│  1. users                           │
│  2. categories                      │
│  3. suppliers                       │
│  4. products                        │
│  5. inventory                       │
│  6. stock_movements                 │
└─────────────────────────────────────┘
```

## Security Architecture

```
┌─────────────────────────────────────────────┐
│              Security Layers                │
│                                             │
│  1. Frontend Security                       │
│     ┌────────────────────────────────┐     │
│     │ - Token stored in localStorage │     │
│     │ - Auto-logout on expiration    │     │
│     │ - Protected routes             │     │
│     │ - HTTPS in production          │     │
│     └────────────────────────────────┘     │
│                                             │
│  2. API Security                            │
│     ┌────────────────────────────────┐     │
│     │ - JWT verification             │     │
│     │ - Rate limiting (100/15min)    │     │
│     │ - CORS restrictions            │     │
│     │ - Security headers (Helmet)    │     │
│     └────────────────────────────────┘     │
│                                             │
│  3. Input Validation                        │
│     ┌────────────────────────────────┐     │
│     │ - express-validator            │     │
│     │ - SQL injection prevention     │     │
│     │ - XSS protection               │     │
│     │ - Data sanitization            │     │
│     └────────────────────────────────┘     │
│                                             │
│  4. Database Security                       │
│     ┌────────────────────────────────┐     │
│     │ - Parameterized queries        │     │
│     │ - Password hashing (bcrypt)    │     │
│     │ - Connection pooling           │     │
│     │ - Restricted user permissions  │     │
│     └────────────────────────────────┘     │
└─────────────────────────────────────────────┘
```

## Deployment Architecture

```
                    ┌──────────────┐
                    │    Users     │
                    └──────┬───────┘
                           │
                    ┌──────▼───────┐
                    │   CDN/WAF    │  ← Cloudflare/AWS CloudFront
                    └──────┬───────┘
                           │
                    ┌──────▼───────┐
                    │ Load Balancer│  ← Nginx/AWS ALB
                    └──────┬───────┘
                           │
            ┌──────────────┴──────────────┐
            │                             │
     ┌──────▼─────┐              ┌────────▼──────┐
     │  Frontend  │              │   Backend API │
     │  (Static)  │              │   (Node.js)   │
     │            │              │               │
     │ Vercel/    │              │ AWS EC2/      │
     │ Netlify/   │              │ Heroku/       │
     │ S3+CF      │              │ DigitalOcean  │
     └────────────┘              └────────┬──────┘
                                          │
                                 ┌────────▼──────┐
                                 │  MySQL DB     │
                                 │               │
                                 │ AWS RDS/      │
                                 │ DigitalOcean  │
                                 │ Managed DB    │
                                 └───────────────┘
```

## Development vs Production

### Development Environment
```
Frontend: http://localhost:3001 (Vite Dev Server)
Backend:  http://localhost:3000 (Nodemon)
Database: localhost:3306 (MySQL)

- Hot module replacement
- Source maps enabled
- Detailed error messages
- No minification
- CORS allows localhost
```

### Production Environment
```
Frontend: https://dental-app.com (CDN)
Backend:  https://api.dental-app.com (Load Balanced)
Database: Remote MySQL (Managed Service)

- Minified bundles
- Code splitting
- Gzip compression
- HTTPS only
- Environment variables
- Error logging
- Performance monitoring
```

## Data Flow Examples

### Dashboard Load
```
User → Dashboard Page
  ↓
React Query: useQuery('dashboard-stats')
  ↓
GET /api/inventory/dashboard
  ↓
MySQL: SELECT stats from inventory
  ↓
Returns: { totalItems, lowStock, outOfStock, expiringSoon }
  ↓
React Query caches (5 min)
  ↓
Dashboard renders stats cards
```

### Stock Update
```
User clicks "Update Stock"
  ↓
Form dialog opens
  ↓
User enters new quantity
  ↓
useMutation(updateStock)
  ↓
PUT /api/inventory/:id/stock
  ↓
Auth middleware verifies JWT
  ↓
Validation middleware checks data
  ↓
Controller: Inventory.updateStock()
  ↓
MySQL: BEGIN TRANSACTION
  ↓
UPDATE inventory SET quantity = ?
  ↓
INSERT INTO stock_movements
  ↓
COMMIT
  ↓
Return updated inventory
  ↓
React Query invalidates cache
  ↓
Auto-refetch inventory list
  ↓
Toast: "Stock updated successfully"
  ↓
Dialog closes, table updates
```

---

This architecture ensures:
- ✅ Separation of concerns
- ✅ Scalability
- ✅ Security
- ✅ Maintainability
- ✅ Performance
- ✅ Developer experience
