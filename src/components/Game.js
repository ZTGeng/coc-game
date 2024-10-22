import { useState, useEffect, useRef, useContext, createContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import { LanguageContext } from "../App";
import Character from "./character/Character";
import characterSheet from "./character/characterSheet";
import Chapter from "./chapter/Chapter";
import chapterMap from "./chapter/chapterMap";
import MapModal from "./MapModal";
import HistoryModal from "./HistoryModal";
import AchievementModal from "./AchievementModal";
import { showToast } from "./ToastMessage";
import { setFlag, FlagCheckContext, createFlagCheck } from "../store/slices/flagSlice";
import { addOrUpdateHighlight, removeHighlight, clearHighlights } from "../store/slices/highlightSlice";
import * as utils from "../utils/utils";

const initChars = {
  STR: { value: 80 },
  CON: { value: 50 },
  SIZ: { value: 50 },
  DEX: { value: 50 },
  APP: { value: 60 },
  INT: { value: 60 },
  POW: { value: 70 },
  EDU: { value: 40 },
};

const initAttributes = {
  HP: { value: "", maxValue: "" },
  San: { value: "", maxValue: "" },
  Luck: { value: "" },
  MP: { value: "", maxValue: "" },
};

const initSkills = Object.entries(characterSheet.skills).reduce((acc, [key, item]) => {
  if (!(item.group)) {
    acc[key] = { value: item.value, baseValue: item.value, checked: false, occupation: false, hobby: false };
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

const initChapterStatus = new Uint32Array(9);
initChapterStatus[0] = 1;

export default function Game({ showCharacter, setShowCharacter, mapEnabled, setMapEnabled, saveLoad, playSound }) {
  const { autoLang } = useContext(LanguageContext);
  const [chapterKey, setChapterKey] = useState(0);
  const [chars, setChars] = useState(initChars);
  const [attributes, setAttributes] = useState(initAttributes);
  const [skills, setSkills] = useState(initSkills);
  const [occupation, setOccupation] = useState(initOccupation);
  const [info, setInfo] = useState(initInfo);
  const [mapLocation, setMapLocation] = useState(null);
  const [chapterStatus, setChapterStatus] = useState(initChapterStatus);
  const [chapterHistory, setChapterHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isReloading, setIsReloading] = useState(false);
  // console.log(`on Game refresh: chapterFlags: ${JSON.stringify(flags)}`);
  // console.log(`Game refresh, chapterKey: ${chapterKey}, skills: ${JSON.stringify(skills)}`);
  const dispatch = useDispatch();
  const flagStore = useSelector(state => state.flag);

  useEffect(() => {
    console.log(`Game - useEffect: chapterKey: ${chapterKey}， saveLoad: ${saveLoad.action}`);
    if (saveLoad.action === "save") {
      save(saveLoad.saveKey);
    } else if (saveLoad.action === "load") {
      load(saveLoad.saveKey);
    }
  }, [saveLoad]);

  // Source of Truth of current state during chapter transitions
  const stateSnapshotRef = useRef({});
  console.log(`Game refresh - stateSnapshotRef: ${JSON.stringify(stateSnapshotRef.current)}`);
  let attrCopy = {...attributes};
  let skillsCopy = {...skills};

  function gameSnapshot(doIncludeSkillSnapshot = false) {
    const snapshot = {
      chapterKey,
      flags: flagStore,
      attributes: { ...attrCopy },
      occupationName: occupation.name,
      info,
      mapEnabled,
      checkedSkills: Object.keys(skillsCopy).filter(skillKey => skillsCopy[skillKey].checked),
    };

    const currentSkillSnapshot = Object.keys(skillsCopy)
      .filter(skillKey => skillsCopy[skillKey].value !== initSkills[skillKey].value 
        || skillsCopy[skillKey].customName
        || skillsCopy[skillKey].occupation
        || skillsCopy[skillKey].hobby)
      .reduce((acc, skillKey) => {
        acc[skillKey] = {};
        skillsCopy[skillKey].value !== initSkills[skillKey].value && (acc[skillKey].value = skillsCopy[skillKey].value);
        skillsCopy[skillKey].customName && (acc[skillKey].customName = skillsCopy[skillKey].customName);
        skillsCopy[skillKey].occupation && (acc[skillKey].occupation = skillsCopy[skillKey].occupation);
        skillsCopy[skillKey].hobby && (acc[skillKey].hobby = skillsCopy[skillKey].hobby);
        return acc;
      }, {});
    const lastSkillSnapshot = findLastSkillSnapshot(historyIndex);
    if (doIncludeSkillSnapshot || JSON.stringify(currentSkillSnapshot) !== JSON.stringify(lastSkillSnapshot)) {
      snapshot.skills = currentSkillSnapshot;
    }

    return snapshot;
  }

  function setSkillsWithSnapshot(skillSnapshot, checkedSkills) {
    skillsCopy = Object.keys(skillSnapshot)
      .reduce((acc, skillKey) => {
        acc[skillKey] = { ...initSkills[skillKey] };
        (skillSnapshot[skillKey].value || skillSnapshot[skillKey].value === 0)
          && (acc[skillKey].value = skillSnapshot[skillKey].value);
        skillSnapshot[skillKey].customName && (acc[skillKey].customName = skillSnapshot[skillKey].customName);
        skillSnapshot[skillKey].occupation && (acc[skillKey].occupation = skillSnapshot[skillKey].occupation);
        skillSnapshot[skillKey].hobby && (acc[skillKey].hobby = skillSnapshot[skillKey].hobby);
        return acc;
      }, { ...initSkills });
    checkedSkills.forEach(skillKey => skillsCopy[skillKey].checked = true);
    setSkills(skillsCopy);
  }

  const gameFlagFunc = {
    "flag_characteristics_unfinished": () => Object.values(chars).some(char => char.value === ""),
    "flag_skills_occupation_unfinished": () => {
      const occupationSkillsNum = Object.keys(skills).filter(skillKey => skills[skillKey].occupation).length;
      const occupationSkillsMaxNum = occupation.skills.length + occupation.art + occupation.interpersonal + occupation.language + occupation.universal;
      return occupationSkillsNum < occupationSkillsMaxNum;
    },
    "flag_skills_hobby_unfinished": () => Object.keys(skills).filter(skillKey => skills[skillKey].hobby).length < 4,
    "flag_siz_greater_than_40": () => chars.SIZ.value > 40,
    "flag_dex_greater_than_siz": () => chars.DEX.value > chars.SIZ.value,
    "flag_luck_unfinished": () => attributes.Luck.value === "",
    "flag_track_skill_box_checked": () => skills.track.checked,
    "flag_hp_zero": () => attributes.HP.value <= 0,
  };

  function checkFlagInStore(flag) {
    if (flag in flagStore) {
      return flagStore[flag];
    }
    console.error(`Game - checkFlagInStore: flag ${flag} not found in store`);
    return false;
  }
  const flagCheck = createFlagCheck(gameFlagFunc, checkFlagInStore);

  function onChapterAction(action, param) {
    console.log(`Game - onChapterAction: ${action} with params: ${JSON.stringify(param)}`);
    action in actions && actions[action](param);
  }

  function onCharacterAction(action, param) {
    console.log(`Game - onCharacterAction: ${action} with params: ${JSON.stringify(param)}`);
    action in actions && actions[action](param);
  }

  const adjustHighlight = (key, level, color) => {
    if (level === "none") {
      dispatch(removeHighlight(key));
    } else {
      dispatch(addOrUpdateHighlight({ key, level, color }));
    }
  }

  const actions = {
    action_set_flag: (param) => { // param: { flag, value }
      console.log(`action_set_flag: ${param.flag} = ${param.value}`);
      dispatch(setFlag({ flag: param.flag, value: param.value }));
    },
    action_show_character_sheet: (param) => { // param: true/false/undefined
      setShowCharacter(param !== false);
    },
    action_set_highlight: (param) => { // param: { key, level, color } level: none/value/half/fifth/all, color: danger/success
      adjustHighlight(param.key, param.level, param.color);
    },
    action_clear_highlight: () => {
      dispatch(clearHighlights());
    },
    action_check_in_skill_box: (param) => { // param: key
      setSkills({ ...skills, [param]: { ...skills[param], checked: true } });
    },
    action_adjust_attribute: (param) => { // param: { key, delta, noHighlight }, delta: Int or String like "-1d2"
      const attr = attrCopy[param.key];
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
      newValue = Math.min(newValue, attrCopy[param.key].maxValue);
      newValue = Math.max(newValue, 0);

      if (param.key === "HP") {
        if (!param.noHighlight) {
          adjustHighlight("HP", "value", newValue < attr.value ? "danger" : "success");
        }
        if (newValue < attr.value) {
          playSound("hp-reduced");

          if (attr.value - newValue >= attr.maxValue / 2) {
            dispatch(setFlag({ flag: "flag_major_wound", value: true }));
          }
        }
      } else if (param.key === "San") {
        if (!param.noHighlight) {
          adjustHighlight("San", "value", newValue < attr.value ? "danger" : "success");
        }
        playSound("san-reduced");
      }

      attrCopy[param.key] = { ...attr, value: newValue };
      setAttributes(attrCopy);
    },
    action_adjust_skill: (param) => { // param: { key, delta }, delta: Int
      skillsCopy = { ...skillsCopy, [param.key]: { ...skillsCopy[param.key], value: skillsCopy[param.key].value + param.delta } };
      setSkills(skillsCopy);
    },
    action_double_skill_value: (param) => { // param: key
      skillsCopy = { ...skillsCopy, [param]: { ...skillsCopy[param], value: skillsCopy[param].value * 2 } };
      setSkills(skillsCopy);
    },
    action_half_skill_value: (param) => { // param: key
      skillsCopy = { ...skillsCopy, [param]: { ...skillsCopy[param], value: Math.floor(skillsCopy[param].value / 2) } };
      setSkills(skillsCopy);
    },
    action_dice_message: (param) => { // param: { title, num, dice, bonus, results, shouldPlaySound, alterNumDice }
      showDiceToast(param.title, param.num, param.dice, param.bonus, param.results, param.shouldPlaySound, param.alterNumDice);
    },
    action_message: (param) => { // param: { title, subtitle, text, color }
      showToast(param);
    },
    action_set_char_related_values: () => {
      skillsCopy = {
        ...skillsCopy,
        dodge: { ...skillsCopy.dodge, value: Math.floor(chars.DEX.value / 2), baseValue: Math.floor(chars.DEX.value / 2) },
        lang_own: { ...skillsCopy.lang_own, value: chars.EDU.value, baseValue: chars.EDU.value }
      }
      setSkills(skillsCopy);
    },
    action_initial_san_and_mp: () => {
      const san = chars.POW.value;
      const mp = Math.floor(chars.POW.value / 5);
      attrCopy = { ...attrCopy, San: { value: san, maxValue: san }, MP: { value: mp, maxValue: mp } };
      setAttributes(attrCopy);
      adjustHighlight("San", "value");
      adjustHighlight("MP", "value");
      adjustHighlight("POW", "value");
    },
    action_initial_hp_and_reset_luck: () => {
      const hp = Math.floor((chars.SIZ.value + chars.CON.value) / 10);
      attrCopy = { ...attrCopy, HP: { value: hp, maxValue: hp }, Luck: { value: "" } };
      setAttributes(attrCopy);
      adjustHighlight("HP", "value");
      adjustHighlight("Luck", "value");
    },
    action_init_luck: () => {
      const results = utils.roll(3, 6);
      const luck = results.reduce((a, b) => a + b, 0) * 5;

      attrCopy = { ...attrCopy, Luck: { value: luck } };
      setAttributes(attrCopy);
      showDiceToast(autoLang(utils.TEXTS.rollLuck), 3, 6, 0, results, true);
    },
    action_set_occupation_and_credit: (param) => { // param: { name, credit, skills, art, interpersonal, language, universal }
      setOccupation({ ...occupation, ...param });
      skillsCopy = { ...skillsCopy, credit: { ...skillsCopy.credit, value: param.credit, baseValue: param.credit } }
      setSkills(skillsCopy);
    },
    action_enable_map: () => {
      setMapEnabled(true);
    },
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
  
  function nextChapter(optionKey, historyItem, addToHistory) {
    const next = chapterMap[chapterKey][optionKey];
    if (next) {
      console.log(`Game - nextChapter: c${chapterKey} - o${optionKey} => c${next}`);
      if (addToHistory) {
        historyItem.states = stateSnapshotRef.current;
        if (historyIndex !== -1) {
          setChapterHistory([...chapterHistory.slice(0, historyIndex), historyItem]);
          setHistoryIndex(-1);
        } else {
          setChapterHistory([...chapterHistory, historyItem]);
        }
        // console.log(`Game - nextChapter: history updated: ${JSON.stringify(chapterHistory)}`);
      }
      setIsReloading(false);
      setChapterKey(next);
      if (!isChapterVisited(next)) {
        markChapterVisited(next);
      }
    }
  }

  function onJumpToChapter(historyIndex) {
    console.log(`Game - onJumpToChapter: historyIndex: ${historyIndex}`);
    loadHistoryStates(historyIndex);
    setHistoryIndex(historyIndex);
  }

  function updateStateSnapshot() {
    stateSnapshotRef.current = gameSnapshot();
  }

  function loadHistoryStates(historyIndex) {
    const states = chapterHistory[historyIndex].states;

    const skillSnapshot = findLastSkillSnapshot(historyIndex + 1);
    // console.log(`load chrpterKey: ${states.chapterKey}, states.skillHistoryIndex: ${states.skillHistoryIndex}, initSkills: ${JSON.stringify(initSkills)}`);
    // console.log(`load skillSnapshot: ${JSON.stringify(skillSnapshot)}`);
    setSkillsWithSnapshot(skillSnapshot, states.checkedSkills);

    // setFlags({ ...initFlags, ...states.flags });
    setAttributes(states.attributes);
    setOccupation({ name: states.occupationName });
    setInfo(states.info);
    setMapEnabled(states.mapEnabled);

    setIsReloading(true);
    setChapterKey(states.chapterKey);
  }

  function findLastSkillSnapshot(historyItemIndex) {
    const lastItem = chapterHistory.slice(0, historyItemIndex).findLast((historyItem) => historyItem.states && historyItem.states.skills);
    return lastItem ? lastItem.states.skills : {};
  }

  function save(saveKey) {
    const saveData = {
      chapterHistory,
      chapterStatus: Array.from(chapterStatus),
      chars,
      currentStates: stateSnapshotRef.current,
    }
    localStorage.setItem(saveKey, JSON.stringify(saveData));
  }

  function load(saveKey) {
    const saveData = localStorage.getItem(saveKey);
    if (saveData) {
      const {
        chapterHistory: chapterHistoryToLoad,
        chapterStatus: chapterStatusToLoad,
        chars: charsToLoad,
        currentStates: statesToLoad
      } = JSON.parse(saveData);
      setChapterHistory(chapterHistoryToLoad);
      setChapterStatus(new Uint32Array(chapterStatusToLoad));
      setChars(charsToLoad);

      let skillSnapshot = statesToLoad.skills;
      if (!skillSnapshot) {
        const lastItemWithSkillSnapshot = chapterHistoryToLoad.findLast((historyItem) => historyItem.states && historyItem.states.skills);
        skillSnapshot = lastItemWithSkillSnapshot ? lastItemWithSkillSnapshot.states.skills : {};
      }
      setSkillsWithSnapshot(skillSnapshot, statesToLoad.checkedSkills);

      // setFlags({ ...initFlags, ...statesToLoad.flags });
      setAttributes(statesToLoad.attributes);
      setOccupation({ name: statesToLoad.occupationName });
      setInfo(statesToLoad.info);
      setMapEnabled(statesToLoad.mapEnabled);

      setIsReloading(true);
      setChapterKey(statesToLoad.chapterKey);
    }
  }

  // 标记某个章节已访问
  function markChapterVisited(chapterIndex) {
    console.log(`Game - markChapterVisited: chapterStatusCopy ${JSON.stringify(chapterStatus)} `);
    const chapterStatusCopy = new Uint32Array(chapterStatus);
    const arrayIndex = Math.floor(chapterIndex / 32);
    const bitPosition = chapterIndex % 32;
    chapterStatusCopy[arrayIndex] |= (1 << bitPosition);
    setChapterStatus(chapterStatusCopy);
    for (let i = 0; i < chapterStatusCopy.length; i++) {
    console.log(`Game - markChapterVisited: chapterStatusCopy ${chapterStatusCopy[i]} `);
    }
  }

  // 检查某个章节是否已访问
  function isChapterVisited(chapterIndex) {
    const arrayIndex = Math.floor(chapterIndex / 32);
    const bitPosition = chapterIndex % 32;
    return (chapterStatus[arrayIndex] & (1 << bitPosition)) !== 0;
  }
  window.isChapterVisited = isChapterVisited;
  
  // Cheating
  window.goto = (chapterKey) => {
    console.log(`Game - goto: to chapter ${chapterKey}`);
    setChapterKey(chapterKey);
  }
  window.setattr = (key, value, maxValue) => {
    console.log(`Game - setattr: ${key} = ${value}/${maxValue}`);
    setAttributes({ ...attributes, [key]: { value, maxValue } });
  }
  window.setskill = (key, value) => {
    console.log(`Game - setskill: ${key} = ${value}`);
    setSkills({ ...skills, [key]: { ...skills[key], value } });
  }

  return (
    <FlagCheckContext.Provider value={flagCheck}>
        {/* <HighlightContext.Provider value={{ highlight }}> */}
          <div className="row">
            <div id="chapter" className="col px-2">
              <Chapter {...{ 
                chapterKey,
                characterSheet,
                chars,
                attributes,
                skills,
                nextChapter,
                setMapLocation,
                isReloading,
                updateStateSnapshot,
                onChapterAction }} />
            </div>
            { showCharacter && (
              <div id="character" className="col">
                <Character {...{ 
                  characterSheet, 
                  chars, 
                  setChars, 
                  attributes, 
                  skills, 
                  setSkills, 
                  occupation, 
                  info, 
                  setInfo, 
                  onCharacterAction }} />
              </div> 
            )}
          </div>
          <MapModal {...{ mapLocation }} />
          <HistoryModal {...{ characterSheet, chapterHistory, onJumpToChapter }} />
          <AchievementModal {...{ chapterStatus }} />
        {/* </HighlightContext.Provider> */}
    </FlagCheckContext.Provider>
  )
}
