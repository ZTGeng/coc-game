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
  setSkillValueByDelta,
  doubleSkillValue,
  halfSkillValue,
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

const initChapterVisits = new Array(270).fill(false);
initChapterVisits[0] = true;

export default function Game({ showCharacter, setShowCharacter, mapEnabled, setMapEnabled, saveLoad, playSound }) {
  const { autoLang } = useContext(LanguageContext);
  const characterSheet = useContext(CharacterSheetContext);
  const [chapterKey, setChapterKey] = useState(0);
  const [chapterVisits, setChapterVisits] = useState(initChapterVisits);
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
    "flag_siz_greater_than_40": () => charsStore.SIZ.value > 40,
    "flag_dex_greater_than_siz": () => charsStore.DEX.value > charsStore.SIZ.value,
    "flag_luck_unfinished": () => attrsStore.Luck.value === "",
    "flag_hp_zero": () => attrsStore.HP.value <= 0,
  };

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
      console.log(`action_set_flag: ${param.flag} = ${param.value}`);
      dispatch(setFlag({ flag: param.flag, value: param.value }));
    },
    action_show_character_sheet: (param) => { // param: true/false/undefined
      setShowCharacter(param !== false);
    },
    action_set_highlight: (param) => { // param: { key, level, color } level: none/value/half/fifth/all, color: danger/success
      setHighlight(param.key, param.level, param.color);
    },
    action_clear_highlight: () => {
      dispatch(clearHighlights());
    },
    action_check_in_skill_box: (param) => { // param: key
      dispatch(checkSkillBox(param));
    },
    action_adjust_attribute: (param) => { // param: { key, delta, noHighlight }, delta: Int or String like "-1d2"
      const attr = attrsStore[param.key];
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
    },
    action_adjust_skill: (param) => { // param: { key, delta }, delta: Int
      dispatch(setSkillValueByDelta({ skillKey: param.key, delta: param.delta }));
    },
    action_double_skill_value: (param) => { // param: key
      dispatch(doubleSkillValue(param));
    },
    action_half_skill_value: (param) => { // param: key
      dispatch(halfSkillValue(param));
    },
    action_dice_message: (param) => { // param: { title, num, dice, bonus, results, shouldPlaySound, alterNumDice }
      showDiceToast(param.title, param.num, param.dice, param.bonus, param.results, param.shouldPlaySound, param.alterNumDice);
    },
    action_message: (param) => { // param: { title, subtitle, text, color }
      showToast(param);
    },
    action_set_char_related_values: () => {
      dispatch(initSkill({ skillKey: "dodge", value: Math.floor(charsStore.DEX.value / 2) }));
      dispatch(initSkill({ skillKey: "lang_own", value: charsStore.EDU.value }));
    },
    action_initial_san_and_mp: () => {
      dispatch(initAttr({ attrKey: "San", value: charsStore.POW.value }));
      dispatch(initAttr({ attrKey: "MP", value: Math.floor(charsStore.POW.value / 5) }));
      setHighlight("San", "value");
      setHighlight("MP", "value");
      setHighlight("POW", "value");
    },
    action_initial_hp_and_reset_luck: () => {
      dispatch(initAttr({ attrKey: "HP", value: Math.floor((charsStore.SIZ.value + charsStore.CON.value) / 10) }));
      dispatch(setAttr({ attrKey: "Luck", value: "" }));
      setHighlight("HP", "value");
      setHighlight("Luck", "value");
    },
    action_init_luck: () => {
      const results = utils.roll(3, 6);
      const luck = results.reduce((a, b) => a + b, 0) * 5;
      dispatch(initAttr({ attrKey: "Luck", value: luck }));
      showDiceToast(autoLang(utils.TEXTS.rollLuck), 3, 6, 0, results, true);
    },
    action_set_occupation_and_credit: (param) => { // param: { name, credit, skills, art, interpersonal, language, universal }
      dispatch(setOccupation(param));
      dispatch(initSkill({ skillKey: "credit", value: param.credit }));
    },
    action_enable_map: () => {
      setMapEnabled(true);
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
    action in actions && actions[action](param);
  }

  function onCharacterAction(action, param) {
    console.log(`Game - onCharacterAction: ${action} with params: ${JSON.stringify(param)}`);
    action in actions && actions[action](param);
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
      setChapterVisits(utils.int32ToBooleanArray(chapterVisitsToLoad));
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
      <AchievementModal {...{ chapterVisits }} />
    </FlagCheckContext.Provider>
  )
}
