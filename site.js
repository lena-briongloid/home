(function () {
	var root = document.documentElement;

	function load(key) { try { return localStorage.getItem(key); } catch (e) { return null; } }
	function save(key, v) { try { localStorage.setItem(key, v); } catch (e) {} }

	var THEME_KEY = "theme";
	var media = window.matchMedia ? matchMedia("(prefers-color-scheme: dark)") : null;

	function resolveTheme() {
		var s = load(THEME_KEY);
		if (s === "light" || s === "dark") return s;
		return media && media.matches ? "dark" : "light";
	}

	function applyTheme(theme) {
		root.setAttribute("data-theme", theme);
		var meta = document.querySelector('meta[name="theme-color"]');
		if (meta) meta.setAttribute("content", theme === "dark" ? "#171512" : "#F6F3EC");
		document.querySelectorAll(".theme-toggle").forEach(function (b) {
			b.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
		});
	}

	var SIZE_KEY = "body-size";
	var SIZES = { small: "20px", normal: "24px", large: "28px", xlarge: "32px" };

	function resolveSize() { var v = load(SIZE_KEY); return SIZES[v] ? v : "normal"; }

	function applySize(v) {
		root.style.setProperty("--body_size", SIZES[v]);
		document.querySelectorAll('input[name="bodyFontSize"]').forEach(function (r) { r.checked = r.value === v; });
	}

	function applyAll() { applyTheme(resolveTheme()); applySize(resolveSize()); }

	applyAll();
	document.addEventListener("DOMContentLoaded", applyAll);
	document.addEventListener("DOMContentLoaded", function () {
		var logo = document.querySelector(".wordmark");
		var subtitle = logo && logo.querySelector(".sub");
		if (!subtitle) return;
		function fitSubtitle() {
			subtitle.classList.toggle("no-room", subtitle.getBoundingClientRect().width > logo.getBoundingClientRect().width);
		}
		fitSubtitle();
		var observer = new ResizeObserver(fitSubtitle);
		observer.observe(logo);
		observer.observe(subtitle);
	});
	addEventListener("pageshow", applyAll);

	document.addEventListener("DOMContentLoaded", function () {
		var refs = document.querySelectorAll('sup[id^="fnref-"] a[href^="#fn-"]');
		if (!refs.length) return;
		var tip = document.createElement("div");
		tip.className = "note-popup";
		tip.hidden = true;
		tip.id = "note-tooltip";
		tip.setAttribute("role", "tooltip");
		var dialog = document.createElement("dialog");
		dialog.className = "note-dialog";
		dialog.setAttribute("aria-labelledby", "note-dialog-title");
		var close = document.createElement("button");
		close.type = "button";
		close.className = "note-close";
		close.setAttribute("aria-label", "닫기");
		close.textContent = "×";
		var body = document.createElement("div");
		body.className = "note-body";
		dialog.append(close, body);
		document.body.append(tip, dialog);
		var active, timer;

		function hideTip() {
			clearTimeout(timer);
			if (active) active.removeAttribute("aria-describedby");
			active = null;
			tip.hidden = true;
		}
		function leaveTip() { timer = setTimeout(hideTip, 160); }
		function fill(box, ref, note) {
			var label = document.createElement("div");
			label.className = "note-label";
			label.textContent = ref.getAttribute("aria-label");
			if (box === body) label.id = "note-dialog-title";
			box.replaceChildren(label);
			note.childNodes.forEach(function (child) {
				if (child.nodeType === 1 && child.matches(".fn-back")) return;
				box.appendChild(child.cloneNode(true));
			});
		}
		refs.forEach(function (ref) {
			var note = document.getElementById(ref.hash.slice(1));
			if (!note) return;
			ref.setAttribute("aria-haspopup", "dialog");
			ref.addEventListener("pointerenter", function (e) {
				if (e.pointerType !== "mouse" || dialog.open) return;
				hideTip();
				active = ref;
				fill(tip, ref, note);
				ref.setAttribute("aria-describedby", tip.id);
				tip.hidden = false;
				var rect = ref.getBoundingClientRect();
				var left = rect.left + (rect.width - tip.offsetWidth) / 2;
				var above = rect.top - tip.offsetHeight - 6;
				tip.style.left = Math.max(8, Math.min(left, document.documentElement.clientWidth - tip.offsetWidth - 8)) + "px";
				tip.style.top = Math.max(8, above >= 8 ? above : Math.min(rect.bottom + 6, innerHeight - tip.offsetHeight - 8)) + "px";
			});
			ref.addEventListener("pointerleave", leaveTip);
			ref.addEventListener("click", function (e) {
				if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey || !dialog.showModal) return;
				e.preventDefault();
				hideTip();
				fill(body, ref, note);
				ref.focus({ preventScroll: true });
				dialog.showModal();
				body.scrollTop = 0;
			});
		});
		tip.addEventListener("pointerenter", function () { clearTimeout(timer); });
		tip.addEventListener("pointerleave", leaveTip);
		close.addEventListener("click", function () { dialog.close(); });
		dialog.addEventListener("click", function (e) {
			if (e.target === dialog) dialog.close();
		});
		document.addEventListener("keydown", function (e) { if (e.key === "Escape") hideTip(); });
		addEventListener("scroll", hideTip, { passive: true });
		addEventListener("resize", hideTip);
	});

	if (media) {
		var onSchemeChange = function () { if (!load(THEME_KEY)) applyTheme(resolveTheme()); };
		if (media.addEventListener) media.addEventListener("change", onSchemeChange);
		else if (media.addListener) media.addListener(onSchemeChange);
	}

	document.addEventListener("click", function (e) {
		var b = e.target.closest && e.target.closest(".theme-toggle");
		if (!b) return;
		var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
		save(THEME_KEY, next);
		applyTheme(next);
	});

	document.addEventListener("change", function (e) {
		var t = e.target;
		if (!t || t.name !== "bodyFontSize" || !SIZES[t.value]) return;
		save(SIZE_KEY, t.value);
		applySize(t.value);
	});

	document.addEventListener("click", function (e) {
		var li = e.target.closest && e.target.closest(".shelf li");
		document.querySelectorAll(".shelf li.tapped").forEach(function (o) { if (o !== li) o.classList.remove("tapped"); });
		if (li && !li.querySelector("a")) li.classList.toggle("tapped");
		var tip = e.target.closest && e.target.closest(".tip");
		document.querySelectorAll(".tip.tapped").forEach(function (o) { if (o !== tip) o.classList.remove("tapped"); });
		if (tip) tip.classList.toggle("tapped");
	});
	document.addEventListener("pointerout", function (e) {
		if (e.pointerType !== "mouse") return;
		var li = e.target.closest && e.target.closest(".shelf li.tapped, .tip.tapped");
		if (li && !li.contains(e.relatedTarget)) li.classList.remove("tapped");
	});
	document.addEventListener("keydown", function (e) {
		if (e.key !== "Escape") return;
		document.querySelectorAll(".tip.tapped").forEach(function (o) { o.classList.remove("tapped"); });
		var a = document.activeElement;
		if (a && a.classList && a.classList.contains("tip")) a.blur();
	});

	if ("onpagereveal" in window) {
		addEventListener("pagereveal", function (e) { if (!e.viewTransition) root.classList.add("enter"); });
	} else {
		root.classList.add("enter");
	}
})();
