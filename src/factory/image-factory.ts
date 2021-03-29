import {Classifier} from '../detection/classifier';
import {ImageClassifier} from '../detection/image-classifier';
import {Factory, ClassifierOptions} from './factory';

export class ImageFactory extends Factory {
	public async createClassifier(_options: ClassifierOptions): Promise<Classifier> {
		return ImageClassifier.create();
	}
}
