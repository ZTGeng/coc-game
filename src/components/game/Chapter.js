import { useContext, useState, useEffect } from "react";
import { LanguageContext } from "../../App";
import { FlagsContext } from "../Game";
import Chapter0 from "./Chapter0";
import GoToOptions from "./GoToOptions";
import Check from "./Check";
import flagConditionCheckProvider from "../flagCheck";

const initCheckFlags = {
  // status: "", // "", "ready", "done"
  diceNumber: "", // [number]
  rollKey: "", // key
  rollLevel: "", // "value", "half", "fifth"
  result: "", // "pass", "fail"
  resultLevel: "", // 0: fail, 1: value, 2: half, 3: fifth
  isFumble: false,
}

function Loading({ autoLang }) {
  return autoLang({ zh: <p>"加载中..."</p>, en: <p>"Loading..."</p> });
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
  const { flagConditionCheck } = useContext(FlagsContext);

  return (
    interaction.disabled && flagConditionCheck(interaction.disabled)
      ? <button className="btn btn-dark mx-2" disabled>{ autoLang(interaction.text) }</button>
      : (<button className="btn btn-dark mx-2" onClick={() => { onAction(interaction.action, interaction.param) }}>
        { autoLang(interaction.text) }
      </button>)
  )
}

function Interactions({ interactions, onAction }) {
  const { flagConditionCheck } = useContext(FlagsContext);
  const interactionsToShow = interactions.filter(interaction => !interaction.show || flagConditionCheck(interaction.show));

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

export default function Chapter({ chapterKey, characterSheet, chars, attributes, skills, nextChapter, setMapLocation, onChapterAction }) {
  const { autoLang } = useContext(LanguageContext);
  const { flagConditionCheck } = useContext(FlagsContext);
  const [chapter, setChapter] = useState(null);
  const [checkFlags, setCheckFlags] = useState(initCheckFlags);
  const [c25OptionsSelected, setC25OptionsSelected] = useState([false, false, false, false, false, false]);
  console.log(`Chapter refresh: ${chapter?.key ?? "start"} => ${chapterKey}, checkFlags: ${checkFlags.result}`);

  function onLeave(chapterJson) {
    console.log(`Chapter ${chapterJson.key} onLeave`);
    if (chapterJson.onleave) {
      chapterJson.onleave.forEach(action => onChapterAction(action.action, action.param));
    }
  }

  function onLoad(chapterJson) {
    console.log(`Chapter ${chapterJson.key} onLoad`);
    if (chapterJson.onload) {
      chapterJson.onload.forEach(action => {
        if (action.action === "action_c25_select_option") { // param: Int 0-5
          const c25OptionsSelectedCopy = [...c25OptionsSelected];
          c25OptionsSelectedCopy[action.param] = true;
          setC25OptionsSelected(c25OptionsSelectedCopy);
          return;
        }
        onChapterAction(action.action, action.param)
      });
    }
  }

  function onInteractionAction(action, param) {
    if (action === "action_roll_luck_and_update_chapter") {
      // param is the new chapter json with the same key
      setChapter(param);
      // will do DEX check, highlisht is needed
      onChapterAction("action_clear_highlight", "");
      onChapterAction("action_set_highlight", { "key": "DEX", "level": "value" });
      // no return on purpose to let parent initial the Luck value
    }
    onChapterAction(action, param);
  }

  function onCheckAction(action, param) {
    onChapterAction(action, param);
  }

  function chapterFlagStringCheck(flag) {
    console.log(`Chapter ${chapter.key} flagConditionCheck: ${flag}`);
    switch (flag) {
      case "flag_check_passed":
        return checkFlags.result === "pass";
      case "flag_check_failed":
        return checkFlags.result === "fail";
      case "flag_check_finished":
        return checkFlags.result;
      case "flag_check_fumble":
        return checkFlags.isFumble;
      case "flag_c25_option_0_disabled":
        return c25OptionsSelected[0] || c25OptionsSelected.filter(b => b).length >= 4;
      case "flag_c25_option_1_disabled":
        return c25OptionsSelected[1] || c25OptionsSelected.filter(b => b).length >= 4;
      case "flag_c25_option_2_disabled":
        return c25OptionsSelected[2] || c25OptionsSelected.filter(b => b).length >= 4;
      case "flag_c25_option_3_disabled":
        return c25OptionsSelected[3] || c25OptionsSelected.filter(b => b).length >= 4;
      case "flag_c25_option_4_disabled":
        return c25OptionsSelected[4] || c25OptionsSelected.filter(b => b).length >= 4;
      case "flag_c25_option_5_disabled":
        return c25OptionsSelected[5] || c25OptionsSelected.filter(b => b).length >= 4;

    }
    if (flag.startsWith("flag_check_match")) { // "flag_check_match:key-value"
      const [rollKey, rollLevel] = flag.split(":")[1].split("-");
      return checkFlags.rollKey === rollKey && checkFlags.rollLevel === rollLevel;
    }
    // Fall back to the Game flagConditionCheck
    return flagConditionCheck(flag);
  }

  const chapterFlagConditionCheck = flagConditionCheckProvider(chapterFlagStringCheck);

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

        onChapterAction("action_clear_highlight", ""); // reset highlight
        if (data.check) {
          switch (data.check.type) {
            case "roll":
              onChapterAction("action_set_highlight", { "key": data.check.key, "level": data.check.level });
              break;
            case "roll_select":
              data.check.rolls.forEach(roll => onChapterAction("action_set_highlight", { "key": roll.key, "level": roll.level }));
              break;
            case "opposed_roll":
              onChapterAction("action_set_highlight", { "key": data.check.key, "level": "all" });
              break;
            case "combat":
              onChapterAction("action_set_highlight", { "key": "dodge", "level": "value" });
              onChapterAction("action_set_highlight", { "key": "fighting", "level": "value" });
              break;
          }
        }

        // reset checkFlags for new chapter
        if (checkFlags.result) {
          setCheckFlags(initCheckFlags);
        }

        setChapter(data);

        if (data.location) {
          setMapLocation(data.location);
        }

        // useEffect may be triggered multiple times with the same chapterKey
        // run onLoad only for the first time
        if (!chapter || (chapter.key !== chapterKey)) {
          onLoad(data);
        }
      });
  }, [chapterKey]);

  if (chapterKey === 0) {
    return <Chapter0 {...{ nextChapter }} />;
  }

  if (!chapter || chapter.key !== chapterKey) {
    return <Loading {...{ autoLang }} />;
  }

  return (
    <FlagsContext.Provider value={{ flagConditionCheck: chapterFlagConditionCheck }}>
      <ChapterContent chapterText={chapter.text} />
      { chapter.interactions && <Interactions interactions={chapter.interactions} onAction={onInteractionAction} /> }
      { chapter.check && <Check check={chapter.check} onAction={onCheckAction} {...{ characterSheet, chars, attributes, skills, checkFlags, setCheckFlags }}/> }
      <br />
      <div className="px-2">
        <GoToOptions options={chapter.options} {...{ chapterKey, nextChapter }} />
      </div>
    </FlagsContext.Provider>
  )
}