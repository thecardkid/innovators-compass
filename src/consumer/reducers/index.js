import { combineReducers } from 'redux';

import compass from './compass';
import notes from './notes';
import ui from './ui';
import users from './users';
import workspace from './workspace';

const rootReducer = combineReducers({
  notes,
  compass,
  users,
  ui,
  workspace,
});

export default rootReducer;

