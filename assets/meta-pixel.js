/* Meta Pixel — dataset "Agent Hatchers Website" (pixel ID 1806418700537742).
 *
 * One shared file so the pixel ID and the privacy guards live in one place. Load it
 * synchronously in <head> (no defer) so window.fbq exists before any page script fires an
 * event. Pages then report actions through window.ahTrack(name, params), never fbq directly.
 *
 * Guards, in order:
 *  1. Private URLs — the pixel sends the full page URL to Meta. /prototype/?share=<token>,
 *     ?session=<sid>, ?key=… and ?unlimited=1 are team/prospect tokens, so on those URLs the
 *     pixel is not loaded at all (nothing is sent, not even PageView).
 *  1b. Live host only — events are sent from *.agenthatchers.com; any other host (localhost,
 *     GitHub preview) is silent unless the URL carries ?fbtest=1.
 *  2. Never initialise twice — if fbq already exists on the page, stop.
 *  3. autoConfig off — Meta's automatic event detection (button text, form field metadata)
 *     stays off, so nothing typed into the prototype or the booking form can be picked up.
 *     Automatic advanced matching and the Conversions API are deliberately not enabled.
 *
 * Events fired from the pages (each once per browser tab — see ahTrack):
 *   PageView        every public page load                      (standard, fired here)
 *   DemoStart       prospect submits the prototype's first screen (custom, prototype/app.js)
 *   DemoComplete    prospect reaches the hatched dashboard        (custom, prototype/app.js)
 *   BookCallClick   any "Book a call" button                      (custom, index/pricing)
 *   Lead            name + email step of the booking modal        (standard, index/pricing)
 *   Schedule        Calendly confirms the booking (event_scheduled) (standard, index/pricing)
 * Params carry only a short source label ("hero", "nav", …). No names, emails, business
 * descriptions, chat text or form contents — ever.
 */
(function (window, document) {
  var PIXEL_ID = '1806418700537742';
  var PRIVATE_URL = /[?&](share|session|sid|key|unlimited)=/i;
  var STANDARD = ['PageView', 'Lead', 'Schedule', 'Contact', 'ViewContent', 'CompleteRegistration'];
  var fired = {};

  function noop() { return false; }

  // Only the live site reports — localhost / preview hosts stay out of the numbers unless the
  // page is opened with ?fbtest=1 (used when checking events in Events Manager → Test events).
  var LIVE_HOST = /(^|\.)agenthatchers\.com$/i;
  var FORCE_TEST = /[?&]fbtest=1(&|$)/.test(location.search);

  if (PRIVATE_URL.test(location.search)) { window.ahTrack = noop; return; }
  if (!LIVE_HOST.test(location.hostname) && !FORCE_TEST) { window.ahTrack = noop; return; }
  if (window.fbq) { window.ahTrack = window.ahTrack || noop; return; }

  /* Meta Pixel Code (base snippet from Events Manager, unchanged except the autoConfig line) */
  !function(f,b,e,v,n,t,s)
  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
  n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];
  s.parentNode.insertBefore(t,s)}(window, document,'script',
  'https://connect.facebook.net/en_US/fbevents.js');
  fbq('set', 'autoConfig', false, PIXEL_ID);
  fbq('init', PIXEL_ID);
  fbq('track', 'PageView');
  /* End Meta Pixel Code */

  // ahTrack('Name', {source:'hero'}) — fires once per browser tab per event name so a double
  // click, a re-render or a repeated flow never counts twice. Pass {once:false} to allow repeats.
  window.ahTrack = function (name, params, opts) {
    try {
      if (!name || !window.fbq) return false;
      var once = !(opts && opts.once === false);
      if (once) {
        var key = 'ah_fb_' + name;
        var seen = fired[name];
        try { seen = seen || sessionStorage.getItem(key); } catch (e) {}
        if (seen) return false;
        fired[name] = 1;
        try { sessionStorage.setItem(key, '1'); } catch (e) {}
      }
      fbq(STANDARD.indexOf(name) > -1 ? 'track' : 'trackCustom', name, params || {});
      return true;
    } catch (e) { return false; }
  };
})(window, document);
