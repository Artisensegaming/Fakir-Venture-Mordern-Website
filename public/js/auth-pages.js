"use strict";

(function initializeAuthPages() {
  const page = document.body.dataset.page;
  const statusElement = document.getElementById("status");
  const isLocalHost = ["localhost", "127.0.0.1"].includes(window.location.hostname);
  const configuredApiBase = String(document.body.dataset.apiBase || "").trim();
  const API_BASE =
    configuredApiBase || (isLocalHost && window.location.port !== "3000" ? "http://localhost:3000" : "");

  function setStatus(message, type = "") {
    if (!statusElement) return;
    statusElement.textContent = message || "";
    statusElement.className = `status${type ? ` ${type}` : ""}`;
  }

  function withApiBase(url) {
    if (!API_BASE) return url;
    if (/^https?:\/\//i.test(url)) return url;
    return `${API_BASE}${url}`;
  }

  async function request(url, options = {}) {
    let response;
    try {
      response = await fetch(withApiBase(url), {
        credentials: "include",
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...(options.headers || {})
        }
      });
    } catch (_networkError) {
      throw new Error(
        `Cannot reach auth server at ${API_BASE || window.location.origin}. Start backend with "npm start".`
      );
    }

    let payload = {};
    try {
      payload = await response.json();
    } catch (error) {
      payload = {};
    }

    if (!response.ok) {
      let message = payload.message || `Request failed with status ${response.status}.`;
      if ((response.status === 405 || response.status === 501) && url.startsWith("/auth/")) {
        message =
          'Auth API is not available on this server. Run "npm start" and use http://localhost:3000/public/html/register.html';
      }
      const requestError = new Error(message);
      requestError.status = response.status;
      throw requestError;
    }

    return payload;
  }

  if (page === "login") {
    const form = document.getElementById("login-form");
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      setStatus("Signing in...");
      const formData = new FormData(form);

      try {
        await request("/auth/login", {
          method: "POST",
          body: JSON.stringify({
            username: String(formData.get("username") || "").trim(),
            password: String(formData.get("password") || "")
          })
        });
        setStatus("Signed in successfully. Redirecting...", "success");
        window.location.href = "./account-management.html";
      } catch (error) {
        setStatus(error.message, "error");
      }
    });
    return;
  }

  if (page === "register") {
    const form = document.getElementById("register-form");
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      setStatus("Creating your account...");
      const formData = new FormData(form);

      try {
        await request("/auth/register", {
          method: "POST",
          body: JSON.stringify({
            username: String(formData.get("username") || "").trim(),
            password: String(formData.get("password") || ""),
            confirmPassword: String(formData.get("confirmPassword") || "")
          })
        });
        setStatus("Account created. Redirecting...", "success");
        window.location.href = "./account-management.html";
      } catch (error) {
        setStatus(error.message, "error");
      }
    });
    return;
  }

  if (page !== "account") return;

  const usernameOutput = document.getElementById("account-username");
  const profileForm = document.getElementById("profile-form");
  const passwordForm = document.getElementById("password-form");
  const logoutButton = document.getElementById("logout-btn");
  const profileUsernameInput = document.getElementById("profile-username");

  async function loadCurrentUser() {
    try {
      const payload = await request("/auth/me");
      const user = payload.data.user;
      usernameOutput.textContent = user.username;
      profileUsernameInput.value = user.username;
      setStatus("");
    } catch (error) {
      if (error.status === 401) {
        window.location.href = "./login.html";
        return;
      }
      setStatus(error.message, "error");
    }
  }

  profileForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(profileForm);
    setStatus("Updating account...");
    try {
      const payload = await request("/auth/account", {
        method: "PATCH",
        body: JSON.stringify({
          username: String(formData.get("username") || "").trim()
        })
      });
      const user = payload.data.user;
      usernameOutput.textContent = user.username;
      profileUsernameInput.value = user.username;
      setStatus("Account updated.", "success");
    } catch (error) {
      setStatus(error.message, "error");
    }
  });

  passwordForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(passwordForm);
    setStatus("Updating password...");
    try {
      await request("/auth/password", {
        method: "PATCH",
        body: JSON.stringify({
          currentPassword: String(formData.get("currentPassword") || ""),
          newPassword: String(formData.get("newPassword") || ""),
          confirmPassword: String(formData.get("confirmPassword") || "")
        })
      });
      setStatus("Password updated.", "success");
      passwordForm.reset();
    } catch (error) {
      setStatus(error.message, "error");
    }
  });

  logoutButton.addEventListener("click", async () => {
    setStatus("Signing out...");
    try {
      await request("/auth/logout", { method: "POST" });
      window.location.href = "./login.html";
    } catch (error) {
      setStatus(error.message, "error");
    }
  });

  loadCurrentUser();
})();
