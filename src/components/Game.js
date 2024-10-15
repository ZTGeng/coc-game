import { useState, useEffect, useRef, useContext, createContext } from "react";
import { LanguageContext } from "../App";
import Character from "./character/Character";
import characterSheet from "./character/characterSheet";
import Chapter from "./game/Chapter";
import chapterMap from "./game/chapterMap";
import MapModal from "./map/MapModal";
import HistoryModal from "./HistoryModal";
import { showToast } from "./ToastMessage";
import flagConditionCheckProvider from "./flagCheck";
import * as utils from "../utils";

const initFlags = {
  flag_characteristics_editable: false,
  flag_occupation_skills_editable: false,
  flag_hobby_skills_editable: false,

  flag_bought_knife: false,
  flag_found_cliff_ladder: false,
  flag_meet_arbogast: false,
  flag_c167_bear_attack_finished: false,
  flag_involved_fighting: false,
  flag_searched_book_shelf: false,
  flag_learned_magic_arbogast: false,
  
  flag_major_wound: false,
  flag_penalty_die: false,


  flag_hp_reduced: false,
  flag_san_reduced: false,
  flag_mp_used: false,

  flag_c120_tried_three_options: false,
  flag_found_poem_book: false,
  flag_learned_magic_summon: false,
  flag_learned_magic_order: false
};

