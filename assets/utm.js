/* Campaign tracking codes for the booking calendar.
 *
 * Remembers the utm_* tags a visitor arrived with (for this browser tab only) and adds them
 * to the Calendly booking page, so every booked call can be traced back to the ad that
 * brought the visitor in (the Marketing Hatchery's ads use utm_content=ah-xxxxx).
 * Only the five standard utm_* fields are kept — nothing personal, nothing else.
 *
 * Usage: build the Calendly URLSearchParams, then call window.ahUtm(params).
 */
(function (window) {
  var KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
  var store = {};
  try { store = JSON.parse(sessionStorage.getItem('ah_utm') || '{}') || {}; } catch (e) { store = {}; }

  // The latest ad click wins: if this page was opened with utm tags, they replace older ones.
  var query = new URLSearchParams(location.search), found = {}, any = false;
  KEYS.forEach(function (k) { var v = query.get(k); if (v) { found[k] = v.slice(0, 100); any = true; } });
  if (any) {
    store = found;
    try { sessionStorage.setItem('ah_utm', JSON.stringify(store)); } catch (e) { /* private mode: still works for this page */ }
  }

  window.ahUtm = function (params) {
    KEYS.forEach(function (k) { if (store[k] && !params.has(k)) params.set(k, store[k]); });
    return params;
  };
})(window);
