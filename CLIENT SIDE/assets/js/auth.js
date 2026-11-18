(function (window, document) {
  'use strict';

  function normalize(value) { return String(value || '').trim().toLowerCase(); }
  function returnUrl() {
    var requested = new URLSearchParams(window.location.search).get('returnUrl');
    return requested && !/^https?:\/\//i.test(requested) && requested.indexOf('\\') === -1 ? requested : 'account.html';
  }
  function showMessage(container, message, type) {
    if (!container) return;
    container.textContent = message;
    container.className = 'client-messages ' + (type === 'success' ? 'success-message' : 'error-message');
    container.style.display = 'block';
  }
  function currentUser() { return window.Store.getCurrentUser(); }
  function logout() { window.Store.clearCurrentUser(); window.location.href = 'index.html'; }

  var Auth = {
    getCurrentUser: currentUser,
    isLoggedIn: function () { return Boolean(currentUser()); },
    logout: logout,
    requireUser: function () {
      var user = currentUser();
      if (!user) { window.location.href = 'login.html?returnUrl=' + encodeURIComponent(window.location.pathname.split('/').pop() + window.location.search); return null; }
      return user;
    },
    login: function (identifier, password) {
      var entered = String(identifier || '').trim();
      var user = window.Store.getUsers().find(function (item) {
        return normalize(item.email) === normalize(entered) || (item.id && String(item.id) === entered);
      });
      if (!user || user.password !== String(password || '')) return { ok: false, message: 'The email or password is incorrect.' };
      window.Store.setCurrentUser({ id: user.id, name: user.name, email: user.email, role: user.role || 'Customer' });
      return { ok: true, user: window.Store.getCurrentUser() };
    }
  };
  window.Auth = Auth;

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.btn-client-logout').forEach(function (button) { button.addEventListener('click', function (event) { event.preventDefault(); logout(); }); });
    var loginForm = document.getElementById('loginForm');
    if (loginForm) {
      var loginAlert = document.getElementById('loginAlertContainer');
      var registerLink = document.querySelector('a[href="register.html"]');
      var requestedReturn = new URLSearchParams(window.location.search).get('returnUrl');
      if (registerLink && requestedReturn) registerLink.href = 'register.html?returnUrl=' + encodeURIComponent(requestedReturn);
      loginForm.addEventListener('submit', function (event) {
        event.preventDefault();
        if (!loginForm.reportValidity()) return;
        var result = Auth.login(document.getElementById('loginEmail').value, document.getElementById('loginPassword').value);
        if (!result.ok) { showMessage(loginAlert, result.message, 'error'); return; }
        window.location.href = returnUrl();
      });
      if (new URLSearchParams(window.location.search).get('registered') === '1') showMessage(loginAlert, 'Account created successfully. You can now sign in.', 'success');
    }
    var registerForm = document.getElementById('registerForm');
    if (registerForm) {
      var registerAlert = document.getElementById('registerAlertContainer');
      var loginLink = document.querySelector('a[href="login.html"]');
      var requestedReturnForRegister = new URLSearchParams(window.location.search).get('returnUrl');
      if (loginLink && requestedReturnForRegister) loginLink.href = 'login.html?returnUrl=' + encodeURIComponent(requestedReturnForRegister);
      registerForm.addEventListener('submit', function (event) {
        event.preventDefault();
        if (!registerForm.reportValidity()) return;
        var name = document.getElementById('regName').value.trim();
        var email = document.getElementById('regEmail').value.trim();
        var password = document.getElementById('regPassword').value;
        var confirmation = document.getElementById('regPasswordConfirm').value;
        if (name.length < 2) { showMessage(registerAlert, 'Please enter your full name.', 'error'); return; }
        if (password.length < 6) { showMessage(registerAlert, 'Password must contain at least 6 characters.', 'error'); return; }
        if (password !== confirmation) { showMessage(registerAlert, 'Passwords do not match.', 'error'); return; }
        var duplicate = window.Store.getUsers().some(function (user) { return normalize(user.email) === normalize(email) || (user.id && normalize(user.id) === normalize(email)); });
        if (duplicate) { showMessage(registerAlert, 'An account with those details already exists.', 'error'); return; }
        window.Store.saveUser({ name: name, email: email, password: password, role: 'Customer', joinedDate: new Date().toISOString() });
        registerForm.reset();
        window.location.href = 'login.html?registered=1&returnUrl=' + encodeURIComponent(returnUrl());
      });
    }
  });
})(window, document);
