import {Classifier} from './classifier';
import * as tf from '@tensorflow/tfjs';
import * as bert from './tokenizer/bert-tokenizer';

export interface ArticleData {
	headline?: string;
	body: string;
}

/// our text classifier
/// loads the tensorflow model and exposes the classify function
export class TextClassifier extends Classifier {
	private static instance: TextClassifier;
	private model!: tf.GraphModel;
	private tokenizer!: bert.BertTokenizer;

	private constructor() {
		super();
		console.log('TextClassifier instance created');
	}

	private static get modelPath() {
		return './distilbert/model.json';
	}

	/// factory creation method
	public static async create(): Promise<TextClassifier> {
		if (TextClassifier.instance === undefined) {
			TextClassifier.instance = new TextClassifier();
			TextClassifier.instance.model = await tf.loadGraphModel(TextClassifier.modelPath);
			TextClassifier.instance.tokenizer = new bert.BertTokenizer(true, 512);
		}

		return TextClassifier.instance;
	}

	/// takes input ArticleData, tokenizes it, then feeds it through neural net
	/// returns prediction (true if fake, false if legit)
	public async classify(selection: ArticleData): Promise<boolean> {
		const {inputIds, inputMask} = this.tokenizer.convertSingleExample(
			selection.headline ? selection.headline + ' ' + selection.body : selection.body
		);

		const result = tf.tidy(() => {
			const inputTensor = tf.tensor(inputIds, undefined, 'int32').expandDims(0);
			const maskTensor = tf.tensor(inputMask, undefined, 'int32').expandDims(0);

			// Run model inference
			const result = this.model.predict({
				'input_ids': inputTensor, 'attention_mask': maskTensor // eslint-disable-line quote-props
			}) as tf.Tensor<tf.Rank>;

			const predictions = tf.softmax(result, -1);
			const value = tf.argMax(predictions, 1).dataSync();
			return value[0] === 1;
		});

		return result;
	}
}
