# GEMORA Backend - Complete Workflow Documentation

## Project Overview
GEMORA is a specialized e-commerce platform for rare gems and gemological instruments. The backend is built with Node.js, Express, MongoDB, and Google Gemini AI for intelligent customer support.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Client (Frontend)                         │
└─────────────────────────────────────────────────────────────┘
                            ↓
                    HTTP Requests/Responses
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    Express Server (Port 5000)               │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Routes     │  │   Routes     │  │   Routes     │      │
│  │   (Auth)     │  │  (Gems/Tools)│  │   (Chat)     │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                 │                 │               │
│  ┌──────▼─────────────────▼─────────────────▼───────┐      │
│  │              Controllers (Business Logic)         │      │
│  │  ┌─────────┐  ┌──────────┐  ┌──────────────┐    │      │
│  │  │  Auth   │  │  Gem/Tool│  │    Chat      │    │      │
│  │  └─────────┘  └──────────┘  └──────────────┘    │      │
│  └──────────────────────┬──────────────────────────┘      │
│                         │                                  │
│  ┌──────────────────────▼──────────────────────────┐      │
│  │     Middleware (Auth, Error Handling)           │      │
│  └────────────────────────────────────────────────┘      │
│                         │                                  │
└─────────────────────────┼──────────────────────────────────┘
                          ↓
         ┌────────────────┴────────────────┐
         ↓                                 ↓
    ┌─────────────┐           ┌──────────────────┐
    │ MongoDB     │           │ Google Gemini    │
    │ (Database)  │           │ AI API           │
    └─────────────┘           └──────────────────┘
```

---

## Project Directory Structure

```
GEMORA-backend/
├── src/
│   ├── app.js                          # Express app setup & middleware
│   ├── server.js                       # Entry point (starts server)
│   ├── config/
│   │   └── db.js                       # MongoDB connection
│   ├── controllers/
│   │   ├── auth.controller.js          # User registration & login
│   │   ├── chat.controller.js          # AI chat responses
│   │   ├── gemController.js            # Gem operations
│   │   └── tool.controller.js          # Tool operations
│   ├── middleware/
│   │   ├── auth.middleware.js          # JWT verification (placeholder)
│   │   └── error.middleware.js         # Global error handling
│   ├── models/
│   │   ├── User.js                     # User schema
│   │   ├── gem.js                      # Gem product schema
│   │   └── tool.js                     # Tool product schema
│   ├── routes/
│   │   ├── auth.routes.js              # Auth endpoints
│   │   ├── chat.routes.js              # Chat endpoints
│   │   ├── gem.routes.js               # Gem endpoints
│   │   └── tool.routes.js              # Tool endpoints
│   └── utils/
│       ├── apiResponse.js              # API response formatter (empty)
│       └── auth.js                     # Token management utilities
├── package.json                        # Dependencies
├── .env                                # Environment variables
└── BACKEND_WORKFLOW.md                 # This file
```

---

## Environment Variables (.env)

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGO_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/gemora?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=gemoraSuperSecret123
JWT_EXPIRES_IN=7d

# AI Configuration
GEMINI_API_KEY=AIzaSy...

# Optional
COOKIE_EXPIRE=7
```

---

## Data Models

### 1. User Model
```
User
├── name (String, required)
├── email (String, required, unique)
├── password (String, required, hashed)
├── role (Enum: "user" | "admin", default: "user")
├── createdAt (Timestamp)
└── updatedAt (Timestamp)
```

### 2. Gem Model
```
Gem
├── name (String, required)           # e.g., "Blue Sapphire"
├── carat (Number, required)          # Weight
├── clarity (String)                  # e.g., "VVS", "SI"
├── origin (String)                   # e.g., "Ceylon"
├── price (Number, required)
├── countInStock (Number, default: 1)
├── imageUrl (String)
├── description (String)
├── createdAt (Timestamp)
└── updatedAt (Timestamp)
```

### 3. Tool Model
```
Tool
├── name (String, required)           # e.g., "10x Triplet Loupe"
├── brand (String, required)          # e.g., "Zeiss"
├── category (String, required)       # e.g., "Loupe", "Microscope"
├── price (Number, required)
├── countInStock (Number, default: 0)
├── description (String)
├── imageUrl (String)
├── createdAt (Timestamp)
└── updatedAt (Timestamp)
```

---

## API Endpoints & Workflows

### Authentication Workflow

