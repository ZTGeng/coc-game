import { useContext, useState, useEffect } from "react";
import { LanguageContext } from "../../App";
import Chapter0 from "./Chapter0";
import GoToOptions from "./GoToOptions";
import Check from "./Check";
import MapModal from "../MapModal";
import { FlagCheckContext, useFlagCheck, createFlagCheck } from "../../store/slices/flagSlice";
import * as utils from "../../utils/utils";

const initRollFlags = {
  // status: "", // "", "ready", "done"
  diceNumber: "", // [number]
  rollKey: "", // key
  rollLevel: "", // "value", "half", "fifth"
  result: "", // "pass", "fail", "draw"(for combat)
  resultLevel: "", // 0: fail, 1: value, 2: half, 3: fifth
  isFumble: false,
  isPushed: false,
}

const interactionChapters = {
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

function Loading({ autoLang }) {
  return autoLang({ zh: <p>"加载中..."</p>, en: <p>"Loading..."</p> });
}

function getExcerpt(text) {
  return Object.keys(text)
    .map(lang => {
      const firstItem = text[lang].filter(item => item.tag !== "img" && item.tag !== "info")[0];
      const content = firstItem.tag === "div" ? firstItem.text[0].content : firstItem.content;
      return { [lang]: content.slice(0, 20) };
    })
    .reduce((acc, cur) => ({ ...acc, ...cur }), {});
}

function ChapterContent({ chapterText }) {
  const { autoLang } = useContext(LanguageContext);

  return autoLang(chapterText).map((item, index) => {
    if (item.tag === "div") {
      return item.imageOn === "left" ? (
        <div key={index} className="row">
          <div className="col-md-4"><img src={item.imageSrc} className="img-fluid" /></div>
          <div className="col-md-8">{ item.text.map((line, i) => <p key={i}>{ line.content }</p>) }</div>
        </div>
      ) : (
        <div key={index} className="row">
          <div className="col-md-8">{ item.text.map((line, i) => <p key={i}>{ line.content }</p>) }</div>
          <div className="col-md-4"><img src={item.imageSrc} className="img-fluid" /></div>
        </div>
      );
    }
    if (item.tag === "info") {
      return (
        <div key={index} className="card border-secondary mb-3">
          <div className="card-body text-secondary">
            { item.text.map((line, i) => <p key={i} className="card-text">{ line.content }</p>) }
          </div>
        </div>
      )
    }
    if (item.tag === "img") {
      return <img key={index} src={item.imageSrc} className="img-fluid" />
    }
    if (item.tag === "h") {
      return <h2 key={index}>{ item.content }</h2>
    }
    return <p key={index}>{ item.content }</p>
  });
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

function Interactions({ interactions, onAction }) {
  const flagCheck = useFlagCheck();
  const interactionsToShow = interactions.filter(interaction => !interaction.show || flagCheck(interaction.show));

  return (
    interactionsToShow.length > 0 && (
      <div className="alert alert-dark">
        <div className="d-flexr">
          { interactionsToShow.map((interaction, i) => <InteractionButton key={i} {...{interaction, onAction}} />) }
        </div>
      </div>
    )
  );
}

export default function Chapter({ chapterKey, isReloading, onNextChapter, onUpdateSnapshot, onChapterAction }) {
  const { autoLang } = useContext(LanguageContext);
  const [chapter, setChapter] = useState(null);
  const [interactionFinished, setInteractionFinished] = useState(false);
  const [rollFlags, setRollFlags] = useState(initRollFlags);
  console.log(`Chapter refresh: ${chapter?.key ?? "start"} => ${chapterKey}, isReloading: ${isReloading}`);
  const parentFlagCheck = useFlagCheck();

  useEffect(() => {
    console.log(`Chapter - useEffect: chapterKey: ${chapterKey}, chapter(state): ${chapter && chapter.key}`);

    if (chapterKey === 0) return;

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
        if (data.check) {
          switch (data.check.type) {
            case "roll":
              onChapterAction("action_set_highlight", { key: data.check.key, level: data.check.level });
              break;
            case "roll_select":
              data.check.rolls.forEach(roll => onChapterAction("action_set_highlight", { key: roll.key, level: roll.level }));
              break;
            case "opposed_roll":
              onChapterAction("action_set_highlight", { key: data.check.key, level: "all" });
              break;
            case "combat":
              onChapterAction("action_set_highlight", { key: "dodge", level: "all" });
              onChapterAction("action_set_highlight", { key: "fighting", level: "all" });
              break;
          }
        }

        setInteractionFinished(false);
        setRollFlags(initRollFlags);

        setChapter(data);

        // useEffect may be triggered multiple times with the same chapterKey
        // run onLoad only for the first time
        if (!chapter || (chapter.key !== chapterKey)) {
          onLoad(data);
        }
      });
  }, [chapterKey]);

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
    action_roll_luck_and_update_chapter: (param) => {
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
    if (interactionChapters[chapterKey]) {
      onNextChapter(nextKey, interactionChapters[chapterKey], true);
      return;
    }
    if (chapter.check) { // { chapterKey, optionText，type=roll/roll_select, keys } or { chapterKey, optionText, type=opposed_roll/combat, opponentName }
      const historyItem = { chapterKey, optionText, type: chapter.check.type };
      switch (chapter.check.type) {
        case "roll":
          historyItem.keys = [chapter.check.key];
          break;
        case "roll_select":
          historyItem.keys = chapter.check.rolls.map(roll => roll.key);
          break;
        case "opposed_roll":
        case "combat":
          historyItem.opponentName = chapter.check.opponent.name;
          break;
      }
      onNextChapter(nextKey, historyItem, true);
      return;
    }
    if (chapter.interactions) { // { chapterKey, optionText, type=interaction, texts }
      const texts = chapter.interactions.map(interaction => interaction.text);
      onNextChapter(nextKey, { chapterKey, optionText, type: "interaction", texts }, true);
      return;
    }
    onNextChapter(nextKey, { chapterKey, optionText }, chapter.options.filter(option => !option.show).length > 1);
  }

  if (chapterKey === 0) {
    return <Chapter0 onOptionSelected={onNextChapter} />;
  }

  if (!chapter || chapter.key !== chapterKey) {
    return <Loading {...{ autoLang }} />;
  }

  return (
    <FlagCheckContext.Provider value={flagCheck}>
      <ChapterContent chapterText={chapter.text} />
      {chapter.interactions && <Interactions interactions={chapter.interactions} onAction={onInteractionAction} />}
      {chapter.check && <Check check={chapter.check} onAction={onCheckAction} {...{ rollFlags, setRollFlags }} />}
      <br />
      <div className="px-2">
        <GoToOptions options={chapter.options} {...{ onOptionSelected }} />
      </div>
      <MapModal mapLocation={chapter.location} />
    </FlagCheckContext.Provider>
  )
}