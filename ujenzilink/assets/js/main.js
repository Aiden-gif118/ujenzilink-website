// ═══════════════════════════════════════════
// UJENZILINK — SHARED SCRIPT
// ═══════════════════════════════════════════

// ── Mobile nav toggle ──
document.addEventListener('DOMContentLoaded', function () {
  var toggle = document.querySelector('.nav-toggle');
  var links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      var isOpen = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
    // close menu on link click (mobile)
    links.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { links.classList.remove('open'); });
    });
  }

  // ── FAQ accordion ──
  document.querySelectorAll('.faq-item').forEach(function (item) {
    var btn = item.querySelector('.faq-q-btn');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var isOpen = item.classList.contains('open');
      // close siblings within the same faq group (optional accordion behavior per-section)
      item.classList.toggle('open', !isOpen);
      btn.setAttribute('aria-expanded', !isOpen ? 'true' : 'false');
    });
  });
});

// ═══════════════════════════════════════════
// GOOGLE APPS SCRIPT FORM SUBMISSION
// ═══════════════════════════════════════════
// 1. Set up your Google Sheet + Apps Script Web App (see apps-script-template.gs)
// 2. Deploy it as a Web App ("Execute as: Me", "Who has access: Anyone")
// 3. Paste the deployment URL below.
var UJENZILINK_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbx039Adio5VN9hRs9v2WewcvNl5hmKgaw9oza6TQ7gCC5UWRCIwVRAClm2xnyva66sUDg/exec";

/**
 * Submits a form's data to the Apps Script Web App as JSON.
 * Shows inline success/error status without leaving the page.
 */
function submitToSheet(formEl, statusEl, sheetName) {
  // Honeypot spam check — if filled, silently "succeed" and stop (bots only)
  var honeypot = formEl.querySelector('.honeypot input');
  if (honeypot && honeypot.value.trim() !== '') {
    showStatus(statusEl, 'success', 'Thank you! We will be in touch within 24 hours.');
    formEl.reset();
    return;
  }

  if (!UJENZILINK_SCRIPT_URL || UJENZILINK_SCRIPT_URL.indexOf('PASTE_YOUR') === 0) {
    showStatus(statusEl, 'error', 'Form is not yet connected. Please contact us directly via WhatsApp or email for now.');
    return;
  }

  var data = {};
  new FormData(formEl).forEach(function (value, key) {
    if (key.indexOf('honeypot') === -1) data[key] = value;
  });
  data.sheet = sheetName;
  data.submittedAt = new Date().toISOString();
  data.pageUrl = window.location.href;

  var submitBtn = formEl.querySelector('button[type="submit"]');
  if (submitBtn) submitBtn.disabled = true;
  showStatus(statusEl, 'loading', 'Sending…');

  fetch(UJENZILINK_SCRIPT_URL, {
    method: 'POST',
    mode: 'no-cors', // Apps Script web apps often require no-cors from browser fetch
    headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // avoids CORS preflight
    body: JSON.stringify(data)
  })
    .then(function () {
      // no-cors mode means we can't read the response — assume success if no network error
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
