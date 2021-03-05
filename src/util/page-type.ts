export function pageType(url: string): string {
	enum Site {
		'https://twitter.com' = 'twitter',
		'https://www.facebook.com' = 'facebook'
	}
	console.log(url);
	if (url in Site) {
		return Site[url as keyof typeof Site];
	}

	return 'OTHER';
}
