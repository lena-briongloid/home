(function () {
	var links = Array.prototype.slice.call(document.querySelectorAll(".entry-toc a[href^='#']"));
	if (!links.length) return;
	var heads = links.map(function (a) { return document.getElementById(a.getAttribute("href").slice(1)); });
	var OFFSET = 120;
	var current = null;
	function update() {
		var index = -1;
		for (var i = 0; i < heads.length; i++) {
			if (heads[i] && heads[i].getBoundingClientRect().top <= OFFSET) index = i;
		}
		var doc = document.documentElement;
		if (index > -1 && window.innerHeight + window.scrollY >= doc.scrollHeight - 2) index = heads.length - 1;
		var next = index > -1 ? links[index] : null;
		if (next === current) return;
		if (current) current.removeAttribute("aria-current");
		if (next) next.setAttribute("aria-current", "true");
		current = next;
	}
	window.addEventListener("scroll", update, { passive: true });
	window.addEventListener("resize", update);
	update();
})();