const initChars = {
  STR: { key: "STR", value: 80 },
  CON: { key: "CON", value: 50 },
  SIZ: { key: "SIZ", value: 50 },
  DEX: { key: "DEX", value: 50 },
  APP: { key: "APP", value: 60 },
  INT: { key: "INT", value: 60 },
  POW: { key: "POW", value: 70 },
  EDU: { key: "EDU", value: 40 },
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

export const FlagsContext = createContext();
export const HighlightContext = createContext();

const emptyHighlight = [];

export default function Game({ showCharacter, setShowCharacter, mapEnabled, setMapEnabled, saveLoad, playSound }) {
  const { autoLang } = useContext(LanguageContext);
  const [flags, setFlags] = useState(initFlags);
  const [chapterKey, setChapterKey] = useState(0);
  const [chapterHistory, setChapterHistory] = useState([]);
  const [chars, setChars] = useState(initChars);
  const [attributes, setAttributes] = useState(initAttributes);
  const [skills, setSkills] = useState(initSkills);
  const [occupation, setOccupation] = useState(initOccupation);
  const [info, setInfo] = useState(initInfo);
  const [highlight, setHighlight] = useState(emptyHighlight);
  const [mapLocation, setMapLocation] = useState(null);
  const [c25OptionsSelected, setC25OptionsSelected] = useState([false, false, false, false, false, false]);
  // console.log(`on Game refresh: chapterFlags: ${JSON.stringify(flags)}`);
  console.log(`Game refresh ${JSON.stringify(flags)}`);

  useEffect(() => {
    console.log(`Game - useEffect: chapterKey: ${chapterKey}, saveLoad: ${JSON.stringify(saveLoad)}`);
    if (Object.keys(saveLoad).length > 0) {
      loadState(saveLoad);
    }
  }, [saveLoad]);

  const flagFunctions = {
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
    "flag_hp_zero": () => attributes.HP.value === 0,
  };
  const flagConditionCheck = flagConditionCheckProvider(flags, flagFunctions);

  function onChapterAction(action, param) {
    console.log(`Game - onChapterAction: ${action} with params: ${JSON.stringify(param)}`);
    action in actions && actions[action](param);
  }

  function onCharacterAction(action, param) {
    console.log(`Game - onCharacterAction: ${action} with params: ${JSON.stringify(param)}`);
    action in actions && actions[action](param);
  }

  let flagsCopy = {...flags};
  let highlightCopy = [...highlight];

  const addToHighlight = (key, level) => {
    highlightCopy = highlightCopy.filter(h => h.key !== key);
    if (level !== "none") {
      highlightCopy = [...highlightCopy, { key, level }];
    }
    setHighlight(highlightCopy);
  }

  const actions = {
    action_set_flag: (param) => { // param: { flag, value }
      flagsCopy = { ...flagsCopy, [param.flag]: param.value };
      setFlags(flagsCopy);
    },
    action_show_character_sheet: (param) => { // param: true/false/undefined
      setShowCharacter(param !== false);
    },
    action_set_highlight: (param) => { // param: { key, level } level: none/value/half/fifth/all/danger/success
      addToHighlight(param.key, param.level);
    },
    action_clear_highlight: () => { // param: key
      highlightCopy = emptyHighlight
      setHighlight(emptyHighlight);
    },
    action_check_in_skill_box: (param) => { // param: key
      setSkills({ ...skills, [param]: { ...skills[param], checked: true } });
    },
    action_adjust_attribute: (param) => { // param: { key, delta, noHighlight }, delta: Int or String like "-1d2"
      const newAttributes = { ...attributes };
      const attr = newAttributes[param.key];
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
        showDiceTitleToast(
          autoLang({ zh: `${attrName} ${param.delta}`, en: `${attrName} ${param.delta}` }), 
          parseInt(num), parseInt(dice), 0, results, false);
      } else {
        newValue = attr.value + param.delta;
      }
      newValue = Math.min(newValue, newAttributes[param.key].maxValue);
      newValue = Math.max(newValue, 0);

      if (param.key === "HP") {
        if (!param.noHighlight) {
          addToHighlight("HP", newValue < attr.value ? "danger" : "success");
        }
        if (newValue < attr.value) {
          playSound("hp-reduced");
        }
      } else if (param.key === "San") {
        if (!param.noHighlight) {
          addToHighlight("San", newValue < attr.value ? "danger" : "success");
        }
        // playSound("san-reduced");
      }

      newAttributes[param.key] = { ...attr, value: newValue };
      setAttributes(newAttributes);
    },
    action_adjust_skill: (param) => { // param: { key, delta }, delta: Int
      setSkills({ ...skills, [param.key]: { ...skills[param.key], value: skills[param.key].value + param.delta } });
    },
    action_dice_message: (param) => { // param: { title, num, dice, results, shouldPlaySound, bonus, alterNumDice }
      showDiceTitleToast(param.title, param.num, param.dice, param.bonus, param.results, param.shouldPlaySound, param.alterNumDice);
    },
    action_message: (param) => { // param: { title, subtitle, text, color }
      showToast(param);
    },
    action_set_char_related_values: () => {
      setSkills({
        ...skills,
        dodge: { ...skills.dodge, value: Math.floor(chars.DEX.value / 2), baseValue: Math.floor(chars.DEX.value / 2) },
        lang_own: { ...skills.lang_own, value: chars.EDU.value, baseValue: chars.EDU.value }
      });
    },
    action_initial_san_and_mp: () => {
      const san = chars.POW.value;
      const mp = Math.floor(chars.POW.value / 5);
      setAttributes({ ...attributes, San: { value: san, maxValue: san }, MP: { value: mp, maxValue: mp } });
      addToHighlight("San", "warning");
      addToHighlight("MP", "warning");
      addToHighlight("POW", "value");
    },
    action_initial_hp: () => {
      const hp = Math.floor((chars.SIZ.value + chars.CON.value) / 10);
      setAttributes({ ...attributes, HP: { value: hp, maxValue: hp } });
      addToHighlight("HP", "warning");
    },
    action_roll_luck_and_update_chapter: () => {
      const results = utils.roll(3, 6);
      const luck = results.reduce((a, b) => a + b, 0) * 5;

      showDiceTitleToast(autoLang({ zh: "投掷幸运", en: "Roll Luck" }), 3, 6, 0, results, true);
      setAttributes({ ...attributes, Luck: { value: luck } });
    },
    action_set_occupation_and_credit: (param) => { // param: { name, credit, skills, art, interpersonal, language, universal }
      setOccupation({ ...occupation, ...param });
      setSkills({ ...skills, credit: { ...skills.credit, value: param.credit, baseValue: param.credit } });
    },
    action_enable_map: () => {
      setMapEnabled(true);
    },
    action_c167_bear_attack: () => {
      let hpDelta = 0;
      for (let i = 0; i < 2; i++) {
        const attackCheck = utils.roll(1, 100);
        showDiceTitleToast(autoLang({ zh: "熊 爪击", en: "Bear Claw" }), 1, 100, 0, attackCheck, false);
        const title = autoLang({ zh: "熊的爪击", en: "Bear's Claw Attack" });
        if (attackCheck[0] <= 35) {
          const text = autoLang({ zh: "熊的爪击命中！", en: "The bear's claw attack hits!" });
          showToast({ title: title, text: text, color: "danger" });
          const damage = utils.roll(3, 6);
          showDiceTitleToast(autoLang(utils.TEXTS.damage), 3, 6, 0, damage, false);
          const damageNumber = damage.reduce((a, b) => a + b, 0);
          if (damageNumber >= attributes.HP.maxValue / 2) {
            flagsCopy = { ...flagsCopy, flag_major_wound: true };
          }
          hpDelta -= damageNumber;
        } else {
          const text = autoLang({ zh: "熊的爪击未命中！", en: "The bear's claw attack misses!" });
          showToast({ title: title, text: text, color: "success" });
        }
      }
      if (hpDelta < 0) {
        const newHp = Math.max(attributes.HP.value + hpDelta, 0);
        setAttributes({ ...attributes, HP: { ...attributes.HP, value: newHp } });
        addToHighlight("HP", "danger");
        playSound("hp-reduced");
      }
      flagsCopy = { ...flagsCopy, flag_c167_bear_attack_finished: true };
      setFlags(flagsCopy);
    }
  }

  function nextChapter(chapterKey, optionKey, historyItem, addToHistory) {
    const next = chapterMap[chapterKey][optionKey];
    if (next) {
      console.log(`Game - nextChapter: c${chapterKey} - o${optionKey} => chapter ${next}`);
      setChapterKey(next);
      if (addToHistory) {
        setChapterHistory([...chapterHistory, historyItem]);
        // console.log(`Game - nextChapter: history updated: ${JSON.stringify(chapterHistory)}`);
      }
    }
  }

  function showDiceTitleToast(title, num, dice, bonus, results, shouldPlaySound, alterNumDice = undefined) {
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

  function saveState() {
    const state = {
      flags,
      chapterKey,
      chars,
      attributes,
      skills,
      occupation,
      info,
      c25OptionsSelected,
      mapEnabled,
    };
    localStorage.setItem("coc-state", JSON.stringify(state));
  }
  window.saveState = saveState;

  function loadState(state) {
    if (state) {
      setFlags(state.flags);
      setChapterKey(state.chapterKey);
      setChars(state.chars);
      setAttributes(state.attributes);
      setSkills(state.skills);
      setOccupation(state.occupation);
      setInfo(state.info);
      setC25OptionsSelected(state.c25OptionsSelected);
      setMapEnabled(state.mapEnabled);
    }
  }
  // window.loadState = loadState;
  
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
    <FlagsContext.Provider value={{ flagConditionCheck }}>
      <HighlightContext.Provider value={{ highlight }}>
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
              c25OptionsSelected,
              setC25OptionsSelected,
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
        <HistoryModal {...{ characterSheet, chapterHistory }} />
      </HighlightContext.Provider>
    </FlagsContext.Provider>
  )
}
