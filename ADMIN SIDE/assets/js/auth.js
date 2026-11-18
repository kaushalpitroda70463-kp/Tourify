(function (window) {
  'use strict';
  var SESSION_KEY = 'tourify_admin_session';
  var ADMIN_EMAIL = 'admin@tourify.com';
  var ADMIN_PASSWORD = 'admin123';
  function readSession() { try { return JSON.parse(window.localStorage.getItem(SESSION_KEY) || 'null'); } catch (error) { return null; } }
  var Auth = {
    isLoggedIn: function () { return Boolean(readSession()); },
    getCurrentUser: function () { return readSession(); },
    login: function (identity, password) {
      if (String(identity || '').trim().toLowerCase() !== ADMIN_EMAIL || String(password || '') !== ADMIN_PASSWORD) return { success: false, message: 'Invalid admin credentials.' };
      var session = { email: ADMIN_EMAIL, name: 'Administrator', role: 'Super Admin', signedInAt: new Date().toISOString() };
      window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      return { success: true, user: session };
    },
    logout: function () { window.localStorage.removeItem(SESSION_KEY); window.location.href = 'login.html'; },
    requireAdmin: function () { if (!this.isLoggedIn()) { window.location.href = 'login.html'; return false; } return true; }
  };
  window.Auth = Auth;
})(window);
