import '../style/blocker.scss';
import {browser} from 'webextension-polyfill-ts';
import {Websites, pageType} from './util/page-type';
import {ClassifierOutput, AggregateLabels} from './detection/classifier';

// check if the extension has been enabled by the user
(async () => {
	const enabled: boolean = (await browser.storage.local.get('enabled'))?.enabled ?? true;
	const disabledList: string[] = (await browser.storage.local.get('whitelist'))?.whitelist ?? [];
	if (enabled && !disabledList.includes(window.location.href)) {
		switch (pageType(window.location.origin)) {
			case Websites.kFacebook:
			case Websites.kTwitter:
			case Websites.kNewsSite:
			default:
				setTimeout(async () => {
					const count = await runBlocker();
					console.log(`count is ${count}`);
					await browser.storage.local.set({ct: count});
				}, 1000); // wait 1 sec for page to load
		}
	}
})();

// sets up the html collapsible and wraps the element that is given by the input
function createCollapsible(p: Element, index: number, result: ClassifierOutput) {
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
		await browser.runtime.sendMessage({message: 'openNewTab', url: '/public/results.html', result});
	});

	hiddenContent.append(document.createElement('br'));
	hiddenContent.append(document.createElement('br'));
	hiddenContent.append(resultsLink);
	innerDiv.append(hiddenContent);

	containerDiv.append(toggleButton);
	containerDiv.append(innerDiv);
	containerDiv.append(document.createElement('br')); // spacing
	p.replaceWith(containerDiv);
}

// waits until the page is done loading and then collects all of the wanted elements
// on the page that containt text and sends it through to the machine learning model
// If the result of the ml model flags the text, then the element is wrapped in a collapsible and is 'blocked'
async function runBlocker() {
	// checkLinks();
	// Replace paragraphs with collapsible divs
	// Add support later for other tags
	let count = 0;

	const elementArray = document.querySelectorAll('p,h1,h2,h3,h4,h5,h6,dd,li,text');
	await Promise.all([...elementArray].map(async (p, index) => {
		if (!p.textContent || p.textContent.split(' ').length < 15) {
			return; // skip scanning content that doesn't look to be a complete sentence (< 15 words)
		}

		return browser.runtime.sendMessage({message: 'scanText', text: p.textContent}).then(result => {
			// should maybe have it so if aggregate is mixed, text is highlighted but not blocked
			if (result && result.valueAggregate !== AggregateLabels.reliable) {
				count += 1;
				createCollapsible(p, index, result);
			}
		});
	}));

	const divArray = document.querySelectorAll('span'); // div
	// go through divs, try getting only divs with text in them
	// general solution, block all divs that have no children, but this needs to be worked out
	// text can have <b>(bold), <i>(italic) elements and things like that which prevent the blocking
	await Promise.all([...divArray].map(async (p, index) => {
		if (!p.textContent || p.textContent.split(' ').length < 15) { // || p.hasChildNodes
			return; // skip scanning content that doesn't look to be a complete sentence (< 15 words)
		}

		return browser.runtime.sendMessage({message: 'scanText', text: p.textContent}).then((result: ClassifierOutput) => {
			if (result && result.valueAggregate !== AggregateLabels.reliable) {
				count += 1;
				createCollapsible(p, index, result);
			}
		});
	}));

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

	return count;
}
