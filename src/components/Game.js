import { useState, useEffect, useRef, useContext, createContext } from "react";
import { LanguageContext } from "../App";
import Character from "./character/Character";
import characterSheet from "./character/characterSheet";
import Chapter from "./game/Chapter";
import chapterMap from "./game/chapterMap";
import MapModal from "./map/MapModal";
import { showToast } from "./ToastMessage";
import flagConditionCheckProvider from "./flagCheck";
import * as utils from "../utils";

const initFlags = {
  flag_characteristics_editable: false,
  flag_occupation_skills_editable: false,
  flag_hobby_skills_editable: false,

  flag_bought_knife: false,
  flag_found_cliff_ladder: false,
  flag_meet_aboganster: false,


  flag_opposed_roll_phase2: false,

  flag_hp_reduced: false,
  flag_san_reduced: false,
  flag_major_wound: false,
  flag_mp_used: false,

  flag_c25_tried_four_options: false,
  flag_c120_tried_three_options: false,
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

export default function Game({ showCharacter, setShowCharacter, enableMap, playSound }) {
  const { language } = useContext(LanguageContext);
  const [flags, setFlags] = useState(initFlags);
  const [chapterKey, setChapterKey] = useState(0);
  const [chars, setChars] = useState(initChars);
  const [attributes, setAttributes] = useState(initAttributes);
  const [skills, setSkills] = useState(initSkills);
  const [occupation, setOccupation] = useState(initOccupation);
  const [highlight, setHighlight] = useState([]);
  // console.log(`on Game refresh: chapterFlags: ${JSON.stringify(flags)}`);
  console.log(`Game refresh ${JSON.stringify(flags)}`);

  function flagStringCheck(flag) {
    console.log(`Game flagConditionCheck: ${flag}`);
    switch (flag) {
      case "flag_characteristics_unfinished":
        return Object.values(chars).some(char => char.value === "");
      case "flag_skills_occupation_unfinished":
        const occupationSkillsNum = Object.keys(skills).filter(skillKey => skills[skillKey].occupation).length;
        const occupationSkillsMaxNum = occupation.skills.length + occupation.art + occupation.interpersonal + occupation.language + occupation.universal;
        return occupationSkillsNum < occupationSkillsMaxNum;
      case "flag_skills_hobby_unfinished":
        return Object.keys(skills).filter(skillKey => skills[skillKey].hobby).length < 4;
      case "flag_siz_greater_than_40":
        return chars.SIZ.value > 40;
      case "flag_dex_greater_than_siz":
        return chars.DEX.value > chars.SIZ.value;
      case "flag_luck_unfinished":
        return attributes.Luck.value === "";
      case "flag_track_skill_box_checked":
        return skills.track.checked;
    }
    if (flag in flags) {
      return flags[flag];
    }
    console.log(`Un-handled flag in Game: ${flag} in ${JSON.stringify(flags)}`);
    return false;
  }

  const flagConditionCheck = flagConditionCheckProvider(flagStringCheck);

  function onChapterAction(action, param) {
    console.log(`Game - onChapterAction: ${action} with params: ${JSON.stringify(param)}`);
    onAction(action, param);
  }

  function onCharacterAction(action, param) {
    console.log(`Game - onCharacterAction: ${action} with params: ${JSON.stringify(param)}`);
    onAction(action, param);
  }

  let flagsCopy = {...flags};
  let highlightCopy = [...highlight];

  function onAction(action, param) {
    switch (action) {
      case "action_set_flag": // param: { flag, value }
        flagsCopy = {...flagsCopy, [param.flag]: param.value};
        setFlags(flagsCopy);
        break;
      case "action_show_character_sheet": // param: true/false/undefined
        setShowCharacter(param !== false);
        break;
      case "action_set_highlight": // param: { key, level } level: none/value/half/fifth/all/danger/success
        highlightCopy = highlightCopy.filter(h => h.key !== param.key);
        if (param.level !== "none") {
          highlightCopy = [...highlightCopy, param];
        }
        setHighlight(highlightCopy);
        break;
      case "action_check_in_skill_box": // param: key
        setSkills({ ...skills, [param]: { ...skills[param], checked: true } });
        break;
      case "action_adjust_attribute": // param: { key, delta }, delta: Int or String like "-1d2"
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
          const [num, dice] = deltaString.split("d");
          const results = utils.roll(parseInt(num), parseInt(dice));
          newValue = attr.value + results.reduce((a, b) => a + b, 0) * multiplier;
          showDiceToast(parseInt(num), parseInt(dice), results, false);
        } else {
          newValue = attr.value + param.delta;
        }
        newValue = Math.min(newValue, newAttributes[param.key].maxValue);
        newValue = Math.max(newValue, 0);

        if (param.key === "HP" && newValue < attr.value) {
          playSound("hp-reduced");
        } else if (param.key === "San" && newValue < attr.value) {
          // playSound("san-reduced");
        }

        newAttributes[param.key] = { ...attr, value: newValue };
        setAttributes(newAttributes);
        break;
      case "action_adjust_skill":
        setSkills({ ...skills, [param.key]: { ...skills[param.key], value: skills[param.key].value + param.delta } });
        break;
      case "action_show_dice_toast": // param: { num, dice, bonus, results, shouldPlaySound }
        showDiceToast(param.num, param.dice, param.results, param.shouldPlaySound, param.bonus);
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
      case "action_enable_map":
        enableMap();
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

  function showDiceToast(num, dice, results, shouldPlaySound, bonus="") {
    let subtitle = "";
    if (bonus && bonus > 0) {
      subtitle = language === "zh" ? `奖励骰 x ${bonus}` : `Bonus Die x ${bonus}`;
    } else if (bonus && bonus < 0) {
      subtitle = language === "zh" ? `惩罚骰 x ${-bonus}` : `Penalty Die x ${-bonus}`;
    }
    showToast({
      title: language === "zh" ? `投掷${num}D${dice}` : `Roll ${num}D${dice}`,
      subtitle: subtitle,
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
            <Chapter {...{ chapterKey, characterSheet, chars, attributes, skills, nextChapter, onChapterAction }} />
          </div>
          { showCharacter && (
            <div id="character" className="col">
              <Character {...{ characterSheet, chars, setChars, attributes, skills, setSkills, occupation, onCharacterAction }} />
            </div> 
          )}
        </div>
        <MapModal {...{ chapterKey }} />
      </HighlightContext.Provider>
    </FlagsContext.Provider>
  )
}
