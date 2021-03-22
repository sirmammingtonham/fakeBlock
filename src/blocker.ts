import '../style/blocker.scss';
// import $ from 'jquery';
// import * as CJRIndex from '../assets/cjrindex.json';
import {browser} from 'webextension-polyfill-ts';
import {Websites, pageType} from './util/page-type';

// check if the extension has been enabled by the user
(async () => {
	const retrieved = await browser.storage.local.get('enabled');
	const enabled = !retrieved.enabled ?? true;
	if (enabled) {
		switch (pageType(window.location.origin)) {
			case Websites.kFacebook:
			case Websites.kTwitter:
			default:
				testBlocker();
		}
	}
})();

// function checkLinks() {
// 	const domainRegex = /^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:/\n?]+)/;
// 	// should make this look nicer
// 	$('a').each(function (this: any) {
// 		const subDomain: keyof typeof CJRIndex = this.href.match(domainRegex)[1];
// 		// these websites have a million links to themselves,
// 		// should ignore otherwise page will get bloated with warnings
// 		const shouldSkip = window.location.origin.includes(subDomain);
// 		if (!shouldSkip && subDomain in CJRIndex) {
// 			const indexEntry = CJRIndex[subDomain];
// 			console.log('found sketchy link!');
// 			$(this).addClass('linkSus');
// 			$(this).append(`<span class="linkSusText">Link's website reported as ${indexEntry.categories as unknown as string}!</span>`);
// 		}
// 	});
// }

function testBlocker() {
	// checkLinks();
	// Replace paragraphs with collapsible divs
	//Add support later for other tags
	const elementArray = document.querySelectorAll('p,h1,h2,h3,h4,h5,h6,dd,li,text')
	for (const [index, p] of [...elementArray].entries()) {
		const containerDiv = document.createElement('div');
		const innerDiv = document.createElement('div');
		innerDiv.classList.add('block', 'collapse', `_${index}`);

		const toggleButton = document.createElement('button');
		toggleButton.innerHTML = 'Detected fake news! Click to show.';
		toggleButton.classList.add('btn', 'btn-primary', 'btn__first');
		toggleButton.dataset.toggle = 'collapse';
		toggleButton.dataset.target = `.collapse._${index}`;
		toggleButton.dataset.text = 'Collapse';

		const hiddenContent = document.createElement('p');
		hiddenContent.innerHTML = p.innerHTML;
		hiddenContent.classList.add('block__content');

		const resultsLink = document.createElement('a');
		resultsLink.innerHTML = 'See why we\'ve blocked this!';

		resultsLink.addEventListener('click', async () => {
			console.log('pls');
			await browser.runtime.sendMessage({message: 'openNewTab', url: '/public/results.html'});
		});

		hiddenContent.append(document.createElement('br'));
		hiddenContent.append(resultsLink);
		innerDiv.append(hiddenContent);

		containerDiv.append(toggleButton);
		containerDiv.append(innerDiv);
		containerDiv.append(document.createElement('br')); // spacing
		p.replaceWith(containerDiv);
	}

	const divArray = document.querySelectorAll('div,span')
	//go through divs, try getting only divs with text in them
	//general solution, block all divs that have no childrem, but this needs to be worked out
	//text can have <b>(bold), <i>(italic) elements and things like that which prevent the blocking
	for (const [index, p] of [...divArray].entries()) {
		if(!p.hasChildNodes() && p.textContent != "")
		{
			const containerDiv = document.createElement('div');
			const innerDiv = document.createElement('div');
			innerDiv.classList.add('block', 'collapse', `_${index}`);

			const toggleButton = document.createElement('button');
			toggleButton.innerHTML = 'Detected fake news! Click to show.';
			toggleButton.classList.add('btn', 'btn-primary', 'btn__first');
			toggleButton.dataset.toggle = 'collapse';
			toggleButton.dataset.target = `.collapse._${index}`;
			toggleButton.dataset.text = 'Collapse';

			const hiddenContent = document.createElement('p');
			hiddenContent.innerHTML = p.innerHTML;
			hiddenContent.classList.add('block__content');

			const resultsLink = document.createElement('a');
			resultsLink.innerHTML = 'See why we\'ve blocked this!';

			resultsLink.addEventListener('click', async () => {
			console.log('pls');
				await browser.runtime.sendMessage({message: 'openNewTab', url: '/public/results.html'});
			});

			hiddenContent.append(document.createElement('br'));
			hiddenContent.append(resultsLink);
			innerDiv.append(hiddenContent);

			containerDiv.append(toggleButton);
			containerDiv.append(innerDiv);
			containerDiv.append(document.createElement('br')); // spacing
			p.replaceWith(containerDiv);
		}
	}
	
	// document.head.append(collapsibleStyle);
	

	const triggers = new Set([...document.querySelectorAll('[data-toggle="collapse"]')]);

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
		const targets = [...document.querySelectorAll(selector)];
		for (const target of targets) {
			target.classList[fnmap[cmd]]('show');
		}
	};

	console.log('blocker running in page!');
}
