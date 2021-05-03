import {ClassifierOutput, AggregateLabels} from '../detection/classifier';

const THRESHOLD = 0;

export function shouldBlock(result: ClassifierOutput): boolean {
	if (result && result.valueAggregate !== AggregateLabels.reliable) {
		console.log(result);
		// if result is mixed, block only if probability of unreliable is higher than reliable
		return result.probsAggregate[AggregateLabels.unreliable] >= result.probsAggregate[AggregateLabels.reliable] + THRESHOLD;
	}

	return false;
}
