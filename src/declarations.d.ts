// so we can import scss files in react
declare module '*.scss' {
	const content: Record<string, string>;
	export = content;
}
