import * as tf from '@tensorflow/tfjs';

export enum AggregateLabels {
	reliable, mixed, unreliable
}

export enum CategoryLabels {
	conspiracyPseudoscience, leastBiased, leftBias, leftCenterBias, questionableSource, rightBias, rightCenterBias, NA
}

/// interface to wrap results from classifier models
export interface Output {
	logitsAggregate: tf.TypedArray;
	logitsCategory: tf.TypedArray;
	probsAggregate: tf.TypedArray;
	probsCategory: tf.TypedArray;
	valueAggregate: AggregateLabels;
	valueCategory: CategoryLabels;
}

export type ClassifierOutput = Output | undefined;

/// abstract classifier class
export abstract class Classifier {
	// public static create(): Promise<Classifier>;
	public abstract classify(selection: any): Promise<ClassifierOutput>;
}
