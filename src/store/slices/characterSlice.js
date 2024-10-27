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
    checkedSkills: [],
    skillCustomNames: {},
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
    setAttrWithSnapshot(state, action) { // action: { type: 'character/setAttrWithSnapshot', payload: { HP: "10/10", ... } }
      Object.keys(action.payload).forEach(attrKey => {
        const [value, maxValue] = action.payload[attrKey].split("/").map(v => v && parseInt(v));
        state.attrs[attrKey].value = value;
        attrKey !== "Luck" && (state.attrs[attrKey].maxValue = maxValue);
      });
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
    },
    setSkillValue(state, action) { // action: { type: 'character/setSkillValue', payload: { skillKey, value } }
      if (state.skills[action.payload.skillKey].value !== action.payload.value) {
        state.skills[action.payload.skillKey].value = action.payload.value;
      }
    },
    setSkillValueByDelta(state, action) { // action: { type: 'character/setSkillValueByDelta', payload: { skillKey, delta } }
      const skill = state.skills[action.payload.skillKey];
      skill.value += action.payload.delta;
    },
    doubleSkillValue(state, action) { // action: { type: 'character/doubleSkillValue', payload: skillKey }
      const skill = state.skills[action.payload];
      skill.value *= 2;
    },
    halfSkillValue(state, action) { // action: { type: 'character/halfSkillValue', payload: skillKey }
      const skill = state.skills[action.payload];
      skill.value = Math.floor(skill.value / 2);
    },
    setSkillOccupation(state, action) { // action: { type: 'character/setSkillOccupation', payload: skillKey }
      state.skills[action.payload].occupation || (state.skills[action.payload].occupation = true);
    },
    setSkillHobby(state, action) { // action: { type: 'character/setSkillHobby', payload: skillKey }
      state.skills[action.payload].hobby || (state.skills[action.payload].hobby = true);
    },
    setSkillCustomName(state, action) { // action: { type: 'character/setSkillCustomName', payload: { skillKey, customName } }
      if (action.payload.customName) {
        state.skillCustomNames[action.payload.skillKey] = action.payload.customName;
      } else {
        delete state.skillCustomNames[action.payload.skillKey];
      }
    },
    setSkillWithSnapshot(state, action) { // action: { type: 'character/setSkillWithSnapshot', payload: { skillKey: { value, ... } } }
      Object.keys(state.skills).forEach(skillKey => {
        const skill = state.skills[skillKey];
        if (action.payload[skillKey]) {
          skill.value !== action.payload[skillKey].value && (skill.value = action.payload[skillKey].value);
          skill.occupation !== action.payload[skillKey].occupation && (skill.occupation = action.payload[skillKey].occupation);
          skill.hobby !== action.payload[skillKey].hobby && (skill.hobby = action.payload[skillKey].hobby);
        } else {
          state.skills[skillKey] = { ...initSkills[skillKey] };
        }
      });
    },
    checkSkillBox(state, action) { // action: { type: 'character/checkSkillBox', payload: skillKey }
      if (!state.checkedSkills.includes(action.payload)) {
        state.checkedSkills.push(action.payload);
      }
    },
    checkSkillBoxWithSnapshot(state, action) { // action: { type: 'character/checkSkillBoxWithSnapshot', payload: [skillKey] }
      state.checkedSkills = action.payload;
    },
    setOccupation(state, action) { // action: { type: 'character/setOccupation', payload: { name, credit, skills, art, interpersonal, language, universal } }
      state.occupation = action.payload;
    },
    setOccupationName(state, action) { // action: { type: 'character/setOccupationName', payload: { en, zh } }
      state.occupation.name = action.payload;
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
  setAttrWithSnapshot,
  initSkill,
  resetSkill,
  setSkillValue,
  setSkillValueByDelta,
  doubleSkillValue,
  halfSkillValue,
  setSkillOccupation,
  setSkillHobby,
  setSkillCustomName,
  setSkillWithSnapshot,
  checkSkillBox,
  checkSkillBoxWithSnapshot,
  setOccupation,
  setOccupationName,
  setName,
  setAge
} = characterSlice.actions;
export default characterSlice.reducer;

export const snapshotAttrs = (state) =>
  Object.keys(state.attrs)
    .reduce((acc, attrKey) => {
      acc[attrKey] = `${state.attrs[attrKey].value}${attrKey === "Luck" ? "" : `/${state.attrs[attrKey].maxValue}`}`;
      return acc;
    }, {});
export const snapshotUpdatedSkills = (state) =>
  Object.keys(state.skills)
    .filter(skillKey => state.skills[skillKey].value !== initSkills[skillKey].value
      || state.skills[skillKey].occupation
      || state.skills[skillKey].hobby)
    .reduce((acc, skillKey) => {
      const skill = state.skills[skillKey];
      acc[skillKey] = {};
      skill.value !== initSkills[skillKey].value && (acc[skillKey].value = skill.value);
      skill.occupation && (acc[skillKey].occupation = skill.occupation);
      skill.hobby && (acc[skillKey].hobby = skill.hobby);
      return acc;
    }, {});
