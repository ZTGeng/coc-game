import { useContext, useState, useEffect } from "react";
import { LanguageContext, CharacterSheetContext } from "../../App";
import GoToOptions from "./GoToOptions";
import Check from "./Check";
import MapModal from "../MapModal";
import { FlagCheckContext, useFlagCheck, createFlagCheck } from "../../store/slices/flagSlice";
import * as utils from "../../utils/utils";

const initRollFlags = {
  diceNumber: "", // [number]
  rollKey: "", // key
  rollLevel: "", // "value", "half", "fifth"
  result: "", // "pass", "fail", "draw"(for combat)
  resultLevel: "", // 0: fail, 1: value, 2: half, 3: fifth
  isFumble: false,
  isPushed: false,
}

const historyItemTexts = {
  134: {
    chapterKey: 134,
    optionText: utils.TEXTS.rollLuck,
  },
  263: {
    chapterKey: 263,
    optionText: {
      "zh": "设定人物属性",
      "en": "Set up characteristics",
    },
  },

};

function getExcerpt(text) {
  return Object.keys(text)
    .map(lang => {
      const firstItem = text[lang].filter(item => item.tag !== "img" && item.tag !== "info")[0];
      const content = firstItem.tag === "div" ? firstItem.text[0].content : firstItem.content;
      return { [lang]: content.slice(0, 20) };
    })
    .reduce((acc, cur) => ({ ...acc, ...cur }), {});
}

function Background({ imageFilename }) {

  return (
    <div className="position-fixed top-0 start-0 w-100 h-100 z-n1 pt-5 pb-4">
      {imageFilename && <img 
        src={`images/${imageFilename}`}
        className="w-100 h-100"
        onError={(e) => { e.target.style.display = 'none'; }}
        onLoad={(e) => { e.target.style.display = 'block'; }}
        style={{ display: 'none' }} />}
    </div>
  );
}

function CursorButton({ onCursorClick }) {
  const [isHover, setIsHover] = useState(false);

  return (
    <button className="btn btn-outline-dark"
            onClick={(e) => { e.stopPropagation(); onCursorClick(); }}
            onMouseEnter={() => setIsHover(true)}
            onMouseLeave={() => setIsHover(false)}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
        <path d="M5.22 8.22a.749.749 0 0 0 0 1.06l6.25 6.25a.749.749 0 0 0 1.06 0l6.25-6.25a.749.749 0 1 0-1.06-1.06L12 13.939 6.28 8.22a.749.749 0 0 0-1.06 0Z"></path>
        <animate attributeName="opacity" values="1;0;1" dur={isHover ? "0.5s" : "1s"} repeatCount="indefinite" />
      </svg>
    </button>
  );
}

function ChapterContent({ chapterText, showCursor, onCursorClick }) {

  return chapterText.map((item, index) => {
    switch (item.tag) {
      case "div":
        return item.imageOn === "left" ? (
          <div key={index} className="row">
            <div className="col-md-4"><img src={item.imageSrc} className="img-fluid" /></div>
            <div className="col-md-8">
              {item.text.map((line, i) => <p key={i} className="bg-white p-2 mb-0" style={{ "--bs-bg-opacity": .8 }}>{line.content}</p>)}
            </div>
          </div>
        ) : (
          <div key={index} className="row">
            <div className="col-md-8">
              {item.text.map((line, i) => <p key={i} className="bg-white p-2 mb-0" style={{ "--bs-bg-opacity": .8 }}>{line.content}</p>)}
            </div>
            <div className="col-md-4"><img src={item.imageSrc} className="img-fluid" /></div>
          </div>
        );
      case "info":
        return (
          <div key={index} className="card border-secondary my-3">
            <div className="card-body text-secondary">
              {item.text.map((line, i) => <p key={i} className="card-text">{line.content}</p>)}
            </div>
          </div>
        );
      case "img":
        return <img key={index} src={item.imageSrc} className="img-fluid" />;
      case "h":
        return <h2 key={index} className="text-center bg-white p-2 mb-0" style={{ "--bs-bg-opacity": .8 }}>{item.content}</h2>;
      case "a":
        const aOpenIndex = item.content.indexOf("<a>");
        const aCloseIndex = item.content.indexOf("</a>");
        return aOpenIndex < 0 || aCloseIndex < 0 ? (
          <p key={index} className="bg-white p-2 mb-0" style={{ "--bs-bg-opacity": .8 }}>
            {item.content}
          </p>
        ) : (
          <p key={index} className="bg-white p-2 mb-0" style={{ "--bs-bg-opacity": .8 }}>
            {item.content.slice(0, aOpenIndex)}
            <a href={item.href} target="_blank">{item.content.slice(aOpenIndex + 3, aCloseIndex)}</a>
            {item.content.slice(aCloseIndex + 4)}
          </p>
        );
      default:
        return <p key={index} className="bg-white p-2 mb-0" style={{ "--bs-bg-opacity": .8 }}>{item.content}</p>;
    }
  }).concat(showCursor ? (
    <div className="text-end text-primary me-3">
      <CursorButton {...{ onCursorClick }} />
    </div>
  ) : null);
}

