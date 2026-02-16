"use strict";

(function initializeAuthPages() {
  const page = document.body.dataset.page;
  const statusElement = document.getElementById("status");

  function setStatus(message, type = "") {
    if (!statusElement) return;
    statusElement.textContent = message || "";
    statusElement.className = `status${type ? ` ${type}` : ""}`;
  }

  async function request(url, options = {}) {
    const response = await fetch(url, {
      credentials: "include",
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {})
      }
    });

    let payload = {};
    try {
      payload = await response.json();
    } catch (error) {
      payload = {};
    }

    if (!response.ok) {
      const message = payload.message || `Request failed with status ${response.status}.`;
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
        window.location.href = "/html/account-management.html";
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
        window.location.href = "/html/account-management.html";
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
        window.location.href = "/html/login.html";
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
      window.location.href = "/html/login.html";
    } catch (error) {
      setStatus(error.message, "error");
    }
  });

  loadCurrentUser();
})();
