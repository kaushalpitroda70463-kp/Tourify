(function (window, document) {
  'use strict';
  var ADDONS = { 'travel-insurance': 89, 'airport-transfer': 45, 'extra-nights': 120, 'local-guide': 199 };
  function escapeHtml(value) { return String(value == null ? '' : value).replace(/[&<>"']/g, function (character) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]; }); }
  function value(record, fields, fallback) { for (var i = 0; i < fields.length; i += 1) if (record[fields[i]] != null && String(record[fields[i]]).trim()) return record[fields[i]]; return fallback || ''; }
  function imagePath(record) { return window.resolveTourifyImage(record, 'tour'); }
  function days(record) { var match = String(value(record, ['duration'], '')).match(/\d+/); return match ? Number(match[0]) : 0; }
  function money(amount) { return window.formatCurrency(Number(amount) || 0); }
  function setText(id, text) { var element = document.getElementById(id); if (element) element.textContent = text; }
  function showError(message) { var form = document.querySelector('.booking-form-container'); if (form) form.insertAdjacentHTML('afterbegin', '<div class="alert alert-danger" role="alert">' + escapeHtml(message) + '</div>'); }
  function datePlus(date, amount) { var result = new Date(date + 'T00:00:00'); result.setDate(result.getDate() + amount); return result.toISOString().slice(0, 10); }
  function isPreviousValid(targetIndex) { var steps = document.querySelectorAll('.form-step'); for (var i = 0; i < targetIndex; i += 1) { var fields = steps[i].querySelectorAll('input, select, textarea'); for (var j = 0; j < fields.length; j += 1) if (!fields[j].checkValidity()) { fields[j].reportValidity(); return false; } } return true; }

  document.addEventListener('DOMContentLoaded', function () {
    var user = window.Auth.getCurrentUser();
    var query = new URLSearchParams(window.location.search);
    if (!user) { window.location.href = 'login.html?returnUrl=' + encodeURIComponent('booking.html' + window.location.search); return; }
    var tours = window.Store.getAvailableTours();
    var select = document.getElementById('tour-select');
    var form = document.querySelector('.booking-form');
    var requestedId = query.get('tourId');
    var tour = requestedId ? window.Store.getTour(requestedId) : null;
    if (requestedId && !tour) { showError('The selected tour is no longer available. Please choose a valid tour from the Tours page.'); form.querySelectorAll('input, select, textarea, button').forEach(function (field) { field.disabled = true; }); return; }
    select.innerHTML = '<option value="">Select a tour...</option>' + tours.map(function (item) { return '<option value="' + escapeHtml(item.id) + '">' + escapeHtml(value(item, ['title', 'name'], 'Untitled tour')) + '</option>'; }).join('');
    if (tour) select.value = tour.id;
    if (!tours.length) { showError('No tours are available for booking yet.'); form.querySelectorAll('input, select, textarea, button').forEach(function (field) { field.disabled = true; }); return; }
    var currentUser = user;
    var nameParts = String(currentUser.name || '').trim().split(/\s+/);
    document.getElementById('first-name').value = nameParts.shift() || '';
    document.getElementById('last-name').value = nameParts.join(' ');
    document.getElementById('email').value = currentUser.email || '';
    document.getElementById('email').readOnly = Boolean(currentUser.email);
    var departure = document.getElementById('departure-date');
    var returning = document.getElementById('return-date');
    var today = new Date().toISOString().slice(0, 10);
    departure.min = today; returning.min = today;
    function selectedTour() { return window.Store.getTour(select.value); }
    function updateSummary() {
      var selected = selectedTour();
      if (!selected) { setText('summaryTourTitle', 'Select a tour'); setText('summaryTourDuration', 'Select a tour'); setText('summaryTourDestination', 'Select a tour'); setText('summaryBasePrice', '₹0'); setText('summaryTotalPrice', '₹0'); return; }
      var duration = value(selected, ['duration'], 'Duration not specified');
      document.getElementById('tour-duration').value = duration;
      setText('summaryTourTitle', value(selected, ['title', 'name'], 'Untitled tour'));
      setText('summaryTourDuration', duration); setText('summaryDuration', duration);
      setText('summaryTourDestination', value(selected, ['destination', 'location'], 'Destination not specified'));
      var image = imagePath(selected), imageElement = document.getElementById('summaryTourImage');
      if (image) { imageElement.src = image; imageElement.alt = value(selected, ['title', 'name'], 'Selected tour'); imageElement.onerror = function () { this.onerror = null; this.src = 'assets/img/hero/home-hero-travel.jpg'; }; }
      updateTotal();
    }
    function updateTotal() {
      var selected = selectedTour(), travelers = Number(document.getElementById('adults').value || 0) + Number(document.getElementById('children').value || 0) + Number(document.getElementById('infants').value || 0);
      var base = selected ? Number(selected.price) * travelers : 0, addonTotal = 0;
      Object.keys(ADDONS).forEach(function (id) { var checkbox = document.getElementById(id); if (checkbox && checkbox.checked) addonTotal += ADDONS[id]; });
      setText('summaryBasePrice', money(base)); setText('summaryInsurancePrice', document.getElementById('travel-insurance').checked ? money(ADDONS['travel-insurance']) : '₹0'); setText('summaryTransferPrice', document.getElementById('airport-transfer').checked ? money(ADDONS['airport-transfer']) : '₹0'); setText('summaryFeesPrice', money(addonTotal - (document.getElementById('travel-insurance').checked ? ADDONS['travel-insurance'] : 0) - (document.getElementById('airport-transfer').checked ? ADDONS['airport-transfer'] : 0))); setText('summaryTotalPrice', money(base + addonTotal));
      setText('summaryTravelers', travelers + ' traveler' + (travelers === 1 ? '' : 's')); setText('summaryDeparture', departure.value ? departure.value + (returning.value ? ' to ' + returning.value : '') : 'Select dates');
    }
    select.addEventListener('change', function () { tour = selectedTour(); updateSummary(); if (departure.value && days(tour)) returning.value = datePlus(departure.value, days(tour) - 1); });
    [departure, returning, document.getElementById('adults'), document.getElementById('children'), document.getElementById('infants')].forEach(function (field) { field.addEventListener('change', updateSummary); });
    Object.keys(ADDONS).forEach(function (id) { document.getElementById(id).addEventListener('change', updateSummary); });
    departure.addEventListener('change', function () { var selected = selectedTour(); returning.min = departure.value || today; if (selected && days(selected)) { returning.value = datePlus(departure.value, days(selected) - 1); } updateSummary(); });
    document.querySelectorAll('.step').forEach(function (button, index) { button.addEventListener('click', function (event) { if (!isPreviousValid(index)) event.preventDefault(); }); });
    form.querySelectorAll('#card-name, #card-number, #card-cvv, #card-expiry-month, #card-expiry-year').forEach(function (field) { field.required = false; });
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      if (!select.value || !selectedTour()) { select.setCustomValidity('Select a valid tour.'); select.reportValidity(); select.setCustomValidity(''); return; }
      if (!departure.value || !returning.value || new Date(returning.value) < new Date(departure.value) || (days(selectedTour()) && returning.value !== datePlus(departure.value, days(selectedTour()) - 1))) { returning.setCustomValidity('Return date must match the selected tour duration.'); returning.reportValidity(); returning.setCustomValidity(''); return; }
      if (!form.reportValidity()) return;
      var selected = selectedTour(), travelers = Number(document.getElementById('adults').value) + Number(document.getElementById('children').value) + Number(document.getElementById('infants').value), base = Number(selected.price) * travelers, addons = [], addonTotal = 0;
      Object.keys(ADDONS).forEach(function (id) { var checkbox = document.getElementById(id); if (checkbox.checked) { addons.push({ id: id, price: ADDONS[id] }); addonTotal += ADDONS[id]; } });
      var draft = { userId: currentUser.id || currentUser.email, tourId: selected.id, tourTitle: value(selected, ['title', 'name'], 'Untitled tour'), destination: value(selected, ['destination', 'location'], ''), duration: value(selected, ['duration'], ''), departureDate: departure.value, returnDate: returning.value, travelers: travelers, adults: Number(document.getElementById('adults').value), children: Number(document.getElementById('children').value), infants: Number(document.getElementById('infants').value), firstName: document.getElementById('first-name').value.trim(), lastName: document.getElementById('last-name').value.trim(), email: document.getElementById('email').value.trim(), phone: document.getElementById('phone').value.trim(), nationality: document.getElementById('nationality').value, dietary: document.getElementById('dietary').value.trim(), specialRequests: document.getElementById('special-requests').value.trim(), addons: addons, basePrice: base, addonTotal: addonTotal, totalPrice: base + addonTotal, paymentMethod: document.querySelector('input[name="payment_method"]:checked').value, createdAt: new Date().toISOString() };
      window.Store.setDraftBooking(draft);
      window.location.href = 'payment.html';
    });
    updateSummary();
  });
})(window, document);
