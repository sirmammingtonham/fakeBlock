/**
 * Unit tests for our content script (blocker.ts)
 * Mocks the webext-polyfill browser variable
 * Uses jsdom to create a dom-like environment from our mock website html
 * And replaces vanilla tensorflowjs with tensorflowjs-node so our models don't try to use the nonexistent webgl backend
 */
import path from 'path';
import * as fs from 'fs';
import * as tfn from '@tensorflow/tfjs-node';

import {JSDOM} from 'jsdom';
import {sendMessage, storageGet as get} from './browser-mocks';
import {TextClassifier} from '../src/detection/text-classifier';

import * as blocker from '../src/blocker'; // must go last for some reason

jest.setTimeout(180000); // alot 3 min timeout to download model (should be cached after first time)

jest.mock('@tensorflow/tfjs', () => ({...tfn})); // mock tfjs web with the node version

jest.mock('webextension-polyfill-ts', () => {
	get.mockReturnValue({enabled: false, whitelist: []}); // mock return value as disabled so we don't automatically run the script
	sendMessage.mockReturnValueOnce(undefined); // function runs once with message: 'updateBadge', don't want it to do anything
	return {
		browser: {
			storage: {
				local: {
					get
				}
			},
			runtime: {
				sendMessage
			}
		}};
});

/* uncomment to use local model instead of hosted one
const handler = tfn.io.fileSystem(
	path.resolve(__dirname, '../ml/distilbert_nela_js/model.json')
);
jest.spyOn(TextClassifier, 'modelPath', 'get').mockReturnValue(handler); // replace model path getter with tf-node friendly handler
*/

describe('content script tests', () => {
	beforeEach(() => {
		const html = fs.readFileSync(
			path.resolve(__dirname, './test_assets/mock.html')
		);
		const page = new JSDOM(html);
		global.document = page.window.document;
		global.window = (page.window as unknown) as Window & typeof globalThis;
	});

	test('blocker script on website', async () => {
		const textScanner = await TextClassifier.create();
		sendMessage.mockImplementation(async (request: any) => {
			const text = request?.text;
			if (text) {
				return textScanner.classify({body: text});
			}

			return undefined;
		});

		const count = await blocker.runBlocker();

		expect(count).toBe(6); // 6 things should be blocked on the page
		console.log(document.body.innerHTML); // add more tests later
	});
});
