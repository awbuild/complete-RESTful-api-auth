# Option B: Recipe Sharing API Development Plan

## Project Overview

Build a REST API where users can share recipes with authentication, role-based moderation, and public/private recipe visibility. Users manage their own recipes while moderators can feature or hide community content.

## IMPORTANT: Minimum vs Bonus Features

This plan focuses on **ONLY the rubric requirements**. Bonus features are clearly marked at the end.

**Build in order. Test each feature before moving to the next.**

---

## What You MUST Build (Required for Passing)

### Core Requirements from Rubric:
1. User registration and login with JWT
2. Password hashing with bcrypt
3. Authentication middleware
4. Role-based access (user vs moderator)
5. Recipe CRUD operations
6. Public/Private recipe visibility
7. Moderator can feature or hide recipes
8. Security middleware (helmet, CORS, rate limiting)

---

## Planning Phase

### Step 0: Understand the Scope

This is a **backend-only API**. No frontend. Test with:
- Postman (recommended)
- curl commands
- Thunder Client (VS Code extension)

### Step 1: Plan Your Data Models (MINIMUM REQUIRED)

**Users (REQUIRED):**
- username (String, required, unique)
- email (String, required, unique)
- password (String, required, hashed)
- role (String, "user" or "moderator")
- createdAt (Date)

**Recipes (REQUIRED - Per Rubric):**
- title (String, required)
- ingredients (Array of strings, required)
- instructions (Array of strings, required)
- cookTime (Number, minutes, required)
- isPublic (Boolean, default true) - For public/private feature
- isFeatured (Boolean, default false) - For moderator feature action
- isHidden (Boolean, default false) - For moderator hide action
- createdBy (Reference to User)
- createdAt, updatedAt (Dates)

**Note:** The rubric specifies: title, ingredients, instructions, cookTime. Other fields are NOT required for passing.

### Step 2: Plan Your API Endpoints (MINIMUM REQUIRED)

**Public Endpoints:**
- POST /api/auth/register
- POST /api/auth/login
- GET /api/recipes (all public recipes)
- GET /api/recipes/:id (single recipe if public)

