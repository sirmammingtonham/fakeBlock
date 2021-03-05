import axios from 'axios';
import * as fs from 'fs';

function parseTableJson(data: any):{} {
	const obj = {};
	data.table.rows.forEach((element: any) => {
		obj[element.c[0].v] = {
			url: element.c[0].v,
			categories: element.c[1].v.split(', '),
			sources: element.c[2].v.split(', ').map(
				(element: any) => /<a\s+(?:[^>]*?\s+)?href=(["'])(.*?)\1/.exec(element)[2]
			),
			rank: element.c[3].v
		}
	});
	return obj;
}

// add webscraping scripts here if we need them
export function exportCJRIndex() {
	const queryString = encodeURIComponent('SELECT A, B, C, D');
	axios
	.get('https://docs.google.com/spreadsheets/d/1ck1_FZC-97uDLIlvRJDTrGqBk0FuDe9yHkluROgpGS8/gviz/tq?gid=964996204&headers=1&tq=' + queryString)  // 'https://www.cjr.org/fake-beta'
	.then((response: any) => {
		const data = JSON.parse(response.data.slice(47,response.data.length-2));
		const output = parseTableJson(data);
		fs.writeFile(__dirname + '/../assets/cjrindex.json', JSON.stringify(output), (err) => {
			if (err) console.log('Error writing file:', err)
		});
	})
	.catch((error: any) => {
		console.error(error);
	});
}