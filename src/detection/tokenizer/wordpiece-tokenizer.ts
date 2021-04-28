import vocab from './vocab.json';
type Child = Record<string, TrieNode>;

/**
 * Trie node
 */
class TrieNode {
	key: string | null;
	parent: TrieNode | null;
	children: Child;
	end: boolean;
	score: number;
	index: number;

	constructor(key: string | null) {
		this.key = key;
		this.parent = null;
		this.children = {};
		this.end = false;
	}

	getWord() {
		const output: string[] = [];
		let node: TrieNode | null = this; // eslint-disable-line @typescript-eslint/no-this-alias, unicorn/no-this-assignment
		while (node !== null) {
			if (node.key !== null) {
				output.unshift(node.key);
			}

			node = node.parent;
		}

		return [output, this.score, this.index];
	}
}

/**
 * Simple trie class
 */
class Trie {
	root: TrieNode | undefined;

	constructor() {
		this.root = new TrieNode(null);
	}

	insert(word: string, score: number, index: number) {
		let node = this.root;

		const symbols: string[] = [];
		for (const symbol of word) {
			symbols.push(symbol);
		}

		for (let i = 0; i < symbols.length; i++) {
			const symbol = symbols[i]!;
			if (node && !node.children[symbol]) {
				node.children[symbol] = new TrieNode(symbol);
				node.children[symbol]!.parent = node;
			}

			node = node?.children[symbol];
			if (node && i === symbols.length - 1) {
				node.end = true;
				node.score = score;
				node.index = index;
			}
		}
	}

	find(ss: string) {
		let node = this.root;
		let iter = 0;

		while (iter < ss.length && node) {
			node = node.children[ss[iter]!];
			iter++;
		}

		return node;
	}
}

/**
 * WordPieceTokenizer class
 * Converts strings to token ids for use in neural network (using a trie)
 * https://arxiv.org/abs/1609.08144v2
 */
export default class WordPieceTokenizer {
	separator: string;
	UNK_INDEX: number;
	trie: Trie;
	vocab: string[];

	constructor() {
		this.separator = '\u2581';
		this.UNK_INDEX = 100;
	}

	/**
	 * loads vocab from json, parses it into trie
	 */
	public load() {
		this.vocab = vocab;
		this.trie = new Trie();
		this.trie.insert('[CLS]', 1, 101);
		this.trie.insert('[SEP]', 1, 102);

		// Actual tokens start at 999.
		for (let i = 999; i < this.vocab.length; i++) {
			const word = this.vocab[i];
			if (word) {
				this.trie.insert(word, 1, i);
			}
		}
	}

	/**
	 * splits input string into array of unicode normalized words with separator
	 * @param text input text
	 * @returns array of words with added special tokens
	 */
	public processInput(text: string) {
		const words = text.split(' ');
		return words.map(word => {
			if (word !== '[CLS]' && word !== '[SEP]') {
				return this.separator + word.toLowerCase().normalize('NFKC');
			}

			return word;
		});
	}

	/**
	 * tokenizes input string into an array of token ids
	 * @param text input text
	 * @returns array of token ids
	 */
	public tokenize(text: string) {
		// Source:
		// https://github.com/google-research/bert/blob/88a817c37f788702a363ff935fd173b6dc6ac0d6/tokenization.py#L311
		let outputTokens: number[] = [];
		const words = this.processInput(text);

		for (const word of words) {
			const chars = [];
			for (const symbol of word) {
				chars.push(symbol);
			}

			let isUnknown = false;
			let start = 0;
			const subTokens: number[] = [];
			const charsLength = chars.length;

			while (start < charsLength) {
				let end = charsLength;
				let currIndex: number | null = null;
				while (start < end) {
					const match = this.trie.find(chars.slice(start, end).join(''));
					if (match?.end) {
						currIndex = match.getWord()[2] as number;
						break;
					}

					end -= 1;
				}

				if (currIndex === null) {
					isUnknown = true;
					break;
				}

				subTokens.push(currIndex);
				start = end;
			}

			if (isUnknown) {
				outputTokens.push(this.UNK_INDEX);
			} else {
				outputTokens = [...outputTokens, ...subTokens];
			}
		}

		return outputTokens;
	}
}
