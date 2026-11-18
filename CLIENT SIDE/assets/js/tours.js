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
  function imagePath(record) { return window.resolveTourifyImage(record, 'tour'); }
  function title(record) { return value(record, ['title', 'name'], 'Untitled tour'); }
  function destination(record) { return value(record, ['destination', 'location'], 'Destination not specified'); }
  function durationDays(record) { var match = String(value(record, ['duration'], '')).match(/\d+/); return match ? Number(match[0]) : 0; }
  function imageHtml(record, alt) { var image = imagePath(record); return image ? '<img src="' + escapeHtml(image) + '" alt="' + escapeHtml(alt) + '" class="img-fluid" loading="lazy" onerror="this.onerror=null;this.src=\'assets/img/hero/home-hero-travel.jpg\'">' : '<div class="d-flex align-items-center justify-content-center h-100 bg-light text-muted"><i class="bi bi-image fs-1"></i></div>'; }
  function criteriaQuery(params) { var query = new URLSearchParams(); ['destination', 'departure', 'return', 'tourType', 'adults', 'children'].forEach(function (key) { if (params.get(key)) query.set(key, params.get(key)); }); return query.toString(); }
  function linkFor(page, id, params) { var query = new URLSearchParams(criteriaQuery(params)); query.set(page === 'booking.html' ? 'tourId' : 'id', id); return page + '?' + query.toString(); }
  function emptyState(message) { return '<div class="col-12"><div class="alert alert-light border text-center py-5"><i class="bi bi-map fs-2 d-block mb-2 text-primary"></i>' + escapeHtml(message) + '</div></div>'; }

  function renderFeatured(list, params) {
    var wrapper = document.getElementById('featuredToursWrapper');
    if (!wrapper) return;
    if (!list.length) { wrapper.innerHTML = emptyState('No featured tours are available yet.'); return; }
    wrapper.innerHTML = list.map(function (item) {
      return '<div class="swiper-slide"><div class="featured-tour-card"><div class="tour-image">' + imageHtml(item, title(item)) + '</div><div class="tour-content"><h4>' + escapeHtml(title(item)) + '</h4><p>' + escapeHtml(value(item, ['description', 'summary'], 'Tour details will be available soon.')) + '</p><div class="tour-meta"><span class="duration"><i class="bi bi-clock"></i> ' + escapeHtml(value(item, ['duration'], 'Duration not specified')) + '</span><span class="price">' + escapeHtml(window.formatCurrency(item.price)) + '</span></div><a href="' + linkFor('tour-details.html', item.id, params) + '" class="btn btn-primary">View Details</a></div></div></div>';
    }).join('');
  }

  function renderAll(list, params) {
    var grid = document.getElementById('allToursGrid');
    if (!grid) return;
    if (!list.length) { grid.innerHTML = emptyState('No tours match the selected criteria.'); return; }
    grid.innerHTML = list.map(function (item) {
      return '<div class="col-lg-4 col-md-6 mb-4"><div class="tour-card"><div class="tour-image">' + imageHtml(item, title(item)) + '<div class="tour-price">' + escapeHtml(window.formatCurrency(item.price)) + '</div></div><div class="tour-content"><h4>' + escapeHtml(title(item)) + '</h4><p>' + escapeHtml(value(item, ['description', 'summary'], 'Tour details will be available soon.')) + '</p><div class="tour-details"><span><i class="bi bi-clock"></i> ' + escapeHtml(value(item, ['duration'], 'Duration not specified')) + '</span><span><i class="bi bi-geo-alt"></i> ' + escapeHtml(destination(item)) + '</span></div><a href="' + linkFor('tour-details.html', item.id, params) + '" class="btn btn-outline-primary me-2">View Tour</a><a href="' + linkFor('booking.html', item.id, params) + '" class="btn btn-primary">Book Now</a></div></div></div>';
    }).join('');
  }

  document.addEventListener('DOMContentLoaded', function () {
    var all = window.Store.getAvailableTours();
    var params = new URLSearchParams(window.location.search);
    var search = document.getElementById('tourSearch');
    var destinationFilter = document.getElementById('tourDestinationFilter');
    var categoryFilter = document.getElementById('tourCategoryFilter');
    var durationFilter = document.getElementById('tourDurationFilter');
    var priceFilter = document.getElementById('tourPriceFilter');
    function fill(select, values, label) { if (!select) return; select.innerHTML = '<option value="">' + label + '</option>' + values.map(function (item) { return '<option value="' + escapeHtml(item) + '">' + escapeHtml(item) + '</option>'; }).join(''); }
    fill(destinationFilter, all.map(destination).filter(function (item, index, list) { return item && list.indexOf(item) === index; }), 'Select Destination');
    fill(categoryFilter, all.map(function (item) { return value(item, ['category', 'type', 'tourType'], ''); }).filter(function (item, index, list) { return item && list.indexOf(item) === index; }), 'Tour Type');
    if (!all.length) { if (destinationFilter) destinationFilter.insertAdjacentHTML('beforeend', '<option disabled>No destinations available</option>'); if (categoryFilter) categoryFilter.insertAdjacentHTML('beforeend', '<option disabled>No categories available</option>'); }
    if (params.get('destination') && destinationFilter) {
      var requestedDestination = all.find(function (item) { return String(item.id || '') === params.get('destination') || destination(item).toLowerCase() === params.get('destination').toLowerCase(); });
      destinationFilter.value = requestedDestination ? destination(requestedDestination) : params.get('destination');
    }
    if (params.get('tourType')) categoryFilter.value = params.get('tourType');
    function matchesDestination(item, selected) { if (!selected) return true; return String(item.destinationId || '') === selected || destination(item).toLowerCase().indexOf(selected.toLowerCase()) !== -1; }
    function apply() {
      var term = (search ? search.value : '').trim().toLowerCase();
      var category = categoryFilter ? categoryFilter.value.toLowerCase() : '';
      var duration = durationFilter ? durationFilter.value : '';
      var price = priceFilter ? priceFilter.value : '';
      var selectedDestination = destinationFilter ? destinationFilter.value : '';
      var filtered = all.filter(function (item) {
        var days = durationDays(item), amount = Number(item.price) || 0, text = [title(item), destination(item), item.description, item.category, item.type].join(' ').toLowerCase();
        var durationMatch = !duration || (duration === '1-3' && days >= 1 && days <= 3) || (duration === '4-7' && days >= 4 && days <= 7) || (duration === '8-14' && days >= 8 && days <= 14) || (duration === '15+' && days >= 15);
        var priceMatch = !price || (price === '0-500' && amount <= 500) || (price === '500-1000' && amount > 500 && amount <= 1000) || (price === '1000-2000' && amount > 1000 && amount <= 2000) || (price === '2000+' && amount > 2000);
        return (!term || text.indexOf(term) !== -1) && matchesDestination(item, selectedDestination) && (!category || String(value(item, ['category', 'type', 'tourType'], '')).toLowerCase() === category) && durationMatch && priceMatch;
      });
      var featured = all.filter(function (item) { return item.featured === true || item.isFeatured === true; });
      renderFeatured((featured.length ? featured : all).slice(0, 8), params);
      renderAll(filtered, params);
    }
    [search, destinationFilter, categoryFilter, durationFilter, priceFilter].forEach(function (control) { if (control) control.addEventListener(control.tagName === 'INPUT' ? 'input' : 'change', apply); });
    apply();
  });
})();
