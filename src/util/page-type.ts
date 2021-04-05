export const enum Websites {
	kOther,
	kTwitter,
	kFacebook
}

export function pageType(url: string): Websites {
	if (url.includes('twitter.com')) {
		return Websites.kTwitter;
	}

	if (url.includes('facebook.com')) {
		return Websites.kFacebook;
	}

	return Websites.kOther;
}
