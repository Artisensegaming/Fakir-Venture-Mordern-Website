"use strict";

const bcrypt = require("bcryptjs");
const { firebaseAdmin, getDb } = require("../config/firebase");

const USERS_COLLECTION = "users";

function normalizeUsername(username) {
  return String(username || "").trim().toLowerCase();
}

function validateUsername(username) {
  const value = String(username || "").trim();
  if (!value) {
    const error = new Error("Username is required.");
    error.code = "VALIDATION_ERROR";
    throw error;
  }
  if (value.length < 3 || value.length > 40) {
    const error = new Error("Username must be between 3 and 40 characters.");
    error.code = "VALIDATION_ERROR";
    throw error;
  }
  return value;
}

function validatePassword(password) {
  const value = String(password || "");
  if (value.length < 8) {
    const error = new Error("Password must be at least 8 characters.");
    error.code = "VALIDATION_ERROR";
    throw error;
  }
  return value;
}

function serializeTimestamp(value) {
  if (!value) return null;
  if (typeof value.toDate === "function") return value.toDate().toISOString();
  if (value instanceof Date) return value.toISOString();
  return value;
}

class User {
  constructor({ id, username, usernameNormalized, passwordHash, createdAt, updatedAt }) {
    this.id = id;
    this.username = username;
    this.usernameNormalized = usernameNormalized;
    this.password = passwordHash;
    this.createdAt = createdAt || null;
    this.updatedAt = updatedAt || null;
  }

  static collection() {
    return getDb().collection(USERS_COLLECTION);
  }

  static fromDoc(document) {
    if (!document.exists) return null;
    const data = document.data();
    return new User({
      id: document.id,
      username: data.username,
      usernameNormalized: data.usernameNormalized,
      passwordHash: data.passwordHash,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt
    });
  }

  static async findById(id) {
    const doc = await User.collection().doc(String(id)).get();
    return User.fromDoc(doc);
  }

  static async findByUsername(username) {
    const normalized = normalizeUsername(username);
    if (!normalized) return null;

    const snapshot = await User.collection()
      .where("usernameNormalized", "==", normalized)
      .limit(1)
      .get();

    if (snapshot.empty) return null;
    return User.fromDoc(snapshot.docs[0]);
  }

  async encryptPassword(password) {
    const validated = validatePassword(password);
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(validated, salt);
  }

  async comparePassword(candidatePassword) {
    return bcrypt.compare(String(candidatePassword || ""), this.password);
  }

  static async ensureUsernameAvailable(username, excludeId = null) {
    const existing = await User.findByUsername(username);
    if (existing && existing.id !== excludeId) {
      const error = new Error("This username is already in use.");
      error.code = "USERNAME_TAKEN";
      throw error;
    }
  }

  static async create({ username, password }) {
    const safeUsername = validateUsername(username);
    await User.ensureUsernameAvailable(safeUsername);

    const passwordHash = await new User({}).encryptPassword(password);
    const now = firebaseAdmin.firestore.FieldValue.serverTimestamp();
    const payload = {
      username: safeUsername,
      usernameNormalized: normalizeUsername(safeUsername),
      passwordHash,
      createdAt: now,
      updatedAt: now
    };

    const ref = await User.collection().add(payload);
    const createdDoc = await ref.get();
    return User.fromDoc(createdDoc);
  }

  async updateProfile({ username }) {
    const safeUsername = validateUsername(username);
    await User.ensureUsernameAvailable(safeUsername, this.id);

    await User.collection().doc(this.id).update({
      username: safeUsername,
      usernameNormalized: normalizeUsername(safeUsername),
      updatedAt: firebaseAdmin.firestore.FieldValue.serverTimestamp()
    });

    const refreshed = await User.findById(this.id);
    this.username = refreshed.username;
    this.usernameNormalized = refreshed.usernameNormalized;
    this.updatedAt = refreshed.updatedAt;
    return this;
  }

  async updatePassword(newPassword) {
    const passwordHash = await this.encryptPassword(newPassword);
    await User.collection().doc(this.id).update({
      passwordHash,
      updatedAt: firebaseAdmin.firestore.FieldValue.serverTimestamp()
    });
    this.password = passwordHash;
    return this;
  }

  toJSON() {
    return {
      id: this.id,
      username: this.username,
      createdAt: serializeTimestamp(this.createdAt),
      updatedAt: serializeTimestamp(this.updatedAt)
    };
  }
}

module.exports = User;
