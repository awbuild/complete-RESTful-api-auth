var jwt = require("jsonwebtoken");

function authenticateToken(req, res, next) {
  console.log("authenticateToken middleware fired");
  console.log("checking Authorization header");

  var authHeader = req.headers["authorization"];
  console.log("Authorization header value:", authHeader);

  if (authHeader === undefined) {
    console.log("no Authorization header found - rejecting request");
    return res.status(401).json({ error: "No token provided" });
  }

  var token = authHeader.split(" ")[1];
  console.log("token extracted from header:", token);

  if (token === undefined) {
    console.log("token was missing from Bearer string - rejecting");
    return res
      .status(401)
      .json({ error: "Token missing from Authorization header" });
  }

  jwt.verify(token, process.env.JWT_SECRET, function (err, decodedUser) {
    if (err) {
      console.log("token verification failed:", err.message);
      return res.status(401).json({ error: "Token is not valid" });
    }

    console.log("token is valid - decoded user:", decodedUser);
    req.user = decodedUser;
    console.log("user attached to req.user, calling next()");
    next();
  });
}

function requireAdmin(req, res, next) {
  console.log("requireAdmin middleware fired");
  console.log("checking role for user:", req.user);

  if (req.user.role !== "admin") {
    console.log("user role is", req.user.role, "- not admin, rejecting");
    return res.status(403).json({ error: "Admin access required" });
  }

  console.log("user is admin - calling next()");
  next();
}

module.exports = { authenticateToken, requireAdmin };
