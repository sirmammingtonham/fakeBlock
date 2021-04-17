/**
 * Enum for the different reliability tags our model learned to detect
 */
export enum AggregateLabels {
	reliable, mixed, unreliable
}

/**
 * Enum for the different categories our model learned to detect
 */
export enum CategoryLabels {
	conspiracyPseudoscience, unBiased, leftBias, leftCenterBias, questionableSource, rightBias, rightCenterBias, NA
}

/**
 * Interface to wrap the input to our classifier models
 */
export interface ClassifierInput {
	headline?: string;
	body: string;
}

/**
 * Interface to wrap results from classifier models
 */
export interface Output {
	logitsAggregate: number[];
	logitsCategory: number[];
	probsAggregate: number[];
	probsCategory: number[];
	valueAggregate: AggregateLabels;
	valueCategory: CategoryLabels;
}

/* Define type for optional Output so we don't have to write Output | undefined everywhere */
export type ClassifierOutput = Output | undefined;

/**
 * Abstract Classifier type (represents any type of classification neural network wrapper)
 */
export abstract class Classifier {
	// public static create(): Promise<Classifier>;
	public abstract classify(selection: any): Promise<ClassifierOutput>;
}
