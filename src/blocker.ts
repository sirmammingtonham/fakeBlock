import '../style/blocker.css';

// Set up collapsible CSS
const collapsibleStyle = document.createElement('style');
collapsibleStyle.innerHTML = `
*, ::after, ::before {
    box-sizing: border-box;
}

.collapse {
  display: block;
  max-height: 0px;
  overflow: hidden;
  transition: max-height .5s cubic-bezier(0, 1, 0, 1);; 

  &.show {
    max-height: 99em;
    transition: max-height .5s ease-in-out;
  }
}

.block {
  margin-top: 10px;
  background: #f5f5f5;
  padding: 0;
  // height: 250px;
  
  &__content {
    border: 1px solid #ccc;
    padding: 1.5em;
    height: 100%;
  }
}
    `;

// Replace paragraphs with collapsible divs
const elementArray = document.querySelectorAll('p');

for (const p of elementArray) {
	const newContainer = document.createElement('div');
	const newContent = document.createElement('div');
	const newButton = document.createElement('button');
	newButton.innerHTML = 'Click me!';
	newButton.classList.add('btn');
	newButton.classList.add('btn-primary');
	newButton.classList.add('btn__first');

	newButton.dataset.toggle = 'collapse';
	newButton.dataset.target = '.collapse';
	newButton.dataset.text = 'Collapse';

	const newText = document.createElement('p');
	newText.innerHTML = 'lol im a colaspible';
	// const stickbug = new Image(200, 200);
	// stickbug.src = 'https://media.tenor.com/images/91dc2daa231f29e7d836305979fc0bac/tenor.gif';

	newContent.classList.add('block', 'collapse', 'first');
	newText.classList.add('block__content');
	newContent.append(newText);

	newContainer.append(newButton);
	newContainer.append(newContent);
	p.replaceWith(newContainer);
}

document.head.append(collapsibleStyle);

const triggers = new Set(Array.from(document.querySelectorAll('[data-toggle="collapse"]')));

window.addEventListener('click', ev => {
	console.log('found a click');
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
		console.log('whee');
	}
};

console.log('blocker running in page!');
