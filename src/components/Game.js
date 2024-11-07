import { useState, useEffect, useRef, useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import { LanguageContext, CharacterSheetContext } from "../App";
import Character from "./character/Character";
import Chapter from "./chapter/Chapter";
import HistoryModal from "./HistoryModal";
import AchievementModal from "./AchievementModal";
import { showToast } from "./ToastMessage";
import { setFlag, FlagCheckContext, createFlagCheck, snapshotFlag, setFlagWithSnapshot } from "../store/slices/flagSlice";
import { addOrUpdateHighlight, removeHighlight, clearHighlights } from "../store/slices/highlightSlice";
import {
  snapshotCharacter,
  initAttr,
  setAttr,
  setAttrWithSnapshot,
  snapshotAttrs,
  initSkill,
  setSkillValue,
  setSkillWithSnapshot,
  snapshotUpdatedSkills,
  checkSkillBox,
  setCheckedSkills,
  restoreSkillCustomNames,
  setOccupation,
  setOccupationName,
  setCharsWithSnapshot,
  setName,
  setAge
} from "../store/slices/characterSlice";
import { addHistory, setHistoryIndex, restoreHistory } from "../store/slices/historySlice";
import * as utils from "../utils/utils";

const initChapterVisits = new Array(271).fill(false);
initChapterVisits[0] = true;

export default function Game({ showCharacter, setShowCharacter, mapEnabled, setMapEnabled, saveLoad, playSound }) {
  const { autoLang } = useContext(LanguageContext);
  const characterSheet = useContext(CharacterSheetContext);
  const [chapterKey, setChapterKey] = useState(0);
  const [committedMP, setCommittedMP] = useState(0);
  const [chapterVisits, setChapterVisits] = useState(initChapterVisits);
  const [endings, setEndings] = useState([]);
  const [isReloading, setIsReloading] = useState(false);
  const flagStore = useSelector(state => state.flag);
  const charsStore = useSelector(state => state.character.chars);
  const attrsStore = useSelector(state => state.character.attrs);
  const skillsStore = useSelector(state => state.character.skills);
  const occupationStore = useSelector(state => state.character.occupation);
  const historyStore = useSelector(state => state.history);
  const dispatch = useDispatch();
  console.log(`Game refresh, chapterKey: ${chapterKey}`);

  useEffect(() => {
    console.log(`Game - useEffect: chapterKey: ${chapterKey}， saveLoad: ${saveLoad.action}`);
    if (saveLoad.action === "save") {
      dispatch(saveThunk(saveLoad.saveKey));
    } else if (saveLoad.action === "load") {
      load(saveLoad.saveKey);
    }
  }, [saveLoad]);

  // Source of Truth of current state during chapter transitions
  const stateSnapshotRef = useRef({});
  // console.log(`Game refresh - stateSnapshotRef: ${JSON.stringify(stateSnapshotRef.current)}`);

  const gameFlagFunc = {
    "flag_characteristics_unfinished": () => Object.values(charsStore).some(char => char.value === ""),
    "flag_skills_occupation_unfinished": () => {
      const occupationSkillsNum = Object.keys(skillsStore).filter(skillKey => skillsStore[skillKey].occupation).length;
      const occupationSkillsMaxNum = occupationStore.skills.length
        + occupationStore.art
        + occupationStore.interpersonal
        + occupationStore.language
        + occupationStore.universal;
      return occupationSkillsNum < occupationSkillsMaxNum;
    },
    "flag_skills_hobby_unfinished": () => Object.keys(skillsStore).filter(skillKey => skillsStore[skillKey].hobby).length < 4,
    "flag_key_less_than_value": (param) => {
      const key = param.key;
      const value = param.value;
      if (key === "committedMP") return committedMP < value;
      const item = findItem(key);
      if (item) return item.value < value;
      console.error(`Game - flag_key_less_than_value: key ${key} not found`);
      return false;
    },
    "flag_key_greater_than_value": (param) => {
      const key = param.key;
      const value = param.value;
      if (key === "committedMP") return committedMP > value;
      const item = findItem(key);
      if (item) return item.value > value;
      console.error(`Game - flag_key_greater_than_value: key ${key} not found`);
      return false;
    },
    "flag_key_equal_to_value": (param) => {
      const key = param.key;
      const value = param.value;
      if (key === "committedMP") return committedMP === value;
      const item = findItem(key);
      if (item) return item.value === value;
      console.error(`Game - flag_key_less_than_value: key ${key} not found`);
      return false;
    },
    "flag_key1_greater_than_key2": (param) => {
      const key1 = param.key1;
      const key2 = param.key2;
      let value1, value2;
      if (key1 === "committedMP") {
        value1 = committedMP;
      } else {
        const item1 = findItem(key1);
        if (item1) value1 = item1.value;
        else console.error(`Game - flag_key1_greater_than_key2: key ${key1} not found`);
      }
      if (key2 === "committedMP") {
        value2 = committedMP;
      } else {
        const item2 = findItem(key2);
        if (item2) value2 = item2.value;
        else console.error(`Game - flag_key1_greater_than_key2: key ${key2} not found`);
      }
      return value1 > value2;
    },
  };

  function findItem(key) {
    if (charsStore[key]) {
      return charsStore[key];
    } else if (attrsStore[key]) {
      return attrsStore[key];
    } else if (skillsStore[key]) {
      return skillsStore[key];
    }
    return null;
  }

  function checkFlagInStore(flag) {
    if (flag in flagStore) {
      return flagStore[flag];
    }
    console.error(`Game - checkFlagInStore: flag ${flag} not found in store`);
    return false;
  }
  const flagCheck = createFlagCheck(gameFlagFunc, checkFlagInStore);

  const actions = {
    action_set_flag: (param) => { // param: { flag, value }
      // console.log(`action_set_flag: ${param.flag} = ${param.value}`);
      const oldValue = flagStore[param.flag];
      dispatch(setFlag({ flag: param.flag, value: param.value }));
      return { oldValue, newValue: param.value };
    },
    action_ending: (param) => { // param: endingKey
      const alreadyCollected = endings.includes(param);
      if (!alreadyCollected) {
        setEndings([...endings, param]);
      }
      return { alreadyCollected };
    },
    action_show_character_sheet: (param) => { // param: true/false/undefined
      const oldValue = showCharacter;
      setShowCharacter(param !== false);
      return { oldValue, newValue: param !== false };
    },
    action_set_highlight: (param) => { // param: { key, level, color } level: none/value/half/fifth/all, color: danger/success
      setHighlight(param.key, param.level, param.color);
      return {};
    },
    action_clear_highlight: () => {
      dispatch(clearHighlights());
      return {};
    },
    action_check_in_skill_box: (param) => { // param: key
      const alreadyChecked = skillsStore[param].checked;
      if (!alreadyChecked) {
        dispatch(checkSkillBox(param));
      }
      return { alreadyChecked };
    },
    action_adjust_attribute: (param) => { // param: { key, delta, noHighlight }, delta: Int or String like "-1d2"
      const attr = attrsStore[param.key];
      const oldValue = attr.value;
      let newValue;
      if (typeof param.delta === "string") {
        let deltaString = param.delta;
        let multiplier = 1;
        if (deltaString.startsWith("-")) {
          deltaString = deltaString.substring(1);
          multiplier = -1;
        }
        const [num, dice] = deltaString.toLowerCase().split("d");
        const results = utils.roll(parseInt(num), parseInt(dice));
        newValue = attr.value + results.reduce((a, b) => a + b, 0) * multiplier;
        const attrName = autoLang(characterSheet[param.key].name);
        showDiceToast(
          autoLang({ zh: `${attrName} ${param.delta}`, en: `${attrName} ${param.delta}` }), 
          parseInt(num), parseInt(dice), 0, results, false);
      } else {
        newValue = attr.value + param.delta;
      }
      newValue = Math.min(newValue, attr.maxValue);
      newValue = Math.max(newValue, 0);

      if (param.key === "HP") {
        if (!param.noHighlight) {
          setHighlight("HP", "value", newValue < attr.value ? "danger" : "success");
        }
        if (newValue < attr.value) {
          playSound("hp-reduced");

          if (attr.value - newValue >= attr.maxValue / 2) {
            dispatch(setFlag({ flag: "flag_major_wound", value: true }));
          }
        }
      } else if (param.key === "San") {
        if (!param.noHighlight) {
          setHighlight("San", "value", newValue < attr.value ? "danger" : "success");
        }
        playSound("san-reduced");
      }

      dispatch(setAttr({ attrKey: param.key, value: newValue }));
      return { oldValue, newValue };
    },
    action_adjust_skill: (param) => { // param: { key, delta }, delta: Int
      const oldValue = skillsStore[param.key].value;
      const newValue = oldValue + param.delta;
      dispatch(setSkillValue({ skillKey: param.key, value: newValue }));
      return { oldValue, newValue };
    },
    action_double_skill_value: (param) => { // param: key
      const oldValue = skillsStore[param].value;
      const newValue = oldValue * 2;
      dispatch(setSkillValue({ skillKey: param, value: newValue }));
      return { oldValue, newValue };
    },
    action_half_skill_value: (param) => { // param: key
      const oldValue = skillsStore[param].value;
      const newValue = Math.floor(oldValue / 2);
      dispatch(setSkillValue({ skillKey: param, value: newValue }));
      return { oldValue, newValue };
    },
    action_dice_message: (param) => { // param: { title, num, dice, bonus, results, shouldPlaySound, alterNumDice }
      showDiceToast(param.title, param.num, param.dice, param.bonus, param.results, param.shouldPlaySound, param.alterNumDice);
      return {};
    },
    action_message: (param) => { // param: { title, subtitle, text, color }
      showToast(param);
      return {};
    },
    action_set_char_related_values: () => {
      dispatch(initSkill({ skillKey: "dodge", value: Math.floor(charsStore.DEX.value / 2) }));
      dispatch(initSkill({ skillKey: "lang_own", value: charsStore.EDU.value }));
      return {};
    },
    action_initial_san_and_mp: () => {
      dispatch(initAttr({ attrKey: "San", value: charsStore.POW.value }));
      dispatch(initAttr({ attrKey: "MP", value: Math.floor(charsStore.POW.value / 5) }));
      setHighlight("San", "value");
      setHighlight("MP", "value");
      setHighlight("POW", "value");
      return {};
    },
    action_reset_luck: () => {
      dispatch(setAttr({ attrKey: "Luck", value: "" }));
      return {};
    },
    action_initial_hp: () => {
      const newValue = Math.floor((charsStore.SIZ.value + charsStore.CON.value) / 10);
      dispatch(initAttr({ attrKey: "HP", value: newValue }));
      // dispatch(setAttr({ attrKey: "Luck", value: "" }));
      setHighlight("HP", "value");
      // setHighlight("Luck", "value");
      return { newValue };
    },
    action_init_luck: () => {
      const results = utils.roll(3, 6);
      const newValue = results.reduce((a, b) => a + b, 0) * 5;
      dispatch(initAttr({ attrKey: "Luck", value: newValue }));
      showDiceToast(autoLang(utils.TEXTS.rollLuck), 3, 6, 0, results, true);
      return { newValue };
    },
    action_set_occupation_and_credit: (param) => { // param: { name, credit, skills, art, interpersonal, language, universal }
      dispatch(setOccupation(param));
      dispatch(initSkill({ skillKey: "credit", value: param.credit }));
      return {};
    },
    action_enable_map: () => {
      const alreadyEnabled = mapEnabled;
      setMapEnabled(true);
      return { alreadyEnabled };
    },
    action_commit_mp: (param) => { // param: Int
      const oldValue = committedMP;
      if (attrsStore.MP.value >= param) {
        dispatch(setAttr({ attrKey: "MP", value: attrsStore.MP.value - param }));
        setHighlight("MP", "value");
      } else {
        const hpToUse = param - attrsStore.MP.value;
        if (attrsStore.HP.value < hpToUse) {
          console.error(`Game - action_commit_mp: HP not enough to commit ${param} MP`);
          param = attrsStore.HP.value;
        }
        dispatch(setAttr({ attrKey: "MP", value: 0 }));
        dispatch(setAttr({ attrKey: "HP", value: attrsStore.HP.value - hpToUse }));
        setHighlight("MP", "value");
        setHighlight("HP", "value", "danger");
      }
      setCommittedMP(committedMP + param);
      return { oldValue, newValue: oldValue + param };
    },
    action_clear_committed_mp: () => {
      const oldValue = committedMP;
      setCommittedMP(0);
      return { oldValue, newValue: 0 };
    },
  }

  const setHighlight = (key, level, color) => {
    if (level === "none") {
      dispatch(removeHighlight(key));
    } else {
      dispatch(addOrUpdateHighlight({ key, level, color }));
    }
  }

  function showDiceToast(title, num, dice, bonus, results, shouldPlaySound, alterNumDice = undefined) {
    let subtitle = `${num}D${dice}`;
    if (bonus && bonus > 0) {
      subtitle += autoLang({ zh: `，奖励骰 x ${bonus}`, en: `, Bonus Die x ${bonus}` });
    } else if (bonus && bonus < 0) {
      subtitle += autoLang({ zh: `，惩罚骰 x ${-bonus}`, en: `, Penalty Die x ${-bonus}` });
    }
    showToast({
      title: title,
      subtitle: alterNumDice || subtitle,
      text: autoLang({ zh: `骰子点数：${results.join("、")}`, en: `Dice Numbers: ${results.join(", ")}` })
    });
    if (shouldPlaySound) {
      num > 1 || dice === 100 ? playSound("dice") : playSound("one-die");
    }
  }

  function onChapterAction(action, param) {
    console.log(`Game - onChapterAction: ${action} with params: ${JSON.stringify(param)}`);
    if (action in actions) {
      return actions[action](param);
    } else {
      return { error: `Chapter Action ${action} not found` };
    }
  }

  function onCharacterAction(action, param) {
    console.log(`Game - onCharacterAction: ${action} with params: ${JSON.stringify(param)}`);
    if (action in actions) {
      return actions[action](param);
    } else {
      return { error: `Character Action ${action} not found` };
    }
  }

  function onUpdateSnapshot() {
    dispatch(createSnapshotThunk());
  }

  function onHistorySelected(historyIndex) {
    console.log(`Game - onJumpToChapter: historyIndex: ${historyIndex}`);
    loadHistoryStates(historyIndex);
    dispatch(setHistoryIndex(historyIndex));
  }

  function onNextChapter(nextKey, historyItem) {
    console.log(`Game - nextChapter: c${chapterKey} => c${nextKey}, historyItem: ${JSON.stringify(historyItem)}`);
    if (historyItem) {
      dispatch(addHistory({ ...historyItem, states: stateSnapshotRef.current }));
    }
    setIsReloading(false);
    setChapterKey(nextKey);

    const chapterVisitsCopy = [...chapterVisits];
    chapterVisitsCopy[nextKey] = true
    setChapterVisits(chapterVisitsCopy);
  }

  function loadHistoryStates(historyIndex) {
    const historyItem = historyStore.items[historyIndex];
    dispatch(setFlagWithSnapshot(historyItem.states.flags));
    dispatch(setAttrWithSnapshot(historyItem.states.attrs));
    dispatch(setOccupationName(historyItem.states.occupationName));
    dispatch(setCheckedSkills(historyItem.states.checkedSkills));

    const skillSnapshot = latestSkillSnapshot(historyStore.items, historyIndex + 1);
    dispatch(setSkillWithSnapshot(skillSnapshot));

    setCommittedMP(historyItem.states.committedMP || 0);
    setMapEnabled(historyItem.states.mapEnabled);

    setIsReloading(true);
    setChapterKey(historyItem.chapterKey);
  }

  function latestSkillSnapshot(historyItems, historyIndex) {
    const lastItem = historyItems.slice(0, historyIndex).findLast((historyItem) => historyItem.states.skills);
    return lastItem ? lastItem.states.skills : {};
  }

  const createSnapshotThunk = () => (dispatch, getState) => {
    const state = getState();
    stateSnapshotRef.current = {
      flags: snapshotFlag(state.flag),
      attrs: snapshotAttrs(state.character),
      occupationName: state.character.occupation.name,
      checkedSkills: [...state.character.checkedSkills],
      committedMP,
      mapEnabled,
    };

    const skillSnapshot = snapshotUpdatedSkills(state.character);
    const lastSkillSnapshot = latestSkillSnapshot(state.history.items, state.history.index);
    if (JSON.stringify(skillSnapshot) !== JSON.stringify(lastSkillSnapshot)) {
      stateSnapshotRef.current.skills = skillSnapshot;
    }
  }

  const saveThunk = (saveKey) => (dispatch, getState) => {
    const state = getState();
    const saveData = {
      chapterKey,
      flag: snapshotFlag(state.flag),
      character: snapshotCharacter(state.character),
      history: state.history,
      chapterVisits: utils.booleanToInt32Array(chapterVisits),
      endings: [...endings],
      committedMP,
      mapEnabled,
    }
    localStorage.setItem(saveKey, JSON.stringify(saveData));
  }

  function load(saveKey) {
    const saveData = localStorage.getItem(saveKey);
    if (saveData) {
      const {
        chapterKey: chapterKeyToLoad,
        flag: flagToLoad,
        character: characterToLoad,
        history: historyToLoad,
        chapterVisits: chapterVisitsToLoad,
        endings: endingsToLoad,
        committedMP: committedMPToLoad,
        mapEnabled: mapEnabledToLoad,
      } = JSON.parse(saveData);

      dispatch(setFlagWithSnapshot(flagToLoad));
      dispatch(setCharsWithSnapshot(characterToLoad.charsSnapshot));
      dispatch(setAttrWithSnapshot(characterToLoad.attrsSnapshot));
      dispatch(setSkillWithSnapshot(characterToLoad.skillsSnapshot));
      dispatch(setOccupation(characterToLoad.occupation));
      dispatch(setName(characterToLoad.info.name));
      dispatch(setAge(characterToLoad.info.age));
      dispatch(setCheckedSkills(characterToLoad.checkedSkills));
      dispatch(restoreSkillCustomNames(characterToLoad.skillCustomNames));
      dispatch(restoreHistory(historyToLoad));
      setChapterVisits(utils.int32ToBooleanArray(chapterVisitsToLoad, 271));
      setEndings(endingsToLoad);
      setCommittedMP(committedMPToLoad);
      setMapEnabled(mapEnabledToLoad);

      setIsReloading(true);
      setChapterKey(chapterKeyToLoad);
    }
  }
  
  // Cheating
  window.goto = (chapterKey) => {
    console.log(`Game - goto: to chapter ${chapterKey}`);
    setChapterKey(chapterKey);
  }
  window.setattr = (key, value) => {
    console.log(`Game - setattr: ${key} = ${value}/${value}`);
    dispatch(initAttr({ attrKey: key, value }));
  }
  window.setskill = (key, value) => {
    console.log(`Game - setskill: ${key} = ${value}`);
    dispatch(initSkill({ skillKey: key, value }));
  }

  return (
    <FlagCheckContext.Provider value={flagCheck}>
      <div className="row">
        <div id="chapter" className="col px-2">
          <Chapter {...{
            chapterKey,
            committedMP,
            isReloading,
            onNextChapter,
            onUpdateSnapshot,
            onChapterAction
          }} />
        </div>
        {showCharacter && (
          <div id="character" className="col">
            <Character {...{ onCharacterAction }} />
          </div>
        )}
      </div>
      <HistoryModal {...{ onHistorySelected }} />
      <AchievementModal {...{ chapterVisits, endings }} />
    </FlagCheckContext.Provider>
  )
}
