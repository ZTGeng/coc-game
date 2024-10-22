import { combineReducers } from "redux";
import flagReducer from "./slices/flagSlice";
import highlightReducer from "./slices/highlightSlice";
import characterReducer from "./slices/characterSlice";

const rootReducer = combineReducers({
    flag: flagReducer,
    highlight: highlightReducer,
    character: characterReducer,
});

export default rootReducer;
