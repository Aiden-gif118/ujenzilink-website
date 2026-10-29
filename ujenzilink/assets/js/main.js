// UJENZILINK - SHARED SCRIPT

// Mobile nav toggle
document.addEventListener('DOMContentLoaded', function () {
  var toggle = document.querySelector('.nav-toggle');
  var links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      var isOpen = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
    links.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { links.classList.remove('open'); });
    });
  }

  // FAQ accordion
  document.querySelectorAll('.faq-item').forEach(function (item) {
    var btn = item.querySelector('.faq-q-btn');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var isOpen = item.classList.contains('open');
      item.classList.toggle('open', !isOpen);
      btn.setAttribute('aria-expanded', !isOpen ? 'true' : 'false');
    });
  });
});

// FORM SUBMISSION -> FIREBASE (see assets/js/leads.js)
// The function keeps its old name so the pages that call it need no changes.
var LEAD_FIELDS = ['phone', 'email', 'projectType', 'currentStage', 'managedBy',
  'mainConcern', 'budgetRange', 'ownerType', 'preferredContact', 'subject', 'message'];
var LEAD_LIMITS = { phone: 40, email: 200, mainConcern: 2000, subject: 200, message: 2000, preferredContact: 50 };

function submitToSheet(formEl, statusEl, formType) {
  // Honeypot: bots fill the hidden field, so pretend it worked and stop.
  var honeypot = formEl.querySelector('.honeypot input');
  if (honeypot && honeypot.value.trim() !== '') {
    showStatus(statusEl, 'success', 'Thank you! We will be in touch within 24 hours.');
    formEl.reset();
    return;
  }
  if (!formEl.reportValidity()) return;

  var f = {};
  new FormData(formEl).forEach(function (value, key) { f[key] = String(value).trim(); });

  var lead = {
    type: formType === 'ProjectReview' ? 'ProjectReview' : 'Contact',
    name: (f.fullName || f.name || '').slice(0, 120),
    pageUrl: (window.location.origin + window.location.pathname).slice(0, 300)
  };
  if (f.projectLocation) lead.location = f.projectLocation.slice(0, 200);
  LEAD_FIELDS.forEach(function (k) {
    if (f[k]) lead[k] = f[k].slice(0, LEAD_LIMITS[k] || 100);
  });

  var submitBtn = formEl.querySelector('button[type="submit"]');
  if (submitBtn) submitBtn.disabled = true;
  showStatus(statusEl, 'loading', 'Sending...');

  import('./leads.js')
    .then(function (m) { return m.saveLead(lead); })
    .then(function () {
      showStatus(statusEl, 'success', 'Thank you! We will be in touch within 24 hours.');
      formEl.reset();
    })
    .catch(function (err) {
      console.error('UjenziLink form submit error:', err);
      showStatus(statusEl, 'error', 'Something went wrong. Please try WhatsApp or email instead.');
    })
    .finally(function () {
      if (submitBtn) submitBtn.disabled = false;
    });
}

function showStatus(statusEl, type, message) {
  if (!statusEl) return;
  statusEl.className = 'form-status show ' + type;
  statusEl.textContent = message;
}