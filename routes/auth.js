"use strict";

const express = require("express");
const passport = require("passport");
const User = require("../models/User");
const ensureAuthenticated = require("../middleware/ensureAuthenticated");

const router = express.Router();

function loginUser(req, user) {
  return new Promise((resolve, reject) => {
    req.login(user, (error) => {
      if (error) return reject(error);
      resolve();
    });
  });
}

function mapErrorToStatus(error) {
  if (!error) return 500;
  if (error.code === "VALIDATION_ERROR") return 400;
  if (error.code === "USERNAME_TAKEN") return 409;
  return 500;
}

router.post("/register", async (req, res) => {
  try {
    const username = String(req.body.username || "").trim();
    const password = String(req.body.password || "");
    const confirmPassword = String(req.body.confirmPassword || "");

    if (!username || !password) {
      return res.status(400).json({ status: "error", message: "Username and password are required." });
    }
    if (confirmPassword && confirmPassword !== password) {
      return res.status(400).json({ status: "error", message: "Passwords do not match." });
    }

    const user = await User.create({ username, password });
    await loginUser(req, user);

    return res.status(201).json({
      status: "success",
      message: "Registration successful.",
      data: { user: user.toJSON() }
    });
  } catch (error) {
    return res.status(mapErrorToStatus(error)).json({
      status: "error",
      message: error.message || "Error during registration."
    });
  }
});

router.post("/login", (req, res, next) => {
  passport.authenticate("local", async (error, user, info) => {
    try {
      if (error) return next(error);
      if (!user) {
        return res.status(401).json({
          status: "error",
          message: (info && info.message) || "Invalid username or password."
        });
      }

      await loginUser(req, user);
      return res.json({
        status: "success",
        message: `Logged in as ${user.username}`,
        data: { user: user.toJSON() }
      });
    } catch (loginError) {
      return next(loginError);
    }
  })(req, res, next);
});

router.post("/logout", ensureAuthenticated, (req, res, next) => {
  req.logout((error) => {
    if (error) return next(error);

    req.session.destroy((sessionError) => {
      if (sessionError) return next(sessionError);
      res.clearCookie("fakir.sid");
      return res.json({ status: "success", message: "Logged out." });
    });
  });
});

router.get("/me", ensureAuthenticated, (req, res) => {
  return res.json({
    status: "success",
    data: { user: req.user.toJSON() }
  });
});

router.patch("/account", ensureAuthenticated, async (req, res) => {
  try {
    const username = String(req.body.username || "").trim();
    if (!username) {
      return res.status(400).json({ status: "error", message: "Username is required." });
    }

    await req.user.updateProfile({ username });
    return res.json({
      status: "success",
      message: "Account updated.",
      data: { user: req.user.toJSON() }
    });
  } catch (error) {
    return res.status(mapErrorToStatus(error)).json({
      status: "error",
      message: error.message || "Error updating account."
    });
  }
});

router.patch("/password", ensureAuthenticated, async (req, res) => {
  try {
    const currentPassword = String(req.body.currentPassword || "");
    const newPassword = String(req.body.newPassword || "");
    const confirmPassword = String(req.body.confirmPassword || "");

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        status: "error",
        message: "Current password and new password are required."
      });
    }

    if (confirmPassword && confirmPassword !== newPassword) {
      return res.status(400).json({ status: "error", message: "New passwords do not match." });
    }

    const validCurrentPassword = await req.user.comparePassword(currentPassword);
    if (!validCurrentPassword) {
      return res.status(400).json({ status: "error", message: "Current password is incorrect." });
    }

    await req.user.updatePassword(newPassword);
    return res.json({ status: "success", message: "Password updated." });
  } catch (error) {
    return res.status(mapErrorToStatus(error)).json({
      status: "error",
      message: error.message || "Error updating password."
    });
  }
});

module.exports = router;
