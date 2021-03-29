import {browser} from 'webextension-polyfill-ts';
import React from 'react';
import {FormControlLabel, Switch, withStyles, Grid} from '@material-ui/core';
import {render} from 'react-dom';
import LinearWithValueLabel from './progressbar';
import WhiteList from './whitelist';

type PopupProps = any;
type PopupState = {powerOn: boolean; whitelist: string[]};

export default class Popup extends React.Component<PopupProps, PopupState> {
	constructor(props: PopupProps) {
		super(props);
		this.state = {
			powerOn: true,
			whitelist: []
		};
		this.buttonClick = this.buttonClick.bind(this);
	}

	async buttonClick() {
		const retrieved = await browser.storage.local.get('enabled');
		const enabled = !retrieved.enabled ?? true; // check if anything is assigned
		await browser.storage.local.set({
			enabled
		});
		await browser.tabs.reload();
		await browser.browserAction.setIcon({path: enabled ? '../assets/icon.png' : '../assets/icon_disabled.png'});

		this.setState({...this.state, powerOn: enabled});
	}

	async componentDidMount() {
		const enabled: boolean = (await browser.storage.local.get('enabled'))?.enabled ?? true;
		const disabledList: string[] = (await browser.storage.local.get('whitelist'))?.whitelist ?? [];
		this.setState({...this.state, powerOn: enabled, whitelist: disabledList});
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

		return (
			<div>
				<Grid item xs={12} md={12}>
					<FormControlLabel
						control = {<BigSwitch checked={this.state.powerOn} name="power" color="secondary" onChange={this.buttonClick}></BigSwitch>}
						label = {this.state.powerOn ? 'Power on' : ' Power off'}
					/>
					<LinearWithValueLabel percentage={60}/>
					<hr></hr>
					<WhiteList webs={this.state.whitelist}/>
				</Grid>
			</div>
		);
	}
}
const appContainer = document.querySelector('#app');
render(<Popup />, appContainer);
