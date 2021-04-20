import {browser} from 'webextension-polyfill-ts';
import React from 'react';
import {Grid, Avatar, IconButton, List, ListItem, ListItemAvatar, ListItemSecondaryAction, ListItemText, Typography, makeStyles, TextField} from '@material-ui/core';

import WebIcon from '@material-ui/icons/Web.js';
import DeleteIcon from '@material-ui/icons/Delete.js';
import AddIcon from '@material-ui/icons/Add.js';

// Styles for whitelist
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
// pass in parameter from popup through props
type WebsiteProps = {webs: string[]};

export default function WhiteList(props: WebsiteProps) {
	const classes = useStyles();
	const [websites, setWebs] = React.useState(props.webs);
	const [value, setValue] = React.useState('');

	// called when the component is mounted
	React.useEffect(() => {
		async function setDisablelist() {
			const disableList = (await browser.storage.local.get('whitelist'))?.whitelist ?? [];
			setWebs(disableList);
		}

		void setDisablelist();
	}, []);

	// function that supports the list
	const listWeb = () => {
		const deleteWeb = async (name: string) => {
			let webs: string[] = websites;
			webs = webs.filter(object => object !== name);

			setWebs(webs);

			await browser.storage.local.set({
				whitelist: webs
			});
			await browser.tabs.reload();
		};

		const addWeb = async (name: string) => {
			const webs = [...websites, name];
			setWebs(webs);

			await browser.storage.local.set({
				whitelist: webs
			});
			await browser.tabs.reload();
		};

		// the list part of the component
		const listItems = websites.map((web: string, index: number) =>
			<ListItem key={`whitelist_${index}`}>
				<ListItemAvatar>
					<Avatar>
						<WebIcon/>
					</Avatar>
				</ListItemAvatar>
				<ListItemText
					primary={web}
					secondary={null}
				/>
				<ListItemSecondaryAction>
					<IconButton edge="end" aria-label="delete" onClick={ async () => {
						await deleteWeb(web);
					}}>
						<DeleteIcon/>
					</IconButton>
				</ListItemSecondaryAction>
			</ListItem>
		);

		// the add button of the component
		const addButton = <IconButton edge="end" aria-label="delete" onClick={ async () => {
			await addWeb(value);
		}}><AddIcon/></IconButton>;

		const handleChange = (event: any) => {
			setValue(event.target.value);
		};

		// a text field where user can enter the website name
		const addForm = <TextField
			key="whitelist_input"
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