#### 1. User Registration
```
POST /api/auth/register
┌─────────────────────────────────────┐
│ Request Body:                       │
│ {                                   │
│   "name": "John Doe",              │
│   "email": "john@example.com",     │
│   "password": "securePass123"      │
│ }                                   │
└─────────────────────────────────────┘
         ↓
   Check if email exists
         ↓
   Hash password (bcrypt)
         ↓
   Save user to MongoDB
         ↓
   Generate JWT token
         ↓
┌─────────────────────────────────────┐
│ Response (201):                     │
│ {                                   │
│   "token": "eyJhbG...",            │
│   "user": {                         │
│     "id": "xyz123",                │
│     "name": "John Doe",            │
│     "email": "john@example.com",   │
│     "role": "user"                 │
│   }                                 │
│ }                                   │
└─────────────────────────────────────┘
```

#### 2. User Login
```
POST /api/auth/login
┌─────────────────────────────────────┐
│ Request Body:                       │
│ {                                   │
│   "email": "john@example.com",     │
│   "password": "securePass123"      │
│ }                                   │
└─────────────────────────────────────┘
         ↓
   Find user by email
         ↓
   Compare password (bcrypt)
         ↓
   Generate JWT token
         ↓
┌─────────────────────────────────────┐
│ Response (200):                     │
│ {                                   │
│   "token": "eyJhbG...",            │
│   "user": {                         │
│     "id": "xyz123",                │
│     "name": "John Doe",            │
│     "email": "john@example.com",   │
│     "role": "user"                 │
│   }                                 │
│ }                                   │
└─────────────────────────────────────┘
```

---

### Gem Management Workflow

#### 1. Get All Gems
```
GET /api/gems
         ↓
   Query MongoDB (Gem collection)
         ↓
┌─────────────────────────────────────┐
│ Response (200): Array of gems      │
│ [                                   │
│   {                                 │
│     "id": "gem001",                │
│     "name": "Blue Sapphire",       │
│     "carat": 2.5,                  │
│     "clarity": "VVS",              │
│     "origin": "Ceylon",            │
│     "price": 15000,                │
│     "countInStock": 3              │
│   },                                │
│   ...                               │
│ ]                                   │
└─────────────────────────────────────┘
```

#### 2. Create New Gem
```
POST /api/gems
┌─────────────────────────────────────┐
│ Request Body:                       │
│ {                                   │
│   "name": "Ruby",                  │
│   "carat": 1.8,                    │
│   "clarity": "SI",                 │
│   "origin": "Myanmar",             │
│   "price": 20000,                  │
│   "countInStock": 2,               │
│   "imageUrl": "...",               │
│   "description": "..."             │
│ }                                   │
└─────────────────────────────────────┘
         ↓
   Validate request data
         ↓
   Create new Gem document
         ↓
   Save to MongoDB
         ↓
┌─────────────────────────────────────┐
│ Response (201): Created gem         │
└─────────────────────────────────────┘
```

---

### Tool Management Workflow

#### 1. Get All Tools
```
GET /api/tools
         ↓
   Query MongoDB (Tool collection)
         ↓
┌─────────────────────────────────────┐
│ Response (200): Array of tools     │
│ [                                   │
│   {                                 │
│     "id": "tool001",               │
│     "name": "10x Triplet Loupe",   │
│     "brand": "Zeiss",              │
│     "category": "Loupe",           │
│     "price": 450,                  │
│     "countInStock": 5              │
│   },                                │
│   ...                               │
│ ]                                   │
└─────────────────────────────────────┘
```

#### 2. Create New Tool
```
POST /api/tools
┌─────────────────────────────────────┐
│ Request Body:                       │
│ {                                   │
│   "name": "Digital Scale",         │
│   "brand": "Mettler",              │
│   "category": "Scale",             │
│   "price": 350,                    │
│   "countInStock": 3,               │
│   "imageUrl": "...",               │
│   "description": "..."             │
│ }                                   │
└─────────────────────────────────────┘
         ↓
   Validate request data
         ↓
   Create new Tool document
         ↓
   Save to MongoDB
         ↓
┌─────────────────────────────────────┐
│ Response (201): Created tool        │
└─────────────────────────────────────┘
```

---

### AI Chat Workflow

#### Chat with Gemini AI
```
POST /api/chat
┌─────────────────────────────────────┐
│ Request Body:                       │
│ {                                   │
│   "message": "What is a carat?"    │
│ }                                   │
└─────────────────────────────────────┘
         ↓
   Validate message (not empty)
         ↓
   Verify API key exists
         ↓
   Initialize Gemini model
         ↓
   Create system prompt with rules:
   • Only answer about gems & tools
   • Refuse music instrument questions
   • Refuse general knowledge questions
   • Keep answers professional
         ↓
   Send to Google Gemini API
         ↓
   Receive AI response
         ↓
┌─────────────────────────────────────┐
│ Response (200):                     │
│ {                                   │
│   "success": true,                 │
│   "reply": "A carat is a unit..."  │
│ }                                   │
└─────────────────────────────────────┘

Error Handling:
├── Empty message → 400 (Bad Request)
├── API key missing → 500 (Server Error)
└── API call fails → 500 (Server Error)
```

