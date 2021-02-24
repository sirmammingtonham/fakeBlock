import {ImageScanner} from './scan_scripts/scan-image';
import {TextScanner} from './scan_scripts/scan-text';

console.log('background script test');
const imageScanner = new ImageScanner();
const textScanner = new TextScanner();

function onCreated() {
	if (browser.runtime.lastError) {
		console.log(`Error: ${browser.runtime.lastError as string}`);
	} else {
		console.log('Context menu item created successfully');
	}
}

// Scans image
browser.contextMenus.create(
	{
		id: 'scan-image',
		title: 'Scan with fakeBlock', // Browser.i18n.getMessage("contextMenuItemSelectionLogger"),
		contexts: ['image']
	},
	onCreated
);

// Scans text
browser.contextMenus.create(
	{
		id: 'scan-selection',
		title: 'Scan with fakeBlock',
		contexts: ['selection']
	},
	onCreated
);

browser.contextMenus.onClicked.addListener((info, _tab) => {
	switch (info.menuItemId) {
		case 'scan-image':
			if (info.srcUrl) {
				imageScanner.scanImage(info.srcUrl);
			}

			break;
		case 'scan-selection':
			if (info.selectionText) {
				textScanner.scanText(info.selectionText);
			}

			break;
		default:
			break;
	}
});
