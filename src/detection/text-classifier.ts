import * as tf from '@tensorflow/tfjs';
// import {TFSavedModel} from '@tensorflow/tfjs-node/dist/saved_model.js';
// import {BertWordPieceTokenizer} from 'tokenizers';
// tokenizer library relies on rust, cant use webpack?

export interface ArticleData {
	headline?: string;
	body: string;
}

// opting for singleton for now because background and content scripts need access, and class is very resource intensive
export class TextClassifier {
	private static instance: TextClassifier;
	private model!: tf.GraphModel;
	// private tokenizer!: BertWordPieceTokenizer;
	private constructor() {
		console.log('Instance created');
	}

	private static get modelPath() {
		return './distilbertu_ISOT';
	}

	private static get vocabPath() {
		return './distilbertu_ISOT';
	}

	public static async getInstance(): Promise<TextClassifier> {
		if (!TextClassifier.instance) {
			TextClassifier.instance = new TextClassifier();
			await TextClassifier.instance.init(TextClassifier.modelPath, TextClassifier.vocabPath);
		}

		return TextClassifier.instance;
	}

	public async classifyText(_selection: ArticleData): Promise<boolean> {
		// const {tokens, attentionMask} = await (
		// 	selection.headline ? TextClassifier.instance.tokenizer.encode(selection.headline, selection.body) :
		// 		TextClassifier.instance.tokenizer.encode(selection.body)
		// );
		const tokens = [0];
		const attentionMask = [0];

		const result = tf.tidy(() => {
			const inputTensor = tf.tensor(tokens, undefined, 'int32');
			const maskTensor = tf.tensor(attentionMask, undefined, 'int32');

			// Run model inference
			const result = this.model.predict({
				'input_ids': inputTensor, 'attention_mask': maskTensor // eslint-disable-line quote-props
			}) as tf.NamedTensorMap;
			if (result.logits) {
				const predictions = tf.softmax(result.logits, -1);
				const value = tf.argMax(predictions, -1).dataSync();
				return value[0] === 1;
			}

			return false;
		});

		return result;
	}

	private async init(modelPath: string, _vocabPath: string) {
		TextClassifier.instance.model = await tf.loadGraphModel(modelPath);
		// TextClassifier.instance.tokenizer = await BertWordPieceTokenizer.fromOptions({
		// 	vocabFile: vocabPath, lowercase: true
		// });
		// TextClassifier.instance.tokenizer.setPadding({maxLength: 512});
	}
}
