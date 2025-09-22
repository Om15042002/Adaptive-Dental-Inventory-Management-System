# Adaptive Dental Inventory Management API

## Overview
The Adaptive Dental Inventory Management API is designed to manage inventory and user data for dental practices. It provides endpoints for inventory management, user management, and authentication.

## Features
- List all inventory items
- Retrieve specific inventory item
- Update stock levels
- Retrieve low-stock items
- User profile management
- User authentication (login/logout)

## Technologies Used
- Node.js
- Express.js
- MySQL
- JWT for authentication

## Project Structure
```
adaptive-dental-inventory-api
├── src
│   ├── app.js
│   ├── controllers
│   ├── routes
│   ├── models
│   ├── middleware
│   ├── config
│   └── utils
├── tests
├── package.json
├── .env.example
└── .gitignore
```

## Setup Instructions
1. Clone the repository:
   ```
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```
   cd adaptive-dental-inventory-api
   ```
3. Install dependencies:
   ```
   npm install
   ```
4. Create a `.env` file based on the `.env.example` file and configure your database connection settings.
5. Start the application:
   ```
   npm start
   ```

## API Usage
### Inventory Endpoints
- `GET /api/inventory` - List all inventory items
- `GET /api/inventory/:id` - Get a specific inventory item
- `POST /api/inventory` - Create a new inventory item
- `PUT /api/inventory/:id` - Update an inventory item
- `DELETE /api/inventory/:id` - Delete an inventory item

### User Endpoints
- `GET /api/users/:id` - Retrieve user profile
- `PUT /api/users/:id` - Update user data

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

## Testing
To run tests, use the following command:
```
npm test
```

## License
This project is licensed under the MIT License.