// import {browser} from 'webextension-polyfill-ts';
import React from 'react';
import {render} from 'react-dom';
import {Chip, Container, Box} from '@material-ui/core';
import {Warning, Error} from '@material-ui/icons';
import {AggregateLabels, CategoryLabels} from '../detection/classifier';
import {Doughnut, Polar} from 'react-chartjs-2';
import '../../style/result.scss';

interface ClassifierOutput {
	logitsAggregate: number[];
	logitsCategory: number[];
	probsAggregate: number[];
	probsCategory: number[];
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

		for (const [index, prob] of result.probsCategory.entries()) {
			// since 8 categories, if anything is significantly over 12.5% we want to display it
			if (prob > 0.125) {
				chips.push(<Chip color="primary" label={this.camelCaseToNormal(CategoryLabels[index])} icon={<Warning />} />, <span>&nbsp;&nbsp;</span>);
			}
		}

		const aggregateData = {
			labels: Object.values(AggregateLabels).slice(0, 3),
			datasets: [
				{
					label: 'Aggregate Data',
					data: result.probsAggregate,
					backgroundColor: [
						'rgba(255, 206, 86, 1)',
						'rgba(54, 162, 235, 1)',
						'rgba(255, 99, 132, 1)'
					]
					// borderColor: [
					// 	'rgba(255, 99, 132, 1)',
					// 	'rgba(54, 162, 235, 1)',
					// 	'rgba(255, 206, 86, 1)'
					// ],
					// borderWidth: 1
				}
			]
		};

		const categoryData = {
			labels: Object.values(CategoryLabels).slice(0, 8),
			datasets: [
				{
					label: 'Category Data',
					data: result.probsCategory,
					backgroundColor: [
						'rgba(255, 99, 132, 1)',
						'rgba(255, 159, 64, 1)',
						'rgba(255, 205, 86, 1)',
						'rgba(75, 192, 192, 1)',
						'rgba(54, 162, 235, 1)',
						'rgba(153, 102, 255, 1)',
						'rgba(88, 199, 200, 1)',
						'rgba(201, 203, 207, 1)'
					],
					borderColor: [
						'rgb(255, 99, 132)',
						'rgb(255, 159, 64)',
						'rgb(255, 205, 86)',
						'rgb(75, 192, 192)',
						'rgb(54, 162, 235)',
						'rgb(153, 102, 255)',
						'rgb(88, 199, 200)',
						'rgb(201, 203, 207)'
					],
					borderWidth: 1
				}
			]
		};

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
				<div className="graph-container">
					<Doughnut data={aggregateData} />
					<Polar data={categoryData} />
				</div>
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
