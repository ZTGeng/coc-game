import { createSlice } from '@reduxjs/toolkit';

const historySlice = createSlice({
  name: 'history',
  initialState: {
    items: [],
    index: 0,
  },
  reducers: {
    addHistory(state, action) { // action: { type: 'history/addHistory', payload: { chapterKey, flags, attrs, skills, showCharacter, mapEnabled } }
      state.items = state.items.slice(0, state.index);
      state.items.push(action.payload);
      state.index = state.items.length;
    },
    setHistoryIndex(state, action) { // action: { type: 'history/setIndex', payload: index }
      state.index = action.payload;
    },
    clearHistory(state) { // action: { type: 'history/clear' }
      state.items = [];
      state.index = 0;
    },
    restoreHistory(state, action) { // action: { type: 'history/restore', payload: { items, index } }
      state.items = action.payload.items;
      state.index = action.payload.index
    }
  },
});

export const { addHistory, setHistoryIndex, clearHistory, restoreHistory } = historySlice.actions;
export default historySlice.reducer;
