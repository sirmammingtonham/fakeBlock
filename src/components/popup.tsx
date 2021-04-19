import {browser} from 'webextension-polyfill-ts';
import React from 'react';
import {FormControlLabel, Switch, withStyles, Grid} from '@material-ui/core';
import {render} from 'react-dom';
import LinearWithValueLabel from './progressbar';
import WhiteList from './whitelist';

type PopupProps = any;
type PopupState = {powerOn: boolean; whitelist: string[]; collapsibleCount: number};

export default class Popup extends React.Component<PopupProps, PopupState> {
	constructor(props: PopupProps) {
		super(props);
		this.state = {
			powerOn: true,
			whitelist: [],
			collapsibleCount: 0
		};
		this.buttonClick = this.buttonClick.bind(this);
		this.logStorageChange = this.logStorageChange.bind(this);
	}

	async buttonClick() {
		const retrieved = await browser.storage.local.get('enabled');
		const enabled = !retrieved.enabled ?? true; // check if anything is assigned
		await browser.storage.local.set({
			enabled
		});
		await browser.tabs.reload();
		await browser.browserAction.setBadgeText({text: ''});
		await browser.browserAction.setIcon({path: enabled ? '../assets/icon.png' : '../assets/icon_disabled.png'});

		this.setState({...this.state, powerOn: enabled});
	}

	logStorageChange(changes: any, area: any) {
		const changedItems = Object.keys(changes);

		for (const item of changedItems) {
			console.log(area);
			console.log(changes[item].newValue);
			if (item !== 'enabled') {
				this.setState({...this.state, collapsibleCount: changes[item].newValue});
			}
		}
	}

	async componentDidMount() {
		const enabled: boolean = (await browser.storage.local.get('enabled'))?.enabled ?? true;
		const disabledList: string[] = (await browser.storage.local.get('whitelist'))?.whitelist ?? [];
		// const tabs: any = await browser.tabs.query({active: true, currentWindow: true});
		// const response: any = await browser.tabs.sendMessage(tabs[0].id, {type: 'getCount'});
		// if (typeof response === 'undefined') {
		// 	console.log('undefined count');
		// } else {
		// 	console.log(response);
		// 	this.setState({...this.state, collapsibleCount: response});
		// }
		// const data: any = await browser.storage.local.get('ct');
		// console.log(data.ct);
		const count = (await browser.storage.local.get('count'))?.count ?? 0;
		// await browser.storage.local.set({count});
		browser.storage.onChanged.addListener(this.logStorageChange);
		// if (!enabled) {
		// 	await browser.storage.local.set({
		// 		ct: 0
		// 	});
		// }

		this.setState({...this.state, powerOn: enabled, whitelist: disabledList, collapsibleCount: count});
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
					<LinearWithValueLabel percentage={this.state.collapsibleCount}/>
					<hr></hr>
					<WhiteList webs={this.state.whitelist}/>
				</Grid>
			</div>
		);
	}
}
const appContainer = document.querySelector('#app');
render(<Popup />, appContainer);
