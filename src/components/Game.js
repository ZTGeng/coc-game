import { useState, useEffect, useRef, useContext, createContext } from "react";
import { LanguageContext } from "../App";
import Character from "./character/Character";
import characterSheet from "./character/characterSheet";
import Chapter from "./game/Chapter";
import chapterMap from "./game/chapterMap";
import { showToast } from "./ToastMessage";
import * as utils from "../utils";

const initFlags = {
  flag_characteristics_editable: false,
  // flag_characteristics_unfinished: true,
  flag_skills_editable: false,
  flag_skills_editing_phase_2: false,
  // flag_skills1_unfinished: true,
  flag_skills2_unfinished: true,
  flag_opposed_roll_phase2: false,

  flag_hp_reduced: false,
  flag_san_reduced: false,
  flag_major_wound: false,
  flag_mp_used: false,

  flag_c25_tried_four_options: false,
  flag_c120_tried_three_options: false,
  flag_found_cliff_ladder: false,
  flag_bought_knife: false,
  flag_meet_aboganster: false,
  flag_involved_fighting: false,
  flag_punish_dice: false,
  flag_searched_book_shelf: false,
  flag_found_poem_book: false,
  flag_learned_magic_aboganster: false,
  flag_learned_magic_summon: false,
  flag_learned_magic_order: false
};

