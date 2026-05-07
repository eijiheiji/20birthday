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
    ".travel-destination, .travel-subtitle, .weather-widget, .day-block, .footer-message, .highlights-title, .highlight-card"
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

  /* =============================================
     "今ここ" — highlight active timeline item
     ============================================= */
  function updateCurrentItem() {
    var now = new Date();
    var items = document.querySelectorAll(".timeline-item[data-start]");
    var match = null;
    var latestStart = null;

    items.forEach(function (item) {
      item.classList.remove("current");
      var start = new Date(item.dataset.start);
      var end = new Date(item.dataset.end);
      if (now >= start && now < end) {
        if (!latestStart || start > latestStart) {
          latestStart = start;
          match = item;
        }
      }
    });

    if (match) match.classList.add("current");
  }

  updateCurrentItem();
  setInterval(updateCurrentItem, 60 * 1000);

  /* =============================================
     Weather — Open-Meteo (Atami)
     ============================================= */
  var weatherDescriptions = {
    0: { icon: "☀️", desc: "快晴" },
    1: { icon: "🌤", desc: "晴れ" },
    2: { icon: "⛅️", desc: "晴れ時々曇り" },
    3: { icon: "☁️", desc: "曇り" },
    45: { icon: "🌫", desc: "霧" },
    48: { icon: "🌫", desc: "霧" },
    51: { icon: "🌦", desc: "霧雨" },
    53: { icon: "🌦", desc: "霧雨" },
    55: { icon: "🌦", desc: "霧雨" },
    61: { icon: "🌧", desc: "小雨" },
    63: { icon: "🌧", desc: "雨" },
    65: { icon: "🌧", desc: "強い雨" },
    71: { icon: "🌨", desc: "小雪" },
    73: { icon: "🌨", desc: "雪" },
    75: { icon: "🌨", desc: "大雪" },
    80: { icon: "🌦", desc: "にわか雨" },
    81: { icon: "🌧", desc: "にわか雨" },
    82: { icon: "🌧", desc: "激しい雨" },
    95: { icon: "⛈", desc: "雷雨" },
    96: { icon: "⛈", desc: "雷雨・ひょう" },
    99: { icon: "⛈", desc: "激しい雷雨" }
  };

  function getWeatherInfo(code) {
    return weatherDescriptions[code] || { icon: "🌡", desc: "—" };
  }

  function renderWeatherError() {
    document.querySelectorAll(".weather-card").forEach(function (card) {
      card.querySelector(".weather-icon").textContent = "🌡";
      card.querySelector(".weather-temp").textContent = "—";
      card.querySelector(".weather-desc").textContent = "天気情報を取得できませんでした";
    });
  }

  function loadWeather() {
    var url =
      "https://api.open-meteo.com/v1/forecast" +
      "?latitude=35.0964&longitude=139.0716" +
      "&daily=weather_code,temperature_2m_max,temperature_2m_min" +
      "&timezone=Asia%2FTokyo" +
      "&start_date=2026-05-08&end_date=2026-05-09";

    fetch(url)
      .then(function (res) {
        if (!res.ok) throw new Error("weather fetch failed");
        return res.json();
      })
      .then(function (data) {
        var dates = data.daily && data.daily.time;
        if (!dates) { renderWeatherError(); return; }

        document.querySelectorAll(".weather-card").forEach(function (card) {
          var date = card.dataset.date;
          var idx = dates.indexOf(date);
          if (idx < 0) return;
          var code = data.daily.weather_code[idx];
          var max = Math.round(data.daily.temperature_2m_max[idx]);
          var min = Math.round(data.daily.temperature_2m_min[idx]);
          var info = getWeatherInfo(code);
          card.querySelector(".weather-icon").textContent = info.icon;
          card.querySelector(".weather-temp").textContent = max + "° / " + min + "°";
          card.querySelector(".weather-desc").textContent = info.desc;
        });
      })
      .catch(renderWeatherError);
  }

  loadWeather();
});
