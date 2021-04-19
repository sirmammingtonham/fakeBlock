import React from 'react';
import LinearWithValueLabel from '../src/components/progressbar';
import * as renderer from 'react-test-renderer';
// import {shallow} from 'enzyme';

test('Test linear value label creation when percentage as 50', () => {
	const component = renderer.create(
		<LinearWithValueLabel percentage={50}/>
	);
	const progressbar = component.toJSON();
	expect(progressbar).toMatchSnapshot();
});

describe('Check if the component is defined after creation', () => {
	it('should be defined', () => {
		expect(LinearWithValueLabel).toBeDefined();
	});
});
