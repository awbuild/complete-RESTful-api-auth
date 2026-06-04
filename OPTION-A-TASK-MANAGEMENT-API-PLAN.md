# Option A: Task Management API Development Plan

## Project Overview

Build a secure REST API for task management with user authentication, JWT tokens, and role-based access control. Users can create and manage their own tasks, while admin users can view and manage all tasks.

## IMPORTANT: Minimum vs Bonus Features

This plan is organized to help you build **ONLY what's required to pass**. Bonus features are clearly marked at the end.

**Build features in order. Test each before moving to the next.**

---

## What You MUST Build (Required for Passing)

### Core Requirements from Rubric:
1. User registration and login with JWT
2. Password hashing with bcrypt
3. Authentication middleware
4. Role-based access (user vs admin)
5. Task CRUD operations
6. Ownership verification
7. Security middleware (helmet, CORS, rate limiting)
8. Input validation and error handling

---

## Planning Phase

### Step 0: Understand the Scope

This is a **backend-only API**. No frontend needed. Test with:
- Postman (recommended)
- curl commands
- Thunder Client (VS Code extension)

### Step 1: Plan Your Data Models

**Users (REQUIRED):**
- username (String, required, unique)
- email (String, required, unique)
- password (String, required, hashed)
- role (String, "user" or "admin")
- createdAt (Date)

**Tasks (REQUIRED - Rubric Specifies These Fields):**
- title (String, required)
- description (String, required)
- status (String: "todo", "in-progress", "completed")
- priority (String: "low", "medium", "high")
- dueDate (Date, optional)
- userId (Reference to User who created it)
- createdAt, updatedAt (Dates)

### Step 2: Plan Your API Endpoints (MINIMUM REQUIRED)

**Public Endpoints:**
- POST /api/auth/register
- POST /api/auth/login

