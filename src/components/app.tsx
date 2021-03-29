import {browser} from 'webextension-polyfill-ts';
import React from 'react';
import {FormControlLabel, Switch, withStyles, Grid} from '@material-ui/core';
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
	}

	async componentDidMount() {
		const retrieved = await browser.storage.local.get('enabled');
		const enabled = retrieved.enabled ?? true; // check if anything is assigned
		this.setState({powerOn: enabled});
	}

	render() {
		const BigSwitch = withStyles({
			root: {
				width: 92,
				height: 46,
				marginRight: 15,
				marginLeft: 10
			},
			switchBase: {
				padding: 1,
				'&$checked': {
					transform: 'translateX(45px)'
				}
			},
			thumb: {
				width: 44,
				height: 44
			},
			track: {
				borderRadius: 46 / 2
			},
			checked: {}
		})(Switch);

		return (<div><Grid item xs={12} md={12}><FormControlLabel
			control = {<BigSwitch checked={this.state.powerOn} name="power" color="secondary" onChange={this.buttonClick}></BigSwitch>}
			label = {this.state.powerOn ? 'Power on' : ' Power off'}
		/>
		<Demo/>
		</Grid>
		<hr></hr>
		</div>
		);
		//  <Button variant= "contained" color= "secondary" onClick={this.buttonclick}>Toggle fakeBlock!</Button>;
	}
}
const appContainer = document.querySelector('#app');
render(<App />, appContainer);
