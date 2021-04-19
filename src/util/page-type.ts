import * as newsList from '../../assets/news-list.json';

export const enum Websites {
	kOther,
	kTwitter,
	kFacebook,
	kNewsSite
}

/// utility function to allow us to tailor interface on specific sites
export function pageType(url: string): Websites {
	if (url.includes('twitter.com')) {
		return Websites.kTwitter;
	}

	if (url.includes('facebook.com')) {
		return Websites.kFacebook;
	}

	for (const newsSite of newsList.sites) {
		if (url.includes(newsSite)) {
			return Websites.kNewsSite;
		}
	}

	return Websites.kOther;
}
