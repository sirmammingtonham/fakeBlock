import {Classifier, ClassifierOutput} from './classifier';

/**
 * Our altered image classifier
 * Loads our custom tensorflow model and exposes the classify function (WIP)
 *
 * @extends Classifier
 */
export class ImageClassifier extends Classifier {
	private static instance: ImageClassifier;

	/**
	 * Private constructor since we use factory, no custom functionality
	 */
	private constructor() {
		super();
		console.log('ImageClassifier instance created');
	}

	/**
	 * Factory creation method for ImageClassifier
	 *
	 * @returns Promise that resolves to new or existing instance of ImageClassifier
	 */
	public static async create(): Promise<ImageClassifier> {
		if (ImageClassifier.instance === undefined) {
			ImageClassifier.instance = new ImageClassifier();
		}

		return ImageClassifier.instance;
	}

	/**
	 * takes url to image, gets data, and runs it through our model
	 *
	 * @stub
	 * @param url The url to the input image
	 * @returns Promise that resolves to ClassifierOutput containing data from inference
	 */
	public async classify(url: string): Promise<ClassifierOutput> {
		console.log(url);
		return undefined;
	}
}
