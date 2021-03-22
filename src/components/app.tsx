import {browser} from 'webextension-polyfill-ts';
import React from 'react';
import {FormControlLabel, Switch} from '@material-ui/core';
import {render} from 'react-dom';
import Demo from './progressbar';

type MyState = {powerOn: boolean; infoblocker: boolean; infowarning: boolean};
export default class App extends React.Component<Record<string, unknown>, MyState> {
	// enabled: boolean;
	constructor(props: any) {
		super(props);
		this.state = {
			powerOn: true,
			infoblocker: false,
			infowarning: true
		};
		this.buttonClick = this.buttonClick.bind(this);
	}

	async buttonClick() { // event: any
		const retrieved = await browser.storage.local.get('enabled');
		const enabled = !retrieved.enabled ?? true; // check if anything is assigned
		// console.log(enabled);
		await browser.storage.local.set({
			enabled
		});
		await browser.tabs.reload();
		this.setState({...this.state, powerOn: enabled});
		console.log(this.state.powerOn);
		console.log(enabled);
	}

	async componentDidMount() {
		const retrieved = await browser.storage.local.get('enabled');
		const enabled = retrieved.enabled ?? true; // check if anything is assigned
		this.setState({powerOn: enabled});
	}

	render() {
		return (<div><FormControlLabel
			control = {<Switch checked={this.state.powerOn} name="power" color="secondary" onChange={this.buttonClick}></Switch>}
			label = {this.state.powerOn ? 'Power on' : ' Power off'}
		/>
		<Demo/>
		<hr></hr>
		<h2>bruh</h2>
		</div>
		);
		//  <Button variant= "contained" color= "secondary" onClick={this.buttonclick}>Toggle fakeBlock!</Button>;
	}
}
const appContainer = document.querySelector('#app');
render(<App />, appContainer);
