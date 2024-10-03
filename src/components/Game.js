import { useState, useEffect, useRef, useContext, createContext } from "react";
import Character from "./character/Character";
import characterSheet from "./character/characterSheet";
import Chapter from "./game/Chapter";
import chapterMap from "./game/chapterMap";

const initFlags = {
  flag_characteristics_editable: false,
  flag_characteristics_unfinished: true,
  flag_luck_unfinished: true,
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
  const [flags, setFlags] = useState(initFlags);
  console.log(`on Game refresh: chapterFlags: ${JSON.stringify(flags)}`);
  // console.log(`on Game refresh`);

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
        case "flag_siz_greater_than_40":
          return characterSheet.SIZ.value > 40;
        case "flag_dex_greater_than_siz":
          return characterSheet.DEX.value > characterSheet.SIZ.value;
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
      case "action_show_character_sheet":
        setShowCharacter(param);
        break;
      case "action_set_char_related_values":
        characterSheet.skills.dodge.value = Math.floor(characterSheet.DEX.value / 2);
        characterSheet.skills.lang_own.value = characterSheet.EDU.value;
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
      <div className="row">
        <div id="text-content" className="col px-2">
          <Chapter {...{ chapterKey, nextChapter, onChapterAction } }/>
        </div>
        {showCharacter && <div id="character" className="col">
          <Character character={characterSheet} {...{ onCharacterAction }} />
        </div>}
      </div>
    </FlagsContext.Provider>
  )
}
