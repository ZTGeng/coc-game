import { useContext, useState, useEffect, useRef } from "react";
import { LanguageContext } from "../../App";
import * as utils from "../../utils";

const characteristicsList = ["STR", "CON", "SIZ", "DEX", "APP", "INT", "POW", "EDU"];
const attributesList = ["HP", "San", "Luck", "MP"];
const resultLevels = ["fail", "value", "half", "fifth"];
const resultLevelTexts = {
  en: {
    "fail": "Failure",
    "value": "Regular Success",
    "half": "Hard Success",
    "fifth": "Extreme Success"
  },
  zh: {
    "fail": "失败",
    "value": "普通成功",
    "half": "困难成功",
    "fifth": "极难成功"
  }
};
const checkLevelTexts = {
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
const opposedCheckWinText = {
  en: "Win the Opposed Roll",
  zh: "对抗检定胜出"
};
const opposedCheckLoseText = {
  en: "Lose the Opposed Roll",
  zh: "对抗检定落败"
};
const checkButtonText = {
  en: "Roll 1D100",
  zh: "掷骰1D100"
};
const yourName = {
  en: "You",
  zh: "你"
};

function getNameAndValueByKey(key, characterSheet, chars, attributes, skills, language) {
  if (characteristicsList.includes(key)) {
    return [characterSheet[key].name[language] || characterSheet[key].name["en"], chars[key].value];
  } else if (attributesList.includes(key)) {
    return [characterSheet[key].name[language] || characterSheet[key].name["en"], attributes[key].value];
  } else {
    return [characterSheet.skills[key].name[language] || characterSheet.skills[key].name["en"], skills[key].value];
  }
}

function calculateLevel(diceNumber, value, half, fifth) { // 0: fail, 1: value, 2: half, 3: fifth
  if (!half && half !== 0) half = Math.floor(value / 2);
  if (!fifth && fifth !== 0) fifth = Math.floor(value / 5);
  return diceNumber <= fifth ? 3 : diceNumber <= half ? 2 : diceNumber <= value ? 1 : 0;
}

function OpposedCheck({ check, characterSheet, chars, attributes, skills, onAction, checkFlags, setCheckFlags }) {
  console.log(`OpposedCheck: ${check.key} vs ${check.opponent.key}`);
  const { language } = useContext(LanguageContext);
  const [opponentResult, setOpponentResult] = useState({ diceNumber: "", level: "" });
  const loaded = useRef(false);

  const [yourSkillName, yourSkillValue] = getNameAndValueByKey(check.key, characterSheet, chars, attributes, skills, language);
  const yourSkillHalf = Math.floor(yourSkillValue / 2);
  const yourSkillFifth = Math.floor(yourSkillValue / 5);
  const [opponentSkillName, _] = getNameAndValueByKey(check.opponent.key, characterSheet, chars, attributes, skills, language);

  const resultLevelText = resultLevelTexts[language] || resultLevelTexts["en"];
  const title = language === "zh"
    ? `对抗检定 - ${yourSkillName} vs ${opponentSkillName} ${check.bonus && check.bonus > 0 ? `- 奖励骰 x ${check.bonus}` : (check.bonus && check.bonus < 0 ? `- 惩罚骰 x ${-check.bonus}` : "")}`
    : `Opposed Roll - ${yourSkillName} vs ${opponentSkillName} ${check.bonus && check.bonus > 0 ? `- Bonus Die x ${check.bonus}` : (check.bonus && check.bonus < 0 ? `- Penalty Die x ${-check.bonus}` : "")}`;

  const yourResultLevel = resultLevels[checkFlags.resultLevel || 0];
  const yourText = language === "zh"
    ? `${checkFlags.diceNumber} - ${resultLevelText[yourResultLevel]}`
    : `${checkFlags.diceNumber} - ${resultLevelText[yourResultLevel]}`;

  const opponentResultLevel = resultLevels[opponentResult.level || 0];
  const opponentText = language === "zh"
    ? `${opponentResult.diceNumber} - ${resultLevelText[opponentResultLevel]}`
    : `${opponentResult.diceNumber} - ${resultLevelText[opponentResultLevel]}`;

  useEffect(() => {
    console.log(`OpposedCheck useEffect: ${check.key} vs ${check.opponent.key}`);
    if (loaded.current) return;
    loaded.current = true;
    const opponentDiceNumber = utils.roll(1, 100);
    const opponentLevel = calculateLevel(opponentDiceNumber[0], check.opponent.value, check.opponent.half, check.opponent.fifth);
    setOpponentResult({ diceNumber: opponentDiceNumber[0], level: opponentLevel });
    onAction("action_show_dice_toast", { num: 1, dice: 100, results: opponentDiceNumber, shouldPlaySound: true });

  }, []);

  function doCheck() {
    const diceNumbers = utils.roll(1, 100);
    let diceNumber = diceNumbers[0];
    if (check.bonus) {
      for (let i = 0; i < Math.abs(check.bonus); i++) {
        diceNumbers.push(utils.roll(1, 10) * 10 + diceNumber % 10);
      }
      if (check.bonus > 0) {
        diceNumber = Math.max(...diceNumbers);
      } else {
        diceNumber = Math.min(...diceNumbers);
      }
    }
    const resultLevel = calculateLevel(diceNumber, yourSkillValue, yourSkillHalf, yourSkillFifth);
    const isPassed = resultLevel === opponentResult.level ? yourSkillValue > check.opponent.value : resultLevel > opponentResult.level;
    onAction("action_show_dice_toast", { num: 1, dice: 100, bonus: check.bonus, results: diceNumbers, shouldPlaySound: true });
    setCheckFlags({
      // status: "done", 
      diceNumber: diceNumber,
      rollKey: check.key,
      rollLevel: check.level,
      result: isPassed ? "pass" : "fail",
      resultLevel: resultLevel,
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
        <div className="d-flex align-items-stretch">
          <div className="card text-bg-light flex-fill mw-25 me-2 px-0">
            <div className="card-header d-flex">
              <h6>{`${yourName[language] || yourName["en"]}`}</h6>
              <small className="ms-auto">{yourSkillName} {yourSkillValue}</small>
            </div>
            <div className="card-body">
              <div className="mb-3">
                {checkFlags.result && (
                  <div>
                    {language === "zh" ? `掷骰1D100：` : `Roll 1D100: `}
                    <p className="lead text-end">{yourText}</p>
                  </div>
                )}
                {!checkFlags.result && <button className="btn btn-dark mx-2" onClick={doCheck}>{checkButtonText[language] || checkButtonText["en"]}</button>}
              </div>
              <ul className="list-group list-group-flush">
                <li className={"list-group-item list-group-item-secondary" + (checkFlags.resultLevel === 3 ? " active" : "")}>{resultLevelText["fifth"]}: &le;{yourSkillFifth}</li>
                <li className={"list-group-item list-group-item-secondary" + (checkFlags.resultLevel === 2 ? " active" : "")}>{resultLevelText["half"]}: &le;{yourSkillHalf}</li>
                <li className={"list-group-item list-group-item-secondary" + (checkFlags.resultLevel === 1 ? " active" : "")}>{resultLevelText["value"]}: &le;{yourSkillValue}</li>
                <li className={"list-group-item list-group-item-secondary" + (checkFlags.resultLevel === 0 ? " active" : "")}>{resultLevelText["fail"]}: &gt;{yourSkillValue}</li>
              </ul>
            </div>
          </div>
          <div className="card text-bg-dark flex-fill mw-25 ms-2 px-0">
            <div className="card-header d-flex">
              <h6>{`${check.opponent.name[language] || check.opponent.name["en"]}`}</h6>
              <small className="ms-auto">{opponentSkillName} {check.opponent.value}</small>
            </div>
            <div className="card-body">
              <div>
                {language === "zh" ? `掷骰1D100：` : `Roll 1D100: `}
                <p className="lead text-end">{opponentText}</p>
              </div>
              <ul className="list-group list-group-flush">
                <li className={"list-group-item list-group-item-dark" + (opponentResult.level === 3 ? " active" : "")}>{resultLevelText["fifth"]}: &le;{check.opponent.fifth}</li>
                <li className={"list-group-item list-group-item-dark" + (opponentResult.level === 2 ? " active" : "")}>{resultLevelText["half"]}: &le;{check.opponent.half}</li>
                <li className={"list-group-item list-group-item-dark" + (opponentResult.level === 1 ? " active" : "")}>{resultLevelText["value"]}: &le;{check.opponent.value}</li>
                <li className={"list-group-item list-group-item-dark" + (opponentResult.level === 0 ? " active" : "")}>{resultLevelText["fail"]}: &gt;{check.opponent.value}</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-3">
          {checkFlags.result && <strong>{checkFlags.result === "pass" ? (opposedCheckWinText[language] || opposedCheckWinText["en"]) : (opposedCheckLoseText[language] || opposedCheckLoseText["en"])}</strong>}
        </div>
      </div>
    </div>
  );
}

function RollCheck({ check, characterSheet, chars, attributes, skills, onAction, checkFlags, setCheckFlags }) {
  const { language } = useContext(LanguageContext);

  let [name, value] = getNameAndValueByKey(check.key, characterSheet, chars, attributes, skills, language);
  const target = check.level === "fifth" ? Math.floor(value / 5) : (check.level === "half" ? Math.floor(value / 2) : value);
  const checkLevelText = checkLevelTexts[language] || checkLevelTexts["en"];
  const title = language === "zh"
    ? `${name}检定 - ${checkLevelText[check.level]} ${check.bonus && check.bonus > 0 ? `- 奖励骰 x ${check.bonus}` : (check.bonus && check.bonus < 0 ? `- 惩罚骰 x ${-check.bonus}` : "")}`
    : `${name} Roll - ${checkLevelText[check.level]} ${check.bonus && check.bonus > 0 ? `- Bonus Die x ${check.bonus}` : (check.bonus && check.bonus < 0 ? `- Penalty Die x ${-check.bonus}` : "")}`;

  function doCheck() {
    const diceNumbers = utils.roll(1, 100);
    let diceNumber = diceNumbers[0];
    if (check.bonus) {
      for (let i = 0; i < Math.abs(check.bonus); i++) {
        diceNumbers.push((utils.roll(1, 10) - 1) * 10 + diceNumber % 10);
      }
      if (check.bonus > 0) {
        diceNumber = Math.max(...diceNumbers);
      } else {
        diceNumber = Math.min(...diceNumbers);
      }
    }
    const isPassed = diceNumber <= target;
    onAction("action_show_dice_toast", { num: 1, dice: 100, bonus: check.bonus, results: diceNumbers, shouldPlaySound: true });
    setCheckFlags({
      // status: "done", 
      diceNumber: diceNumber,
      rollKey: check.key,
      rollLevel: check.level,
      result: isPassed ? "pass" : "fail",
      resultLevel: calculateLevel(diceNumber, value),
      isFumble: value < 50 ? diceNumber >= 96 : diceNumber === 100,
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

export default function Check({ check, characterSheet, chars, attributes, skills, onAction, checkFlags, setCheckFlags }) {

  switch (check.type) {
    case "roll":
      return <RollCheck {...{ check, characterSheet, chars, attributes, skills, onAction, checkFlags, setCheckFlags }} />;
    case "roll_select":
      return <RollSelectCheck {...{ check, characterSheet, chars, attributes, skills, onAction, checkFlags, setCheckFlags }} />;
    case "opposed_roll":
      return <OpposedCheck {...{ check, characterSheet, chars, attributes, skills, onAction, checkFlags, setCheckFlags }} />;
    default:
      return null;
  }
}