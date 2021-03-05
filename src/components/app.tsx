import {browser} from 'webextension-polyfill-ts';
import React, {Component} from 'react';
import {render} from 'react-dom';

export default class App extends Component {
	// enabled: boolean;
	// constructor(props: any) {
	// 	super(props);
	// }
	async buttonclick() {
		const retrieved = await browser.storage.local.get('enabled');
		const enabled = !retrieved.enabled ?? true; // check if anything is assigned

		(async () => {
			await browser.storage.local.set({
				enabled
			});
			await browser.tabs.reload();
		})();
	}

	render() {
		return <button onClick={this.buttonclick}>Toggle fakeBlock!</button>;
	}
}
const appContainer = document.querySelector('#app');
render(<App />, appContainer);
