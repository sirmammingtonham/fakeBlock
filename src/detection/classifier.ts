// import * as tf from '@tensorflow/tfjs';

export enum AggregateLabels {
	reliable, mixed, unreliable
}

export enum CategoryLabels {
	conspiracyPseudoscience, unBiased, leftBias, leftCenterBias, questionableSource, rightBias, rightCenterBias, NA
}

/// interface to wrap results from classifier models
export interface Output {
	logitsAggregate: number[];
	logitsCategory: number[];
	probsAggregate: number[];
	probsCategory: number[];
	valueAggregate: AggregateLabels;
	valueCategory: CategoryLabels;
}

export type ClassifierOutput = Output | undefined;

/// abstract classifier class
export abstract class Classifier {
	// public static create(): Promise<Classifier>;
	public abstract classify(selection: any): Promise<ClassifierOutput>;
}
