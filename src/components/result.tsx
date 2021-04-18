// import {browser} from 'webextension-polyfill-ts';
import React from 'react';
import ReactTooltip from 'react-tooltip';
import styles from '../../style/result.scss';
import {render} from 'react-dom';
import {Chip, Container} from '@material-ui/core';
import {Warning, Error, Info} from '@material-ui/icons';
import {AggregateLabels, CategoryLabels} from '../detection/classifier';
import {Bar, Doughnut, Polar} from 'react-chartjs-2';

interface ClassifierOutput {
	logitsAggregate: number[];
	logitsCategory: number[];
	probsAggregate: number[];
	probsCategory: number[];
	valueAggregate: number;
	valueCategory: number;
}

export default class Result extends React.Component {
	/**
	 *
	 * Creates tags and charts from classifier output
	 *
	 * @returns results page
	 */
	public render() {
		const parameters = new URLSearchParams(window.location.search);
		const rawResult = parameters.get('res');
		if (rawResult === null) {
			return (<div></div>); // replace with error component later
		}

		const result: ClassifierOutput = JSON.parse(rawResult);
		const aggregateConfidence = (result.probsAggregate[result.valueAggregate]! * 100).toFixed(2);

		// Creates chips from aggregate and category labels for the specified result
		const chips = [];
		chips.push(<Chip color="secondary" label={this.camelCaseToNormal(AggregateLabels[result.valueAggregate])} icon={<Error />} />, <span>&nbsp;&nbsp;</span>);

		for (const [index, prob] of result.probsCategory.entries()) {
			// since 8 categories, if anything is significantly over 12.5% we want to display it
			if (prob > 0.125) {
				chips.push(<Chip color="primary" label={this.camelCaseToNormal(CategoryLabels[index])} icon={<Warning />} />, <span>&nbsp;&nbsp;</span>);
			}
		}

		// Data for Aggregates
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
				}
			]
		};

		// Data for Categories
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

		// Data for Aggregate Logits
		const logitsAggregateData = {
			labels: Object.values(AggregateLabels).slice(0, 3),
			datasets: [
				{
					type: 'line',
					label: 'Line',
					data: result.logitsAggregate
				},
				{
					type: 'bar',
					label: 'Bar',
					data: result.logitsAggregate,
					backgroundColor: [
						'rgba(255, 206, 86, 1)',
						'rgba(54, 162, 235, 1)',
						'rgba(255, 99, 132, 1)'
					]
				}
			]
		};

		// Data for Categorical Logits
		const logitsCategoryData = {
			labels: Object.values(CategoryLabels).slice(0, 8),
			datasets: [
				{
					type: 'line',
					label: 'Line',
					data: result.logitsCategory,
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
				},
				{
					type: 'bar',
					label: 'Bar',
					data: result.logitsCategory,
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
					{/* <h1>The text was blocked for the following reasons.</h1> */}
					<h1 style={{textAlign: 'center'}}>fakeBlock is {aggregateConfidence}% confident that the text is <br/>
						<span className={styles.color__secondary}> {this.camelCaseToNormal(AggregateLabels[result.valueAggregate])}</span>
					</h1>
				</Container>
				<Container maxWidth="sm">
					<h1>We flagged the text with the following tags:</h1>
					{chips}
				</Container>
				<Container maxWidth="sm">
					<h1>Here are some stats you may be interested in:</h1>
				</Container>
				<Container maxWidth="sm">
					<div className={styles.graph__header}>
						<h2>Reliability Probability Breakdown &nbsp;</h2>
						<Info
							data-for="global-tooltip"
							data-tip="Neural Network Probability Outputs for Reliability Classes"
						/>
						<Doughnut data={aggregateData} />
					</div>
				</Container>
				<Container maxWidth="sm">
					<div className={styles.graph__header}>
						<h2>Category Probability Breakdown &nbsp;</h2>
						<Info
							data-for="global-tooltip"
							data-tip="Neural Network Probability Outputs for Category Classes"
						/>
						<Polar data={categoryData} />
					</div>
				</Container>
				<Container maxWidth="sm">
					<div className={styles.graph__header}>
						<h2>Aggregate Logits Breakdown&nbsp;</h2>
						<Info
							data-for="global-tooltip"
							data-tip="Raw Neural Network Outputs for Reliability Classes (aggregate)"
						/>
					</div>
					<Bar data={logitsAggregateData} />
				</Container>
				<Container maxWidth="sm">
					<div className={styles.graph__header}>
						<h2>Category Logits Breakdown&nbsp;</h2>
						<Info
							data-for="global-tooltip"
							data-tip="Raw Neural Network Outputs for Category Classes"
						/>
					</div>
					<Bar data={logitsCategoryData} />
				</Container>
				<ReactTooltip id="global-tooltip" effect="solid"/>
			</div>
		);
	}

	/**
	 *
	 * Utility function for formatting classifier tags to be more legible
	 *
	 * @param input a string
	 * @returns an empty string if input is null; otherwise, returns a noncamelCase string
	 */
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
