"use strict";

const LocalStrategy = require("passport-local").Strategy;
const User = require("../models/User");

module.exports = function configurePassport(passport) {
  passport.use(
    new LocalStrategy(
      {
        usernameField: "username",
        passwordField: "password"
      },
      async (username, password, done) => {
        try {
          const user = await User.findByUsername(username);
          if (!user) {
            return done(null, false, { message: "Invalid username or password." });
          }

          const isMatch = await user.comparePassword(password);
          if (!isMatch) {
            return done(null, false, { message: "Invalid username or password." });
          }

          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user || false);
    } catch (error) {
      done(error);
    }
  });
};
