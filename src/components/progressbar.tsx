import React from 'react';
import {makeStyles, LinearProgress, Typography, Box} from '@material-ui/core';

function LinearProgressWithLabel(props: any) {
	return (
		<Box display="flex" alignItems="center">
			<Box width="100%" mr={1}>
				<LinearProgress variant="determinate" {...props} />
			</Box>
			<Box minWidth={270}>
				<Typography variant="body2" color="textSecondary">{`Detected ${Math.round(
					props.value
				)} untrustworthy paragraphs.`}</Typography>
			</Box>
		</Box>
	);
}

// styles for progressbar
const useStyles = makeStyles({
	root: {
		width: '80%'
	}
});

export default function LinearWithValueLabel(props: any) {
	const classes = useStyles();
	// pass in progress data as a prop instead of state for better code clarity
	const progress = props.percentage;
	return (
		<div className={classes.root}>
			<LinearProgressWithLabel value={progress} />
		</div>
	);
}
