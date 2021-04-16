import $ from 'jquery'; // convert this to not use json later
import * as CJRIndex from '../../assets/cjrindex.json';

export function checkLinks() {
	const domainRegex = /^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:/\n?]+)/;
	// should make this look nicer
	$('a').each(function (this: any) {
		const subDomain: keyof typeof CJRIndex = this.href.match(domainRegex)[1];
		// these websites have a million links to themselves,
		// should ignore otherwise page will get bloated with warnings
		const shouldSkip = window.location.origin.includes(subDomain);
		if (!shouldSkip && subDomain in CJRIndex) {
			const indexEntry = CJRIndex[subDomain];
			console.log('found sketchy link!');
			$(this).addClass('linkSus');
			$(this).append(`<span class="linkSusText">Link's website reported as ${indexEntry.categories as unknown as string}!</span>`);
		}
	});
}
