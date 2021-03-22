// import {browser} from 'webextension-polyfill-ts';
import React from 'react';
import {render} from 'react-dom';

export default class Result extends React.Component {
	state = {
		count: 0
	};

	increment = () => {
		this.setState({
			count: (this.state.count + 1)
		});
	};

	decrement = () => {
		this.setState({
			count: (this.state.count - 1)
		});
	};

	render() {
		return (
			<div>
				<h1>{this.state.count}</h1>
				<button onClick={this.increment}>Increment</button>
				<button onClick={this.decrement}>Decrement</button>
			</div>
		);
	}
}
render(<Result />, document.querySelector('#result'));
