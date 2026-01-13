// Minimal JS: mobile nav toggle, contact form validation, set year
// plus dynamic header-height calculation so fixed header doesn't cover page content

document.addEventListener('DOMContentLoaded', function(){
  // Adjust CSS variable --header-height to header's actual height
  var header = document.querySelector('.site-header');
  function setHeaderOffset() {
    if (!header) return;
    // Use getBoundingClientRect for a precise height including padding
    var h = Math.ceil(header.getBoundingClientRect().height);
    // Set on root so CSS can use var(--header-height)
    document.documentElement.style.setProperty('--header-height', h + 'px');
  }

  // run on load and on resize (and after a small delay to catch fonts/layout)
  setHeaderOffset();
  // sometimes useful to run twice (after fonts load) — use a timeout
  setTimeout(setHeaderOffset, 250);
  window.addEventListener('resize', setHeaderOffset);

  // Set copyright year
  var y = new Date().getFullYear();
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = y;

  // Mobile nav toggle
  var navToggle = document.getElementById('nav-toggle');
  var navList = document.getElementById('nav-list');
  if(navToggle){
    navToggle.addEventListener('click', function(){
      var expanded = this.getAttribute('aria-expanded') === 'true';
      this.setAttribute('aria-expanded', String(!expanded));
      if(navList.style.display === 'block'){
        navList.style.display = '';
      } else {
        navList.style.display = 'block';
      }
    });
  }

  // Small helper to ensure the page scrolls to the pricing table when linked from nav anchors
document.addEventListener('DOMContentLoaded', function () {
  // Ensure correct year (main.js does this too; harmless duplicate)
  var y = new Date().getFullYear();
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = y;

  // If the URL contains a hash that targets an element on this page, ensure it scrolls after layout settles
  if (location.hash) {
    setTimeout(function () {
      var el = document.querySelector(location.hash);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 250);
  }
});

  // Simple front-end form validation & demo handler
  var form = document.getElementById('contact-form');
  if(form){
    form.addEventListener('submit', function(e){
      e.preventDefault();
      var name = form.name.value.trim();
      var email = form.email.value.trim();
      var message = form.message.value.trim();
      if(!name || !email || !message){
        alert('Please complete your name, email and message before sending.');
        return;
      }
      // Demo: show success and reset form. Replace with real submission (AJAX/third-party) in production.
      alert('Thanks — your appointment request has been sent (demo). We will contact you soon.');
      form.reset();
    });
  }
});

// Announcement banner helper - paste inside your DOMContentLoaded handler or call after DOM ready
(function initAnnouncementBanner(){
  var banner = document.querySelector('.announcement-banner');
  if (!banner) return;

  // Use a per-announcement id so you can change text/date and not reuse old dismissal
  var id = banner.getAttribute('data-announcement-id') || 'announcement';
  var storageKey = 'announcement-dismissed-' + id;

  // Hide if previously dismissed
  if (localStorage.getItem(storageKey) === '1') {
    banner.style.display = 'none';
    return;
  }

  // Close button handler
  var btn = banner.querySelector('.announce-close');
  if (btn) {
    btn.addEventListener('click', function () {
      // Hide immediately
      banner.style.display = 'none';
      // Persist dismissal
      try { localStorage.setItem(storageKey, '1'); } catch (e) { /* storage may fail in private mode */ }
    });
  }
})();

/* Replace the existing "Find all groups" DOMContentLoaded block in js/main.js with this block.
   This keeps localStorage behavior (if user previously expanded a group) but otherwise
   defaults groups to collapsed. */
document.addEventListener('DOMContentLoaded', function () {
  // Find all groups
  var groups = document.querySelectorAll('.pricing-group');

  groups.forEach(function (tbody) {
    var toggle = tbody.querySelector('.group-toggle');
    if (!toggle) return;

    // Read initial state (localStorage preferred). Default to CLOSED (false) if nothing saved.
    var id = tbody.getAttribute('data-group') || Array.from(groups).indexOf(tbody);
    var saved = null;
    try { saved = localStorage.getItem('pricing-group-' + id); } catch(e) { /* ignore */ }

    // NOTE: default is now false (collapsed) when no saved state is present.
    var open = saved !== null ? (saved === '1') : false;

    // If you want specific groups open by default, set localStorage or
    // change this line to: var open = saved !== null ? (saved === '1') : (tbody.getAttribute('data-open') === 'true');

    // Apply initial state
    setGroupState(tbody, toggle, !!open);

    // Click to toggle
    toggle.addEventListener('click', function () {
      var isExpanded = toggle.getAttribute('aria-expanded') === 'true';
      setGroupState(tbody, toggle, !isExpanded);
      // Persist
      try { localStorage.setItem('pricing-group-' + id, (!isExpanded ? '1' : '0')); } catch(e) {}
    });

    // Allow Enter / Space when focused (button already handles it, but ensure)
    toggle.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggle.click();
      }
    });
  });

  function setGroupState(tbody, toggle, open) {
    if (open) {
      tbody.classList.remove('collapsed');
      toggle.setAttribute('aria-expanded', 'true');
      // mark subsequent rows visible (for assistive tech)
      tbody.querySelectorAll('tr:not(.group-header)').forEach(function (r) { r.removeAttribute('aria-hidden'); });
    } else {
      tbody.classList.add('collapsed');
      toggle.setAttribute('aria-expanded', 'false');
      tbody.querySelectorAll('tr:not(.group-header)').forEach(function (r) { r.setAttribute('aria-hidden', 'true'); });
    }
  }
});

