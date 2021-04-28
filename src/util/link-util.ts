import CJRIndex from '../../assets/cjrindex.json';

const domainRegex = new RegExp(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:/\n?]+)/);

export function checkLinks() {
	const elementArray = document.querySelectorAll('a');
	for (const element of elementArray) {
		const subDomain = domainRegex.exec(element.href)?.[0];
		if (subDomain) {
			// these websites have a million links to themselves,
			// should ignore otherwise page will get bloated with warnings
			const shouldSkip = window.location.origin.includes(subDomain);
			if (!shouldSkip && subDomain in CJRIndex) {
				const indexEntry = CJRIndex[subDomain as keyof typeof CJRIndex];
				console.log('found sketchy link!');
				element.classList.add('linkSus');
				element.append(`<span class="linkSusText">Link's website reported as ${indexEntry.categories as unknown as string}!</span>`);
			}
		}
	}
}

export function checkDisablelist(href: string, disableList: string[]) {
	for (const url of disableList) {
		const subDomain = domainRegex.exec(url);
		if (subDomain && href.includes(subDomain[1])) {
			return false;
		}
	}

	return true;
}
