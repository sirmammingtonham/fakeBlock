import {Classifier} from './classifier';
export class ImageClassifier extends Classifier {
	public static async create(): Promise<ImageClassifier> {
		const me = new ImageClassifier();
		return me;
	}

	public async classify(url: string): Promise<boolean> {
		console.log(url);
		return true;
	}
}
