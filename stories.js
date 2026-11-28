(function () {
	var PER = 10;
	var list = document.querySelector(".stories");
	var nav = document.querySelector(".cat-filter");
	var pager = document.querySelector(".pager");
	if (!list || !nav) return;
	var params = new URLSearchParams(location.search);
	var cat = params.get("c") || "";
	var known = Array.prototype.some.call(nav.querySelectorAll("a"), function (a) { return a.dataset.cat === cat; });
	if (!known) cat = "";
	var items = Array.prototype.filter.call(list.querySelectorAll("li"), function (li) { return !cat || li.dataset.cat === cat; });
	var pages = Math.max(1, Math.ceil(items.length / PER));
	var page = parseInt(params.get("p"), 10);
	if (!(page >= 1)) page = 1;
	if (page > pages) page = pages;
	list.querySelectorAll("li").forEach(function (li) { li.hidden = true; });
	items.slice((page - 1) * PER, page * PER).forEach(function (li) { li.hidden = false; });
	nav.querySelectorAll("a").forEach(function (a) {
		if (a.dataset.cat === cat) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
	});
	var empty = document.querySelector(".cat-empty");
	if (empty) empty.hidden = items.length > 0;
	if (!pager) return;
	function href(n) {
		var q = new URLSearchParams();
		if (cat) q.set("c", cat);
		if (n > 1) q.set("p", String(n));
		var s = q.toString();
		return location.pathname.split("/").pop() + (s ? "?" + s : "");
	}
	function el(tag, text, attrs) {
		var e = document.createElement(tag);
		e.textContent = text;
		for (var k in attrs) e.setAttribute(k, attrs[k]);
		return e;
	}
	pager.textContent = "";
	pager.appendChild(page > 1 ? el("a", "‹", { href: href(page - 1), "aria-label": "이전 쪽", "class": "step" }) : el("span", "‹", { "class": "step", "aria-hidden": "true" }));
	for (var n = 1; n <= pages; n++) {
		pager.appendChild(n === page ? el("span", String(n), { "aria-current": "page" }) : el("a", String(n), { href: href(n) }));
	}
	pager.appendChild(page < pages ? el("a", "›", { href: href(page + 1), "aria-label": "다음 쪽", "class": "step" }) : el("span", "›", { "class": "step", "aria-hidden": "true" }));
})();
