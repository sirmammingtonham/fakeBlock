import {pageType, Websites} from '../src/util/page-type';

test('pageType twitter', () => {
	const r = pageType('https://twitter.com/DaBaby80197437');
	expect(r).toBe(Websites.kTwitter);
});

test('pageType facebook', () => {
	const r = pageType('https://www.facebook.com/pokimane');
	expect(r).toBe(Websites.kFacebook);
});

test('pageType other', () => {
	const r = pageType('https://www.github.com');
	expect(r).toBe(Websites.kOther);
});

