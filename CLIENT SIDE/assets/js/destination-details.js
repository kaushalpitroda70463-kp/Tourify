(function () {
  'use strict';

  function escapeHtml(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (character) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character];
    });
  }
  function value(record, fields, fallback) {
    for (var i = 0; i < fields.length; i += 1) if (record[fields[i]] != null && String(record[fields[i]]).trim()) return record[fields[i]];
    return fallback || '';
  }
  function label(record) {
    var name = value(record, ['name', 'title', 'destination'], 'Unnamed destination');
    var country = value(record, ['country', 'location'], '');
    return country && String(country).toLowerCase() !== String(name).toLowerCase() ? name + ', ' + country : name;
  }
  function imagePath(record) { return window.resolveTourifyImage(record, 'destination'); }
  function empty(message) { return '<div class="col-12"><div class="alert alert-light border text-center py-5"><i class="bi bi-info-circle fs-2 d-block mb-2 text-primary"></i>' + escapeHtml(message) + '</div></div>'; }

  document.addEventListener('DOMContentLoaded', function () {
    var section = document.getElementById('travel-destination-details');
    var id = new URLSearchParams(window.location.search).get('id');
    var destination = id ? window.Store.getDestination(id) : null;
    if (!destination) {
      section.innerHTML = '<div class="container"><div class="alert alert-light border text-center py-5"><h2>Destination unavailable</h2><p>Choose a destination from the listing to view its details.</p><a class="btn btn-primary" href="destinations.html">Browse Destinations</a></div></div>';
      return;
    }
    var name = value(destination, ['name', 'title', 'destination'], 'Unnamed destination');
    var location = label(destination);
    var description = value(destination, ['description', 'summary'], 'No description is available for this destination yet.');
    var image = imagePath(destination);
    document.getElementById('destinationHeroTitle').textContent = location;
    document.getElementById('destinationHeroTagline').textContent = value(destination, ['tagline', 'category', 'continent'], 'Explore with Tourify');
    document.getElementById('destinationOverviewTitle').textContent = 'Discover ' + name;
    document.getElementById('destinationOverviewText').textContent = description;
    var heroImage = document.getElementById('destinationHeroImage');
    if (image) { heroImage.src = image; heroImage.alt = location; } else heroImage.style.display = 'none';
    document.querySelectorAll('.attractions-section, .map-section, .practical-info, .travel-tips, .gallery-section, .cta-section').forEach(function (item) { item.style.display = 'none'; });
    var attractionGrid = document.getElementById('destinationAttractions');
    if (attractionGrid) attractionGrid.innerHTML = empty('No attraction details have been added for this destination yet.');
    var tours = window.Store.getAvailableTours().filter(function (tour) {
      var tourDestination = String(value(tour, ['destination', 'location', 'destinationId'], '')).toLowerCase();
      return tour.destinationId === destination.id || tourDestination === String(name).toLowerCase() || tourDestination.indexOf(String(name).toLowerCase()) !== -1 || tourDestination.indexOf(String(value(destination, ['country'], '')).toLowerCase()) !== -1;
    });
    var tourGrid = document.getElementById('destinationTours');
    if (!tours.length) { tourGrid.innerHTML = empty('No tours are currently linked to this destination.'); return; }
    tourGrid.innerHTML = tours.map(function (tour) {
      var title = value(tour, ['title', 'name'], 'Untitled tour');
      var tourImage = window.resolveTourifyImage(tour, 'tour');
      var imageHtml = tourImage ? '<img src="' + escapeHtml(tourImage) + '" alt="' + escapeHtml(title) + '" class="img-fluid" onerror="this.onerror=null;this.src=\'assets/img/hero/home-hero-travel.jpg\'">' : '<div class="d-flex align-items-center justify-content-center h-100 bg-light text-muted"><i class="bi bi-image fs-1"></i></div>';
      return '<div class="col-lg-4 col-md-6"><div class="tour-card"><div class="tour-image">' + imageHtml + '<div class="tour-price"><span>' + escapeHtml(window.formatCurrency(tour.price)) + '</span></div></div><div class="tour-content"><div class="tour-meta"><span class="duration"><i class="bi bi-clock"></i> ' + escapeHtml(value(tour, ['duration'], 'Duration not specified')) + '</span></div><h4>' + escapeHtml(title) + '</h4><p>' + escapeHtml(value(tour, ['description', 'summary'], 'Tour details will be available soon.')) + '</p><a href="tour-details.html?id=' + encodeURIComponent(tour.id) + '" class="btn-tour">View Tour</a></div></div></div>';
    }).join('');
  });
})();
