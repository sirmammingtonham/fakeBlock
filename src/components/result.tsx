// import {browser} from 'webextension-polyfill-ts';
import React from 'react';
import {render} from 'react-dom';
import {Chip, Container, Box} from '@material-ui/core';
import {Warning, Announcement, SentimentVeryDissatisfied} from '@material-ui/icons';
export default class Result extends React.Component {
	render() {
		return (
			<div>
				<Container maxWidth="sm">
					<h1>The text was blocked for the following reasons.</h1>
				</Container>
				<Container maxWidth="sm">
					<Chip color="secondary" label="Fake News" icon={<Announcement />} />
					<Chip color="secondary" label="Deepfaked" icon={<Warning />} />
					<Chip color="primary" label="Based" icon={<SentimentVeryDissatisfied />} />
				</Container>
				<Container maxWidth="sm">
					<h1>Here are some stats you may be interested in:</h1>
					<Box>
						<p>Wow stat goes here</p>
						<p>Another one</p>
					</Box>
				</Container>
			</div>
		);
	}
}
render(<Result />, document.querySelector('#result'));
