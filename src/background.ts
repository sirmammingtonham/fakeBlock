import {Classifier} from './detection/classifier';
import {Factory} from './factory/factory';
import {ImageFactory} from './factory/image-factory';
import {TextFactory} from './factory/text-factory';

console.log('background script test');
const imageFactory: Factory = new ImageFactory();
const textFactory: Factory = new TextFactory();
let imageScanner: Classifier;
let textScanner: Classifier;

(async () => {
	imageScanner = await imageFactory.createClassifier({_: 'image'});
	textScanner = await textFactory.createClassifier({_: 'text'});
})();

// Scans image
browser.contextMenus.create(
	{
		id: 'scan-image',
		title: 'Scan with fakeBlock', // Browser.i18n.getMessage("contextMenuItemSelectionLogger"),
		contexts: ['image']
	},
	() => {
		console.log('image context menu created');
	}
);

// Scans text
browser.contextMenus.create(
	{
		id: 'scan-selection',
		title: 'Scan with fakeBlock',
		contexts: ['selection']
	},
	() => {
		console.log('text selection context menu created');
	}
);

browser.contextMenus.onClicked.addListener(async (info, _tab) => {
	switch (info.menuItemId) {
		case 'scan-image':
			if (info.srcUrl) {
				await imageScanner.classify(info.srcUrl);
			}

			break;
		case 'scan-selection':
			if (info.selectionText) {
				const result = await textScanner.classify({body: info.selectionText});
				console.log(`Scan result for "${info.selectionText}": ${result ? 'fake!' : 'legit'}`);
			}

			break;
		default:
			break;
	}
});

browser.runtime.onMessage.addListener(async (request: any, _sender: browser.runtime.MessageSender, sendResponse: any) => {
	switch (request?.message) {
		case 'getEnabled': {
			const retrieved = await browser.storage.local.get('enabled');
			const enabled = !retrieved.enabled ?? true;
			sendResponse({response: enabled});

			return true;
		}

		case 'reload': {
			await browser.tabs.reload();

			break;
		}

		case 'openNewTab': {
			await browser.tabs.create({url: request?.url});

			break;
		}

		default:
			break;
	}

	return false;
});
