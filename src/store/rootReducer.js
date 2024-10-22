import { combineReducers } from "redux";
import flagReducer from "./slices/flagSlice";

const rootReducer = combineReducers({
    flag: flagReducer,
});

export default rootReducer;
