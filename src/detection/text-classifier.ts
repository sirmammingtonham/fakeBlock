import {Classifier} from './classifier';
import * as tf from '@tensorflow/tfjs';
import * as bert from './tokenizer/bert-tokenizer';

export interface ArticleData {
	headline?: string;
	body: string;
}

export class TextClassifier extends Classifier {
	private model!: tf.GraphModel;
	private tokenizer!: bert.BertTokenizer;

	private constructor() {
		super();
		console.log('Instance created');
	}

	public static async create(modelPath: string): Promise<TextClassifier> {
		const me = new TextClassifier();
		me.model = await tf.loadGraphModel(modelPath);
		me.tokenizer = new bert.BertTokenizer(true, 512);

		return me;
	}

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
