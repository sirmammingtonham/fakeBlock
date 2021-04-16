// import {browser} from 'webextension-polyfill-ts';
import React from 'react';
import {render} from 'react-dom';
import {Chip, Container, Box} from '@material-ui/core';
import {Warning, Error} from '@material-ui/icons';
import {AggregateLabels, CategoryLabels} from '../detection/classifier';

interface ClassifierOutput {
	logitsAggregate: Record<number, number>;
	logitsCategory: Record<number, number>;
	probsAggregate: Record<number, number>;
	probsCategory: Record<number, number>;
	valueAggregate: number;
	valueCategory: number;
}
export default class Result extends React.Component {
	public render() {
		const parameters = new URLSearchParams(window.location.search);
		const rawResult = parameters.get('res');
		if (rawResult === null) {
			return (<div></div>); // replace with error component later
		}

		const result: ClassifierOutput = JSON.parse(rawResult);

		const chips = [];
		chips.push(<Chip color="secondary" label={this.camelCaseToNormal(AggregateLabels[result.valueAggregate])} icon={<Error />} />, <span>&nbsp;&nbsp;</span>);

		for (const [index, prob] of Object.entries(result.probsCategory)) {
			// since 8 categories, if anything is significantly over 12.5% we want to display it
			if (prob > 0.125) {
				chips.push(<Chip color="primary" label={this.camelCaseToNormal(CategoryLabels[Number.parseInt(index, 10)])} icon={<Warning />} />, <span>&nbsp;&nbsp;</span>);
			}
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
						<h3>Percent Confidence: {result.probsAggregate[result.valueAggregate]}</h3>
					</Box>
				</Container>
			</div>
		);
	}

	private camelCaseToNormal(input: string | undefined) {
		if (!input) {
			return '';
		}

		return input
			.replace(/([A-Z])/g, ' $1')
			.replace(/^./, string => {
				return string.toUpperCase();
			});
	}
}
render(<Result />, document.querySelector('#result'));