**Protected Endpoints (Auth Required):**
- GET /api/auth/me
- GET /api/tasks (user's own tasks only)
- POST /api/tasks
- PUT /api/tasks/:id (own tasks only)
- DELETE /api/tasks/:id (own tasks only)

**Admin Endpoints (Admin Role Required):**
- GET /api/admin/tasks (view ALL tasks from all users)

**Note:** The rubric requires "Admin dashboard to view/manage all tasks" - this means AT MINIMUM admin can view all tasks. You can add admin delete functionality as a bonus.

---

## Implementation Phase

### Phase 1: Project Setup (REQUIRED)

Create project and install dependencies:

```bash
mkdir task-management-api
cd task-management-api
npm init -y
npm install express bcryptjs jsonwebtoken cors helmet express-rate-limit dotenv
npm install --save-dev nodemon
```

Add scripts to package.json:
```json
"scripts": {
  "start": "node server.js",
  "dev": "nodemon server.js"
}
```

Create folders:
```bash
mkdir routes middleware
```

Create .env file:
```
PORT=3001
JWT_SECRET=your-secret-key-change-in-production
```

Create .env.example:
```
PORT=3001
JWT_SECRET=your-jwt-secret-here
```

Create .gitignore:
```
node_modules/
.env
```

**Test:** Run `npm run dev` (will error - that's expected)

---

### Phase 2: Create Server File (REQUIRED)

Create `server.js`:
- Load dotenv
- Import express, cors, helmet, express-rate-limit
- Create Express app
- Apply middleware: helmet(), cors(), express.json()
- Set up rate limiting for auth routes
- Create root route (GET /) returning API info
- Start server listening on PORT
- Add basic error handling

**Test:** Server should start without errors

---

### Phase 3: Create Data Storage (REQUIRED)

In server.js, add arrays for in-memory storage:
- users array (start with one admin user with pre-hashed password)
- tasks array (start empty)
- ID counter variables

**Why in-memory?** This keeps project simple. Database integration is optional bonus.

**Test:** Console.log arrays to verify structure

---

### Phase 4: Build Authentication Middleware (REQUIRED)

Create `middleware/auth.js`:

**authenticateToken function:**
- Check if Authorization header exists
- Extract token from "Bearer TOKEN" format
- Verify token with jwt.verify()
- If valid, attach user data to req.user
- If invalid, return 401 Unauthorized
- Call next() to continue

**requireAdmin function:**
- Check if req.user.role === "admin"
- If not, return 403 Forbidden
- If yes, call next()

**Test:** Can't test yet - need routes first

---

### Phase 5: Authentication Routes (REQUIRED)

Create `routes/authRoutes.js`:

**POST /register:**
- Validate username, email, password exist
- Validate email format
- Check if email already exists (return 400 if yes)
- Hash password with bcrypt (10 salt rounds)
- Create user object with unique ID
- Add to users array
- Generate JWT token (7 day expiration)
- Return { token, user } (don't include password)

**POST /login:**
- Validate email and password provided
- Find user by email
- If not found, return 401 "Invalid credentials"
- Compare password with bcrypt.compare()
- If wrong, return 401
- Generate JWT token
- Return { token, user }

**GET /me (protected):**
- Apply authenticateToken middleware
- Find user by req.user.userId
- Return user info (no password)

**Test:**
1. Register new user - should return token
2. Login - should return token
3. /me with token - should return user
4. /me without token - should return 401

---

### Phase 6: Task Routes (REQUIRED)

Create `routes/taskRoutes.js`:

**GET / (get user's tasks):**
- Apply authenticateToken middleware
- Filter tasks where task.userId === req.user.userId
- Return user's tasks only

**POST / (create task):**
- Apply authenticateToken middleware
- Validate title, description, status provided
- Validate status is one of: "todo", "in-progress", "completed"
- Create task object with unique ID
- Set task.userId = req.user.userId
- Add to tasks array
- Return created task

**PUT /:id (update task):**
- Apply authenticateToken middleware
- Find task by ID
- Check if exists (404 if not)
- Verify task.userId === req.user.userId (403 if not owner)
- Update allowed fields (title, description, status, priority, dueDate)
- Return updated task

**DELETE /:id (delete task):**
- Apply authenticateToken middleware
- Find task by ID
- Verify ownership
- Remove from tasks array
- Return success message

**Test each route:**
1. Create task as user A
2. Get tasks as user A - should see it
3. Try to get tasks as user B - should not see user A's tasks
4. Update own task - should work
5. Try to update another user's task - should return 403
6. Delete own task - should work

---

### Phase 7: Admin Routes (REQUIRED)

Create `routes/adminRoutes.js`:

**GET /tasks (view all tasks):**
- Apply authenticateToken AND requireAdmin middlewares
- Return ALL tasks from array (not filtered by user)
- Include task owner info

**Test:**
1. Login as admin user
2. GET /admin/tasks - should see all tasks from all users
3. Login as regular user
4. Try GET /admin/tasks - should return 403 Forbidden

---

### Phase 8: Mount Routes (REQUIRED)

In `server.js`:
- Import all route files
- Mount routes:
  - app.use('/api/auth', authRoutes)
  - app.use('/api/tasks', taskRoutes)
  - app.use('/api/admin', adminRoutes)

**Test:** All endpoints should be accessible at correct paths

---

### Phase 9: Add Input Validation (REQUIRED)

In each route, add validation:

**Registration:**
- Email must be valid format
- Password must be at least 6 characters
- Username must be 3-20 characters

**Task Creation:**
- Title: required, 3-100 characters
- Description: required, minimum 10 characters
- Status: must be one of the valid enum values

Return 400 Bad Request with clear error messages for validation failures.

**Test:** Try invalid inputs, should get helpful error messages

---

### Phase 10: Error Handling (REQUIRED)

Add global error handlers in server.js:

**404 Handler (after all routes):**
- Catch any unmatched routes
- Return 404 with message

**Global Error Handler:**
- Log error to console
- Return 500 with generic message
- Never expose stack traces

**Test:**
- Visit invalid route - should get 404
- Trigger server error - should get 500

---

## Testing Your API

### Method 1: Postman Testing

Create collection with these requests:

**Auth:**
1. Register user
2. Login
3. Get current user (with token)

**Tasks:**
1. Create task
2. Get all tasks
3. Update task
4. Delete task

**Admin:**
1. Login as admin
2. View all tasks

### Method 2: curl Commands

**Register:**
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"john","email":"john@test.com","password":"pass123"}'
```

**Login:**
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@test.com","password":"pass123"}'
```

**Create Task (with token):**
```bash
curl -X POST http://localhost:3001/api/tasks \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Buy groceries","description":"Get milk and eggs","status":"todo"}'
```

---

## Project Submission Checklist

**MUST HAVE (Required to Pass):**

```
Files and Structure:
[ ] routes/ folder with separate route files
[ ] middleware/ folder with auth.js
[ ] server.js as main entry point
[ ] package.json with all dependencies
[ ] .env file (not committed)
[ ] .env.example file
[ ] .gitignore includes node_modules/ and .env

Authentication:
[ ] POST /api/auth/register endpoint
[ ] POST /api/auth/login endpoint
[ ] Passwords hashed with bcrypt (10+ rounds)
[ ] JWT tokens generated with user data
[ ] Input validation on register/login

Middleware:
[ ] authenticateToken middleware extracts and verifies JWT
[ ] requireAdmin middleware checks role
[ ] 401 returned for invalid/missing tokens
[ ] 403 returned for insufficient permissions

Task CRUD:
[ ] POST /api/tasks creates task (auth required)
[ ] GET /api/tasks returns user's tasks (auth required)
[ ] PUT /api/tasks/:id updates task (owner only)
[ ] DELETE /api/tasks/:id deletes task (owner only)
[ ] Ownership verified before update/delete

Admin Features:
[ ] GET /api/admin/tasks returns ALL tasks (admin only)
[ ] Regular users cannot access admin routes

Security:
[ ] helmet.js middleware applied
[ ] CORS configured
[ ] Rate limiting on auth routes
[ ] JWT_SECRET in .env
[ ] .env not committed to git

Error Handling:
[ ] Input validation returns 400
[ ] Invalid auth returns 401
[ ] Forbidden actions return 403
[ ] Not found returns 404
[ ] Consistent error message format
```

---

## Could Have (Bonus Features)

**Only attempt these AFTER completing all required features above.**

### Bonus Feature 1: Get Single Task
- GET /api/tasks/:id endpoint
- Returns single task details
- Verify ownership

### Bonus Feature 2: Admin User Management
- GET /api/admin/users (list all users)
- DELETE /api/admin/users/:id (delete user)
- When user deleted, also delete their tasks

### Bonus Feature 3: Advanced Filtering
- Filter tasks by status query param
- Filter by priority
- Sort by dueDate or createdAt

### Bonus Feature 4: Task Search
- Search tasks by title or description keyword

### Bonus Feature 5: Pagination
- Add limit and offset query params
- Return paginated results

### Bonus Feature 6: PostgreSQL Integration
- Replace in-memory arrays with Sequelize models
- Connect to a PostgreSQL database (set `DATABASE_URL` in `.env`)
- Add Sequelize migrations so the schema is reproducible
- Persist data across server restarts

### Bonus Feature 7: Refresh Tokens
- Implement refresh token system
- Short-lived access tokens (15 min)
- Long-lived refresh tokens (7 days)

### Bonus Feature 8: Password Reset
- Forgot password endpoint
- Email reset token
- Reset password with token

### Bonus Feature 9: Automated Tests
- Write tests with Jest or Mocha
- Test auth flow
- Test CRUD operations
- Test authorization

---

## Common Pitfalls to Avoid

1. **Not filtering by userId** - Users must only see their own tasks
2. **Forgetting ownership check** - Verify owner before update/delete
3. **No admin user** - Add one admin to test admin routes
4. **Token not in header** - Must be "Bearer TOKEN" format
5. **Comparing passwords wrong** - Use bcrypt.compare(), not ===
6. **JWT_SECRET in code** - Must be in .env file
7. **No input validation** - Always validate user inputs
8. **Returning passwords** - Never include password in API responses

---

## Tips for Success

1. **Build minimum first** - Don't add bonuses until basics work
2. **Test as you go** - Test after EACH step
3. **Use Postman** - Save all test requests
4. **Check ownership** - Users can only modify their own tasks
5. **Validate inputs** - Never trust client data
6. **Handle errors** - Try/catch all async operations
7. **Keep .env secure** - Never commit to git
8. **Read error messages** - They tell you what's wrong

Good luck building your Task Management API!
