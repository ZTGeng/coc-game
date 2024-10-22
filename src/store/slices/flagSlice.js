import { createContext, useContext } from 'react';
import { createSlice } from '@reduxjs/toolkit';

const flagSlice = createSlice({
    name: 'flag',
    initialState: {
        flag_characteristics_editable: false,
        flag_occupation_skills_editable: false,
        flag_hobby_skills_editable: false,

        flag_bought_knife: false,
        flag_found_cliff_ladder: false,
        flag_meet_arbogast: false,
        flag_involved_fighting: false,
        flag_searched_book_shelf: false,
        flag_learned_magic_arbogast: false,
        flag_learned_magic_summon: false,
        flag_learned_magic_order: false,
        flag_found_poem_book: false,
        
        flag_major_wound: false,
        flag_penalty_die: false,

        flag_c25_option_selected_0: false,
        flag_c25_option_selected_1: false,
        flag_c25_option_selected_2: false,
        flag_c25_option_selected_3: false,
        flag_c25_option_selected_4: false,
        flag_c25_option_selected_5: false,

        flag_c120_option_selected_0: false,
        flag_c120_option_selected_1: false,
        flag_c120_option_selected_2: false,
        flag_c120_option_selected_3: false,
    },
    reducers: {
        setFlag(state, action) { // action: { type: 'flag/setFlag', payload: { flag: 'flag_name', value: true/false } }
            state[action.payload.flag] = action.payload.value;
        },
        resetFlag(state, action) { // action: { type: 'flag/reset' }
            Object.keys(state).forEach(key => {
                state[key] = false;
            });
        },
    },
});

export const { setFlag, resetFlag } = flagSlice.actions;
export default flagSlice.reducer;

export const FlagCheckContext = createContext(() => { throw new Error("FlagCheckContext not found"); });
export const useFlagCheck = () => useContext(FlagCheckContext);
export const createFlagCheck = (localFlagFunc, parentCheckFlag) => {
    const checkFlagImpl = (condition) => {
        if (Object.prototype.toString.call(condition) === "[object Object]") {
            if (condition.type === "and") {
                return condition.flags.every(flag => checkFlagImpl(flag));
            } else if (condition.type === "or") {
                return condition.flags.some(flag => checkFlagImpl(flag));
            } else if (condition.flag) {
                if (localFlagFunc && localFlagFunc[condition.flag]) {
                    return localFlagFunc[condition.flag](condition.param);
                }
            }
        } else if (Array.isArray(condition)) {
            return condition.every(c => checkFlagImpl(c));
        } else if (typeof condition === 'boolean') {
            return condition;
        } else if (typeof condition === 'string') {
            if (condition.startsWith("!")) {
                return !checkFlagImpl(condition.slice(1));
            }
            if (localFlagFunc && localFlagFunc[condition]) {
                return localFlagFunc[condition]();
            }
        }
        if (typeof parentCheckFlag !== 'function') {
            console.error("1 parentCheckFlag is not a function");
            return false;
        }
        return parentCheckFlag(condition);
    }
    return checkFlagImpl;
};