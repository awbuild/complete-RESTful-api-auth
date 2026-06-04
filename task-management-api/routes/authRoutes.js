var express = require("express");
var bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");
var router = express.Router();

var auth = require("../middleware/auth");

function generateToken(user) {
  console.log("generateToken called for user:", user.email);
  var payload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };
  var token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });
  console.log("token generated successfully");
  return token;
}

module.exports = function (users, nextUserId) {
  // --- POST /api/auth/register ---
  router.post("/register", function (req, res) {
    console.log("POST /api/auth/register hit");
    console.log("request body:", req.body);

    var username = req.body.username;
    var email = req.body.email;
    var password = req.body.password;

    // --- Validate inputs ---
    if (!username || !email || !password) {
      console.log("validation failed - missing fields");
      return res
        .status(400)
        .json({ error: "Username, email, and password are required" });
    }

    if (username.length < 3 || username.length > 20) {
      console.log("validation failed - username length:", username.length);
      return res
        .status(400)
        .json({ error: "Username must be between 3 and 20 characters" });
    }

    if (password.length < 6) {
      console.log("validation failed - password too short");
      return res
        .status(400)
        .json({ error: "Password must be at least 6 characters" });
    }

    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log("validation failed - invalid email format:", email);
      return res.status(400).json({ error: "Invalid email format" });
    }

    // --- Check if email already exists ---
    var existingUser = null;
    for (var i = 0; i < users.length; i++) {
      if (users[i].email === email) {
        existingUser = users[i];
        break;
      }
    }

    if (existingUser !== null) {
      console.log("email already in use:", email);
      return res.status(400).json({ error: "Email already in use" });
    }

    // --- Hash password ---
    console.log("hashing password with bcrypt");
    bcrypt.hash(password, 10, function (err, hashedPassword) {
      if (err) {
        console.log("bcrypt error:", err);
        return res.status(500).json({ error: "Error creating account" });
      }

      console.log("password hashed successfully");

      var newUser = {
        id: nextUserId.value,
        username: username,
        email: email,
        password: hashedPassword,
        role: "user",
        createdAt: new Date(),
      };

      nextUserId.value = nextUserId.value + 1;
      users.push(newUser);

      console.log("new user created with id:", newUser.id);
      console.log("users array now has", users.length, "users");

      var token = generateToken(newUser);

      return res.status(201).json({
        message: "Account created successfully",
        token: token,
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          role: newUser.role,
        },
      });
    });
  });

  // --- POST /api/auth/login ---
  router.post("/login", function (req, res) {
    console.log("POST /api/auth/login hit");
    console.log("request body:", req.body);

    var email = req.body.email;
    var password = req.body.password;

    if (!email || !password) {
      console.log("validation failed - missing email or password");
      return res.status(400).json({ error: "Email and password are required" });
    }

    // --- Find user by email ---
    var foundUser = null;
    for (var i = 0; i < users.length; i++) {
      if (users[i].email === email) {
        foundUser = users[i];
        break;
      }
    }

    if (foundUser === null) {
      console.log("no user found with email:", email);
      return res.status(401).json({ error: "Invalid credentials" });
    }

    console.log("user found:", foundUser.email, "- comparing passwords");

    // --- Compare password ---
    bcrypt.compare(password, foundUser.password, function (err, passwordMatch) {
      if (err) {
        console.log("bcrypt compare error:", err);
        return res.status(500).json({ error: "Error during login" });
      }

      console.log("password match result:", passwordMatch);

      if (!passwordMatch) {
        console.log("password did not match - rejecting login");
        return res.status(401).json({ error: "Invalid credentials" });
      }

      var token = generateToken(foundUser);

      console.log("login successful for:", foundUser.email);

      return res.status(200).json({
        message: "Login successful",
        token: token,
        user: {
          id: foundUser.id,
          username: foundUser.username,
          email: foundUser.email,
          role: foundUser.role,
        },
      });
    });
  });

  // --- GET /api/auth/me ---
  router.get("/me", auth.authenticateToken, function (req, res) {
    console.log("GET /api/auth/me hit");
    console.log("req.user from token:", req.user);

    var foundUser = null;
    for (var i = 0; i < users.length; i++) {
      if (users[i].id === req.user.userId) {
        foundUser = users[i];
        break;
      }
    }

    if (foundUser === null) {
      console.log("user from token not found in users array");
      return res.status(404).json({ error: "User not found" });
    }

    console.log("returning user info for:", foundUser.email);

    return res.status(200).json({
      user: {
        id: foundUser.id,
        username: foundUser.username,
        email: foundUser.email,
        role: foundUser.role,
        createdAt: foundUser.createdAt,
      },
    });
  });

  return router;
};
