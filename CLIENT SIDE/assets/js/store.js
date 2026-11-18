(function (window) {
  'use strict';

  var KEYS = {
    tours: 'tourify_tours',
    destinations: 'tourify_destinations',
    users: 'tourify_users',
    bookings: 'tourify_bookings',
    messages: 'tourify_messages',
    currentUser: 'tourify_current_user',
    adminSession: 'tourify_admin_session',
    lastBooking: 'tourify_last_booking',
    draftBooking: 'tourify_draft_booking'
  };

  function clone(value) {
    return value == null ? value : JSON.parse(JSON.stringify(value));
  }

  function read(key, fallback) {
    var raw = window.localStorage.getItem(key);
    if (raw === null) {
      window.localStorage.setItem(key, JSON.stringify(fallback));
      return clone(fallback);
    }
    try {
      return JSON.parse(raw);
    } catch (error) {
      console.warn('Tourify data could not be parsed:', key);
      return clone(fallback);
    }
  }

  function write(key, value) {
    window.localStorage.setItem(key, JSON.stringify(value));
    return clone(value);
  }

  function list(key) {
    var value = read(key, []);
    return Array.isArray(value) ? clone(value) : [];
  }

  function id(prefix) {
    return prefix + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  function saveRecord(key, value, prefix) {
    var records = list(key);
    var record = clone(value || {});
    var index = records.findIndex(function (item) { return item.id === record.id; });
    if (!record.id) record.id = id(prefix);
    if (!record.createdAt) record.createdAt = new Date().toISOString();
    if (index === -1) records.push(record); else records[index] = Object.assign({}, records[index], record);
    write(key, records);
    return clone(index === -1 ? record : records[index]);
  }

  function getById(key, recordId) {
    return list(key).find(function (item) { return item.id === recordId; }) || null;
  }

  function removeById(key, recordId) {
    var records = list(key);
    var next = records.filter(function (item) { return item.id !== recordId; });
    if (next.length !== records.length) write(key, next);
    return next.length !== records.length;
  }

  function updateById(key, recordId, changes) {
    var records = list(key);
    var index = records.findIndex(function (item) { return item.id === recordId; });
    if (index === -1) return null;
    records[index] = Object.assign({}, records[index], clone(changes || {}), { updatedAt: new Date().toISOString() });
    write(key, records);
    return clone(records[index]);
  }

  var Store = {
    keys: clone(KEYS),
    getTours: function () { return list(KEYS.tours); },
    isActive: function (record) { return !record || !record.status || String(record.status).trim().toLowerCase() === 'active'; },
    getAvailableTours: function () { return list(KEYS.tours).filter(function (item) { return Store.isActive(item); }); },
    getTour: function (id) { return getById(KEYS.tours, id); },
    saveTour: function (record) { return saveRecord(KEYS.tours, record, 'tour'); },
    deleteTour: function (id) { return removeById(KEYS.tours, id); },
    getDestinations: function () { return list(KEYS.destinations); },
    getAvailableDestinations: function () { return list(KEYS.destinations).filter(function (item) { return Store.isActive(item); }); },
    getDestination: function (id) { return getById(KEYS.destinations, id); },
    saveDestination: function (record) { return saveRecord(KEYS.destinations, record, 'destination'); },
    deleteDestination: function (id) { return removeById(KEYS.destinations, id); },
    getUsers: function () { return list(KEYS.users); },
    getUser: function (id) { return getById(KEYS.users, id); },
    saveUser: function (record) { return saveRecord(KEYS.users, record, 'user'); },
    deleteUser: function (id) { return removeById(KEYS.users, id); },
    getBookings: function () { return list(KEYS.bookings); },
    getBooking: function (id) { return getById(KEYS.bookings, id); },
    saveBooking: function (record) { return saveRecord(KEYS.bookings, record, 'booking'); },
    deleteBooking: function (id) { return removeById(KEYS.bookings, id); },
    updateBookingStatus: function (id, status) { return updateById(KEYS.bookings, id, { status: status }); },
    getMessages: function () { return list(KEYS.messages); },
    getMessage: function (id) { return getById(KEYS.messages, id); },
    saveMessage: function (record) { return saveRecord(KEYS.messages, record, 'message'); },
    deleteMessage: function (id) { return removeById(KEYS.messages, id); },
    markMessageRead: function (id, isRead) { return updateById(KEYS.messages, id, { isRead: Boolean(isRead) }); },
    getStats: function () {
      var bookings = list(KEYS.bookings);
      var paid = bookings.filter(function (item) { return ['confirmed', 'completed'].indexOf(String(item.status || '').toLowerCase()) !== -1 || ['paid', 'simulated_paid'].indexOf(String(item.paymentStatus || '').toLowerCase()) !== -1; });
      return {
        totalTours: list(KEYS.tours).length,
        totalDestinations: list(KEYS.destinations).length,
        totalUsers: list(KEYS.users).length,
        totalBookings: bookings.length,
        pendingBookings: bookings.filter(function (item) { return String(item.status || '').toLowerCase() === 'pending'; }).length,
        recentBookings: bookings.slice().sort(function (a, b) { return String(b.createdAt || '').localeCompare(String(a.createdAt || '')); }).slice(0, 5),
        totalMessages: list(KEYS.messages).length,
        unreadMessages: list(KEYS.messages).filter(function (item) { return !item.isRead; }).length,
        totalRevenue: paid.reduce(function (sum, item) { return sum + (Number(item.totalPrice) || 0); }, 0)
      };
    },
    getCurrentUser: function () { return clone(read(KEYS.currentUser, null)); },
    setCurrentUser: function (user) { return write(KEYS.currentUser, user || null); },
    clearCurrentUser: function () { return write(KEYS.currentUser, null); },
    getLastBooking: function () { return clone(read(KEYS.lastBooking, null)); },
    setLastBooking: function (booking) { return write(KEYS.lastBooking, booking || null); },
    getDraftBooking: function () {
      var draft = read(KEYS.draftBooking, null);
      if (draft) return clone(draft);
      var legacy = window.localStorage.getItem('tourify_pending_booking');
      if (!legacy) return null;
      try { draft = JSON.parse(legacy); } catch (error) { return null; }
      if (draft) { write(KEYS.draftBooking, draft); window.localStorage.removeItem('tourify_pending_booking'); }
      return clone(draft);
    },
    setDraftBooking: function (booking) { return write(KEYS.draftBooking, booking || null); },
    clearDraftBooking: function () { window.localStorage.removeItem('tourify_pending_booking'); return write(KEYS.draftBooking, null); }
  };

  window.TourifyStorageKeys = clone(KEYS);
  window.Store = window.Store || Store;
  window.formatCurrency = window.formatCurrency || function (amount) {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(amount) || 0);
  };
  window.formatDate = window.formatDate || function (value) {
    if (!value) return '-';
    var date = new Date(value);
    return isNaN(date.getTime()) ? String(value) : date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };
  function localImageUrl(asset) {
    if (typeof window.URL === 'function' && window.location && window.location.href) {
      var pageIsAdmin = /(?:^|[/\\])ADMIN(?:%20|\s)SIDE(?:[/\\])/i.test(window.location.pathname || window.location.href);
      return new window.URL((pageIsAdmin ? '../CLIENT SIDE/' : '') + asset, window.location.href).href;
    }
    return asset;
  }
  window.resolveTourifyImage = window.resolveTourifyImage || function (record, kind) {
    record = record || {};
    var fields = ['image', 'imageUrl', 'imagePath', 'coverImage'], source = '';
    for (var i = 0; i < fields.length; i += 1) if (record[fields[i]] != null && String(record[fields[i]]).trim()) { source = String(record[fields[i]]).trim(); break; }
    if (source) {
      source = source.replace(/\\/g, '/').replace(/^\.\.\/CLIENT SIDE\//, '').replace(/^CLIENT SIDE\//, '');
      try { source = decodeURIComponent(source); } catch (error) { /* keep the original normalized path */ }
      var assetIndex = source.indexOf('assets/');
      if (assetIndex > 0) source = source.slice(assetIndex);
      source = source.replace(/^\.\//, '');
      var known = 'destination-1.webp destination-2.webp destination-3.webp destination-4.webp destination-5.webp destination-6.webp destination-7.webp destination-8.webp destination-9.webp destination-10.webp destination-11.webp destination-12.webp destination-14.webp destination-15.webp destination-16.webp destination-18.webp destination-20.webp tour-1.webp tour-2.webp tour-3.webp tour-4.webp tour-5.webp tour-6.webp tour-7.webp tour-8.webp tour-11.webp tour-12.webp tour-13.webp tour-14.webp tour-15.webp tour-18.webp tour-19.webp tour-22.webp tour-25.webp tour-26.webp showcase-3.webp showcase-7.webp showcase-8.webp showcase-9.webp misc-3.webp misc-5.webp misc-8.webp misc-12.webp misc-15.webp maldives-cover.jpg maldives-gallery-01.jpg rome-cover.jpg rome-gallery-01.jpg swiss-alps-cover.jpg swiss-alps-gallery-01.jpg costa-rica-cover.jpg costa-rica-gallery-01.jpg dubai-cover.jpg dubai-gallery-01.jpg amalfi-coast-cover.jpg amalfi-coast-gallery-01.jpg thailand-cover.jpg thailand-gallery-01.jpg nepal-himalayas-cover.jpg nepal-himalayas-gallery-01.jpg egypt-cover.jpg egypt-gallery-01.jpg singapore-cover.jpg singapore-gallery-01.jpg norwegian-fjords-cover.jpg norwegian-fjords-gallery-01.jpg patagonia-trek-cover.jpg patagonia-trek-gallery-01.jpg iceland-northern-lights-cover.jpg iceland-northern-lights-gallery-01.jpg morocco-tour-cover.jpg morocco-tour-gallery-01.jpg peru-machu-picchu-cover.jpg peru-machu-picchu-gallery-01.jpg vietnam-discovery-cover.jpg vietnam-discovery-gallery-01.jpg australia-highlights-cover.jpg australia-highlights-gallery-01.jpg tokyo-cultural-cover.jpg tokyo-cultural-gallery-01.jpg bali-adventure-cover.jpg bali-adventure-gallery-01.jpg paris-getaway-cover.jpg paris-getaway-gallery-01.jpg'.split(' ');
      var file = source.split('/').pop();
      if ((source.indexOf('assets/img/travel/') === 0 || source.indexOf('assets/img/destinations/') === 0 || source.indexOf('assets/img/tours/') === 0) && known.indexOf(file) === -1) source = '';
      else if (source.indexOf('assets/') === 0 && known.indexOf(file) !== -1) return localImageUrl(source);
      else if (source.indexOf('assets/') !== 0) return source;
    }
    var text = [record.title, record.name, record.destination, record.location, record.country, record.category, record.type, record.description].join(' ').toLowerCase();
    var destinationMap = [[/maldives/, 'assets/img/destinations/maldives-cover.jpg'], [/rome|italy|heritage|palace|venice/, 'assets/img/destinations/rome-cover.jpg'], [/swiss|alps/, 'assets/img/destinations/swiss-alps-cover.jpg'], [/costa rica/, 'assets/img/destinations/costa-rica-cover.jpg'], [/dubai|uae|desert/, 'assets/img/destinations/dubai-cover.jpg'], [/amalfi/, 'assets/img/destinations/amalfi-coast-cover.jpg'], [/thailand/, 'assets/img/destinations/thailand-cover.jpg'], [/himalaya|nepal/, 'assets/img/destinations/nepal-himalayas-cover.jpg'], [/egypt|cairo|pyramid/, 'assets/img/destinations/egypt-cover.jpg'], [/singapore/, 'assets/img/destinations/singapore-cover.jpg']];
    var tourMap = [[/paris|france|eiffel/, 'assets/img/tours/paris-getaway-cover.jpg'], [/bali|indonesia/, 'assets/img/tours/bali-adventure-cover.jpg'], [/tokyo|japan/, 'assets/img/tours/tokyo-cultural-cover.jpg'], [/norway|fjord/, 'assets/img/tours/norwegian-fjords-cover.jpg'], [/patagonia/, 'assets/img/tours/patagonia-trek-cover.jpg'], [/iceland/, 'assets/img/tours/iceland-northern-lights-cover.jpg'], [/morocco/, 'assets/img/tours/morocco-tour-cover.jpg'], [/peru|machu/, 'assets/img/tours/peru-machu-picchu-cover.jpg'], [/australia|sydney/, 'assets/img/tours/australia-highlights-cover.jpg'], [/vietnam/, 'assets/img/tours/vietnam-discovery-cover.jpg']];
  var map = kind === 'destination' ? destinationMap : tourMap, match = kind === 'destination' ? 'assets/img/destinations/maldives-cover.jpg' : 'assets/img/hero/home-hero-travel.jpg';
    for (var j = 0; j < map.length; j += 1) if (map[j][0].test(text)) { match = map[j][1]; break; }
    return localImageUrl(match);
  };
})(window);
