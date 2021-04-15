import {Classifier} from '../detection/classifier';
import {ImageClassifier} from '../detection/image-classifier';
import {TextClassifier} from '../detection/text-classifier';

export enum ClassifierTypes {
	kImage,
	kText
}
export interface ClassifierOptions {
	type: ClassifierTypes;
}

/// Factory class (abstract)
/// requires overriding createClassifier method
export class ClassifierFactory {
	public async createClassifier(options: ClassifierOptions): Promise<Classifier> {
		switch (options.type) {
			case ClassifierTypes.kImage:
				return ImageClassifier.create();
			case ClassifierTypes.kText:
				return TextClassifier.create();
			default:
				throw new Error('Unknown classifier type!');
		}
	}
}
