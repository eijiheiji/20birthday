document.addEventListener("DOMContentLoaded", function () {

  /* =============================================
     Elements
     ============================================= */
  var progressBar = document.querySelector(".progress-bar");
  var heroContent = document.querySelector(".hero-content");
  var scrollHint = document.querySelector(".scroll-hint");
  var heroHeight = window.innerHeight;

  /* =============================================
     Scroll-triggered reveals (IntersectionObserver)
     ============================================= */
  var revealTargets = document.querySelectorAll(
    ".travel-destination, .travel-subtitle, .day-block, .footer-message, .highlights-title, .highlight-card"
  );

  var revealObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          if (entry.target.classList.contains("highlight-card")) {
            var cards = document.querySelectorAll(".highlight-card");
            var idx = Array.prototype.indexOf.call(cards, entry.target);
            entry.target.style.transitionDelay = (idx * 0.15) + "s";
          }
          entry.target.classList.add("visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  revealTargets.forEach(function (el) {
    revealObserver.observe(el);
  });

  /* =============================================
     Timeline items — staggered reveal
     ============================================= */
  var timelineItems = document.querySelectorAll(".timeline-item");

  var timelineObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var parent = entry.target.parentElement;
          var siblings = parent.querySelectorAll(".timeline-item");
          var index = Array.prototype.indexOf.call(siblings, entry.target);
          entry.target.style.transitionDelay = (index * 0.08) + "s";
          entry.target.classList.add("visible");
          timelineObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );

  timelineItems.forEach(function (el) {
    timelineObserver.observe(el);
  });

  /* =============================================
     Route toggle panels
     ============================================= */
  document.querySelectorAll(".route-toggle").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var expanded = btn.getAttribute("aria-expanded") === "true";
      var panel = btn.nextElementSibling;
      var textEl = btn.querySelector(".route-toggle-text");

      if (expanded) {
        btn.setAttribute("aria-expanded", "false");
        panel.classList.remove("open");
        textEl.textContent = "詳細を表示";
      } else {
        btn.setAttribute("aria-expanded", "true");
        panel.classList.add("open");
        textEl.textContent = "詳細を閉じる";
      }
    });
  });

  /* =============================================
     Scroll handler — progress bar + hero parallax
     ============================================= */
  var ticking = false;

  function onScroll() {
    var scrollY = window.pageYOffset;
    var docHeight = document.documentElement.scrollHeight - window.innerHeight;

    var scrollPercent = docHeight > 0 ? (scrollY / docHeight) * 100 : 0;
    progressBar.style.width = scrollPercent + "%";

    if (scrollY < heroHeight) {
      var progress = scrollY / heroHeight;
      heroContent.style.transform = "translateY(-" + (scrollY * 0.35) + "px)";
      heroContent.style.opacity = Math.max(0, 1 - progress * 1.2);
      if (scrollHint) {
        scrollHint.style.opacity = Math.max(0, 1 - progress * 3);
      }
    }

    ticking = false;
  }

  window.addEventListener("scroll", function () {
    if (!ticking) {
      requestAnimationFrame(onScroll);
      ticking = true;
    }
  }, { passive: true });

  onScroll();
});
