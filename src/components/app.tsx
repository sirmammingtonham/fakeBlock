import {browser} from 'webextension-polyfill-ts';
import React from 'react';
import {FormControlLabel, Switch} from '@material-ui/core';
import {render} from 'react-dom';
import Demo from './progressbar';
type MyState = {poweron: boolean; infoblocker: boolean; infowarning: boolean};
export default class App extends React.Component<Record<string, unknown>, MyState> {
	// enabled: boolean;
	constructor(props: any) {
		super(props);
		this.state = {
			poweron: true,
			infoblocker: false,
			infowarning: true
		};
		this.buttonclick = this.buttonclick.bind(this);
	}

	async buttonclick(event: any) {
		const retrieved = await browser.storage.local.get('enabled');
		const enabled = !retrieved.enabled ?? true; // check if anything is assigned
		this.setState({...this.state, [event.target.name]: !event.target.checked});
		console.log(this.state.poweron);
		(async () => {
			await browser.storage.local.set({
				enabled
			});
			await browser.tabs.reload();
		})();
	}

	render() {
		return (<div><FormControlLabel
			control = {<Switch checked={this.state.poweron} name="poweron" color="secondary" onChange={this.buttonclick}></Switch>}
			label = {this.state.poweron ? 'Power on' : ' Power off'}
		/>
		<FormControlLabel
			control = {<Switch checked={this.state.infoblocker} name="infoblocker" color="primary" onChange={this.buttonclick}></Switch>}
			label = {this.state.infoblocker ? 'blocker on' : ' blocker off'}
		/>
		<FormControlLabel
			control = {<Switch checked={this.state.infowarning} name="infowarning" color="primary" onChange={this.buttonclick}></Switch>}
			label = {this.state.infowarning ? 'warning overlay on' : 'warning overlay off'}
		/>
		<Demo/>
		<hr></hr>
		<h2>Playing around with stuffs</h2>
		</div>
		);
		//  <Button variant= "contained" color= "secondary" onClick={this.buttonclick}>Toggle fakeBlock!</Button>;
	}
}
const appContainer = document.querySelector('#app');
render(<App />, appContainer);
