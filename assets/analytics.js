(function () {
  // Mixpanel — same project as the dashboard. Website events carry
  // surface: "website" so both surfaces can be analysed together.
  (function(f,b){if(!b.__SV){var e,g,i,h;window.mixpanel=b;b._i=[];b.init=function(e,f,c){function g(a,d){var b=d.split(".");2==b.length&&(a=a[b[0]],d=b[1]);a[d]=function(){a.push([d].concat(Array.prototype.slice.call(arguments,0)))}}var a=b;"undefined"!==typeof c?a=b[c]=[]:c="mixpanel";a.people=a.people||[];a.toString=function(a){var d="mixpanel";"mixpanel"!==c&&(d+="."+c);a||(d+=" (stub)");return d};a.people.toString=function(){return a.toString(1)+".people (stub)"};i="disable time_event track track_pageview track_links track_forms track_with_groups add_group set_group remove_group register register_once alias unregister identify name_tag set_config reset opt_in_tracking opt_out_tracking has_opted_in_tracking has_opted_out_tracking clear_opt_in_out_tracking start_batch_senders people.set people.set_once people.unset people.increment people.append people.union people.track_charge people.clear_charges people.delete_user people.remove".split(" ");for(h=0;h<i.length;h++)g(a,i[h]);var j="set set_once union unset remove delete".split(" ");a.get_group=function(){function b(c){d[c]=function(){call2_args=arguments;call2=[c].concat(Array.prototype.slice.call(call2_args,0));a.push([e,call2])}}for(var d={},e=["get_group"].concat(Array.prototype.slice.call(arguments,0)),c=0;c<j.length;c++)b(j[c]);return d};b._i.push([e,f,c])};b.__SV=1.2;e=f.createElement("script");e.type="text/javascript";e.async=!0;e.src="https://cdn.mxpnl.com/libs/mixpanel-2-latest.min.js";g=f.getElementsByTagName("script")[0];g.parentNode.insertBefore(e,g)}})(document,window.mixpanel||[]);

  mixpanel.init('0025aa523dc8a70755b790a7ad66ab3b', {
    track_pageview: false,
    persistence: 'localStorage'
  });

  // Anonymous only — no login on this site, so never identify().
  mixpanel.register({ surface: 'website' });

  mixpanel.track('page_view', {
    page: location.pathname.replace(/^\//, '') || 'index'
  });

  document.addEventListener('DOMContentLoaded', function () {
    // The handoff into the dashboard — the most important event here.
    document.querySelectorAll('a.login-link').forEach(function (el) {
      el.addEventListener('click', function () {
        mixpanel.track('login_click', {
          page: location.pathname.replace(/^\//, '') || 'index'
        });
      });
    });
  });
})();