function InteractionButton({ interaction, onAction }) {
  const { autoLang } = useContext(LanguageContext);
  const flagCheck = useFlagCheck();

  return (
    interaction.disabled && flagCheck(interaction.disabled)
      ? <button className="btn btn-dark mx-2" disabled>{ autoLang(interaction.text) }</button>
      : (<button className="btn btn-dark mx-2" onClick={() => { onAction(interaction.action, interaction.param) }}>
        { autoLang(interaction.text) }
      </button>)
  )
}

function CommittedMPButton({ interaction, committedMP, onAction }) {
  const { autoLang } = useContext(LanguageContext);
  const flagCheck = useFlagCheck();

  return (
    interaction.disabled && flagCheck(interaction.disabled)
      ? <button className="btn btn-dark mx-2" disabled>{ autoLang(interaction.text) }<span className="badge text-bg-light ms-2">{ committedMP }</span></button>
      : (<button className="btn btn-dark mx-2" onClick={() => { onAction(interaction.action, interaction.param) }}>
        { autoLang(interaction.text) }
        <span className="badge text-bg-light ms-2">{ committedMP }</span>
      </button>)
  )
}

function Interactions({ interactions, committedMP, onAction }) {
  const flagCheck = useFlagCheck();
  const interactionsToShow = interactions.filter(interaction => !interaction.show || flagCheck(interaction.show));

  return (
    interactionsToShow.length > 0 && (
      <div className="alert alert-dark">
        <div className="d-flex">
          {
            interactionsToShow.map(
              (interaction, i) => interaction.type === "magic"
                ? <CommittedMPButton key={i} {...{interaction, committedMP, onAction}} />
                : <InteractionButton key={i} {...{interaction, onAction}} />
            )
          }
        </div>
      </div>
    )
  );
}

