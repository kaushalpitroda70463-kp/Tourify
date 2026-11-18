(function (window, document) {
  'use strict';
  function escapeHtml(value) { return String(value == null ? '' : value).replace(/[&<>"']/g, function (character) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]; }); }
  function sameUser(booking, user) {
    if (booking.userId) return String(booking.userId) === String(user.id || user.email);
    return String(booking.email || booking.customerEmail || '').trim().toLowerCase() === String(user.email || '').trim().toLowerCase();
  }
  document.addEventListener('DOMContentLoaded', function () {
    var user = window.Auth.requireUser();
    if (!user) return;
    document.getElementById('accountName').textContent = user.name || 'Tourify traveler';
    document.getElementById('accountEmail').textContent = user.email || '';
    var joined = window.Store.getUsers().find(function (item) { return (user.id && String(item.id) === String(user.id)) || String(item.email || '').trim().toLowerCase() === String(user.email || '').trim().toLowerCase(); });
    document.getElementById('accountJoined').textContent = joined && joined.joinedDate ? 'Member since ' + window.formatDate(joined.joinedDate) : '';
    var bookings = window.Store.getBookings().filter(function (booking) { return sameUser(booking, user); });
    var target = document.getElementById('accountBookings');
    if (!bookings.length) { target.innerHTML = '<div class="alert alert-light border mb-0">You have no bookings yet. Explore our <a href="tours.html">available tours</a> to plan your next journey.</div>'; return; }
    target.innerHTML = '<div class="list-group list-group-flush">' + bookings.map(function (booking) { var dates = window.formatDate(booking.departureDate || booking.travelDate) + (booking.returnDate ? ' – ' + window.formatDate(booking.returnDate) : ''); var travelers = booking.travelers || ((Number(booking.adults) || 0) + (Number(booking.children) || 0) + (Number(booking.infants) || 0)); return '<div class="list-group-item px-0 py-3"><div class="d-flex justify-content-between gap-3"><div><h3 class="h6 mb-1">' + escapeHtml(booking.tourTitle || booking.tourName || 'Tour booking') + '</h3><div class="small text-muted">' + escapeHtml(booking.destination || 'Destination not recorded') + ' · ' + escapeHtml(dates) + '</div><div class="small text-muted">Booking ID: ' + escapeHtml(booking.bookingCode || booking.id || '-') + ' · Travelers: ' + escapeHtml(travelers || '-') + '</div></div><strong class="text-primary">' + escapeHtml(window.formatCurrency(booking.totalPrice)) + '</strong></div><span class="badge bg-light text-dark border mt-2">' + escapeHtml(booking.status || 'Pending') + '</span> <a class="small ms-2" href="payment-success.html?bookingId=' + encodeURIComponent(booking.id || '') + '">View confirmation</a></div>'; }).join('') + '</div>';
  });
})(window, document);
