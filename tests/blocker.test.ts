import path from 'path';
import * as fs from 'fs';
import * as tfn from '@tensorflow/tfjs-node';

import {JSDOM} from 'jsdom';
import {browser, mockBrowser, mockBrowserNode} from './browser-mocks';
import {TextClassifier} from '../src/detection/text-classifier';

import * as blocker from '../src/blocker'; // must go last

jest.mock('webextension-polyfill-ts', () => {
	mockBrowser.storage.local.get.mock(
		async _keys => {
			return {enabled: false, whitelist: []}; // disable so it doesn't run before our tests
		}
	);
	return {browser};
});

// const html = fs.readFileSync(path.resolve(__dirname, './test_assets/mock.html'));
// const page = new JSDOM(html);
// document = page.window.document;
// window = page.window;

const handler = tfn.io.fileSystem(path.resolve(__dirname, '../ml/distilbert_nela_js/model.json'));
jest.spyOn(TextClassifier, 'modelPath', 'get').mockReturnValue(handler);

describe('blocker tests', () => {
	beforeEach(() => {
		const html = fs.readFileSync(path.resolve(__dirname, './test_assets/mock.html'));
		const page = new JSDOM(html);
		global.document = page.window.document;
		global.window = page.window as unknown as Window & typeof globalThis;
		mockBrowserNode.enable();
	});

	afterEach(() => {
		mockBrowserNode.verifyAndDisable();
	});

	test('blocker script on website', async () => {
		const textScanner = await TextClassifier.create();
		mockBrowser.runtime.sendMessage.mock(
			async (request: any) => {
				const text = request?.text;
				if (text) {
					return textScanner.classify({body: text});
				}

				return undefined;
			}
		);

		const count = await blocker.runBlocker();
		expect(count).toBe(2);
		// console.log(document.body.innerHTML);
	});
});
