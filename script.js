// Shared by every page; each block only runs when its elements are present.
(() => {
  const root = document.documentElement;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const $ = (id) => document.getElementById(id);

  // Entrance: hero reveals on load; each [data-reveal-group] reveals when scrolled into view.
  root.classList.add("js");
  const showAll = (els) => els.forEach((el) => el.classList.add("is-in"));

  const heroEls = [...document.querySelectorAll(".hero [data-reveal]")];
  heroEls.forEach((el, i) => el.style.setProperty("--i", i));
  requestAnimationFrame(() => requestAnimationFrame(() => showAll(heroEls)));

  const groups = document.querySelectorAll("[data-reveal-group]");
  const groupEls = (group) => [...group.querySelectorAll("[data-reveal]")];
  groups.forEach((group) => groupEls(group).forEach((el, i) => el.style.setProperty("--i", i)));

  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        showAll(groupEls(entry.target));
        io.unobserve(entry.target);
      });
    }, { threshold: 0.12 });
    groups.forEach((group) => io.observe(group));
  } else {
    groups.forEach((group) => showAll(groupEls(group)));
  }

  document.querySelectorAll("[data-year]").forEach((el) => { el.textContent = new Date().getFullYear(); });

  // Top bar (≤900px): gains a background once the page has scrolled.
  const topbar = $("topbar");
  if (topbar) {
    const onScroll = () => topbar.classList.toggle("is-scrolled", window.scrollY > 16);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  // Sidebar drawer (≤900px): open from the top bar, close via button, scrim or Esc.
  const menuToggle = $("menuToggle");
  const sidebarClose = $("sidebarClose");
  const scrim = $("sidebarScrim");
  if (menuToggle && sidebarClose && scrim) {
    const body = document.body;
    const setOpen = (open) => {
      body.classList.toggle("sidebar-open", open);
      menuToggle.setAttribute("aria-expanded", String(open));
      scrim.hidden = !open;
      if (open) sidebarClose.focus();
    };

    menuToggle.addEventListener("click", () => setOpen(true));
    sidebarClose.addEventListener("click", () => { setOpen(false); menuToggle.focus(); });
    scrim.addEventListener("click", () => setOpen(false));
    document.addEventListener("keydown", (e) => {
      if (e.key !== "Escape" || !body.classList.contains("sidebar-open")) return;
      setOpen(false);
      menuToggle.focus();
    });
    window.matchMedia("(max-width: 900px)").addEventListener("change", () => setOpen(false));
  }

  // Settings panel: three preferences, stored per device.
  const settingsToggle = $("settingsToggle");
  const settingsPanel = $("settingsPanel");
  if (settingsToggle && settingsPanel) {
    const STORE = "crema-settings";
    const defaults = { theme: "dark", video: true, reduceMotion: false, textSize: "normal" };
    let prefs = defaults;
    try {
      prefs = { ...defaults, ...JSON.parse(localStorage.getItem(STORE) || "{}") };
    } catch { /* private mode or corrupt value: keep defaults */ }

    const videoSwitch = $("setVideo");
    const motionSwitch = $("setMotion");
    const textButtons = [...document.querySelectorAll("#setText button")];
    const themeButtons = [...document.querySelectorAll("#setTheme button")];

    const apply = () => {
      // Dark is the default palette; light swaps the theme tokens in styles.css.
      if (prefs.theme === "light") root.dataset.theme = "light";
      else delete root.dataset.theme;
      root.classList.toggle("no-video", !prefs.video);
      root.classList.toggle("reduce-motion", prefs.reduceMotion);
      root.classList.toggle("text-large", prefs.textSize === "large");

      const hero = $("heroVideo");
      if (hero) {
        if (prefs.video && !reduceMotion.matches) hero.play().catch(() => {});
        else hero.pause();
      }

      videoSwitch.setAttribute("aria-checked", String(prefs.video));
      motionSwitch.setAttribute("aria-checked", String(prefs.reduceMotion));
      textButtons.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.size === prefs.textSize)));
      themeButtons.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.themeChoice === prefs.theme)));

      try { localStorage.setItem(STORE, JSON.stringify(prefs)); } catch { /* nothing to do */ }
    };

    videoSwitch.addEventListener("click", () => { prefs.video = !prefs.video; apply(); });
    motionSwitch.addEventListener("click", () => { prefs.reduceMotion = !prefs.reduceMotion; apply(); });
    textButtons.forEach((b) => b.addEventListener("click", () => { prefs.textSize = b.dataset.size; apply(); }));
    themeButtons.forEach((b) => b.addEventListener("click", () => { prefs.theme = b.dataset.themeChoice; apply(); }));

    const setPanel = (open) => {
      settingsPanel.hidden = !open;
      settingsToggle.setAttribute("aria-expanded", String(open));
      if (open) $("settingsClose").focus();
    };

    settingsToggle.addEventListener("click", () => setPanel(settingsPanel.hidden));
    $("settingsClose").addEventListener("click", () => { setPanel(false); settingsToggle.focus(); });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !settingsPanel.hidden) { setPanel(false); settingsToggle.focus(); }
    });
    // Clicking away closes it, but not when the click is inside the panel or sidebar.
    document.addEventListener("click", (e) => {
      if (settingsPanel.hidden) return;
      if (settingsPanel.contains(e.target) || e.target.closest("#settingsToggle")) return;
      setPanel(false);
    });

    apply();
  }

  // Page transitions: browsers with cross-document View Transitions animate via CSS
  // (@view-transition in styles.css). Others fade the page out here before leaving,
  // and the next page's entrance reveal fades it back in.
  if (!("PageRevealEvent" in window) && !reduceMotion.matches) {
    document.addEventListener("click", (e) => {
      const link = e.target.closest("a[href]");
      if (!link || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || link.target) return;
      const url = new URL(link.href, location.href);
      // Only animate real page changes on this site, not in-page anchors like #top.
      if (url.origin !== location.origin || url.pathname === location.pathname) return;
      e.preventDefault();
      document.body.classList.add("is-leaving");
      setTimeout(() => { location.href = url.href; }, 240);
    });
    // Coming back via the back button restores the page from cache; undo the fade.
    window.addEventListener("pageshow", (e) => {
      if (e.persisted) document.body.classList.remove("is-leaving");
    });
  }

  // Background video loops on its own; it stays paused only for visitors who prefer reduced motion.
  const video = $("heroVideo");
  if (video && reduceMotion.matches) {
    video.removeAttribute("autoplay");
    video.pause();
  }

  // Live order card: 2:00 countdown that loops (home).
  const timeEl = $("orderTime");
  if (timeEl) {
    const DURATION = 120;
    const READY_HOLD = 4;
    const barEl = $("orderBar");
    const pillEl = $("orderPill");
    const orderSteps = document.querySelectorAll("#orderSteps li");

    let remaining = DURATION;
    let hold = 0;

    const renderOrder = () => {
      const m = Math.floor(remaining / 60);
      const s = String(remaining % 60).padStart(2, "0");
      timeEl.textContent = `${m}:${s}`;
      barEl.style.width = `${((DURATION - remaining) / DURATION) * 100}%`;

      const ready = remaining === 0;
      orderSteps[1].classList.toggle("is-done", remaining < DURATION);
      orderSteps[2].classList.toggle("is-done", ready);
      pillEl.textContent = ready ? "Ready at the bar" : remaining < DURATION ? "Brewing" : "Ordered";
      pillEl.classList.toggle("is-ready", ready);
    };

    const tick = () => {
      if (remaining > 0) {
        remaining -= 1;
      } else if (++hold >= READY_HOLD) {
        hold = 0;
        remaining = DURATION;
        barEl.style.transition = "none";
        renderOrder();
        barEl.offsetWidth; // flush so the bar snaps back instead of animating
        barEl.style.transition = "";
        return;
      }
      renderOrder();
    };

    renderOrder();
    setInterval(tick, 1000);
  }

  // Menu tabs (menu page).
  const tabs = [...document.querySelectorAll("#menuTabs [role=tab]")];
  if (tabs.length) {
    const menuItems = document.querySelectorAll("#menuList .menu-item");

    const selectTab = (tab, focus) => {
      tabs.forEach((t) => {
        const selected = t === tab;
        t.setAttribute("aria-selected", String(selected));
        t.tabIndex = selected ? 0 : -1;
      });
      menuItems.forEach((item) => { item.hidden = item.dataset.category !== tab.dataset.category; });
      if (focus) tab.focus();
    };

    tabs.forEach((tab, i) => {
      tab.addEventListener("click", () => selectTab(tab));
      tab.addEventListener("keydown", (e) => {
        const step = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
        if (!step) return;
        e.preventDefault();
        selectTab(tabs[(i + step + tabs.length) % tabs.length], true);
      });
    });
    selectTab(tabs[0]);
  }

  // Ordering (menu page): add to cart, cart drawer, place order.
  // Demo only: the order lives in this browser and is never sent anywhere.
  const cart = $("cart");
  if (cart) {
    const CART_STORE = "crema-cart";
    const money = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" });
    const fmt = (pence) => money.format(pence / 100);
    const el = (tag, cls, text) => {
      const node = document.createElement(tag);
      if (cls) node.className = cls;
      if (text != null) node.textContent = text;
      return node;
    };

    const fab = $("cartOpen");
    const cartScrim = $("cartScrim");
    const view = $("cartView");
    const done = $("cartDone");
    const linesEl = $("cartLines");
    const emptyEl = $("cartEmpty");
    const countEl = $("cartCount");
    const totalEl = $("cartTotal");
    const statusEl = $("cartStatus");
    const form = $("cartForm");
    const nameInput = $("orderName");
    const errorEl = $("cartError");

    // Each line: { key, name, milk, price (pence), qty }. The key keeps a flat white
    // with oat milk separate from one with whole milk.
    let lines = [];
    try {
      const saved = JSON.parse(localStorage.getItem(CART_STORE) || "[]");
      if (Array.isArray(saved)) lines = saved.filter((l) => l && l.key && l.qty > 0);
    } catch { /* private mode or a corrupt value: start empty */ }

    const save = () => { try { localStorage.setItem(CART_STORE, JSON.stringify(lines)); } catch { /* nothing to do */ } };
    const itemCount = () => lines.reduce((n, l) => n + l.qty, 0);
    const totalPence = () => lines.reduce((n, l) => n + l.qty * l.price, 0);
    const plural = (n) => `${n} ${n === 1 ? "item" : "items"}`;

    const render = () => {
      linesEl.replaceChildren(...lines.map((l) => {
        const li = el("li", "cart-line");
        const info = el("div", "cart-line-info");
        info.append(
          el("p", "cart-line-name", l.name),
          el("p", "cart-line-meta", [l.milk, `${fmt(l.price)} each`].filter(Boolean).join(" · ")),
        );

        const qty = el("div", "qty");
        qty.setAttribute("role", "group");
        qty.setAttribute("aria-label", `Quantity of ${l.name}`);
        const minus = el("button", "", "−");
        const plus = el("button", "", "+");
        minus.type = plus.type = "button";
        minus.dataset.key = plus.dataset.key = l.key;
        minus.dataset.step = "-1";
        plus.dataset.step = "1";
        minus.setAttribute("aria-label", l.qty === 1 ? `Remove ${l.name}` : `One fewer ${l.name}`);
        plus.setAttribute("aria-label", `One more ${l.name}`);
        qty.append(minus, el("span", "", String(l.qty)), plus);

        li.append(info, qty, el("p", "cart-line-total", fmt(l.qty * l.price)));
        return li;
      }));

      const n = itemCount();
      emptyEl.hidden = n > 0;
      countEl.textContent = n;
      totalEl.textContent = fmt(totalPence());
      fab.setAttribute("aria-label", `Your order: ${plural(n)}, ${fmt(totalPence())}`);
    };

    // Add buttons on the menu cards.
    document.querySelectorAll(".menu-item .add-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const card = btn.closest(".menu-item");
        const milkSelect = card.querySelector("select[data-milk]");
        const milk = milkSelect ? milkSelect.value : "";
        const key = card.dataset.id + (milk ? `|${milk}` : "");
        const line = lines.find((l) => l.key === key);
        if (line) line.qty += 1;
        else lines.push({ key, name: card.dataset.name, milk, price: Number(card.dataset.price), qty: 1 });
        save();
        render();

        statusEl.textContent = `${card.dataset.name}${milk ? ` with ${milk.toLowerCase()}` : ""} added. ${plural(itemCount())} in your order.`;

        // Brief "Added" confirmation on the button, and a bump on the order button.
        const label = btn.lastChild;
        label.textContent = "Added";
        btn.classList.add("is-added");
        clearTimeout(Number(btn.dataset.timer));
        btn.dataset.timer = String(setTimeout(() => { label.textContent = "Add"; btn.classList.remove("is-added"); }, 1200));
        fab.classList.remove("is-bump");
        void fab.offsetWidth; // restart the animation
        fab.classList.add("is-bump");
      });
    });

    // Quantity steppers inside the drawer.
    linesEl.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-step]");
      if (!btn) return;
      const line = lines.find((l) => l.key === btn.dataset.key);
      if (!line) return;
      line.qty += Number(btn.dataset.step);
      if (line.qty <= 0) {
        lines = lines.filter((l) => l !== line);
        statusEl.textContent = `${line.name} removed.`;
      }
      save();
      render();
      // Keep focus on the same stepper after re-rendering, when the line still exists.
      const again = linesEl.querySelector(`button[data-key="${CSS.escape(btn.dataset.key)}"][data-step="${btn.dataset.step}"]`);
      (again || $("cartClose")).focus();
    });

    // Opening and closing the drawer.
    let returnFocus = null;
    const setCart = (open) => {
      if (open && !done.hidden && lines.length) { done.hidden = true; view.hidden = false; }
      cart.classList.toggle("is-open", open);
      cartScrim.hidden = !open;
      document.body.classList.toggle("cart-open", open);
      fab.setAttribute("aria-expanded", String(open));
      if (open) {
        returnFocus = document.activeElement;
        $("cartClose").focus();
      } else if (returnFocus) {
        returnFocus.focus();
      }
    };

    fab.addEventListener("click", () => setCart(true));
    $("cartClose").addEventListener("click", () => setCart(false));
    cartScrim.addEventListener("click", () => setCart(false));
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && cart.classList.contains("is-open")) setCart(false);
    });

    // Keep Tab inside the drawer while it is open.
    cart.addEventListener("keydown", (e) => {
      if (e.key !== "Tab") return;
      const focusable = [...cart.querySelectorAll("button, input, select, [tabindex]:not([tabindex='-1'])")]
        .filter((f) => !f.disabled && f.offsetParent !== null);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });

    // Placing the order.
    const showError = (message, field) => {
      errorEl.textContent = message;
      if (field) { field.setAttribute("aria-invalid", "true"); field.focus(); }
    };

    nameInput.addEventListener("input", () => {
      if (!nameInput.value.trim()) return;
      nameInput.removeAttribute("aria-invalid");
      errorEl.textContent = "";
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = nameInput.value.trim();
      if (!lines.length) return showError("Add something from the menu first.");
      if (!name) return showError("Add a name so the barista can call you.", nameInput);
      errorEl.textContent = "";

      const minutes = Number(form.elements.when.value);
      const ready = new Date(Date.now() + minutes * 60000);
      const number = `C${Math.floor(100 + Math.random() * 900)}`;

      $("doneNumber").textContent = `Order ${number}`;
      $("doneName").textContent = name;
      $("doneBar").textContent = form.elements.bar.value;
      $("doneTime").textContent = ready.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
      $("doneTotal").textContent = fmt(totalPence());
      $("doneItems").replaceChildren(...lines.map((l) => el("li", "", `${l.qty} × ${l.name}${l.milk ? `, ${l.milk.toLowerCase()}` : ""}`)));

      lines = [];
      save();
      render();
      view.hidden = true;
      done.hidden = false;
      done.focus();
      statusEl.textContent = `Order ${number} placed.`;
    });

    $("newOrder").addEventListener("click", () => {
      done.hidden = true;
      view.hidden = false;
      setCart(false);
    });

    render();
  }

  // Stamp card demo (rewards page).
  const stampButton = $("stampButton");
  if (stampButton) {
    const STAMPS = 9;
    const stamps = document.querySelectorAll("#stamps .stamp");
    const stampCount = $("stampCount");
    const stampStatus = $("stampStatus");
    let filled = 3;

    const renderStamps = () => {
      stamps.forEach((stamp, i) => stamp.classList.toggle("is-filled", i < filled));
      stampCount.textContent = filled;
      // Stamps 1–8 are paid drinks; the 9th is the free cup.
      stampStatus.textContent =
        filled === STAMPS ? "Free cup redeemed. Enjoy it." :
        filled === STAMPS - 1 ? "Your next cup is free." :
        `${STAMPS - 1 - filled} more to your free cup.`;
      stampButton.textContent = filled === STAMPS ? "Start a new card" : "Add a stamp";
    };

    stampButton.addEventListener("click", () => {
      filled = filled >= STAMPS ? 0 : filled + 1;
      renderStamps();
    });
    renderStamps();
  }

  // Open/closed status in London time, plus "Open now" filter (locations page).
  const openFilter = $("openNowFilter");
  if (openFilter) {
    const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const londonClock = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/London", weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23",
    });
    const locCards = [...document.querySelectorAll("#locList .loc-card")];
    const locEmpty = $("locEmpty");

    const fmt = (h) => `${Math.floor(h)}:${String(Math.round((h % 1) * 60)).padStart(2, "0")}`;

    const renderLocations = () => {
      const parts = Object.fromEntries(londonClock.formatToParts(new Date()).map((p) => [p.type, p.value]));
      const day = DAYS.indexOf(parts.weekday);
      const now = Number(parts.hour) + Number(parts.minute) / 60;
      const onlyOpen = openFilter.getAttribute("aria-pressed") === "true";
      let visible = 0;

      locCards.forEach((card) => {
        const hours = JSON.parse(card.dataset.hours);
        const today = hours[day];
        const status = card.querySelector(".loc-status");
        const open = !!today && now >= today[0] && now < today[1];
        const soon = open && today[1] - now <= 1;

        if (open) {
          status.textContent = soon ? `Closes ${fmt(today[1])}` : "Open now";
        } else if (today && now < today[0]) {
          status.textContent = `Opens ${fmt(today[0])}`;
        } else {
          // Find the next day with hours.
          let offset = 1;
          while (offset < 7 && !hours[(day + offset) % 7]) offset++;
          const next = hours[(day + offset) % 7];
          status.textContent = next ? `Opens ${offset === 1 ? "tomorrow" : DAYS[(day + offset) % 7]} ${fmt(next[0])}` : "Closed";
        }
        status.classList.toggle("is-open", open && !soon);
        status.classList.toggle("is-soon", soon);

        card.hidden = onlyOpen && !open;
        if (!card.hidden) visible++;
      });

      locEmpty.hidden = visible > 0;
    };

    openFilter.addEventListener("click", () => {
      openFilter.setAttribute("aria-pressed", String(openFilter.getAttribute("aria-pressed") !== "true"));
      renderLocations();
    });
    renderLocations();
    setInterval(renderLocations, 60000);
  }
})();