const initChars = {
  STR: { key: "STR", value: 40 },
  CON: { key: "CON", value: 50 },
  SIZ: { key: "SIZ", value: 50 },
  DEX: { key: "DEX", value: 50 },
  APP: { key: "APP", value: 60 },
  INT: { key: "INT", value: 60 },
  POW: { key: "POW", value: 70 },
  EDU: { key: "EDU", value: 80 },
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

export const FlagsContext = createContext();
export const HighlightContext = createContext();

export default function Game({ showCharacter, setShowCharacter, playSound }) {
  const { language } = useContext(LanguageContext);
  const [flags, setFlags] = useState(initFlags);
  const [chapterKey, setChapterKey] = useState(0);
  const [chars, setChars] = useState(initChars);
  const [attributes, setAttributes] = useState(initAttributes);
  const [skills, setSkills] = useState(initSkills);
  const [occupation, setOccupation] = useState(initOccupation);
  const [highlight, setHighlight] = useState([]);
  // console.log(`on Game refresh: chapterFlags: ${JSON.stringify(flags)}`);
  console.log(`Game refresh`);

  function flagConditionCheck(condition) {
    if (Array.isArray(condition)) {
      return condition.every(cond => flagConditionCheck(cond));
    } else if (typeof condition === 'boolean') {
      return condition;
    } else if (typeof condition === 'string') {
      if (condition.startsWith("!")) {
        return !flagConditionCheck(condition.slice(1));
      }
      // console.log(`Checking flag: ${condition} in ${JSON.stringify(flags)}`);
      switch (condition) {
        // Chapter needs information from Character
        case "flag_characteristics_unfinished":
          return Object.values(chars).some(char => char.value === "");
        case "flag_skills1_unfinished":
          const occupationSkillsNum = Object.keys(skills).filter(skillKey => skills[skillKey].occupation).length;
          const occupationSkillsMaxNum = occupation.skills.length + occupation.art + occupation.interpersonal + occupation.language + occupation.universal;
          return occupationSkillsNum < occupationSkillsMaxNum;
        case "flag_siz_greater_than_40":
          return chars.SIZ.value > 40;
        case "flag_dex_greater_than_siz":
          return chars.DEX.value > chars.SIZ.value;
        case "flag_luck_unfinished":
          return attributes.Luck.value === "";
      }
      if (condition in flags) {
        return flags[condition];
      }
    }
    console.log(`Un-handled condition: ${condition} in ${JSON.stringify(flags)}`);
    return false;
  }

  function onChapterAction(action, param) {
    console.log(`Game - onChapterAction: ${action} with params: ${JSON.stringify(param)}`);
    onAction(action, param);
  }

  function onCharacterAction(action, param) {
    console.log(`Game - onCharacterAction: ${action} with params: ${JSON.stringify(param)}`);
    onAction(action, param);
  }

  function onAction(action, param) {
    switch (action) {
      case "action_set_flag": // param: { flag, value }
        setFlags({ ...flags, [param.flag]: param.value });
        break;
      case "action_show_character_sheet": // param: true/false/undefined
        setShowCharacter(param !== false);
        break;
      case "action_set_highlight": // param: { key, level }
        if (param.level === "none") {
          setHighlight(highlight.filter(h => h.key !== param.key));
        } else {
          setHighlight([...highlight, param]);
        }
        break;
      case "action_adjust_attribute": // param: { key, delta }
        const newAttributes = { ...attributes };
        newAttributes[param.key].value += param.delta;
        setAttributes(newAttributes);
        break;
      case "action_show_dice_toast": // param: { num, dice, results, shouldPlaySound }
        showDiceToast(param.num, param.dice, param.results, param.shouldPlaySound);
        break;
      case "action_set_char_related_values":
        setSkills({ 
          ...skills, 
          dodge: { ...skills.dodge, value: Math.floor(chars.DEX.value / 2), baseValue: Math.floor(chars.DEX.value / 2) }, 
          lang_own: { ...skills.lang_own, value: chars.EDU.value, baseValue: chars.EDU.value } 
        });
        break;
      case "action_initial_san_and_mp":
        const san = chars.POW.value;
        const mp = Math.floor(chars.POW.value / 5);
        setAttributes({ ...attributes, San: { value: san, maxValue: san }, MP: { value: mp, maxValue: mp } });
        break;
      case "action_initial_hp":
        const hp = Math.floor((chars.SIZ.value + chars.CON.value) / 10);
        setAttributes({ ...attributes, HP: { value: hp, maxValue: hp } });
        break;
      case "action_roll_luck_and_update_chapter":
        const results = utils.roll(3, 6);
        const luck = results.reduce((a, b) => a + b, 0) * 5;

        showDiceToast(3, 6, results, true);
        setAttributes({ ...attributes, Luck: { value: luck } });
        break;
      case "action_set_occupation_and_credit": // param: { name, credit, skills, art, interpersonal, language, universal }
        setOccupation({ ...occupation, ...param });
        setSkills({ ...skills, credit: { ...skills.credit, value: param.credit, baseValue: param.credit } });
        break;
    }
  }

  function nextChapter(chapterKey, optionKey) {
    const next = chapterMap[chapterKey][optionKey];
    if (next) {
      console.log(`Game - nextChapter: c${chapterKey} - o${optionKey} => chapter ${next}`);
      setChapterKey(next);
    }
  }

  function showDiceToast(num, dice, results, shouldPlaySound) {
    showToast({
      title: language === "zh" ? `投掷${num}D${dice}` : `Roll ${num}D${dice}`,
      text: language === "zh" ? `结果：${results.join("、")}` : `Results: ${results.join(", ")}`
    });
    if (shouldPlaySound) {
      num > 1 || dice === 100 ? playSound("dice") : playSound("one-die");
    }
  }
  
  // Cheating
  window.goto = (chapterKey) => {
    console.log(`Game - goto: to chapter ${chapterKey}`);
    setChapterKey(chapterKey);
  }
  window.setattr = (key, value) => {
    console.log(`Game - setattr: ${key} = ${value}`);
    setAttributes({ ...attributes, [key]: { value } });
  }

  return (
    <FlagsContext.Provider value={{ flagConditionCheck }}>
      <HighlightContext.Provider value={{ highlight }}>
        <div className="row">
          <div id="chapter" className="col px-2">
            <Chapter {...{ chapterKey, characterSheet, chars, attributes, skills, nextChapter, onChapterAction } }/>
          </div>
          {showCharacter && <div id="character" className="col">
            <Character {...{ characterSheet, chars, setChars, attributes, skills, setSkills, occupation, onCharacterAction }} />
          </div>}
        </div>
      </HighlightContext.Provider>
    </FlagsContext.Provider>
  )
}
