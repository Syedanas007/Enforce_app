import Enzyme from 'enzyme';
import Adapter from '@cfaester/enzyme-adapter-react-18';


jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter');
Enzyme.configure({ adapter: new Adapter() });