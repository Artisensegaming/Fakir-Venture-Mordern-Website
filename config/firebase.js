"use strict";

const fs = require("fs");
const path = require("path");
const admin = require("firebase-admin");

function parseServiceAccountFromEnv() {
  if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) return null;
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY.trim();
  if (!raw) return null;

  const parsed = JSON.parse(raw);
  if (typeof parsed.private_key === "string") {
    parsed.private_key = parsed.private_key.replace(/\\n/g, "\n");
  }
  return parsed;
}

function readServiceAccountFromPath() {
  if (!process.env.FIREBASE_SERVICE_ACCOUNT_PATH) return null;
  const candidate = process.env.FIREBASE_SERVICE_ACCOUNT_PATH.trim();
  if (!candidate) return null;

  const fullPath = path.isAbsolute(candidate) ? candidate : path.join(process.cwd(), candidate);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`FIREBASE_SERVICE_ACCOUNT_PATH does not exist: ${fullPath}`);
  }

  const parsed = JSON.parse(fs.readFileSync(fullPath, "utf8"));
  if (typeof parsed.private_key === "string") {
    parsed.private_key = parsed.private_key.replace(/\\n/g, "\n");
  }
  return parsed;
}

function createCredential() {
  const fromEnv = parseServiceAccountFromEnv();
  if (fromEnv) return admin.credential.cert(fromEnv);

  const fromPath = readServiceAccountFromPath();
  if (fromPath) return admin.credential.cert(fromPath);

  return admin.credential.applicationDefault();
}

if (!admin.apps.length) {
  const options = {
    credential: createCredential()
  };

  if (process.env.FIREBASE_PROJECT_ID) {
    options.projectId = process.env.FIREBASE_PROJECT_ID;
  }

  admin.initializeApp(options);
}

const db = admin.firestore();

module.exports = {
  firebaseAdmin: admin,
  getDb: () => db
};
