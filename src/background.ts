import {Classifier, ClassifierOutput} from './detection/classifier';
import {ClassifierFactory, ClassifierTypes} from './factory/classifier-factory';

console.log('background script test');
const factory: ClassifierFactory = new ClassifierFactory();
let imageScanner: Classifier;
let textScanner: Classifier;

(async () => {
	imageScanner = await factory.createClassifier({type: ClassifierTypes.kImage});
	textScanner = await factory.createClassifier({type: ClassifierTypes.kText});

	const enabled: boolean = (await browser.storage.local.get('enabled'))?.enabled ?? true;
	await browser.browserAction.setIcon({path: enabled ? '../assets/icon.png' : '../assets/icon_disabled.png'});
})();

async function createResultPage(result: ClassifierOutput) {
	if (result) {
		const url = `/public/results.html?res=${
			encodeURIComponent(JSON.stringify(result))
		}`;
		await browser.tabs.create({url});
	}
}

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
				await createResultPage(result);
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

		case 'scanText': {
			const text = request?.text;
			if (text) {
				return textScanner.classify({body: text});
				// sendResponse({result});
			}

			break;
		}

		case 'openNewTab': {
			const result = request?.result;
			if (result) {
				await createResultPage(result);
			}

			break;
		}

		default:
			break;
	}

	return false;
});
