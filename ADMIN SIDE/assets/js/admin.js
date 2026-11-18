(function (window, document) {
  'use strict';
  if (document.body.classList.contains('admin-login-body')) return;
  if (!window.Auth.requireAdmin()) return;
  window.showToast = function (message, type) {
    var toast = document.createElement('div');
    toast.className = 'alert alert-' + (type === 'danger' ? 'danger' : type === 'info' ? 'info' : 'success') + ' position-fixed top-0 end-0 m-3 shadow';
    toast.style.zIndex = '2000'; toast.textContent = message; document.body.appendChild(toast); setTimeout(function () { toast.remove(); }, 2800);
  };
  window.confirmAction = function (message, callback) { if (window.confirm(message)) callback(); };
  window.updateSidebarBadges = function () {
    var bookings = window.Store.getBookings(), messages = window.Store.getMessages().filter(function (item) { return !item.isRead; });
    [['sidebarBookingBadge', bookings.length], ['sidebarMessageBadge', messages.length]].forEach(function (pair) { var element = document.getElementById(pair[0]); if (element) { element.textContent = pair[1]; element.style.display = pair[1] ? 'inline-block' : 'none'; } });
  };
  document.addEventListener('DOMContentLoaded', function () {
    var user = window.Auth.getCurrentUser();
    document.querySelectorAll('#topbarAdminName').forEach(function (element) { element.textContent = user && user.name || 'Administrator'; });
    document.querySelectorAll('#topbarAdminRole').forEach(function (element) { element.textContent = user && user.role || 'Super Admin'; });
    document.querySelectorAll('.btn-admin-logout').forEach(function (button) { button.addEventListener('click', function (event) { event.preventDefault(); window.Auth.logout(); }); });
    document.querySelectorAll('.btn-reset-demo-data, a[href="users.html?action=new"]').forEach(function (button) { var container = button.closest('li') || button.closest('.col-md-4') || button; container.remove(); });
    var primaryNav = document.querySelector('.admin-sidebar .admin-nav');
    if (primaryNav) {
      var links = primaryNav.querySelectorAll('.nav-link');
      if (links.length > 1) { links[1].href = 'handling.html'; links[1].innerHTML = '<i class="bi bi-kanban"></i> Handling'; }
      for (var i = 2; i < links.length; i += 1) links[i].closest('li').style.display = 'none';
    }
    window.updateSidebarBadges();
  });
})(window, document);
