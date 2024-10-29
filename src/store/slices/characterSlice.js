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
      state.checkedSkills = [];
      state.skillCustomNames = {};
    },
    initChar(state, action) { // action: { type: 'character/initChar', payload: { charKey, value } }
      state.chars[action.payload.charKey].value = action.payload.value;
    },
    setCharsWithSnapshot(state, action) { // action: { type: 'character/setCharsWithSnapshot', payload: { STR: 10, ... } }
      Object.keys(action.payload).forEach(charKey => {
        state.chars[charKey].value = action.payload[charKey];
      });
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
    setSkillValue(state, action) { // action: { type: 'character/setSkillValue', payload: { skillKey, value } }
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
      if (action.payload.customName) {
        state.skillCustomNames[action.payload.skillKey] = action.payload.customName;
      } else {
        delete state.skillCustomNames[action.payload.skillKey];
      }
    },
    restoreSkillCustomNames(state, action) { // action: { type: 'character/restoreSkillCustomNames', payload: { skillKey: customName, ... } }
      state.skillCustomNames = action.payload;
    },
    checkSkillBox(state, action) { // action: { type: 'character/checkSkillBox', payload: skillKey }
      if (!state.checkedSkills.includes(action.payload)) {
        state.checkedSkills.push(action.payload);
      }
    },
    setCheckedSkills(state, action) { // action: { type: 'character/checkSkillBoxWithSnapshot', payload: [skillKey] }
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
  initChar,
  setCharsWithSnapshot,
  initAttr,
  setAttr,
  setAttrWithSnapshot,
  initSkill,
  resetSkill,
  setSkillWithSnapshot,
  setSkillValue,
  setSkillOccupation,
  setSkillHobby,
  setSkillCustomName,
  restoreSkillCustomNames,
  checkSkillBox,
  setCheckedSkills,
  setOccupation,
  setOccupationName,
  setName,
  setAge
} = characterSlice.actions;
export default characterSlice.reducer;

export const snapshotChars = (state) =>
  Object.keys(state.chars)
    .reduce((acc, charKey) => {
      acc[charKey] = state.chars[charKey].value;
      return acc;
    }, {});
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
export const snapshotCharacter = (state) => ({
  charsSnapshot: snapshotChars(state),
  attrsSnapshot: snapshotAttrs(state),
  skillsSnapshot: snapshotUpdatedSkills(state),
  occupation: state.occupation,
  info: state.info,
  checkedSkills: state.checkedSkills,
  skillCustomNames: state.skillCustomNames
});
