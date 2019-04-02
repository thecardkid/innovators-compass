import { createStore } from 'redux';

import rootReducer from './reducers/index';

export default (initialState) => {
    return createStore(rootReducer, initialState);
};
