import '../style/blocker.scss';
import {browser} from 'webextension-polyfill-ts';
import {checkDisablelist} from './util/link-util';
import {Websites, pageType} from './util/page-type';
import {ClassifierOutput, AggregateLabels} from './detection/classifier';

// check if the extension has been enabled by the user
(async () => {
	const enabled: boolean = (await browser.storage.local.get('enabled'))?.enabled ?? true;
	const disabledList: string[] = (await browser.storage.local.get('whitelist'))?.whitelist ?? [];
	if (enabled && checkDisablelist(window.location.href, disabledList)) {
		switch (pageType(window.location.origin)) {
			case Websites.kFacebook:
			case Websites.kTwitter:
			case Websites.kNewsSite:
			default:
				setTimeout(async () => {
					await browser.runtime.sendMessage({message: 'updateBadge'});
					const count = await runBlocker();
					await browser.runtime.sendMessage({message: 'updateBadge', count});
				}, 1000); // wait 1 sec for page to load
		}
	} else {
		await browser.runtime.sendMessage({message: 'updateBadge'});
	}
})();

// sets up the html collapsible and wraps the element that is given by the input
function createCollapsible(p: Element, result: ClassifierOutput) {
	// create the "see why we blocked this" button
	const resultsButton = document.createElement('button');
	resultsButton.classList.add('mdc-button', 'mdc-card__action', 'mdc-card__action--button');
	const resultsButtonRipple = document.createElement('div');
	resultsButtonRipple.classList.add('mdc-button__ripple');
	const resultsButtonIcon = document.createElement('i');
	resultsButtonIcon.classList.add('material-icons', 'mdc-button__icon');
	resultsButtonIcon.setAttribute('aria-hidden', 'true');
	resultsButtonIcon.innerHTML = 'info';
	const resultsButtonLabel = document.createElement('span');
	resultsButtonLabel.classList.add('mdc-button__label');
	resultsButtonLabel.innerHTML = 'See why we\'ve blocked this!';
	resultsButton.append(resultsButtonRipple);
	resultsButton.append(resultsButtonIcon);
	resultsButton.append(resultsButtonLabel);

	resultsButton.addEventListener('click', async () => {
		await browser.runtime.sendMessage({message: 'openNewTab', url: '/public/results.html', result});
	});

	// create the card that holds the hidden content
	const hiddenContent = document.createElement('div');
	hiddenContent.classList.add('mdc-card', 'mdc-card--outlined', 'collapsible__content');
	const hiddenText = p.cloneNode(true);
	hiddenContent.append(hiddenText);
	if ((hiddenText as HTMLElement).tagName === 'SPAN') {
		hiddenContent.append(document.createElement('br'));
	}

	hiddenContent.append(resultsButton);

	// create the collapsible toggle button
	const toggleButton = document.createElement('button');
	toggleButton.classList.add('mdc-button', 'mdc-button--outlined');
	const toggleButtonRipple = document.createElement('span');
	toggleButtonRipple.classList.add('mdc-button__ripple');
	const toggleButtonIcon = document.createElement('i');
	toggleButtonIcon.classList.add('material-icons', 'mdc-button__icon');
	toggleButtonIcon.setAttribute('aria-hidden', 'true');
	toggleButtonIcon.innerHTML = 'warning';
	const buttonText = document.createElement('span');
	buttonText.classList.add('mdc-button__label');
	buttonText.innerHTML = 'Detected fake news! Click to show.';
	toggleButton.append(toggleButtonRipple);
	toggleButton.append(toggleButtonIcon);
	toggleButton.append(buttonText);

	toggleButton.addEventListener('click', () => {
		if (hiddenContent.style.maxHeight !== `${hiddenContent.scrollHeight}px`) { // eslint-disable-line no-negated-condition
			hiddenContent.style.display = 'block'; // set display to block so it becomes visible
			hiddenContent.classList.add('mdc-card--outlined'); // add outline incase it was removed in the else statement
			hiddenContent.style.maxHeight = `${hiddenContent.scrollHeight}px`; // animate to max height
		} else {
			hiddenContent.style.maxHeight = '0px'; // animate to closed
			hiddenContent.classList.remove('mdc-card--outlined'); // remove outline so we don't see border (can't set display to none because it won't be animated)
		}
	});

	// create the container div that replaces the original paragraph
	const containerDiv = document.createElement('div');
	containerDiv.classList.add('collapsible');
	containerDiv.append(toggleButton);
	containerDiv.append(hiddenContent);
	p.replaceWith(containerDiv);
}

// This is the meat of the blocking script
// waits until the page is done loading and then collects all of the wanted elements
// on the page that containt text and sends it through to the machine learning model
// If the result of the ml model flags the text, then the element is wrapped in a collapsible and is 'blocked'
export async function runBlocker() {
	// checkLinks();
	// Replace paragraphs with collapsible divs
	// Add support later for other tags
	console.log('blocker running in page!');
	console.time('Blocker Time');
	let count = 0;

	// collects all of the non-header and non-span tags, and runs each piece through the ml model
	// if the text is flagged, it is wrapped in the collapsible
	// to be put in the model, the model must have at least 15 words (as to not clog up the model)
	const elementArray = document.querySelectorAll('p,dd,li,text');
	await Promise.all([...elementArray].map(async p => {
		if (!p.textContent || p.textContent.split(' ').length < 15) {
			return; // skip scanning content that doesn't look to be a complete sentence (< 15 words)
		}

		return browser.runtime.sendMessage({message: 'scanText', text: p.textContent}).then(result => {
			// should maybe have it so if aggregate is mixed, text is highlighted but not blocked
			if (result && result.valueAggregate !== AggregateLabels.reliable) {
				count += 1;
				createCollapsible(p, result);
			}
		});
	}));

	console.time('Headers');
	// collects all of the header tags, and runs each piece through the ml model
	// if the text is flagged, it is wrapped in the collapsible
	// headers usually are not complete sentences, so we lower the length requirement to 5 words
	const headerArray = document.querySelectorAll('h1,h2,h3,h4,h5,h6');
	await Promise.all([...headerArray].map(async p => {
		if (!p.textContent || p.textContent.split(' ').length < 5) {
			return;
		}

		return browser.runtime.sendMessage({message: 'scanText', text: p.textContent}).then((result: ClassifierOutput) => {
			if (result && result.valueAggregate !== AggregateLabels.reliable) {
				count += 1;
				createCollapsible(p, result);
			}
		});

		// const result = await browser.runtime.sendMessage({message: 'scanText', text: p.textContent});
		// // should maybe have it so if aggregate is mixed, text is highlighted but not blocked
		// if (result && result.valueAggregate !== AggregateLabels.reliable) {
		// 	count += 1;
		// 	createCollapsible(p, result);
		// }
	}));
	console.timeEnd('Headers');

	const divArray = document.querySelectorAll('span'); // div
	// go through divs, try getting only divs with text in them
	// if the text is flagged, it is wrapped in the collapsible
	// to be put in the model, the model must have at least 15 words (as to not clog up the model)
	await Promise.all([...divArray].map(async p => {
		if (!p.textContent || p.textContent.split(' ').length < 15) { // || p.hasChildNodes
			return; // skip scanning content that doesn't look to be a complete sentence (< 15 words)
		}

		return browser.runtime.sendMessage({message: 'scanText', text: p.textContent}).then((result: ClassifierOutput) => {
			if (result && result.valueAggregate !== AggregateLabels.reliable) {
				count += 1;
				createCollapsible(p, result);
			}
		});
	}));

	console.timeEnd('Blocker Time');

	return count;
}
