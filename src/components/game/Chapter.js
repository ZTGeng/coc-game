import { useContext, useState, useEffect } from "react";
import { LanguageContext } from "../../App";
import { FlagsContext } from "../Game";
import Chapter0 from "./Chapter0";
import GoToOptions from "./GoToOptions";
import flagConditionCheckProvider from "../flagCheck";
import * as utils from "../../utils";

const characteristicsList = ["STR", "CON", "SIZ", "DEX", "APP", "INT", "POW", "EDU"];
const attributesList = ["HP", "San", "Luck", "MP"];
const checkLevelText = {
  en: {
    "value": "Regular",
    "half": "Hard",
    "fifth": "Extreme"
  },
  zh: {
    "value": "普通",
    "half": "困难",
    "fifth": "极难"
  }
};
const checkPassText = {
  en: "Passed the Roll",
  zh: "检定成功"
};
const checkFailText = {
  en: "Failed the Roll",
  zh: "检定失败"
};
const checkButtonText = {
  en: "Roll 1D100",
  zh: "掷骰1D100"
};

const initCheckFlags = {
  // status: "", // "", "ready", "done"
  // roll: [], // roll results
  rollKey: "", // "key"
  rollLevel: "", // "value", "half", "fifth"
  result: "", // "", "pass", "fail"

}

function Loading({ language }) {
  return language === "zh" ? <p>"加载中..."</p> : <p>"Loading..."</p>;
}

function ChapterContent({ chapterText }) {
  const { language } = useContext(LanguageContext);

  return (chapterText[language] || chapterText["en"]).map((item, index) => {
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
  const { language } = useContext(LanguageContext);
  const { flagConditionCheck } = useContext(FlagsContext);

  return (
    interaction.disabled && flagConditionCheck(interaction.disabled)
      ? <button className="btn btn-dark mx-2" disabled>{ interaction.text[language] || interaction.text["en"] }</button>
      : (<button className="btn btn-dark mx-2" onClick={() => { onAction(interaction.action, interaction.param) }}>
        { interaction.text[language] || interaction.text["en"] }
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

function RollCheck({ check, characterSheet, chars, attributes, skills, onAction, checkFlags, setCheckFlags }) {
  const { language } = useContext(LanguageContext);

  let name, value;
  if (characteristicsList.includes(check.key)) {
    name = characterSheet[check.key].name[language] || characterSheet[check.key].name["en"];
    value = chars[check.key].value;
  } else if (attributesList.includes(check.key)) {
    name = characterSheet[check.key].name[language] || characterSheet[check.key].name["en"];
    value = attributes[check.key].value;
  } else {
    name = characterSheet.skills[check.key].name[language] || characterSheet.skills[check.key].name["en"];
    value = skills[check.key].value;
  }
  const target = check.level === "fifth" ? Math.floor(value / 5) : (check.level === "half" ? Math.floor(value / 2) : value);
  const title = language === "zh" ? `${name}检定 - ${checkLevelText.zh[check.level]}` : `${name} Roll - ${checkLevelText.en[check.level]}`;

  function doCheck() {
    const diceNumber = utils.roll(1, 100);
    const isPassed = diceNumber[0] <= target;
    onAction("action_show_dice_toast", { num: 1, dice: 100, results: diceNumber, shouldPlaySound: true });
    setCheckFlags({
      // status: "done", 
      // roll: diceNumber, 
      rollKey: check.key,
      rollLevel: check.level,
      result: isPassed ? "pass" : "fail"
    });
    if (isPassed && check.onpass) {
      check.onpass.forEach(action => onAction(action.action, action.param));
    }
    if (!isPassed && check.onfail) {
      check.onfail.forEach(action => onAction(action.action, action.param));
    }
  }

  return (
    <div className={"card mb-3" + (checkFlags.result ? (checkFlags.result === "pass" ? " border-success" : " border-danger") : " text-bg-light")}>
      <div className="card-header">{title}</div>
      <div className={"card-body" + (checkFlags.result ? (checkFlags.result === "pass" ? " text-success" : " text-danger") : "")}>
        {checkFlags.result && <strong>{checkFlags.result === "pass" ? (checkPassText[language] || checkPassText["en"]) : (checkFailText[language] || checkFailText["en"])}</strong>}
        {!checkFlags.result && <button className="btn btn-dark mx-2" onClick={doCheck}>{checkButtonText[language] || checkButtonText["en"]}</button>}
      </div>
    </div>
  )
}

function RollSelectCheck({ check, characterSheet, chars, attributes, skills, onAction, checkFlags, setCheckFlags }) {
  const initRolls = check.rolls;
  const [rolls, setRolls] = useState(initRolls);
  function rollSelectSetCheckFlags(checkFlagsToSet) {
    if (checkFlagsToSet.result) {
      setRolls(rolls.filter(roll => roll.key === checkFlagsToSet.rollKey && roll.level === checkFlagsToSet.rollLevel));
    }
    setCheckFlags(checkFlagsToSet);
  }

  return (
    <div className="card-group">
      { 
        rolls
          .filter(roll => !checkFlags.result || (checkFlags.rollKey === roll.key && checkFlags.rollLevel === roll.level))
          .map((roll, i) => <RollCheck key={i} check={roll} setCheckFlags={rollSelectSetCheckFlags} {...{ characterSheet, chars, attributes, skills, onAction, checkFlags }} />) 
      }
    </div>
  )
}


function Check({ check, characterSheet, chars, attributes, skills, onAction, checkFlags, setCheckFlags }) {
  const { language } = useContext(LanguageContext);

  if (check.type === "roll") {
    return <RollCheck {...{ check, characterSheet, chars, attributes, skills, onAction, checkFlags, setCheckFlags }} />;
  } else if (check.type === "roll_select") {
    return <RollSelectCheck {...{ check, characterSheet, chars, attributes, skills, onAction, checkFlags, setCheckFlags }} />;
  }
}

export default function Chapter({ chapterKey, characterSheet, chars, attributes, skills, nextChapter, onChapterAction }) {
  const { language } = useContext(LanguageContext);
  const { flagConditionCheck } = useContext(FlagsContext);
  const [chapter, setChapter] = useState(null);
  const [checkFlags, setCheckFlags] = useState(initCheckFlags);
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
      chapterJson.onload.forEach(action => onChapterAction(action.action, action.param));
    }
  }

  function onInteractionAction(action, param) {
    console.log(`Chapter ${chapter.key} onInteraction: ${action}(${JSON.stringify(param)})`);
    if (action === "action_roll_luck_and_update_chapter") {
      // param is the new chapter json with the same key
      setChapter(param);
      // will do DEX check, highlisht is needed
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

        // reset checkFlags for new chapter
        if (checkFlags.result) {
          setCheckFlags(initCheckFlags);
        }

        setChapter(data);

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
    return <Loading language={language} />;
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