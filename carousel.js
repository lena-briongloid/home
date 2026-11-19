(function () {
	function setup(root) {
		var track = root.querySelector(".carousel-track");
		var slides = Array.prototype.slice.call(track.querySelectorAll(".slide"));
		var nav = root.querySelector(".carousel-nav");
		var prev = root.querySelector(".carousel-prev");
		var next = root.querySelector(".carousel-next");
		var dotsBox = root.querySelector(".carousel-dots");
		if (slides.length < 2) { nav.hidden = true; return; }

		var dots = slides.map(function (slide, i) {
			slide.setAttribute("aria-label", (i + 1) + " / " + slides.length);
			var d = document.createElement("button");
			d.type = "button";
			d.setAttribute("aria-label", (i + 1) + "번째 프로젝트");
			d.addEventListener("click", function () { go(i); });
			dotsBox.appendChild(d);
			return d;
		});

		function current() { return Math.round(track.scrollLeft / Math.max(1, track.clientWidth)); }

		function go(i) {
			var n = slides.length;
			i = ((i % n) + n) % n;
			track.scrollTo({ left: i * track.clientWidth });
			update(i);
		}

		function update(target) {
			var c = typeof target === "number" ? target : current();
			dots.forEach(function (d, i) { d.setAttribute("aria-current", i === c ? "true" : "false"); });
			slides.forEach(function (s, i) { s.toggleAttribute("inert", i !== c); });
		}

		var DELAY = 5000;
		var timer = null;
		var hovered = false;
		var still = window.matchMedia ? matchMedia("(prefers-reduced-motion: reduce)") : null;

		function stop() { clearTimeout(timer); timer = null; }
		function restart() {
			stop();
			if (hovered || document.hidden || (still && still.matches) || root.querySelector(":focus-visible")) return;
			timer = setTimeout(function () { go(current() + 1); restart(); }, DELAY);
		}

		prev.addEventListener("click", function () { go(current() - 1); restart(); });
		next.addEventListener("click", function () { go(current() + 1); restart(); });
		track.addEventListener("keydown", function (e) {
			if (e.key === "ArrowLeft") { go(current() - 1); e.preventDefault(); }
			if (e.key === "ArrowRight") { go(current() + 1); e.preventDefault(); }
		});
		track.addEventListener("scroll", function () { update(); });
		track.addEventListener("scrollend", function () { update(); });

		root.addEventListener("pointerenter", function (e) { if (e.pointerType === "mouse") { hovered = true; stop(); } });
		root.addEventListener("pointerleave", function (e) { if (e.pointerType === "mouse") { hovered = false; restart(); } });
		root.addEventListener("focusin", function () { if (root.querySelector(":focus-visible")) stop(); });
		root.addEventListener("focusout", function () { setTimeout(restart, 0); });
		track.addEventListener("pointerdown", restart);
		document.addEventListener("visibilitychange", restart);
		if (still && still.addEventListener) still.addEventListener("change", restart);

		update();
		restart();
	}
	document.querySelectorAll(".carousel").forEach(setup);
})();
