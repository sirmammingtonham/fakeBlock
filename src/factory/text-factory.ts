import {Classifier} from '../detection/classifier';
import {TextClassifier} from '../detection/text-classifier';
import {Factory, ClassifierOptions} from './factory';

export class TextFactory extends Factory {
	private static get modelPath() {
		return './distilbert/model.json';
	}

	public async createClassifier(_options: ClassifierOptions): Promise<Classifier> {
		return TextClassifier.create(TextFactory.modelPath);
	}
}
