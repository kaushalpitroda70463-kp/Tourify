(function (window, document) {
  'use strict';
  function escapeHtml(value) { return String(value == null ? '' : value).replace(/[&<>"']/g, function (character) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]; }); }
  function money(amount) { return window.formatCurrency(Number(amount) || 0); }
  function showError(message) { var form = document.getElementById('paymentForm'); if (form) form.insertAdjacentHTML('beforebegin', '<div class="alert alert-danger" role="alert">' + escapeHtml(message) + '</div>'); }
  document.addEventListener('DOMContentLoaded', function () {
    var user = window.Auth.getCurrentUser();
    var draft = window.Store.getDraftBooking();
    var tour = draft && draft.tourId ? window.Store.getTour(draft.tourId) : null;
    if (!user || !draft || !tour || String(draft.userId) !== String(user.id || user.email)) {
      showError('Your booking session is unavailable or expired. Please select a valid tour and complete the booking form again.');
      document.querySelectorAll('#paymentForm input, #paymentForm button').forEach(function (field) { field.disabled = true; });
      return;
    }
    document.getElementById('summaryTourTitle').textContent = draft.tourTitle;
    document.getElementById('summaryDestination').textContent = draft.destination || 'Destination not specified';
    document.getElementById('summaryTravelDate').textContent = draft.departureDate + ' to ' + draft.returnDate;
    document.getElementById('summaryCustomerName').textContent = draft.firstName + ' ' + draft.lastName;
    document.getElementById('summaryTravelers').textContent = draft.travelers + ' Travelers';
    document.getElementById('summaryBasePrice').textContent = money(draft.basePrice);
    document.getElementById('summaryTotalAmount').textContent = money(draft.totalPrice);
    document.querySelector('a[href="booking.html"]').href = 'booking.html?tourId=' + encodeURIComponent(draft.tourId);
    var form = document.getElementById('paymentForm');
    var submitting = false;
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      if (submitting || !form.reportValidity()) return;
      var holder = document.getElementById('cardHolder').value.trim();
      var number = document.getElementById('cardNumber').value.replace(/\D/g, '');
      var expiry = document.getElementById('cardExpiry').value.trim();
      var cvv = document.getElementById('cardCvv').value.replace(/\D/g, '');
      var expiryMatch = /^(0[1-9]|1[0-2])\/(\d{2})$/.exec(expiry);
      var now = new Date();
      if (!holder || number.length < 12 || number.length > 19 || !expiryMatch || cvv.length < 3 || cvv.length > 4 || Number(expiryMatch[2]) < now.getFullYear() % 100 || (Number(expiryMatch[2]) === now.getFullYear() % 100 && Number(expiryMatch[1]) < now.getMonth() + 1)) { showError('Enter valid demo card details. No card information will be stored.'); return; }
      submitting = true;
      document.getElementById('btnPayNow').disabled = true;
      var booking = window.Store.saveBooking({ id: draft.bookingId, bookingCode: 'TR-' + Date.now().toString(36).toUpperCase(), userId: user.id || user.email, tourId: draft.tourId, tourTitle: draft.tourTitle, destination: draft.destination, duration: draft.duration, travelDate: draft.departureDate, returnDate: draft.returnDate, departureDate: draft.departureDate, travelers: draft.travelers, adults: draft.adults, children: draft.children, infants: draft.infants, firstName: draft.firstName, lastName: draft.lastName, customerName: (draft.firstName + ' ' + draft.lastName).trim(), email: draft.email, phone: draft.phone, nationality: draft.nationality, dietary: draft.dietary, specialRequests: draft.specialRequests, addons: draft.addons, basePrice: draft.basePrice, addonTotal: draft.addonTotal, totalPrice: draft.totalPrice, paymentMethod: 'credit_card_demo', paymentStatus: 'simulated_paid', status: 'Confirmed' });
      if (!booking || !booking.id) { submitting = false; document.getElementById('btnPayNow').disabled = false; showError('The booking could not be saved. Please try again.'); return; }
      window.Store.setLastBooking(booking);
      window.Store.clearDraftBooking();
      window.location.href = 'payment-success.html?bookingId=' + encodeURIComponent(booking.id);
    });
  });
})(window, document);
