import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

function parseTableJson(data: any): Record<string, any> {
	const object = {};
	for (const element of data.table.rows) {
		object[element.c[0].v] = {
			url: element.c[0].v,
			categories: element.c[1].v.split(', '),
			sources: element.c[2].v.split(', ').map(
				(element: any) => /<a\s+(?:[^>]*?\s+)?href=(["'])(.*?)\1/.exec(element)[2]
			),
			rank: element.c[3].v
		};
	}

	return object;
}

// add webscraping scripts here if we need them
export async function exportCJRIndex() {
	const queryString = encodeURIComponent('SELECT A, B, C, D');
	const response = await axios
		.get('https://docs.google.com/spreadsheets/d/1ck1_FZC-97uDLIlvRJDTrGqBk0FuDe9yHkluROgpGS8/gviz/tq?gid=964996204&headers=1&tq=' + queryString); // 'https://www.cjr.org/fake-beta'
	const data = JSON.parse(response.data.slice(47, -2));
	const output = parseTableJson(data);
	await fs.promises.writeFile(path.join(__dirname, '/../../assets/cjrindex.json'), JSON.stringify(output));
}
