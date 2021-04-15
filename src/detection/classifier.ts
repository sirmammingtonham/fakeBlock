/// abstract classifier class
export abstract class Classifier {
	// public static create(): Promise<Classifier>;
	public abstract classify(selection: any): Promise<boolean>;
}
