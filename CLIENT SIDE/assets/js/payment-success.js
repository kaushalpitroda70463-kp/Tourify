(function (window, document) {
  'use strict';
  function escapeHtml(value) { return String(value == null ? '' : value).replace(/[&<>"']/g, function (character) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]; }); }
  document.addEventListener('DOMContentLoaded', function () {
    var user = window.Auth.getCurrentUser();
    var id = new URLSearchParams(window.location.search).get('bookingId');
    var booking = id ? window.Store.getBooking(id) : null;
    if (!user || !booking || String(booking.userId) !== String(user.id || user.email)) {
      document.querySelector('.success-card').innerHTML = '<div class="p-5"><h2>Confirmation unavailable</h2><p>This booking confirmation is not available for the current account.</p><a class="btn btn-primary" href="account.html">Go to My Account</a></div>';
      return;
    }
    document.getElementById('successBookingCode').textContent = booking.bookingCode || booking.id;
    document.getElementById('successTourTitle').textContent = booking.tourTitle || '-';
    document.getElementById('successAmount').textContent = window.formatCurrency(booking.totalPrice);
  });
})(window, document);
