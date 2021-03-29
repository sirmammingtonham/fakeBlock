import {Classifier} from '../detection/classifier';
import {ImageClassifier} from '../detection/image-classifier';
import {Factory, ClassifierOptions} from './factory';

export class ImageFactory extends Factory {
	private classifier: ImageClassifier;

	public async createClassifier(_options: ClassifierOptions): Promise<Classifier> {
		if (this.classifier === undefined) {
			this.classifier = await ImageClassifier.create();
		}

		return this.classifier;
	}
}