export default function Chapter({ chapterKey, committedMP, isReloading, onNextChapter, onUpdateSnapshot, onChapterAction, scrollChapterToBottom }) {
  const { autoLang } = useContext(LanguageContext);
  const characterSheet = useContext(CharacterSheetContext);
  const [chapter, setChapter] = useState(null);
  const [interactionFinished, setInteractionFinished] = useState(false);
  const [rollFlags, setRollFlags] = useState(initRollFlags);
  const [showLineNum, setShowLineNum] = useState(1);
  const [showActions, setShowActions] = useState(false);
  // const contentRef = useRef();
  const parentFlagCheck = useFlagCheck();
  console.log(`Chapter refresh: ${chapter?.key ?? "start"} => ${chapterKey}, isReloading: ${isReloading}, showLineNum: ${showLineNum}, showActions: ${showActions}`);

  useEffect(() => {
    console.log(`Chapter - useEffect: chapterKey: ${chapterKey}, chapter(state): ${chapter && chapter.key}`);

    fetch(`./chapters/${chapterKey}.json`)
      .then(response => response.json())
      .then(data => {
        // useEffect may be triggered multiple times with the same chapterKey
        // run onLeave only for the first time
        if (chapter && (chapter.key !== chapterKey)) {
          onLeave(chapter);
        }

        onUpdateSnapshot();

        onChapterAction("action_clear_highlight", "");
        setInteractionFinished(false);
        setRollFlags(initRollFlags);
        setShowLineNum(1);
        setShowActions(false);

        setChapter(data);

        // useEffect may be triggered multiple times with the same chapterKey
        // run onLoad only for the first time
        if (!chapter || (chapter.key !== chapterKey)) {
          onLoad(data);
        }
      });
  }, [chapterKey]);

  useEffect(() => {
    // console.log(`Scroll!: showLineNum: ${showLineNum}, showActions: ${showActions}`);
    setTimeout(() => {
    scrollChapterToBottom();
    }, 100);
  }, [showLineNum, showActions]);

  const chapterFlagFunc = {
    "flag_interaction_finished": () => interactionFinished,
    "flag_check_passed": () => rollFlags.result === "pass",
    "flag_check_failed": () => rollFlags.result === "fail",
    "flag_check_finished": () => rollFlags.result,
    "flag_check_fumble": () => rollFlags.isFumble,
    "flag_check_pushed": () => rollFlags.isPushed,
    "flag_check_match": (keyLevel) => {
      const [rollKey, rollLevel] = keyLevel.split("-");
      return rollFlags.rollKey === rollKey && (!rollLevel || rollFlags.rollLevel === rollLevel);
    },
    "flag_c25_option_disabled": (option) => parentFlagCheck(`flag_c25_option_selected_${option}`)
      || Array
        .from({ length: 6 }, (_, i) => i)
        .map(i => `flag_c25_option_selected_${i}`)
        .filter(flag => parentFlagCheck(flag))
        .length >= 4,
    "flag_c120_option_disabled": (option) => (option < 4 && parentFlagCheck(`flag_c120_option_selected_${option}`))
      || Array
        .from({ length: 4 }, (_, i) => i)
        .map(i => `flag_c120_option_selected_${i}`)
        .filter(flag => parentFlagCheck(flag))
        .length >= 3,
  };
  const flagCheck = createFlagCheck(chapterFlagFunc, parentFlagCheck);

  const actions = {
    action_c25_select_option: (option) => {
      onChapterAction("action_set_flag", { flag: `flag_c25_option_selected_${option}`, value: true });
    },
    action_c120_select_option: (option) => {
      onChapterAction("action_set_flag", { flag: `flag_c120_option_selected_${option}`, value: true });
    },
    action_c134_roll_luck: (param) => {
      setChapter(param);
      onChapterAction("action_clear_highlight", "");
      onChapterAction("action_set_highlight", { "key": "DEX", "level": "value" });
      onChapterAction("action_init_luck", param);
    },
    action_clear_c25_flags: () => {
      Array
        .from({ length: 6 }, (_, i) => i)
        .map(i => `flag_c25_option_selected_${i}`)
        .forEach(flag => onChapterAction("action_set_flag", { flag, value: false }));
    },
    action_clear_c120_flags: () => {
      Array
        .from({ length: 4 }, (_, i) => i)
        .map(i => `flag_c120_option_selected_${i}`)
        .forEach(flag => onChapterAction("action_set_flag", { flag, value: false }));
    },
    action_c167_bear_attack: () => {
      for (let i = 0; i < 2; i++) {
        const attackCheck = utils.roll(1, 100);
        onChapterAction(
          "action_dice_message", 
          { 
            title: autoLang({ zh: "熊 爪击", en: "Bear Claw" }),
            num: 1, dice: 100, bonus: 0,
            results: attackCheck,
            shouldPlaySound: false
          }
        );
        const title = autoLang({ zh: "熊的爪击", en: "Bear's Claw Attack" });
        if (attackCheck[0] <= 35) {
          const text = autoLang({ zh: "熊的爪击命中！", en: "The bear's claw attack hits!" });
          onChapterAction("action_message", { title: title, text: text, color: "danger" });
          onChapterAction("action_adjust_attribute", { key: "HP", delta: "-3d6" });
        } else {
          const text = autoLang({ zh: "熊的爪击未命中！", en: "The bear's claw attack misses!" });
          onChapterAction("action_message", { title: title, text: text, color: "success" });
        }
      }
    },
    action_c198_spell_cast: () => {
      const spellCheck = utils.roll(1, 100);
      onChapterAction(
        "action_dice_message", 
        { 
          title: `${Math.min(committedMP * 10, 95)}%${autoLang(utils.TEXTS.rollSuffix)}`,
          num: 1, dice: 100, bonus: 0,
          results: spellCheck,
          shouldPlaySound: true
        }
      );
      if (spellCheck[0] <= Math.min(committedMP * 10, 95)) {
        const title = autoLang({ zh: "魔法施法", en: "Spell Casting" });
        const text = autoLang({ zh: "魔法施法成功！", en: "Spell casting succeeds!" });
        onChapterAction("action_message", { title: title, text: text, color: "success" });
        setRollFlags({
          diceNumber: spellCheck,
          result: "pass",
        });
      } else {
        const title = autoLang({ zh: "魔法施法", en: "Spell Casting" });
        const text = autoLang({ zh: "魔法施法失败！", en: "Spell casting fails!" });
        onChapterAction("action_message", { title: title, text: text, color: "danger" });
        setRollFlags({
          diceNumber: spellCheck,
          result: "fail",
        });
      }
    },
    action_c65_c93_c109_fire_damage: (param) => {
      const { newValue } = onChapterAction("action_adjust_attribute", { key: "HP", delta: "-1d6" });
      if (newValue <= 0) {
        setChapter(param);
        onChapterAction("action_ending", "burn");
      }
    }
  }

  function onLeave(chapterJson) {
    console.log(`Chapter ${chapterJson.key} onLeave`);
    if (chapterJson.onleave) {
      chapterJson.onleave.forEach(action => {
        action.action in actions ? actions[action.action](action.param) : onChapterAction(action.action, action.param);
      });
    }
  }

  function onLoad(chapterJson) {
    console.log(`Chapter ${chapterJson.key} onLoad`);
    if (chapterJson.onload) {
      chapterJson.onload.forEach(action => {
        action.action in actions ? actions[action.action](action.param) : onChapterAction(action.action, action.param);
      });
    }
  }

  function onInteractionAction(action, param) {
    setInteractionFinished(true);
    action in actions ? actions[action](param) : onChapterAction(action, param);
  }

  function onCheckAction(action, param) {
    action in actions ? actions[action](param) : onChapterAction(action, param);
  }

  function onOptionSelected(nextKey, optionText) {
    // { chapterKey, optionText，contentTexts }
    if (historyItemTexts[chapterKey]) {
      onNextChapter(nextKey, historyItemTexts[chapterKey]);
      return;
    }
    const historyItem = { chapterKey, optionText };
    const contentTexts = [];
    if (chapter.check) {
      switch (chapter.check.type) {
        case "roll":
          const checkTarget = characterSheet[chapter.check.key] || characterSheet.skills[chapter.check.key];
          contentTexts.push(checkTarget.name);
          contentTexts.push(utils.TEXTS.rollSuffix);
          break;
        case "roll_select":
          chapter.check.rolls
            .map(roll => roll.key)
            .map(key => characterSheet[key] || characterSheet.skills[key])
            .forEach(target => {
              contentTexts.push(target.name);
              contentTexts.push(utils.TEXTS.or);
            });
          contentTexts.pop();
          contentTexts.push(utils.TEXTS.rollSuffix);
          break;
        case "opposed_roll":
          contentTexts.push(utils.TEXTS.opposedRoll);
          contentTexts.push(utils.TEXTS.vs);
          contentTexts.push(chapter.check.opponent.name);
          break;
        case "combat":
          contentTexts.push(utils.TEXTS.combat);
          contentTexts.push(utils.TEXTS.vs);
          contentTexts.push(chapter.check.opponent.name);
          break;
      }
      historyItem.contentTexts = contentTexts;
      onNextChapter(nextKey, historyItem);
      return;
    }
    if (chapter.interactions) {
      chapter.interactions.map(interaction => interaction.text).forEach(text => contentTexts.push(text));
      historyItem.contentTexts = contentTexts;
      onNextChapter(nextKey, historyItem);
      return;
    }
    onNextChapter(nextKey, chapter.options.filter(option => !option.show).length > 1 ? historyItem : null);
  }

  function setActionHighlights() {
    if (chapter.check) {
      switch (chapter.check.type) {
        case "roll":
          onChapterAction("action_set_highlight", { key: chapter.check.key, level: chapter.check.level });
          break;
        case "roll_select":
          chapter.check.rolls.forEach(roll => onChapterAction("action_set_highlight", { key: roll.key, level: roll.level }));
          break;
        case "opposed_roll":
          onChapterAction("action_set_highlight", { key: chapter.check.key, level: "all" });
          break;
        case "combat":
          onChapterAction("action_set_highlight", { key: "dodge", level: "all" });
          onChapterAction("action_set_highlight", { key: "fighting", level: "all" });
          break;
      }
    }
  }

  function showNextContentItem() {
    if (showLineNum < autoLang(chapter.text).length) {
      setShowLineNum(showLineNum + 1);
    } else if (!showActions) {
      setActionHighlights();
      setShowActions(true);
    }
  }

  function showAllContentItems() {
    const lineNumTotal = autoLang(chapter.text).length;
    if (showLineNum < lineNumTotal) {
      setShowLineNum(lineNumTotal);
    }
    if (!showActions) {
      setActionHighlights();
      setShowActions(true);
    }
  }

  if (!chapter || chapter.key !== chapterKey) {
    return <p>{autoLang({ zh: "加载中...", en: "Loading..." })}</p>;
  }

  return (
    <FlagCheckContext.Provider value={flagCheck}>
      <Background background={chapter.background} />
      <div className="pb-5" style={{ minHeight: "100%" }} onClick={showNextContentItem}>
        <ChapterContent chapterText={autoLang(chapter.text).slice(0, showLineNum)} showCursor={!showActions} onCursorClick={showAllContentItems} />
        {showActions && chapter.interactions && <Interactions interactions={chapter.interactions} committedMP={committedMP} onAction={onInteractionAction} />}
        {showActions && chapter.check && <Check check={chapter.check} onAction={onCheckAction} {...{ rollFlags, setRollFlags }} />}
        {showActions && chapter.options && chapter.options.length > 0 && <GoToOptions options={chapter.options} {...{ onOptionSelected }} />}
      </div>
      
      <MapModal mapLocation={chapter.location} />
    </FlagCheckContext.Provider>
  )
}