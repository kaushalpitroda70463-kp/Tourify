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

  function imagePath(record) { return window.resolveTourifyImage(record, 'destination'); }

  function label(record) {
    var name = value(record, ['name', 'title', 'destination'], 'Unnamed destination');
    var country = value(record, ['country', 'location'], '');
    return country && String(country).toLowerCase() !== String(name).toLowerCase() ? name + ', ' + country : name;
  }

  function categoryClasses(record) {
    var source = String(value(record, ['category', 'type', 'region', 'continent'], '')).toLowerCase();
    var classes = [];
    if (/tropic|beach|island|asia/.test(source)) classes.push('filter-tropical');
    if (/mountain|alpine|trek|himalaya/.test(source)) classes.push('filter-mountain');
    if (/urban|city|america|europe/.test(source)) classes.push('filter-urban');
    if (/histor|heritage|cultur/.test(source)) classes.push('filter-historical');
    if (/coast|sea|beach|island|ocean/.test(source)) classes.push('filter-coastal');
    return classes.join(' ');
  }

  function render(records) {
    var grid = document.getElementById('destinationGrid');
    if (!grid) return;
    if (!records.length) {
      grid.innerHTML = '<div class="col-12"><div class="alert alert-light border text-center py-5"><i class="bi bi-geo-alt fs-2 d-block mb-2 text-primary"></i>No destinations match your search.</div></div>';
      return;
    }
    grid.innerHTML = records.map(function (item) {
      var name = value(item, ['name', 'title', 'destination'], 'Unnamed destination');
      var description = value(item, ['description', 'summary'], 'Explore this destination with Tourify.');
      var image = imagePath(item);
      var imageHtml = image ? '<img src="' + escapeHtml(image) + '" alt="' + escapeHtml(name) + '" class="img-fluid" loading="lazy" onerror="this.onerror=null;this.src=\'assets/img/hero/home-hero-travel.jpg\'">' : '<div class="d-flex align-items-center justify-content-center h-100 bg-light text-muted"><i class="bi bi-image fs-1"></i></div>';
      return '<div class="col-lg-4 col-md-6 destination-item isotope-item ' + categoryClasses(item) + '"><a href="destination-details.html?id=' + encodeURIComponent(item.id) + '" class="destination-tile"><div class="tile-image">' + imageHtml + '<div class="overlay-content"><span class="destination-tag">' + escapeHtml(value(item, ['category', 'continent'], 'Destination')) + '</span><div class="destination-info"><h4>' + escapeHtml(name) + '</h4><p>' + escapeHtml(description) + '</p><div class="destination-stats"><span class="tours-available"><i class="bi bi-map"></i> ' + escapeHtml(item.toursCount || 0) + ' Tours</span><span class="starting-price">' + escapeHtml(value(item, ['country', 'location'], '')) + '</span></div></div></div></div></a></div>';
    }).join('');
  }

  document.addEventListener('DOMContentLoaded', function () {
    var all = window.Store.getAvailableDestinations();
    var search = document.getElementById('destinationSearch');
    var activeFilter = '*';
    function apply() {
      var term = (search ? search.value : '').trim().toLowerCase();
      render(all.filter(function (item) {
        var matchesText = !term || [item.name, item.title, item.destination, item.country, item.continent, item.description].join(' ').toLowerCase().indexOf(term) !== -1;
        return matchesText && (activeFilter === '*' || categoryClasses(item).split(' ').indexOf(activeFilter.slice(1)) !== -1);
      }));
    }
    document.querySelectorAll('.destination-filters [data-filter]').forEach(function (filter) {
      filter.addEventListener('click', function (event) {
        event.preventDefault();
        document.querySelectorAll('.destination-filters li').forEach(function (item) { item.classList.remove('filter-active'); });
        filter.classList.add('filter-active');
        activeFilter = filter.getAttribute('data-filter') || '*';
        apply();
      });
    });
    if (search) search.addEventListener('input', apply);
    apply();
  });
})();
