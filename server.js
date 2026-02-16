"use strict";

require("dotenv").config();

const path = require("path");
const express = require("express");
const session = require("express-session");
const passport = require("passport");
const cors = require("cors");

require("./config/firebase");
const configurePassport = require("./config/passport");
const authRoutes = require("./routes/auth");

const app = express();
const PORT = Number(process.env.PORT || 3000);
const allowedCorsOrigins = (process.env.CORS_ORIGINS ||
  "http://localhost:3000,http://127.0.0.1:3000,http://localhost:5500,http://127.0.0.1:5500,http://localhost:5501,http://127.0.0.1:5501")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsConfig = cors({
  origin(origin, callback) {
    if (!origin) {
      return callback(null, true);
    }
    if (allowedCorsOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("Origin not allowed by CORS policy."));
  },
  credentials: true
});

configurePassport(passport);

if (!process.env.SESSION_SECRET) {
  // Keep local development moving while signaling the secret should be configured.
  console.warn("SESSION_SECRET is not set. Using an insecure fallback secret for local development.");
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(corsConfig);
app.options("*", corsConfig);
app.use(
  session({
    name: "fakir.sid",
    secret: process.env.SESSION_SECRET || "replace-this-in-production",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24 * 7
    }
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.use("/auth", authRoutes);

app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(__dirname));

app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ status: "error", message: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
