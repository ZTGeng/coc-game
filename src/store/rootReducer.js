import { combineReducers } from "redux";
import flagReducer from "./slices/flagSlice";
import highlightReducer from "./slices/highlightSlice";
import characterReducer from "./slices/characterSlice";
import historyReducer from "./slices/historySlice";

const rootReducer = combineReducers({
    flag: flagReducer,
    highlight: highlightReducer,
    character: characterReducer,
    history: historyReducer,
});

export default rootReducer;
