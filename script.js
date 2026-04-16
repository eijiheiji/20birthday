document.addEventListener("DOMContentLoaded", function () {

  /* =============================================
     Elements
     ============================================= */
  var progressBar = document.querySelector(".progress-bar");
  var heroContent = document.querySelector(".hero-content");
  var scrollHint = document.querySelector(".scroll-hint");
  var heroHeight = window.innerHeight;

  var interSections = document.querySelectorAll(".inter-section");
  var interTexts = document.querySelectorAll(".inter-text");

  var presentSection = document.querySelector(".present");
  var presentLines = document.querySelectorAll(".present-line");
  var giftReveal = document.querySelector(".gift-reveal");

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
          // stagger cards
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
     Scroll handler — runs every frame via rAF
     ============================================= */
  var ticking = false;

  function clamp(val, min, max) {
    return val < min ? min : val > max ? max : val;
  }

  function onScroll() {
    var scrollY = window.pageYOffset;
    var docHeight = document.documentElement.scrollHeight - window.innerHeight;

    // --- 1. Progress bar ---
    var scrollPercent = docHeight > 0 ? (scrollY / docHeight) * 100 : 0;
    progressBar.style.width = scrollPercent + "%";

    // --- 2. Hero parallax ---
    if (scrollY < heroHeight) {
      var progress = scrollY / heroHeight;
      heroContent.style.transform = "translateY(-" + (scrollY * 0.35) + "px)";
      heroContent.style.opacity = Math.max(0, 1 - progress * 1.2);
      if (scrollHint) {
        scrollHint.style.opacity = Math.max(0, 1 - progress * 3);
      }
    }

    // --- 3. Interstitial sections — each fades in then out independently ---
    interSections.forEach(function (section, i) {
      var text = interTexts[i];
      if (!text) return;
      var rect = section.getBoundingClientRect();
      var scrollable = section.offsetHeight - window.innerHeight;
      if (scrollable <= 0) return;
      var progress = clamp(-rect.top / scrollable, 0, 1);

      var op = 0, ty = 20;
      if (progress < 0.35) {
        var p = progress / 0.35;
        op = p; ty = 20 * (1 - p);
      } else if (progress < 0.6) {
        op = 1; ty = 0;
      } else {
        var p = (progress - 0.6) / 0.3;
        op = Math.max(0, 1 - p); ty = -10 * p;
      }
      text.style.opacity = op;
      text.style.transform = "translateY(" + ty + "px)";
    });

    // --- 4. Present — sticky text reveal + gift swap ---
    if (presentSection) {
      var pRect = presentSection.getBoundingClientRect();
      var pScrollable = presentSection.offsetHeight - window.innerHeight;
      if (pScrollable > 0) {
        var pScrolled = -pRect.top;
        var pProgress = clamp(pScrolled / pScrollable, 0, 1);

        // Gift reveal: swap at 40%
        if (giftReveal) {
          if (pProgress > 0.4) {
            giftReveal.classList.add("swapped");
          } else {
            giftReveal.classList.remove("swapped");
          }
        }

        // Text lines
        presentLines.forEach(function (line, i) {
          var lineStart = (i * 0.35) + 0.15;
          var lineEnd = lineStart + 0.2;
          if (pProgress >= lineStart) {
            line.classList.add("line-visible");
          } else {
            line.classList.remove("line-visible");
          }
        });
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

  // Initial run
  onScroll();
});
