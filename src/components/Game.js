import { useState, useEffect, useRef, useContext, createContext } from "react";
import Character from "./character/Character";
import Chapter from "./game/Chapter";
import chapterMap from "./game/chapterMap";

const FlagsInitial = {
  flag_characteristics_editable: false,
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
export const FlagsContext = createContext();

export default function Game({ showCharacter, setShowCharacter }) {
  const [chapterKey, setChapterKey] = useState(0);
  const [flags, setFlags] = useState(FlagsInitial);

  function setFlag(flagName, value) {
    if (flagName in flags) {
      setFlags((flags) => ({ ...flags, [flagName]: value }));
    }
    console.log("Flag: ", flags)
  }

  function conditionChecker(condition) {
    if (typeof condition === 'string') {
      if (condition.startsWith("!")) {
        return !conditionChecker(condition.slice(1));
      }
      if (condition in flags) {
        return flags[condition];
      }
    } else if (Array.isArray(condition)) {
      return condition.every(cond => conditionChecker(cond));
    }
    console.error("Game - conditionChecker: unknown condition", condition);
    return false;
  }

  const actionHandlers = {
    "action_show_character_sheet": (param) => setShowCharacter(param),
    "action_set_flag_true": (param) => { setFlag(param, true) },
    "action_set_flag_false": (param) => { setFlag(param, false) },
    "action_set_dodge_and_lang_own": (_) => {  },
  }

  // Cheet
  function goTo(chapterKey) {
    console.log(`Game - goTo: to chapter ${chapterKey}`);
    setChapterKey(chapterKey);
  }
  window.goTo = goTo;

  function nextChapter(chapterKey, optionKey) {
    const next = chapterMap[chapterKey][optionKey];
    if (next) {
      console.log(`Game - nextChapter: from chapter ${chapterKey} choose option ${optionKey} => to chapter ${next}`);
      setChapterKey(next);
    }
  }

  function onAction(action, param) {
    console.log(`Game - onAction: ${action} with params: ${param}`);
    if (actionHandlers[action]) {
      actionHandlers[action](param);
    }
  }
  
  return (
    <FlagsContext.Provider value={{conditionChecker, setFlag}}>
      <div className="row">
        <div id="text-content" className="col px-2">
          <Chapter {...{ chapterKey, nextChapter, onAction }}/>
        </div>
        <div id="character" className="col" hidden={!showCharacter}>
          <Character />
        </div>
      </div>
    </FlagsContext.Provider>
  )
}
