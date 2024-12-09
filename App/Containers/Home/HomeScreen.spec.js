import React from 'react';
import {shallow} from 'enzyme';
import HomeScreen from './HomeScreen';
import renderer from 'react-test-renderer';

describe('HomeScreen', () => {
    describe('Rendering', () => {
        it('should match to snapshot', () => {
            const component = renderer
            .create(<HomeScreen></HomeScreen>)
            .toJSON();
          expect(component).toMatchSnapshot();
        });
    });
});