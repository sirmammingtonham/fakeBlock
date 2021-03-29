import React from 'react';
import {Grid, Avatar, IconButton, List, ListItem, ListItemAvatar, ListItemSecondaryAction, ListItemText, Typography, makeStyles, TextField} from '@material-ui/core';

import EcoIcon from '@material-ui/icons/Eco.js';
import DeleteIcon from '@material-ui/icons/Delete.js';
import AddIcon from '@material-ui/icons/Add.js';
const useStyles = makeStyles((theme: any) => ({
	root: {
		flexGrow: 1,
		maxWidth: 752
	},
	demo: {
		backgroundColor: theme.palette.background.paper
	},
	title: {
		margin: theme.spacing(4, 0, 2)
	}
}));

export default function WhiteList(props: any) {
	const classes = useStyles();
	const [websites, setWebs] = React.useState(props.webs);
	const [value, setValue] = React.useState('');

	const listWeb = () => {
		const webs = websites;
		const deleteWeb = (name: string) => {
			let webs: string[] = websites;
			webs = webs.filter(object => object !== name);

			setWebs(webs);
		};

		const addWeb = (name: string) => {
			setWebs([...websites, name]);
		};

		const listItems = webs.map((web: string) =>
			<ListItem>
				<ListItemAvatar>
					<Avatar>
						<EcoIcon/>
					</Avatar>
				</ListItemAvatar>
				<ListItemText
					primary={web}
					secondary={null}
				/>
				<ListItemSecondaryAction>
					<IconButton edge="end" aria-label="delete" onClick={() => {
						deleteWeb(web);
					}}>
						<DeleteIcon/>
					</IconButton>
				</ListItemSecondaryAction>
			</ListItem>
		);
		const addButton = <IconButton edge="end" aria-label="delete" onClick={() => {
			addWeb(value);
		}}><AddIcon/></IconButton>;

		const handleChange = (event: any) => {
			setValue(event.target.value);
		};

		const addForm = <TextField
			key="bruh"
			id="standard-multiline-flexible"
			label="e.g. Twitter.com"
			value={value}
			onChange={handleChange}
		/>;
		return <div><List>{listItems}</List><hr></hr>{addForm}{addButton}</div>;
	};

	return (
		<div className={classes.root}>
			<Grid container spacing={2}>
				<Grid item xs={12} md={6}>
					<Typography variant="h6" className={classes.title}>
            Website Whitelist
					</Typography>
					<div className={classes.demo}>
						<List>
							{ /* we spent an hour on this and the solution was to use {listWeb()} instead of </listWeb> ffs */ }
							{ listWeb() }
						</List>
					</div>
				</Grid>
			</Grid>
		</div>
	);
}