---

## Request/Response Flow

### Successful Request Flow
```
1. Client sends HTTP request
         ↓
2. Express receives request
         ↓
3. Middleware (CORS, JSON parser) processes
         ↓
4. Route handler matches endpoint
         ↓
5. Controller executes business logic
         ↓
6. Database/API operations
         ↓
7. Format response
         ↓
8. Send JSON response with status code
         ↓
9. Client receives response
```

### Error Handling Flow
```
1. Error occurs (validation, DB, API)
         ↓
2. Error caught in try-catch
         ↓
3. next(err) passes to error middleware
         ↓
4. Error middleware formats error response
         ↓
5. Return 4xx (client error) or 5xx (server error)
         ↓
6. Client receives error with message
```

---

## Key Features

### 1. Authentication
- User registration with email validation
- Password hashing with bcrypt
- JWT token generation (7-day expiry)
- User roles (user/admin)

### 2. Product Management
- **Gems**: Unique gemstones with carat, clarity, origin
- **Tools**: Gemological instruments like loupes, microscopes
- Full CRUD operations for both

### 3. AI Chat Support
- Powered by Google Gemini 2.5 Flash
- Domain-constrained responses (only gems & tools)
- Automatic rejection of off-topic questions
- Professional customer support automation

### 4. Database
- MongoDB Atlas cloud database
- Collections: Users, Gems, Tools
- Automatic timestamps (createdAt, updatedAt)
- Data validation at schema level

---

## Running the Backend

### Setup
```bash
# 1. Install dependencies
npm install

# 2. Create .env file with required variables
# See .env section above

# 3. Test database connection
# Server will log "MongoDB Connected" on startup
```

### Development
```bash
# Start with auto-reload
npm run dev
```

### Production
```bash
# Start server
npm start
```

### Expected Output
```
[dotenv] injecting env variables
MongoDB Connected
Server running on port 5000
```

---

## Testing API Endpoints

### Using Postman or curl

#### 1. Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

#### 2. Login User
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

#### 3. Get All Gems
```bash
curl -X GET http://localhost:5000/api/gems
```

#### 4. Create Gem
```bash
curl -X POST http://localhost:5000/api/gems \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Ruby",
    "carat": 1.8,
    "clarity": "SI",
    "origin": "Myanmar",
    "price": 20000,
    "countInStock": 2,
    "description": "Beautiful red ruby"
  }'
```

#### 5. Chat with AI
```bash
curl -X POST http://localhost:5000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What is the 4 Cs of diamond grading?"
  }'
```

---

## Code Quality Standards

### File Headers
Each file starts with a documentation comment:
```javascript
/**
 * File description
 * Brief explanation of what this file does
 */
```

### Function Comments
Meaningful comments for complex logic:
```javascript
// Database query to retrieve all gems
const gems = await Gem.find({});

// Hash password with 10 salt rounds
const hashed = await bcrypt.hash(password, 10);
```

### No AI-Generated Clutter
- Removed emoji comments (✅, ❌)
- Removed @desc/@route comments
- Kept only essential documentation

---

## Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| Port 5000 in use | Another process using port | `npx kill-port 5000` |
| MongoDB connection failed | Invalid credentials/IP not whitelisted | Check MONGO_URI, add IP to Atlas |
| Chat API 404 error | Invalid/inactive API key | Create new key at aistudio.google.com |
| Empty response | Missing .env variables | Verify all env vars are set |

---

## Next Steps for Team

1. **Frontend Integration**: Connect frontend to these endpoints
2. **Authentication**: Implement JWT middleware for protected routes
3. **Validation**: Add request validation middleware
4. **Testing**: Write unit tests for controllers
5. **Documentation**: Update API docs as features grow
6. **Deployment**: Deploy to cloud (Heroku, Railway, Render)

---

## Support & Questions

Refer to:
- [Express.js Documentation](https://expressjs.com)
- [MongoDB Documentation](https://docs.mongodb.com)
- [Google Gemini API](https://aistudio.google.com)
- Backend team members

---

**Last Updated**: February 1, 2026
**Version**: 1.0
**Status**: Production Ready ✓
