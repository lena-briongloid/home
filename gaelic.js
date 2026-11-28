(function () {
	var targets = document.querySelectorAll(".gaelic, .song.gadelica .orig");
	if (!targets.length) return;
	var letters = { b: "ḃ", c: "ċ", d: "ḋ", f: "ḟ", g: "ġ", m: "ṁ", p: "ṗ", s: "ṡ", t: "ṫ" };
	var converted = [];

	document.addEventListener("copy", function (event) {
		if (event.defaultPrevented || !event.clipboardData) return;
		var active = document.activeElement;
		if (active && (active.matches("input, textarea") || active.isContentEditable)) return;
		var selection = window.getSelection();
		if (!selection || selection.isCollapsed || !selection.rangeCount) return;
		var ranges = [];
		for (var i = 0; i < selection.rangeCount; i++) ranges.push(selection.getRangeAt(i));
		var selected = converted.filter(function (item) {
			return item.node.isConnected && item.node.data === item.display && ranges.some(function (range) {
				return range.isPointInRange(item.node, 0) && range.isPointInRange(item.node, item.node.length);
			});
		});
		if (!selected.length) return;
		var boundaries = ranges.map(function (range) {
			return { start: range.startContainer, from: range.startOffset, end: range.endContainer, to: range.endOffset };
		});
		var anchor = selection.anchorNode, anchorOffset = selection.anchorOffset;
		var focus = selection.focusNode, focusOffset = selection.focusOffset;
		var originals = new Map(selected.map(function (item) { return [item.node, item.original]; }));
		function offset(node, value, restore) {
			return restore && originals.has(node) && value > 0 ? originals.get(node).length : value;
		}
		function select(restore) {
			selection.removeAllRanges();
			boundaries.forEach(function (b) {
				var range = document.createRange();
				range.setStart(b.start, offset(b.start, b.from, restore));
				range.setEnd(b.end, offset(b.end, b.to, restore));
				selection.addRange(range);
			});
			if (!restore && boundaries.length === 1 && selection.setBaseAndExtent) {
				selection.setBaseAndExtent(anchor, anchorOffset, focus, focusOffset);
			}
		}
		var plain, html;
		try {
			selected.forEach(function (item) { item.node.data = item.original; });
			select(true);
			plain = selection.toString();
			var box = document.createElement("div");
			for (var j = 0; j < selection.rangeCount; j++) {
				var fragment = selection.getRangeAt(j).cloneContents();
				fragment.querySelectorAll(".gaelic-lenition").forEach(function (span) {
					span.replaceWith(document.createTextNode(span.textContent));
				});
				if (j) box.appendChild(document.createElement("br"));
				box.appendChild(fragment);
			}
			html = box.innerHTML;
		} finally {
			selected.forEach(function (item) { item.node.data = item.display; });
			select(false);
		}
		event.clipboardData.setData("text/plain", plain);
		event.clipboardData.setData("text/html", html);
		event.preventDefault();
	});

	targets.forEach(function (target) {
		var walker = document.createTreeWalker(target, NodeFilter.SHOW_TEXT);
		var nodes = [];
		while (walker.nextNode()) {
			var node = walker.currentNode;
			if (node.parentElement.closest("script, style, code, pre, textarea, .gaelic-lenition") || node.parentElement.isContentEditable) continue;
			if (/[bcdfgmpst]h/i.test(node.data)) nodes.push(node);
		}
		nodes.forEach(function (node) {
			var fragment = document.createDocumentFragment();
			var pattern = /[bcdfgmpst]h/gi;
			var last = 0, match;
			while ((match = pattern.exec(node.data))) {
				fragment.appendChild(document.createTextNode(node.data.slice(last, match.index)));
				var original = match[0], letter = original[0];
				var display = letters[letter.toLowerCase()];
				if (letter === letter.toUpperCase()) display = display.toUpperCase();
				var span = document.createElement("span");
				span.className = "gaelic-lenition";
				span.dataset.original = original;
				span.textContent = display;
				fragment.appendChild(span);
				converted.push({ node: span.firstChild, original: original, display: display });
				last = pattern.lastIndex;
			}
			fragment.appendChild(document.createTextNode(node.data.slice(last)));
			node.replaceWith(fragment);
		});
	});
})();
