# Major Project #3
# Complete RESTful API with Authentication - Assessment Rubric

## Project Overview

This rubric evaluates the Complete RESTful API with Authentication project based on user authentication, JSON Web Tokens, protected routes, role-based access control, and security best practices covered in modules 095-101.

### Project Options

**Option A: Task Management API**
Build a professional task management API where users can create, read, update, and delete tasks. Implement user authentication, protected routes, and role-based access control for team collaboration. Users can manage their own tasks, while admin users can view and manage all tasks across the system.

**Option B: Recipe Sharing API**
Build a community recipe sharing API where users can create, share, and save their favorite recipes. Implement user authentication, protected routes, and role-based access control for content moderation. Users can manage their own recipes, while moderator users can review and manage community content.

---

## **Project-Specific Requirements**

### **Option A - Task Management API Must Include:**

- [ ] **Task CRUD** - Full CRUD operations for tasks with title, description, status, priority, dueDate
- [ ] **Task Ownership** - Tasks belong to users, users can only manage their own tasks
- [ ] **Admin Dashboard** - Admin endpoint to view/manage all tasks across users
- [ ] **Status Updates** - Users can update task status (pending/in-progress/completed)

### **Option B - Recipe Sharing API Must Include:**

- [ ] **Recipe CRUD** - Full CRUD operations for recipes with title, ingredients, instructions, cookTime
- [ ] **Recipe Ownership** - Recipes belong to users, users can manage their own recipes
- [ ] **Public/Private** - Users can mark recipes as public or private
- [ ] **Moderator Actions** - Moderators can feature or hide recipes

---

## **Must Have (Required for Passing):**

### **Files and Structure**

- [ ] **Separate Folders** - routes/, controllers/, and middleware/ folders created with organized files
- [ ] **Main Entry Point** - server.js or app.js as main application file
- [ ] **Package Configuration** - package.json with all required dependencies listed

### **Security and Environment**

- [ ] **Environment File** - .env file for secrets (JWT_SECRET, PORT, etc.) not committed to repo
- [ ] **Environment Template** - .env.example file provided showing required variables
- [ ] **Git Ignore** - .gitignore includes node_modules/ and .env

### **Authentication Implementation**

- [ ] **User Registration** - POST /api/auth/register endpoint that hashes passwords with bcrypt and creates new users
- [ ] **User Login** - POST /api/auth/login endpoint that verifies credentials and returns JWT token
- [ ] **Password Hashing** - All passwords hashed with bcrypt using minimum 10 salt rounds
- [ ] **JWT Token Generation** - Generate tokens with user id, email, and role in payload with 7-30 day expiration
- [ ] **Input Validation** - Validate registration/login inputs (email format, password length, required fields)

### **Protected Routes and Middleware**

- [ ] **Authentication Middleware** - Middleware function that extracts and verifies JWT from Authorization header
- [ ] **Token Verification** - Verify tokens using jwt.verify() and attach user data to req.user
- [ ] **Protected Endpoints** - Apply auth middleware to all routes requiring login
- [ ] **Role-Based Middleware** - Middleware that checks user role matches required role for route access
- [ ] **Error Responses** - Return 401 for invalid tokens, 403 for insufficient permissions

### **CRUD Operations with Authorization**

- [ ] **Create Resource** - POST endpoint for creating resources, authenticated users only
- [ ] **Read Resources** - GET endpoints to retrieve user's own resources
- [ ] **Update Resource** - PUT/PATCH endpoint, only resource owner or admin can update
- [ ] **Delete Resource** - DELETE endpoint, only resource owner or admin can delete
- [ ] **Ownership Verification** - Verify resource belongs to user before allowing modifications
- [ ] **CORS Configuration** - Configure CORS middleware properly for API access
- [ ] **Helmet.js** - Use helmet.js for security headers
- [ ] **Rate Limiting** - Implement rate limiting on auth endpoints
- [ ] **Error Handling** - Consistent error format with appropriate HTTP status codes

---

## **Could Have (Bonus Points):**

### **Advanced Authentication**
- [ ] **Refresh Tokens** - Implement refresh token system for extended sessions
- [ ] **Password Reset** - Implement forgot password flow with email token
- [ ] **Email Verification** - Send verification email during registration

### **Enhanced Features**
- [ ] **Pagination** - Implement pagination for list endpoints
- [ ] **Search and Filtering** - Add query parameters to filter resources
- [ ] **API Documentation** - Postman collection or documented endpoints
- [ ] **Automated Tests** - Unit or integration tests for key endpoints

---

## Submission Requirements

### **Technical Requirements:**

- [ ] **Authentication System** - Complete user registration, login, and JWT token management
- [ ] **Protected API** - All resource endpoints protected with authentication middleware
- [ ] **Role-Based Access** - Admin/moderator-only routes properly secured
- [ ] **Security Measures** - Helmet, CORS, rate limiting, and input validation implemented

### **Project Structure Requirements:**

```
auth-api-project/
├── server.js or app.js
├── package.json
├── .env.example
├── routes/
│   ├── auth.js
│   └── [resources].js
├── controllers/
│   ├── authController.js
│   └── [resources]Controller.js
└── middleware/
    ├── auth.js
    └── errorHandler.js
```

### **API Interface Requirements:**

- [ ] **RESTful Design** - Follows REST conventions for URLs and HTTP methods
- [ ] **Consistent Responses** - All endpoints return JSON with consistent structure
- [ ] **HTTP Status Codes** - Proper use of 200, 201, 400, 401, 403, 404, 500
- [ ] **API Documentation** - README with endpoint descriptions and testing instructions

### **Required API Endpoints:**

**Authentication Routes:**
- `POST /api/auth/register` - Create new user account
- `POST /api/auth/login` - Authenticate user and return token
- `GET /api/auth/me` - Get current user info (protected)

**Resource Routes (Tasks or Recipes):**
- `GET /api/[resource]` - Get user's resources (protected)
- `GET /api/[resource]/:id` - Get specific resource (protected)
- `POST /api/[resource]` - Create new resource (protected)
- `PUT /api/[resource]/:id` - Update resource (protected, owner only)
- `DELETE /api/[resource]/:id` - Delete resource (protected, owner only)

**Admin/Moderator Routes:**
- `GET /api/admin/[resource]` - View all resources (admin/moderator only)
- `DELETE /api/admin/[resource]/:id` - Delete any resource (admin/moderator only)

### **Code Quality Requirements:**

- [ ] **MVC Architecture** - Separate routes, controllers, and middleware
- [ ] **Clean Code** - Readable code with consistent naming conventions
- [ ] **Error Handling** - Try-catch blocks and error middleware for all async operations
- [ ] **Git Commits** - Regular commits with descriptive messages

**Due Date:** May 14
**Submission Method:** Github Repo link on #project-showcase channel
