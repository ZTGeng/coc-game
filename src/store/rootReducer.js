import { combineReducers } from "redux";
import flagReducer from "./slices/flagSlice";
import highlightReducer from "./slices/highlightSlice";

const rootReducer = combineReducers({
    flag: flagReducer,
    highlight: highlightReducer,
});

export default rootReducer;
