// import {browser} from 'webextension-polyfill-ts';
import React from 'react';
import {render} from 'react-dom';
import {Chip, Container, Box} from '@material-ui/core';
import {Warning} from '@material-ui/icons';
export default class Result extends React.Component {
	render() {
		const parameters = new URLSearchParams(window.location.search);
		const categories = parameters.getAll('cat');
		const chips = [];
		for (const cat of categories.entries()) {
			chips.push(<Chip color="secondary" label={cat} icon={<Warning />} />);
		}

		return (
			<div>
				<Container maxWidth="sm">
					<h1>The text was blocked for the following reasons.</h1>
				</Container>
				<Container maxWidth="sm">
					{chips}
				</Container>
				<Container maxWidth="sm">
					<h1>Here are some stats you may be interested in:</h1>
					<Box>
						<p>Percent Confidence: {parameters.get('conf')}</p>
					</Box>
				</Container>
			</div>
		);
	}
}
render(<Result />, document.querySelector('#result'));
