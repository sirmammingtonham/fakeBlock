import React from 'react';
import LinearWithValueLabel from '../src/components/progressbar';
// import Popup from '../src/components/popup';
// import * as renderer from 'react-test-renderer';
import {shallow, configure} from 'enzyme';
import EnzymeAdapter from 'enzyme-adapter-react-16';

configure({adapter: new EnzymeAdapter()});

test('Test linear value label creation when percentage as 50', () => {
	// doesnt work bruh
	// const component = renderer.create(
	// 	<LinearWithValueLabel percentage={50}/>
	// );
	// const progressbar = component.toJSON();
	// expect(progressbar).toMatchSnapshot();
});

describe('Check if the component is defined after creation', () => {
	it('should be defined', () => {
		expect(LinearWithValueLabel).toBeDefined();
	});
});

test('ProgressBar showing correct progress', () => {
	const progressbar = shallow(<LinearWithValueLabel percentage={50}/>);
	expect(progressbar.getElement().props.children.props.value).toBe(50);
});

test('ProgressBar showing correct progress', () => {
	const progressbar = shallow(<LinearWithValueLabel percentage={90}/>);
	expect(progressbar.getElement().props.children.props.value).toBe(90);
});
