import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const initialState = [];

const highlightSlice = createSlice({
  name: 'highlight',
  initialState,
  reducers: {
    addOrUpdateHighlight(state, action) { // action: { type: 'highlight/addHighlight', payload: { key, level, color } }
      const existingHighlight = state.find((highlight) => highlight.key === action.payload.key);
      if (existingHighlight) {
        existingHighlight.level === action.payload.level || (existingHighlight.level = action.payload.level);
        existingHighlight.color === action.payload.color || (existingHighlight.color = action.payload.color);
      } else {
        state.push(action.payload);
      }
    },
    removeHighlight(state, action) { // action: { type: 'highlight/removeHighlight', payload: key }
      return state.filter((highlight) => highlight.key !== action.payload);
    },
    clearHighlights() {
      return initialState;
    },
  },
});

export const { addOrUpdateHighlight, removeHighlight, clearHighlights } = highlightSlice.actions;
export const findHighlight = (state, key) => state.find((highlight) => highlight.key === key) ?? null;
export default highlightSlice.reducer;
