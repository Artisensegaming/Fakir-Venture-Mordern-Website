"use strict";

module.exports = function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ status: "error", message: "Authentication required." });
};
