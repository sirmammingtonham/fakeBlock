import {Classifier} from '../detection/classifier';
import {ImageClassifier} from '../detection/image-classifier';
import {TextClassifier} from '../detection/text-classifier';

/**
 * Enum for the different classifier types
 */
export enum ClassifierTypes {
	kImage,
	kText
}

/**
 * Interface to hold options for classifier creation
 */
export interface ClassifierOptions {
	type: ClassifierTypes;
}

/**
 * ClassifierFactory
 * Contains methods to create a Classifier
 */
export class ClassifierFactory {
	/**
	 * Creates a classifier with the specified options
	 *
	 * @param options The options (currently just type of classifier)
	 * @returns Promise that resolves to the specified Classifier
	 */
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
