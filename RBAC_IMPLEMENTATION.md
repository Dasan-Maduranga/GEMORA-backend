# Role-Based Access Control (RBAC) Implementation Guide

## Overview
This document explains the role-based access control system implemented in GEMORA backend. The system supports user authentication with JWT tokens and role-based authorization.

## User Roles

### 1. **user** (Default Role)
- Standard user account
- Can read gems and tools
- Can participate in chat
- Can create gems
- Cannot manage other users or create tools

### 2. **admin** (Administrator Role)
- Full system access
- Can read all gems and tools
- Can participate in chat
- Can create gems and tools
- Can manage user roles
- Can view all users in the system

## Authentication Flow

### 1. Register New User
```bash
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

### 2. Login User
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

## Authorization Middleware

### 1. verifyToken Middleware
Verifies JWT token and attaches user to request object.

**Usage in routes:**
```javascript
const { verifyToken } = require("../middleware/auth.middleware");

router.get("/profile", verifyToken, getProfile);
```

**Token Format:**
```
Authorization: Bearer <jwt_token>
```

### 2. optionalToken Middleware
Verifies token if present, but doesn't fail if missing. Useful for public endpoints that work with or without auth.

**Usage in routes:**
```javascript
const { optionalToken } = require("../middleware/auth.middleware");

router.get("/gems", optionalToken, getGems);
```

### 3. authorize(roles) Middleware
Checks if authenticated user has required role(s).

**Usage in routes:**
```javascript
const { authorize } = require("../middleware/authorization.middleware");

// Single role
router.post("/gems", verifyToken, authorize("admin"), createGem);

// Multiple roles
router.post("/gems", verifyToken, authorize(["admin", "user"]), createGem);
```

### 4. adminOnly Middleware
Shorthand for checking admin role only.

**Usage in routes:**
```javascript
const { adminOnly } = require("../middleware/authorization.middleware");

router.get("/users", verifyToken, adminOnly, getAllUsers);
```

## Protected Endpoints

### Authentication Endpoints

#### 1. Get User Profile
```bash
GET /api/auth/profile
Authorization: Bearer <token>

Response:
{
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

#### 2. Get User by ID
```bash
GET /api/auth/user/:userId
Authorization: Bearer <token>

Response:
{
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

#### 3. List All Users (Admin Only)
```bash
GET /api/auth/users
Authorization: Bearer <admin_token>

Response:
{
  "users": [
    {
      "id": "user_id_1",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "createdAt": "2024-01-15T10:30:00Z"
    },
    {
      "id": "user_id_2",
      "name": "Admin User",
      "email": "admin@example.com",
      "role": "admin",
      "createdAt": "2024-01-10T08:00:00Z"
    }
  ]
}
```

#### 4. Update User Role (Admin Only)
```bash
PUT /api/auth/user/role
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "userId": "target_user_id",
  "role": "admin"
}

Response:
{
  "message": "User role updated successfully",
  "user": {
    "id": "target_user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "admin"
  }
}
```

### Gem Endpoints

#### 1. Get All Gems (Public/Authenticated)
```bash
GET /api/gems
Authorization: Bearer <token> (Optional)
```

#### 2. Create Gem (User/Admin)
```bash
POST /api/gems
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Diamond",
  "color": "Clear",
  "carat": 2.5
}
```

### Tool Endpoints

#### 1. Get All Tools (Public/Authenticated)
```bash
GET /api/tools
Authorization: Bearer <token> (Optional)
```

#### 2. Create Tool (Admin Only)
```bash
POST /api/tools
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Loupe",
  "type": "Magnifier"
}
```

### Chat Endpoints

#### 1. Ask Bot (User/Admin)
```bash
POST /api/chat
Authorization: Bearer <token>
Content-Type: application/json

{
  "message": "What is a carat?"
}
```

## Error Responses

### 1. Missing Token
```json
{
  "message": "No token provided"
}
Status: 401
```

### 2. Invalid Token
```json
{
  "message": "Invalid token"
}
Status: 401
```

### 3. Token Expired
```json
{
  "message": "Token expired"
}
Status: 401
```

### 4. Insufficient Permissions
```json
{
  "message": "Access denied. Required roles: admin"
}
Status: 403
```

## Creating New Protected Routes

### Example: Admin-Only Endpoint
```javascript
const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth.middleware");
const { adminOnly } = require("../middleware/authorization.middleware");

// Admin only route
router.get("/admin-data", verifyToken, adminOnly, async (req, res) => {
  // req.user contains authenticated user data
  console.log("Admin user:", req.user);
  res.json({ data: "Admin only data" });
});

module.exports = router;
```

### Example: User/Admin Endpoint
```javascript
router.post("/create-resource", 
  verifyToken, 
  authorize(["user", "admin"]), 
  async (req, res) => {
    // Both users and admins can access
    console.log("User:", req.user);
    res.json({ message: "Resource created" });
  }
);
```

### Example: Public/Optional Auth Endpoint
```javascript
const { optionalToken } = require("../middleware/auth.middleware");

router.get("/public-data", optionalToken, async (req, res) => {
  if (req.user) {
    // User is authenticated
    res.json({ 
      data: "Public data",
      user: req.user.name 
    });
  } else {
    // User not authenticated
    res.json({ data: "Public data only" });
  }
});
```

## Environment Variables Required

```env
JWT_SECRET=your_secret_key_here
MONGODB_URI=mongodb://localhost/gemora
PORT=5000
```

## Best Practices

1. **Always verify tokens** on protected routes
2. **Use specific middleware** - don't grant more access than needed
3. **Log authentication events** for security audit trails
4. **Rotate JWT secrets** periodically
5. **Use HTTPS** in production to protect tokens
6. **Implement rate limiting** on auth endpoints
7. **Hash passwords** before storing (already implemented)
8. **Validate input** on all admin endpoints

## Middleware Chain Examples

### Public Endpoint with Optional Auth
```javascript
router.get("/gems", optionalToken, getGems);
```

### Protected Endpoint (Any Authenticated User)
```javascript
router.get("/profile", verifyToken, getProfile);
```

### Role-Specific Endpoint
```javascript
router.post("/users", verifyToken, authorize("admin"), createUser);
```

### Multiple Valid Roles
```javascript
router.post("/gems", verifyToken, authorize(["admin", "user"]), createGem);
```

## Testing with cURL

### Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Access Protected Endpoint
```bash
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Access Admin Endpoint
```bash
curl -X GET http://localhost:5000/api/auth/users \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

## Troubleshooting

### Issue: "No token provided"
- Ensure Authorization header is sent
- Format: `Authorization: Bearer <token>`

### Issue: "Invalid token"
- Token may be corrupted or tampered
- Try logging in again

### Issue: "Token expired"
- Generate a new token by logging in again
- Consider implementing refresh tokens

### Issue: "Access denied"
- User doesn't have required role
- Contact admin to upgrade permissions

---

**Last Updated:** February 2, 2026
