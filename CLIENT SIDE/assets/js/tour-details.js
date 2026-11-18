(function () {
  'use strict';
  function escapeHtml(value) { return String(value == null ? '' : value).replace(/[&<>"']/g, function (character) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]; }); }
  function value(record, fields, fallback) { for (var i = 0; i < fields.length; i += 1) if (record[fields[i]] != null && String(record[fields[i]]).trim()) return record[fields[i]]; return fallback || ''; }
  function imagePath(record) { return window.resolveTourifyImage(record, 'tour'); }
  document.addEventListener('DOMContentLoaded', function () {
    var section = document.getElementById('travel-tour-details');
    var params = new URLSearchParams(window.location.search);
    var tour = params.get('id') ? window.Store.getTour(params.get('id')) : null;
    if (tour && !window.Store.isActive(tour)) tour = null;
    if (!tour) { section.innerHTML = '<div class="container"><div class="alert alert-light border text-center py-5"><h2>Tour unavailable</h2><p>Choose a tour from the listings to view its details.</p><a class="btn btn-primary" href="tours.html">Browse Tours</a></div></div>'; return; }
    var name = value(tour, ['title', 'name'], 'Untitled tour');
    var destination = value(tour, ['destination', 'location'], 'Destination not specified');
    var duration = value(tour, ['duration'], 'Duration not specified');
    var description = value(tour, ['description', 'summary'], 'No description is available for this tour yet.');
    var image = imagePath(tour);
    document.getElementById('tourHeroTitle').textContent = name;
    document.getElementById('tourHeroDuration').innerHTML = '<i class="bi bi-calendar"></i> ' + escapeHtml(duration);
    document.getElementById('tourHeroDestination').innerHTML = '<i class="bi bi-geo-alt"></i> ' + escapeHtml(destination);
    document.getElementById('tourHeroRating').innerHTML = '<i class="bi bi-star-fill"></i> ' + escapeHtml(tour.rating || 'Not rated');
    document.getElementById('tourHeroTagline').textContent = value(tour, ['tagline'], description);
    document.getElementById('tourOverviewTitle').textContent = name + ' Overview';
    document.getElementById('tourOverviewText').textContent = description;
    document.getElementById('tourOverviewDestination').textContent = 'Destination: ' + destination;
    document.getElementById('tourStartingPrice').textContent = window.formatCurrency(tour.price);
    document.getElementById('tourDoublePrice').textContent = window.formatCurrency(tour.price);
    if (image) { var hero = document.getElementById('tourHeroImage'); hero.src = image; hero.alt = name; }
    var query = new URLSearchParams(); query.set('tourId', tour.id); ['departure', 'return', 'adults', 'children'].forEach(function (key) { if (params.get(key)) query.set(key, params.get(key)); });
    document.getElementById('tourAvailabilityLink').href = '#booking';
    document.querySelectorAll('.tour-itinerary, .tour-inclusions, .tour-gallery').forEach(function (item) { item.style.display = 'none'; });
    var bookingLink = document.querySelector('.final-cta a[href="booking.html"]');
    if (bookingLink) bookingLink.href = 'booking.html?' + query.toString();
  });
})();
