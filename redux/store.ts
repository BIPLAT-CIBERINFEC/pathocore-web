import { createStore, applyMiddleware, combineReducers } from "redux";
import { thunk } from "redux-thunk";
import { mepramReducer } from "./reducer";

const rootReducer = combineReducers({
  mepram: mepramReducer,
});


export const store = createStore(rootReducer, applyMiddleware(thunk));


export type RootState = ReturnType<typeof rootReducer>;
