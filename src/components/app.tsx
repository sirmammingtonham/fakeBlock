import React, {Component} from 'react';
import {render} from 'react-dom';

export default class App extends Component {
	async buttonclick() {
		const enabled = await chrome.storage.sync.get('enabled');
		chrome.storage.sync.set({
			enabled
		});
	}

	render() {
		return <button onClick={this.buttonclick}>Click me!</button>;
	}
}
const appContainer = document.querySelector('#app');
render(<App />, appContainer);
