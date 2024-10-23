import { createSlice } from '@reduxjs/toolkit';

const historySlice = createSlice({
  name: 'history',
  initialState: {
    items: [],
    index: -1,
  },
  reducers: {
    addHistory(state, action) { // action: { type: 'history/addHistory', payload: { chapterKey, flags, attrs, skills, showCharacter, mapEnabled } }
      state.items = state.items.slice(0, state.index + 1);
      state.items.push(action.payload);
      state.index = state.items.length - 1;
    },
    setHistoryIndex(state, action) { // action: { type: 'history/setIndex', payload: index }
      state.index = action.payload;
    },
  },
});

export const { addHistory, setHistoryIndex } = historySlice.actions;
export default historySlice.reducer;
