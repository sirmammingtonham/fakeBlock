import {ImageClassifier} from './detection/image-classifier';
import {TextClassifier} from './detection/text-classifier';

console.log('background script test');
let imageScanner: ImageClassifier;
let textScanner: TextClassifier;

(async () => {
	imageScanner = new ImageClassifier();
	textScanner = await TextClassifier.getInstance();
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
				imageScanner.classifyImage(info.srcUrl);
			}

			break;
		case 'scan-selection':
			if (info.selectionText) {
				await textScanner.classifyText({body: info.selectionText});
			}

			break;
		default:
			break;
	}
});

// probably don't need this, apparently you can do everything in the content script
// idk why everything online says you can't...
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