**Protected Endpoints (Auth Required):**
- GET /api/auth/me
- POST /api/recipes (create recipe)
- PUT /api/recipes/:id (update own recipe)
- DELETE /api/recipes/:id (delete own recipe)
- GET /api/recipes/my-recipes (user's own recipes, including private)

**Moderator Endpoints (Moderator Role Required):**
- PUT /api/moderator/recipes/:id/feature (feature a recipe)
- PUT /api/moderator/recipes/:id/hide (hide a recipe)

---

## Implementation Phase

### Phase 1: Project Setup (REQUIRED)

Initialize project:

```bash
mkdir recipe-sharing-api
cd recipe-sharing-api
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

Create .env:
```
PORT=3001
JWT_SECRET=your-secret-key-here
```

Create .env.example:
```
PORT=3001
JWT_SECRET=your-jwt-secret
```

Create .gitignore:
```
node_modules/
.env
```

**Test:** Run `npm run dev`

---

### Phase 2: Create Server File (REQUIRED)

Create `server.js`:
- Load dotenv
- Import express, cors, helmet, express-rate-limit
- Create Express app
- Apply middleware: helmet(), cors(), express.json()
- Set up rate limiting for auth
- Add root route
- Listen on PORT
- Add error handling

**Test:** Server starts without errors

---

### Phase 3: Create Data Storage (REQUIRED)

In server.js, create arrays:
- users array (add one moderator user with pre-hashed password)
- recipes array (start empty)
- ID counter variables

**Test:** Console.log arrays to verify

---

### Phase 4: Authentication Middleware (REQUIRED)

Create `middleware/auth.js`:

**authenticateToken function:**
- Check Authorization header
- Extract token from "Bearer TOKEN"
- Verify with jwt.verify()
- Attach user to req.user
- Return 401 if invalid
- Call next()

**requireModerator function:**
- Check if req.user.role === "moderator"
- Return 403 if not moderator
- Call next() if moderator

**Test:** Will test after routes are created

---

### Phase 5: Authentication Routes (REQUIRED)

Create `routes/authRoutes.js`:

**POST /register:**
- Validate username, email, password
- Check email format
- Check if email exists (400 if yes)
- Hash password with bcrypt
- Create user object
- Add to users array
- Generate JWT (7 day expiration)
- Return { token, user }

**POST /login:**
- Validate email and password
- Find user by email
- Return 401 if not found
- Compare password with bcrypt.compare()
- Return 401 if wrong
- Generate JWT
- Return { token, user }

**GET /me (protected):**
- Apply authenticateToken middleware
- Find user by req.user.userId
- Return user info

**Test:**
1. Register new user
2. Login
3. GET /me with token
4. GET /me without token - should fail

---

### Phase 6: Recipe Routes (REQUIRED)

Create `routes/recipeRoutes.js`:

**GET / (public recipes):**
- Filter recipes where isPublic === true AND isHidden === false
- Return public, non-hidden recipes only

**GET /:id (single recipe):**
- Find recipe by ID
- If recipe.isPublic === false, check if requester is owner
- If recipe.isHidden === true, only owner or moderator can view
- Return 403 if not authorized to view
- Return recipe

**POST / (create):**
- Apply authenticateToken middleware
- Validate title, ingredients, instructions, cookTime
- Validate ingredients is non-empty array
- Validate instructions is non-empty array
- Create recipe with unique ID
- Set createdBy = req.user.userId
- Set isPublic = true (default)
- Add to recipes array
- Return created recipe

**GET /my-recipes (user's own):**
- Apply authenticateToken middleware
- Filter recipes where createdBy === req.user.userId
- Return ALL user's recipes (including private)

**PUT /:id (update):**
- Apply authenticateToken middleware
- Find recipe by ID
- Verify createdBy === req.user.userId (403 if not owner)
- Update allowed fields
- Return updated recipe

**DELETE /:id (delete):**
- Apply authenticateToken middleware
- Find recipe
- Verify ownership
- Remove from array
- Return success

**Test:**
1. Create recipe as user A
2. GET public recipes - should see it
3. Update own recipe - should work
4. Try to update another user's recipe - should fail
5. Set recipe to private (isPublic: false)
6. GET public recipes - should NOT see private recipe
7. GET my-recipes - should see private recipe

---

### Phase 7: Moderator Routes (REQUIRED)

Create `routes/moderatorRoutes.js`:

**PUT /recipes/:id/feature:**
- Apply authenticateToken AND requireModerator
- Find recipe by ID
- Set isFeatured = true
- Return updated recipe

**PUT /recipes/:id/hide:**
- Apply both middlewares
- Find recipe
- Set isHidden = true
- Return updated recipe

**Test:**
1. Login as moderator
2. Feature a recipe - should work
3. Hide a recipe - should work
4. Login as regular user
5. Try to feature recipe - should return 403
6. Verify hidden recipes don't show in public GET /recipes

---

### Phase 8: Mount Routes (REQUIRED)

In `server.js`:
- Import route files
- Mount routes:
  - app.use('/api/auth', authRoutes)
  - app.use('/api/recipes', recipeRoutes)
  - app.use('/api/moderator', moderatorRoutes)

**Test:** All endpoints accessible

---

### Phase 9: Input Validation (REQUIRED)

Add validation to routes:

**Registration:**
- Email must be valid format
- Password minimum 6 characters
- Username 3-20 characters

**Recipe Creation:**
- Title: required, 3-100 characters
- Ingredients: array, minimum 1 item
- Instructions: array, minimum 1 item
- cookTime: number, greater than 0

Return 400 with clear messages for validation failures.

**Test:** Try invalid inputs

---

### Phase 10: Error Handling (REQUIRED)

Add in server.js:

**404 Handler:**
- Catch unmatched routes
- Return 404

**Global Error Handler:**
- Log error
- Return 500
- Never expose stack traces

**Test:**
- Invalid route - should get 404
- Trigger error - should get 500

---

## Testing Your API

### Method 1: Postman

Create collection:

**Auth:**
1. Register
2. Login
3. Get current user

**Recipes:**
1. Create recipe
2. Get public recipes
3. Get my recipes
4. Update recipe
5. Delete recipe
6. Set recipe private

**Moderator:**
1. Login as moderator
2. Feature recipe
3. Hide recipe

### Method 2: curl Commands

**Register:**
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"chef","email":"chef@test.com","password":"pass123"}'
```

**Create Recipe:**
```bash
curl -X POST http://localhost:3001/api/recipes \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Pasta","ingredients":["pasta","sauce"],"instructions":["boil","mix"],"cookTime":20}'
```

**Get Public Recipes:**
```bash
curl http://localhost:3001/api/recipes
```

---

## Project Submission Checklist

**MUST HAVE (Required to Pass):**

```
Files and Structure:
[ ] routes/ folder with separate files
[ ] middleware/ folder with auth.js
[ ] server.js main file
[ ] package.json with dependencies
[ ] .env file (not committed)
[ ] .env.example provided
[ ] .gitignore includes .env

Authentication:
[ ] POST /api/auth/register
[ ] POST /api/auth/login
[ ] Passwords hashed with bcrypt
[ ] JWT tokens generated
[ ] Input validation

Middleware:
[ ] authenticateToken verifies JWT
[ ] requireModerator checks role
[ ] 401 for invalid tokens
[ ] 403 for insufficient permissions

Recipe CRUD:
[ ] POST /api/recipes creates recipe
[ ] GET /api/recipes returns public recipes only
[ ] PUT /api/recipes/:id updates (owner only)
[ ] DELETE /api/recipes/:id deletes (owner only)
[ ] Ownership verified

Public/Private Feature:
[ ] Recipes have isPublic field
[ ] Public GET only shows public recipes
[ ] Private recipes only visible to owner
[ ] Users can set recipes public/private

Moderator Features:
[ ] PUT /moderator/recipes/:id/feature (moderator only)
[ ] PUT /moderator/recipes/:id/hide (moderator only)
[ ] Hidden recipes don't show in public list
[ ] Regular users cannot access moderator routes

Security:
[ ] helmet.js applied
[ ] CORS configured
[ ] Rate limiting on auth
[ ] JWT_SECRET in .env

Error Handling:
[ ] Validation returns 400
[ ] Auth errors return 401
[ ] Forbidden returns 403
[ ] Not found returns 404
[ ] Consistent error format
```

---

## Could Have (Bonus Features)

**Only add these AFTER completing all required features.**

### Bonus Feature 1: Recipe Categories
- Add category field to recipes
- Filter recipes by category

### Bonus Feature 2: Search Functionality
- Search recipes by ingredient
- Search by title keyword

### Bonus Feature 3: Recipe Ratings
- Add ratings model (recipeId, userId, score)
- POST /recipes/:id/rate endpoint
- Calculate and display average rating

### Bonus Feature 4: Comments System
- Add comments model
- POST /recipes/:id/comments
- GET /recipes/:id/comments
- Moderators can delete comments

### Bonus Feature 5: Favorites/Save Recipes
- Add favorites model
- POST /favorites/:recipeId
- GET /favorites (user's saved recipes)
- DELETE /favorites/:recipeId

### Bonus Feature 6: User Profiles
- Add bio field to users
- GET /users/:id/recipes (public recipes by user)
- User can update their own profile

### Bonus Feature 7: Pagination
- Add limit and offset query params
- Return paginated results

### Bonus Feature 8: PostgreSQL Integration
- Replace in-memory arrays with Sequelize models
- Connect to a PostgreSQL database (set `DATABASE_URL` in `.env`)
- Add Sequelize migrations so the schema is reproducible
- Persist data across server restarts

### Bonus Feature 9: Recipe Image Upload
- Use multer for file uploads
- Store recipe images
- Return image URLs

### Bonus Feature 10: Advanced Moderator Tools
- GET /moderator/recipes (all recipes)
- GET /moderator/users (all users)
- DELETE /moderator/users/:id
- View moderation stats

---

## Common Pitfalls to Avoid

1. **Not filtering public** - Public GET must only show public recipes
2. **Not checking hidden** - Hidden recipes shouldn't appear publicly
3. **No ownership check** - Verify owner before update/delete
4. **Arrays not arrays** - Ingredients and instructions must be arrays
5. **Token format wrong** - Must be "Bearer TOKEN"
6. **Returning passwords** - Never include password in responses
7. **JWT_SECRET in code** - Must be in .env
8. **No moderator user** - Add one to test moderator features

---

## Tips for Success

1. **Build minimum first** - Complete required features before bonuses
2. **Test after each step** - Don't move forward until current step works
3. **Use Postman** - Save all your test requests
4. **Test visibility** - Verify public/private logic works correctly
5. **Test moderation** - Ensure only moderators can feature/hide
6. **Validate inputs** - Always check user inputs
7. **Handle errors** - Use try/catch everywhere
8. **Keep .env secure** - Never commit secrets

Good luck building your Recipe Sharing API!
