import { createSlice } from '@reduxjs/toolkit';
import characterSheet from "../../utils/characterSheet";

const initChars = {
  STR: { value: "" },
  CON: { value: "" },
  DEX: { value: "" },
  APP: { value: "" },
  SIZ: { value: "" },
  INT: { value: "" },
  POW: { value: "" },
  EDU: { value: "" },
};
const initAttrs = {
  HP: { value: "", maxValue: "" },
  San: { value: "", maxValue: "" },
  Luck: { value: "" },
  MP: { value: "", maxValue: "" },
};
const initSkills = Object.entries(characterSheet.skills).reduce((acc, [key, item]) => {
  if (!(item.group)) {
    acc[key] = {
      value: item.value,
      baseValue: item.value,
      checked: false,
      occupation: false,
      hobby: false
    };
  }
  return acc;
}, {});
const initOccupation = {
  name: { en: "", zh: "" },
  credit: "",
  skills: [],
  art: 0,
  interpersonal: 0,
  language: 0,
  universal: 0
};
const initInfo = {
  name: "",
  age: "",
};

const characterSlice = createSlice({
  name: 'character',
  initialState: {
    chars: initChars,
    attrs: initAttrs,
    skills: initSkills,
    occupation: initOccupation,
    info: initInfo,
  },
  reducers: {
    resetCharacter(state, action) { // action: { type: 'character/reset' }
      state.chars = initChars;
      state.attrs = initAttrs;
      state.skills = initSkills;
      state.occupation = initOccupation;
      state.info = initInfo;
    },
    setCharacter(state, action) { // action: { type: 'character/setCharacter', payload: { chars, attrs, skills, occupation, info } }
      return action.payload;
    },
    initChar(state, action) { // action: { type: 'character/initChar', payload: { charKey, value } }
      state.chars[action.payload.charKey].value = action.payload.value;
    },
    initAttr(state, action) { // action: { type: 'character/initAttr', payload: { attrKey, value } }
      state.attrs[action.payload.attrKey].value = action.payload.value;
      if (action.payload.attrKey !== "Luck") {
        state.attrs[action.payload.attrKey].maxValue = action.payload.value;
      }
    },
    setAttr(state, action) { // action: { type: 'character/adjustAttr', payload: { attrKey, value } }
      if (state.attrs[action.payload.attrKey].value !== action.payload.value) {
        state.attrs[action.payload.attrKey].value = action.payload.value;
      }
    },
    initSkill(state, action) { // action: { type: 'character/initSkill', payload: { skillKey, value } }
      state.skills[action.payload.skillKey].value = action.payload.value;
      state.skills[action.payload.skillKey].baseValue = action.payload.value;
    },
    resetSkill(state, action) { // action: { type: 'character/resetSkill', payload: skillKey }
      console.log(`resetSkill: ${action.payload}`);
      const skill = state.skills[action.payload];
      skill.value !== skill.baseValue && (skill.value = skill.baseValue);
      skill.occupation && (skill.occupation = false);
      skill.hobby && (skill.hobby = false);
      skill.customName && (delete skill.customName);
    },
    setSkill(state, action) { // action: { type: 'character/setSkill', payload: { skillKey, value } }
      if (state.skills[action.payload.skillKey].value !== action.payload.value) {
        state.skills[action.payload.skillKey].value = action.payload.value;
      }
    },
    setSkillOccupation(state, action) { // action: { type: 'character/setSkillOccupation', payload: skillKey }
      state.skills[action.payload].occupation || (state.skills[action.payload].occupation = true);
    },
    setSkillHobby(state, action) { // action: { type: 'character/setSkillHobby', payload: skillKey }
      state.skills[action.payload].hobby || (state.skills[action.payload].hobby = true);
    },
    setSkillCustomName(state, action) { // action: { type: 'character/setSkillCustomName', payload: { skillKey, customName } }
      if (state.skills[action.payload.skillKey].customName !== action.payload.customName) {
        state.skills[action.payload.skillKey].customName = action.payload.customName;
      }
    },
    checkSkillBox(state, action) { // action: { type: 'character/checkSkillBox', payload: skillKey }
      state.skills[action.payload].checked || (state.skills[action.payload].checked = true);
    },
    setOccupation(state, action) { // action: { type: 'character/setOccupation', payload: { name, credit, skills, art, interpersonal, language, universal } }
      state.occupation = action.payload;
    },
    setName(state, action) { // action: { type: 'character/setName', payload: name }
      state.info.name !== action.payload && (state.info.name = action.payload);
    },
    setAge(state, action) { // action: { type: 'character/setAge', payload: age }
      state.info.age !== action.payload && (state.info.age = action.payload);
    }
  },
});

export const {
  resetCharacter,
  setCharacter,
  initChar,
  initAttr,
  setAttr,
  initSkill,
  resetSkill,
  setSkill,
  setSkillOccupation,
  setSkillHobby,
  setSkillCustomName,
  checkSkillBox,
  setOccupation,
  setName,
  setAge
} = characterSlice.actions;
export default characterSlice.reducer;
