import React from 'react';
import PropTypes from 'prop-types';
import {makeStyles, LinearProgress, Typography, Box} from '@material-ui/core';

function LinearProgressWithLabel(props: any) {
	console.log(`percentage:${props.value}`);
	return (
		<Box display="flex" alignItems="center">
			<Box width="100%" mr={1}>
				<LinearProgress variant="determinate" {...props} />
			</Box>
			<Box minWidth={270}>
				<Typography variant="body2" color="textSecondary">{`Number of fake info detected: ${Math.round(
					props.value
				)}`}</Typography>
			</Box>
		</Box>
	);
}

LinearProgressWithLabel.propTypes = {
	value: PropTypes.number.isRequired
};

const useStyles = makeStyles({
	root: {
		width: '80%'
	}
});

export default function LinearWithValueLabel(props: any) {
	const classes = useStyles();
	const progress = props.percentage;

	return (
		<div className={classes.root}>
			<LinearProgressWithLabel value={progress} />
		</div>
	);
}
