import { useState, useEffect, useRef, useContext, createContext } from "react";
import { LanguageContext } from "../App";
import Character from "./character/Character";
import characterSheet from "./character/characterSheet";
import Chapter from "./game/Chapter";
import chapterMap from "./game/chapterMap";
import { showToast } from "./ToastMessage";
import { roll } from "../utils";

const initFlags = {
  flag_characteristics_unfinished: true,
  flag_skills_editable: false,
  flag_skills_editing_phase_2: false,
  flag_skills1_unfinished: true,
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

const initAttributes = {
  HP: { value: "", maxValue: "" },
  San: { value: "", maxValue: "" },
  Luck: { value: "" },
  MP: { value: "", maxValue: "" },
};

export const FlagsContext = createContext();
export const HighlightContext = createContext();

export default function Game({ showCharacter, setShowCharacter, playSound }) {
  const { language } = useContext(LanguageContext);
  const [flags, setFlags] = useState(initFlags);
  const [chapterKey, setChapterKey] = useState(0);
  const [attributes, setAttributes] = useState(initAttributes);
  const [highlight, setHighlight] = useState(null);
  // console.log(`on Game refresh: chapterFlags: ${JSON.stringify(flags)}`);
  console.log(`on Game refresh`);

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
      if (condition in flags) {
        return flags[condition];
      }
      switch (condition) {
        case "flag_characteristics_editable":
          return chapterKey === 263;
        case "flag_siz_greater_than_40":
          return characterSheet.SIZ.value > 40;
        case "flag_dex_greater_than_siz":
          return characterSheet.DEX.value > characterSheet.SIZ.value;
        case "flag_luck_unfinished":
          return attributes.Luck.value === "";
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
      case "action_set_flag":
        setFlags({ ...flags, [param.flag]: param.value });
        break;
      case "action_show_character_sheet":
        setShowCharacter(param);
        break;
      case "action_set_char_related_values":
        characterSheet.skills.dodge.value = Math.floor(characterSheet.DEX.value / 2);
        characterSheet.skills.lang_own.value = characterSheet.EDU.value;
        break;
      case "action_set_highlight":
        if (param.level === "none") {
          setHighlight(null);
        } else {
          setHighlight(param);
        }
        break;
      case "action_initial_san_and_mp":
        const san = characterSheet.POW.value;
        const mp = Math.floor(characterSheet.POW.value / 5);
        setAttributes({ ...attributes, San: { value: san, maxValue: san }, MP: { value: mp, maxValue: mp } });
        break;
      case "action_initial_hp":
        const hp = Math.floor((characterSheet.SIZ.value + characterSheet.CON.value) / 10);
        setAttributes({ ...attributes, HP: { value: hp, maxValue: hp } });
        setFlags({ ...flags });
        break;
      case "action_roll_luck_and_update_chapter":
        const results = roll(3, 6);
        const luck = results.reduce((a, b) => a + b, 0) * 5;

        showToast({
          title: language === "zh" ? "投掷3D6" : "Roll 3D6",
          text: language === "zh" ? `结果：${results.join("、")}，幸运值：${luck}` : `Results: ${results.join(", ")}; Luck: ${luck}`
        });
        playSound("dice");
        setAttributes({ ...attributes, Luck: { value: luck } });
        break;
    }
  }

  // Cheat
  function goTo(chapterKey) {
    console.log(`Game - goTo: to chapter ${chapterKey}`);
    setChapterKey(chapterKey);
  }
  window.goTo = goTo;

  function nextChapter(chapterKey, optionKey) {
    const next = chapterMap[chapterKey][optionKey];
    if (next) {
      console.log(`Game - nextChapter: c${chapterKey} - o${optionKey} => chapter ${next}`);
      setChapterKey(next);
    }
  }

  return (
    <FlagsContext.Provider value={{ flagConditionCheck }}>
      <HighlightContext.Provider value={{ highlight }}>
        <div className="row">
          <div id="text-content" className="col px-2">
            <Chapter {...{ chapterKey, nextChapter, onChapterAction } }/>
          </div>
          {showCharacter && <div id="character" className="col">
            <Character character={characterSheet} {...{ attributes, onCharacterAction }} />
          </div>}
        </div>
      </HighlightContext.Provider>
    </FlagsContext.Provider>
  )
}
