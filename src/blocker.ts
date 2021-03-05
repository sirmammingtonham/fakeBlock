import '../style/blocker.scss';
import {pageType} from './util/page-type';

console.log(pageType(window.location.origin));

// Set up collapsible CSS
// const collapsibleStyle = document.createElement('style');
// collapsibleStyle.innerHTML = `
// *, ::after, ::before {
// 	box-sizing: border-box;
// }
// .collapse {
// 	display: block;
// 	max-height: 0px;
// 	overflow: hidden;
// 	transition: max-height 0.5s cubic-bezier(0, 1, 0, 1);
// }
// .collapse.show {
// 	max-height: 99em;
// 	transition: max-height 0.8s ease-in-out;
// }
// .block {
// 	margin-top: 10px;
// 	background: #f5f5f5;
// 	padding: 0;
// }
// .block__content {
// 	border: 1px solid #ccc;
// 	padding: 1.5em;
// 	height: 100%;
// }`;

// Replace paragraphs with collapsible divs
const elementArray = document.querySelectorAll('p');

for (const [index, p] of elementArray.entries()) {
	const containerDiv = document.createElement('div');
	const innerDiv = document.createElement('div');
	innerDiv.classList.add('block', 'collapse', `_${index}`);

	const toggleButton = document.createElement('button');
	toggleButton.innerHTML = 'Detected misinformation! Click to show.';
	toggleButton.classList.add('btn', 'btn-primary', 'btn__first');
	toggleButton.dataset.toggle = 'collapse';
	toggleButton.dataset.target = `.collapse._${index}`;
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
