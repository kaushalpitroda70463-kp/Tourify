(function (window, document) {
  'use strict';

  var contactDetails = {
    address: 'Rajkot, Gujarat, India',
    phone: '+91 7046356138',
    email: 'kaushalpitroda16@gmail.com'
  };

  function escapeHtml(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (character) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character];
    });
  }

  function saveMessage(record) {
    if (window.Store && typeof window.Store.saveMessage === 'function') return window.Store.saveMessage(record);
    var key = 'tourify_messages', records = [];
    try { records = JSON.parse(window.localStorage.getItem(key) || '[]'); } catch (error) { records = []; }
    if (!Array.isArray(records)) records = [];
    record.id = record.id || 'message_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
    record.createdAt = record.createdAt || new Date().toISOString();
    records.push(record);
    window.localStorage.setItem(key, JSON.stringify(records));
    return record;
  }

  function messages() {
    if (window.Store && typeof window.Store.getMessages === 'function') return window.Store.getMessages();
    try { var records = JSON.parse(window.localStorage.getItem('tourify_messages') || '[]'); return Array.isArray(records) ? records : []; } catch (error) { return []; }
  }

  function storedUser() {
    try { return JSON.parse(window.localStorage.getItem('tourify_current_user') || 'null'); } catch (error) { return null; }
  }

  function updateAuthNavigation() {
    var list = document.querySelector('#navmenu ul');
    if (!list) return;
    list.querySelectorAll('.tourify-auth-nav, .btn-client-logout').forEach(function (item) { item.closest('li') ? item.closest('li').remove() : item.remove(); });
    var user = storedUser(), item = document.createElement('li'), link = document.createElement('a');
    item.className = 'tourify-auth-nav';
    link.href = user ? 'account.html' : 'register.html?returnUrl=' + encodeURIComponent(window.location.pathname.split('/').pop() + window.location.search);
    link.textContent = user ? 'My Account / Profile' : 'Login / Register';
    item.appendChild(link);
    list.appendChild(item);
    if (user) {
      var logoutItem = document.createElement('li'), logout = document.createElement('a');
      logoutItem.className = 'tourify-auth-nav';
      logout.href = '#';
      logout.textContent = 'Log Out';
      logout.addEventListener('click', function (event) { event.preventDefault(); if (window.Auth && typeof window.Auth.logout === 'function') window.Auth.logout(); else { window.localStorage.removeItem('tourify_current_user'); window.location.href = 'index.html'; } });
      logoutItem.appendChild(logout);
      list.appendChild(logoutItem);
    }
  }

  function setFormMessage(form, className, text) {
    var box = form.querySelector('.error-message, .sent-message');
    if (!box) { box = document.createElement('div'); form.appendChild(box); }
    box.className = className;
    box.textContent = text;
    box.hidden = false;
  }

  function wireForms() {
    document.querySelectorAll('form.php-email-form').forEach(function (form) { form.removeAttribute('action'); });
    document.querySelectorAll('form.tour-booking-form').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        setFormMessage(form, 'error-message', 'Please use the Book Now option for this tour to continue with a secure booking draft.');
      });
    });
    document.querySelectorAll('form.php-email-form').forEach(function (form) {
      if (!form.querySelector('textarea[name="message"]')) return;
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        if (form.dataset.submitting === 'true') return;
        var data = new FormData(form), name = String(data.get('name') || '').trim(), email = String(data.get('email') || '').trim().toLowerCase(), subject = String(data.get('subject') || '').trim(), message = String(data.get('message') || '').trim();
        if (!name || !email || !subject || !message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setFormMessage(form, 'error-message', 'Please complete all fields with a valid email address.'); return; }
        form.dataset.submitting = 'true';
        try {
          saveMessage({ type: 'contact', name: name, email: email, subject: subject, message: message, date: new Date().toISOString(), isRead: false });
          form.reset();
          setFormMessage(form, 'sent-message', 'Your message has been saved. We will get back to you soon.');
        } catch (error) { setFormMessage(form, 'error-message', 'Your message could not be saved. Please try again.'); }
        form.dataset.submitting = 'false';
      });
    });
    document.querySelectorAll('form.php-email-form:not(.tour-booking-form)').forEach(function (form) {
      if (form.querySelector('textarea[name="message"]')) return;
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        if (form.dataset.submitting === 'true') return;
        var input = form.querySelector('input[type="email"]'), email = input ? input.value.trim().toLowerCase() : '';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setFormMessage(form, 'error-message', 'Please enter a valid email address.'); return; }
        if (messages().some(function (item) { return item.type === 'newsletter' && String(item.email || '').toLowerCase() === email; })) { setFormMessage(form, 'error-message', 'This email is already subscribed.'); return; }
        form.dataset.submitting = 'true';
        try {
          saveMessage({ type: 'newsletter', name: 'Newsletter subscriber', email: email, subject: 'Newsletter subscription', message: 'Newsletter subscription request.', date: new Date().toISOString(), isRead: false });
          form.reset();
          setFormMessage(form, 'sent-message', 'You are subscribed to the Tourify newsletter.');
        } catch (error) { setFormMessage(form, 'error-message', 'Your subscription could not be saved. Please try again.'); }
        form.dataset.submitting = 'false';
      });
    });
  }

  function renderFooter() {
    var footer = document.getElementById('footer');
    if (!footer) return;
    footer.innerHTML = '<div class="footer-newsletter"><div class="container"><div class="row justify-content-center text-center"><div class="col-lg-6"><h4>Stay in the Loop</h4><p>Get useful travel ideas and Tourify updates in your inbox.</p><form action="#" method="post" class="php-email-form"><div class="newsletter-form"><input type="email" name="email" placeholder="Enter your email" required><input type="submit" value="Subscribe"></div><div class="loading" hidden>Saving</div><div class="error-message" hidden></div><div class="sent-message" hidden></div></form></div></div></div></div><div class="container footer-top"><div class="row gy-4"><div class="col-lg-4 col-md-6 footer-about"><a href="index.html" class="d-flex align-items-center"><span class="sitename">TOURIFY</span></a><p class="mt-3">Explore the world and plan your journey with Tourify.</p><div class="footer-contact pt-3"><p>' + escapeHtml(contactDetails.address) + '</p><p><strong>Phone:</strong> <span>' + contactDetails.phone + '</span></p><p><strong>Email:</strong> <span>' + contactDetails.email + '</span></p></div></div><div class="col-lg-2 col-md-3 footer-links"><h4>Quick Links</h4><ul><li><a href="index.html">Home</a></li><li><a href="about.html">About Us</a></li><li><a href="destinations.html">Destinations</a></li><li><a href="tours.html">Tours</a></li><li><a href="gallery.html">Gallery</a></li><li><a href="contact.html">Contact Us</a></li></ul></div><div class="col-lg-2 col-md-3 footer-links"><h4>Explore</h4><ul><li><a href="destinations.html">Popular Destinations</a></li><li><a href="tours.html">Available Tours</a></li><li><a href="tours.html">Travel Packages</a></li><li><a href="booking.html">Book a Tour</a></li><li><a href="account.html">My Bookings</a></li></ul></div><div class="col-lg-4 col-md-12 footer-links"><h4>Support</h4><ul><li><a href="faq.html">FAQ</a></li><li><a href="terms.html">Terms &amp; Conditions</a></li><li><a href="privacy.html">Privacy Policy</a></li><li><a href="contact.html">Contact Support</a></li></ul><h4 class="mt-3">Follow Us</h4><div class="social-links d-flex"><a href="#" aria-label="Facebook"><i class="bi bi-facebook"></i></a><a href="#" aria-label="Instagram"><i class="bi bi-instagram"></i></a></div></div></div></div><div class="container copyright text-center mt-4"><p>© 2026 Tourify. All Rights Reserved.</p></div>';
    wireForms();
  }

  document.addEventListener('DOMContentLoaded', function () {
    var preloader = document.getElementById('preloader');
    if (preloader) {
      preloader.style.opacity = '0';
      preloader.style.visibility = 'hidden';
      preloader.style.pointerEvents = 'none';
    }
    renderFooter();
    updateAuthNavigation();
    if (window.AOS && typeof window.AOS.init === 'function') window.AOS.init();
  });
})(window, document);
