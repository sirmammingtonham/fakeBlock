import React from 'react';
import PropTypes from 'prop-types';
import {makeStyles, LinearProgress, Typography, Box} from '@material-ui/core';

function LinearProgressWithLabel(props: any) {
	return (
		<Box display="flex" alignItems="center">
			<Box width="100%" mr={1}>
				<LinearProgress variant="determinate" {...props} />
			</Box>
			<Box minWidth={270}>
				<Typography variant="body2" color="textSecondary">{`Fake Info Percentage: ${Math.round(
					props.value
				)}%`}</Typography>
			</Box>
		</Box>
	);
}

LinearProgressWithLabel.propTypes = {
	/**
   * The value of the progress indicator for the determinate and buffer variants.
   * Value between 0 and 100.
   */
	value: PropTypes.number.isRequired
};

const useStyles = makeStyles({
	root: {
		width: '80%'
	}
});

export default function LinearWithValueLabel() {
	const classes = useStyles();
	const [progress, setProgress] = React.useState(10);

	React.useEffect(() => {
		const timer = setInterval(() => {
			setProgress(previousProgress => (previousProgress >= 100 ? 10 : previousProgress + 10));
		}, 800);
		return () => {
			clearInterval(timer);
		};
	}, []);

	return (
		<div className={classes.root}>
			<LinearProgressWithLabel value={progress} />
		</div>
	);
}
