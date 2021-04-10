export const enum Websites {
	kOther,
	kTwitter,
	kFacebook,
	kNewsSite
}

export function pageType(url: string): Websites {
	if (url.includes('twitter.com')) {
		return Websites.kTwitter;
	}

	if (url.includes('facebook.com')) {
		return Websites.kFacebook;
	}
	const newslist = require('../../assets/news-list.json');
	for(var i = 0; i < newslist.newssites.length; i++)
	{
		if(url.includes(newslist[i]))
		{
			return Websites.kNewsSite;
		}
	}
	return Websites.kOther;
}
