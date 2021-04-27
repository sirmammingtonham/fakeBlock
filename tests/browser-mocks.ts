import type {Browser} from 'webextension-polyfill-ts';
import {deepMock} from 'mockzilla';

export const [browser, mockBrowser, mockBrowserNode] = deepMock<Browser>('browser', false);
