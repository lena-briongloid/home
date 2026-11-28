(function () {
	function setup(reader) {
		var view = reader.querySelector(".reader-view");
		var text = reader.querySelector(".reader-text");
		var prev = reader.querySelector(".reader-prev");
		var next = reader.querySelector(".reader-next");
		var count = reader.querySelector(".reader-count");
		var smaller = reader.querySelector(".reader-smaller");
		var larger = reader.querySelector(".reader-larger");
		var SIZES = [0.8, 0.9, 1, 1.12, 1.25, 1.4];
		var ZKEY = "reader-size";
		var size = 2;
		try { var saved = parseInt(localStorage.getItem(ZKEY), 10); if (saved >= 0 && saved < SIZES.length) size = saved; } catch (e) {}

		function applySize() {
			text.style.fontSize = SIZES[size] + "em";
			if (smaller) smaller.disabled = size === 0;
			if (larger) larger.disabled = size === SIZES.length - 1;
		}

		function zoom(d) {
			var n = Math.max(0, Math.min(SIZES.length - 1, size + d));
			if (n === size) return;
			size = n;
			try { localStorage.setItem(ZKEY, String(size)); } catch (e) {}
			applySize();
			layout();
		}
		var gap = 0, page = 0, pages = 1, ratio = 0;

		function step() { return view.clientWidth; }

		function layout() {
			text.style.columnWidth = "auto";
			var w = text.clientWidth;
			gap = view.clientWidth - w;
			text.style.columnWidth = w + "px";
			text.style.columnGap = gap + "px";
			pages = Math.max(1, Math.round((text.scrollWidth + gap) / step()));
			page = Math.min(pages - 1, Math.round(ratio * (pages - 1)));
			show(false);
		}

		function show(animate) {
			text.style.transition = animate ? "" : "none";
			text.style.transform = "translateX(" + (-page * step()) + "px)";
			count.textContent = (page + 1) + " / " + pages;
			prev.disabled = page === 0;
			next.disabled = page === pages - 1;
			ratio = pages > 1 ? page / (pages - 1) : 0;
		}

		function go(d) {
			var p = Math.max(0, Math.min(pages - 1, page + d));
			if (p !== page) { page = p; show(true); }
		}

		prev.addEventListener("click", function () { go(-1); });
		next.addEventListener("click", function () { go(1); });
		if (smaller) smaller.addEventListener("click", function () { zoom(-1); });
		if (larger) larger.addEventListener("click", function () { zoom(1); });
		reader.addEventListener("keydown", function (e) {
			if (e.key === "ArrowLeft") { go(-1); e.preventDefault(); }
			if (e.key === "ArrowRight") { go(1); e.preventDefault(); }
		});

		var x0 = null, y0 = 0;
		view.addEventListener("pointerdown", function (e) { x0 = e.clientX; y0 = e.clientY; });
		view.addEventListener("pointerup", function (e) {
			if (x0 === null) return;
			var dx = e.clientX - x0, dy = e.clientY - y0;
			x0 = null;
			if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) { go(dx < 0 ? 1 : -1); return; }
			if (Math.abs(dx) < 8 && Math.abs(dy) < 8) {
				var r = view.getBoundingClientRect();
				go(e.clientX - r.left < r.width / 3 ? -1 : e.clientX - r.left > r.width * 2 / 3 ? 1 : 0);
			}
		});
		view.addEventListener("pointercancel", function () { x0 = null; });

		var lastW = 0;
		function check() { if (view.clientWidth !== lastW) { lastW = view.clientWidth; layout(); } }
		if ("ResizeObserver" in window) new ResizeObserver(check).observe(view);
		else addEventListener("resize", check);
		if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout);
		applySize();
		layout();
	}
	document.querySelectorAll(".reader").forEach(setup);
})();