// Vanilla JS carousel: controls, indicators, autoplay, keyboard, touch swipe
(function () {
  function initCarousel(root) {
    var track = root.querySelector('.carousel-track');
    var slides = Array.from(root.querySelectorAll('.carousel-slide'));
    var prevBtn = root.querySelector('.carousel-control.prev');
    var nextBtn = root.querySelector('.carousel-control.next');
    var indicatorsBox = root.querySelector('.carousel-indicators');
    var autoplay = root.getAttribute('data-autoplay') === 'true';
    var interval = parseInt(root.getAttribute('data-interval')) || 5000;

    if (!track || slides.length === 0) return;

    var current = 0;
    var timer = null;
    var startX = null;
    var isPointerDown = false;

    // build indicators
    slides.forEach(function (_, i) {
      var btn = document.createElement('button');
      btn.setAttribute('role', 'tab');
      btn.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
      btn.setAttribute('aria-controls', '');
      btn.dataset.index = i;
      btn.addEventListener('click', function () { goTo(parseInt(this.dataset.index)); });
      indicatorsBox.appendChild(btn);
    });

    // update transform
    function update() {
      track.style.transform = 'translateX(' + (-current * 100) + '%)';
      // update indicators
      var dots = indicatorsBox.querySelectorAll('button');
      dots.forEach(function (d, i) { d.setAttribute('aria-selected', i === current ? 'true' : 'false'); });
      // update aria-hidden on slides
      slides.forEach(function (s, i) { s.setAttribute('aria-hidden', i === current ? 'false' : 'true'); });
    }

    function goTo(idx) {
      current = (idx + slides.length) % slides.length;
      update();
      resetAutoplay();
    }
    function prev() { goTo(current - 1); }
    function next() { goTo(current + 1); }

    // autoplay
    function startAutoplay() {
      if (!autoplay) return;
      stopAutoplay();
      timer = setInterval(next, interval);
    }
    function stopAutoplay() {
      if (timer) { clearInterval(timer); timer = null; }
    }
    function resetAutoplay() { stopAutoplay(); startAutoplay(); }

    // keyboard
    root.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { prev(); e.preventDefault(); }
      if (e.key === 'ArrowRight') { next(); e.preventDefault(); }
    });

    // button handlers
    if (prevBtn) prevBtn.addEventListener('click', prev);
    if (nextBtn) nextBtn.addEventListener('click', next);

    // pause on hover/focus
    root.addEventListener('mouseenter', stopAutoplay);
    root.addEventListener('mouseleave', startAutoplay);
    root.addEventListener('focusin', stopAutoplay);
    root.addEventListener('focusout', startAutoplay);

    // touch / pointer swipe (basic)
    track.addEventListener('pointerdown', function (e) {
      isPointerDown = true;
      startX = e.clientX;
      track.style.transition = 'none';
    });
    window.addEventListener('pointermove', function (e) {
      if (!isPointerDown) return;
      var dx = e.clientX - startX;
      // show slight drag effect
      track.style.transform = 'translateX(' + ((-current * track.clientWidth + dx) / track.clientWidth * 100) + '%)';
    });
    window.addEventListener('pointerup', function (e) {
      if (!isPointerDown) return;
      isPointerDown = false;
      track.style.transition = ''; // will use CSS transition
      var dx = e.clientX - startX;
      if (Math.abs(dx) > 50) {
        if (dx > 0) prev(); else next();
      } else {
        update(); // snap back
      }
    });

    // initial state
    slides.forEach(function (s, i) {
      if (i !== 0) s.setAttribute('aria-hidden', 'true');
    });
    update();
    startAutoplay();
  }

  // init all carousels on DOM ready
  document.addEventListener('DOMContentLoaded', function () {
    var carousels = document.querySelectorAll('.carousel');
    carousels.forEach(function (c) { initCarousel(c); });
  });
})();
