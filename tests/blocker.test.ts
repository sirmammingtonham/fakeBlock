import * as fs from 'fs';
import {JSDOM} from 'jsdom';
import {chrome} from 'jest-chrome';
import * as blocker from '../src/blocker';

const html = fs.readFileSync('test_assets/mock.html');
const page = new JSDOM(html);

// jest.mock('browser', () => chrome);

describe('blocker dom injection', () => {
	test('browser api injection', () => {
		const browser = chrome;
		const message = {greeting: 'hello?'};
		const response = {greeting: 'here I am'};
		const callbackSpy = jest.fn();

		browser.runtime.sendMessage.mockImplementation(
			(_message, callback) => {
				callback(response);
			}
		);

		browser.runtime.sendMessage(message, callbackSpy);

		expect(browser.runtime.sendMessage).toBeCalledWith(
			message,
			callbackSpy
		);
		expect(callbackSpy).toBeCalledWith(response);
	});

	test('blocker script on website', async () => {
		const {window} = page;
		await blocker.runBlocker();
	});
});

