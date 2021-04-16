import {Classifier, ClassifierOutput} from './classifier';
export class ImageClassifier extends Classifier {
	private static instance: ImageClassifier;

	private constructor() {
		super();
		console.log('ImageClassifier instance created');
	}

	public static async create(): Promise<ImageClassifier> {
		if (ImageClassifier.instance === undefined) {
			ImageClassifier.instance = new ImageClassifier();
		}

		return ImageClassifier.instance;
	}

	public async classify(url: string): Promise<ClassifierOutput> {
		console.log(url);
		return undefined;
	}
}
