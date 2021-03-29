import {Classifier} from '../detection/classifier';

export interface ClassifierOptions {
	_: string;
}

export abstract class Factory {
	public abstract createClassifier(options: ClassifierOptions): Promise<Classifier>;
}
