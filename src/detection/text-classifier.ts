import * as tf from '@tensorflow/tfjs';
import * as bert from './tokenizer/bert-tokenizer';

export interface ArticleData {
	headline?: string;
	body: string;
}

// opting for singleton for now because background and content scripts need access, and class is very resource intensive
export class TextClassifier {
	private static instance: TextClassifier;
	private model!: tf.GraphModel;
	private tokenizer!: bert.BertTokenizer;

	private constructor() {
		console.log('Instance created');
	}

	private static get modelPath() {
		return './distilbert/model.json';
	}

	public static async getInstance(): Promise<TextClassifier> {
		if (!TextClassifier.instance) {
			TextClassifier.instance = new TextClassifier();
			await TextClassifier.instance.init(TextClassifier.modelPath);
		}

		return TextClassifier.instance;
	}

	public async classifyText(_selection: ArticleData): Promise<boolean> {
		const {inputIds, inputMask} = this.tokenizer.convertSingleExample(
			_selection.headline ? _selection.headline + ' ' + _selection.body : _selection.body
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

	private async init(modelPath: string) {
		TextClassifier.instance.model = await tf.loadGraphModel(modelPath);
		TextClassifier.instance.tokenizer = new bert.BertTokenizer(true, 512);
	}
}
