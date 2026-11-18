(function () {
  'use strict';

  function escapeHtml(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (character) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character];
    });
  }

  function text(record, fields, fallback) {
    for (var i = 0; i < fields.length; i += 1) {
      if (record[fields[i]] !== undefined && record[fields[i]] !== null && String(record[fields[i]]).trim()) return record[fields[i]];
    }
    return fallback || '';
  }

  function imagePath(value) {
    if (!value) return '';
    return String(value).replace(/^\.\.\/CLIENT SIDE\//, '').replace(/^CLIENT SIDE\//, '');
  }

  function imageMarkup(record, alt, kind) {
    var source = window.resolveTourifyImage(record, kind || 'tour');
    return '<img src="' + escapeHtml(source) + '" alt="' + escapeHtml(alt) + '" class="img-fluid" loading="lazy" onerror="this.onerror=null;this.src=\'assets/img/hero/home-hero-travel.jpg\'">';
  }

  function emptyState(message) {
    return '<div class="col-12"><div class="alert alert-light border text-center py-4 mb-0"><i class="bi bi-compass fs-3 d-block mb-2 text-primary"></i>' + escapeHtml(message) + '</div></div>';
  }

  function destinationLabel(record) {
    var name = text(record, ['name', 'title', 'destination'], 'Unnamed destination');
    var country = text(record, ['country', 'location'], '');
    return country && String(country).toLowerCase() !== String(name).toLowerCase() ? name + ', ' + country : name;
  }

  function renderDestinations() {
    var grid = document.getElementById('featuredDestinationsGrid');
    if (!grid) return;
    var records = window.Store.getAvailableDestinations();
    var featured = records.filter(function (item) { return item.featured === true || item.isFeatured === true; });
    var list = (featured.length ? featured : records).slice(0, 4);
    if (!list.length) { grid.innerHTML = emptyState('No destinations are available yet. Please check back after destinations are added.'); return; }
    grid.innerHTML = list.map(function (item, index) {
      var name = text(item, ['name', 'title', 'destination'], 'Unnamed destination');
      var location = destinationLabel(item);
      var description = text(item, ['description', 'summary'], 'Explore this destination with Tourify.');
      var cardClass = index === 0 ? 'col-lg-6' : 'col-12';
      var link = 'destination-details.html?id=' + encodeURIComponent(item.id);
      return '<div class="' + cardClass + '" data-aos="zoom-in"><div class="featured-destination' + (index ? ' compact-destination' : '') + '"><div class="destination-overlay destination-image">' + imageMarkup(item, name, 'destination') + '<div class="destination-info destination-details"><h3>' + escapeHtml(name) + '</h3><p class="location"><i class="bi bi-geo-alt-fill"></i> ' + escapeHtml(location) + '</p><p class="description brief">' + escapeHtml(description) + '</p><div class="destination-meta"><span><i class="bi bi-collection"></i> ' + escapeHtml(item.toursCount || 0) + ' Tours</span><span><i class="bi bi-star-fill"></i> ' + escapeHtml(item.rating || 'Not rated') + '</span></div><a href="' + link + '" class="explore-btn quick-link"><span>Explore Now</span><i class="bi bi-arrow-right"></i></a></div></div></div></div>';
    }).join('');
  }

  function renderTours() {
    var grid = document.getElementById('featuredToursGrid');
    if (!grid) return;
    var records = window.Store.getAvailableTours();
    var featured = records.filter(function (item) { return item.featured === true || item.isFeatured === true; });
    var list = (featured.length ? featured : records).slice(0, 6);
    if (!list.length) { grid.innerHTML = emptyState('No tours are available yet. Please check back after tours are added.'); return; }
    grid.innerHTML = list.map(function (item) {
      var title = text(item, ['title', 'name'], 'Untitled tour');
      var destination = text(item, ['destination', 'location'], 'Destination not specified');
      var link = 'tour-details.html?id=' + encodeURIComponent(item.id);
      return '<div class="col-lg-4 col-md-6" data-aos="fade-up"><div class="tour-card"><div class="tour-image">' + imageMarkup(item, title, 'tour') + '<div class="tour-price">' + escapeHtml(window.formatCurrency(item.price)) + '</div></div><div class="tour-content"><h4>' + escapeHtml(title) + '</h4><div class="tour-meta"><span class="duration"><i class="bi bi-clock"></i> ' + escapeHtml(text(item, ['duration'], 'Duration not specified')) + '</span><span class="group-size"><i class="bi bi-people"></i> Max ' + escapeHtml(item.maxGroup || item.maxGroupSize || '—') + '</span></div><p>' + escapeHtml(text(item, ['description', 'summary'], 'Tour details will be available soon.')) + '</p><div class="tour-highlights"><span>' + escapeHtml(destination) + '</span></div><div class="tour-action"><a href="' + link + '" class="btn-book">View Tour</a></div></div></div></div>';
    }).join('');
  }

  function populateSearch() {
    var destination = document.getElementById('destination');
    var tourType = document.getElementById('tour-type');
    var destinations = window.Store.getAvailableDestinations();
    var tours = window.Store.getAvailableTours();
    if (destination) {
      destination.innerHTML = '<option value="">Choose your destination</option>' + destinations.map(function (item) { return '<option value="' + escapeHtml(item.id || destinationLabel(item)) + '">' + escapeHtml(destinationLabel(item)) + '</option>'; }).join('');
      if (!destinations.length) destination.insertAdjacentHTML('beforeend', '<option value="" disabled>No destinations available</option>');
    }
    if (tourType) {
      var types = tours.map(function (item) { return text(item, ['category', 'type', 'tourType'], ''); }).filter(Boolean).filter(function (value, index, values) { return values.indexOf(value) === index; });
      tourType.innerHTML = '<option value="">Select tour type</option>' + types.map(function (type) { return '<option value="' + escapeHtml(type) + '">' + escapeHtml(type) + '</option>'; }).join('');
      if (!types.length) tourType.insertAdjacentHTML('beforeend', '<option value="" disabled>No tour types available</option>');
    }
  }

  function bindSearch() {
    var form = document.querySelector('.booking-form form');
    if (!form) return;
    var departure = document.getElementById('checkin');
    var returning = document.getElementById('checkout');
    var today = new Date().toISOString().slice(0, 10);
    if (departure) departure.min = today;
    if (returning) returning.min = today;
    if (departure && returning) departure.addEventListener('change', function () { returning.min = departure.value || today; });
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      if (!form.reportValidity()) return;
      var query = new URLSearchParams({ destination: document.getElementById('destination').value, departure: departure.value, return: returning.value, tourType: document.getElementById('tour-type').value, adults: document.getElementById('adults').value, children: document.getElementById('children').value });
      window.location.href = 'tours.html?' + query.toString();
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    renderDestinations();
    renderTours();
    populateSearch();
    bindSearch();
  });
})();
