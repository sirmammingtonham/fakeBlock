import '../style/blocker.scss';
import {browser} from 'webextension-polyfill-ts';
import {pageType} from './util/page-type';

// check if the extension has been enabled by the user
(async () => {
	const retrieved = await browser.storage.local.get('enabled');
	const enabled = !retrieved.enabled ?? true;
	if (enabled) {
		testBlocker();
	}
})();

function testBlocker() {
	console.log(pageType(window.location.origin));

	// Replace paragraphs with collapsible divs
	const elementArray = document.querySelectorAll('p');

	for (const [index, p] of Array.from(elementArray).entries()) {
		const containerDiv = document.createElement('div');
		const innerDiv = document.createElement('div');
		innerDiv.classList.add('block', 'collapse', `_${index as number}`);

		const toggleButton = document.createElement('button');
		toggleButton.innerHTML = 'Detected misinformation! Click to show.';
		toggleButton.classList.add('btn', 'btn-primary', 'btn__first');
		toggleButton.dataset.toggle = 'collapse';
		toggleButton.dataset.target = `.collapse._${index as number}`;
		toggleButton.dataset.text = 'Collapse';

		const hiddenContent = document.createElement('p');
		hiddenContent.innerHTML = p.innerHTML;
		hiddenContent.classList.add('block__content');

		innerDiv.append(hiddenContent);

		containerDiv.append(toggleButton);
		containerDiv.append(innerDiv);
		containerDiv.append(document.createElement('br')); // spacing
		p.replaceWith(containerDiv);
	}

	// document.head.append(collapsibleStyle);

	const triggers = new Set(Array.from(document.querySelectorAll('[data-toggle="collapse"]')));

	window.addEventListener('click', ev => {
		const elm = ev.target as Element;
		if (triggers.has(elm)) {
			const selector = elm.getAttribute('data-target');
			collapse(selector, 'toggle');
		}
	}, false);

	const fnmap: any = {
		toggle: 'toggle',
		show: 'add',
		hide: 'remove'
	};

	const collapse = (selector: any, cmd: string) => {
		const targets = Array.from(document.querySelectorAll(selector));
		for (const target of targets) {
			target.classList[fnmap[cmd]]('show');
		}
	};

	console.log('blocker running in page!');
}
