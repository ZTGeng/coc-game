import { useContext, useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { LanguageContext, CharacterSheetContext } from "../../App";
import { useFlagCheck } from "../../store/slices/flagSlice";
import Combat from "./Combat";
import ActionCard, { CheckButton } from "./ActionCard";
import * as utils from "../../utils/utils";

const characteristicsList = ["STR", "CON", "SIZ", "DEX", "APP", "INT", "POW", "EDU"];
const attributesList = ["HP", "San", "Luck", "MP"];

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
  en: "Roll Pass",
  zh: "检定成功"
};
const checkFailText = {
  en: "Roll Fail",
  zh: "检定失败"
};
const opposedCheckWinText = {
  en: "Opposed Roll Win",
  zh: "对抗检定胜出"
};
const opposedCheckLoseText = {
  en: "Opposed Roll Lose",
  zh: "对抗检定落败"
};
const pushText = {
  en: "Pushed Roll: ",
  zh: "孤注一掷："
};

function getRollName(key, characterSheet) {
  if (characteristicsList.includes(key) || attributesList.includes(key)) {
    return characterSheet[key].name;
  } else {
    return characterSheet.skills[key].name;
  }
}

function getRollValue(key, chars, attrs, skills) {
  if (characteristicsList.includes(key)) {
    return chars[key].value;
  } else if (attributesList.includes(key)) {
    return attrs[key].value;
  } else {
    return skills[key].value;
  }
}

export function calculateBonus(check, flagCheck) {
  let bonus = 0;
  if (check.bonus) { // Int or { flag, value }
    if (typeof check.bonus === "number") {
      bonus = check.bonus;
    } else if (Object.prototype.toString.call(check.bonus) === "[object Object]") {
      if (flagCheck(check.bonus.flag)) {
        bonus = check.bonus.value;
      }
    }
  }
  if (flagCheck("flag_penalty_die") && check.key !== "Luck" && check.key !== "San") {
    bonus -= 1;
  }
  return bonus;
}

export function rollCheck(bonus, skillName, onAction, autoLang) {
  const diceNumbers = utils.roll(1, 100);
  for (let i = 0; i < Math.abs(bonus); i++) {
    const secondRoll = (utils.roll(1, 10) - 1) * 10 + diceNumbers[0] % 10;
    diceNumbers.push(secondRoll === 0 ? 100 : secondRoll);
  }
  onAction("action_dice_message", { 
    title: autoLang({ zh: `${autoLang(skillName)}检定`, en: `${autoLang(skillName)} Roll` }), num: 1, dice: 100, bonus: bonus, results: diceNumbers, shouldPlaySound: true 
  });
  if (bonus > 0) {
    return Math.min(...diceNumbers);
  } else {
    return Math.max(...diceNumbers);
  }
}

// chapter 155
function OpposedCheck({ check, onAction, rollFlags, setRollFlags }) {
  // console.log(`OpposedCheck: ${check.key} vs ${check.opponent.key}`);
  const { autoLang } = useContext(LanguageContext);
  const characterSheet = useContext(CharacterSheetContext);
  const flagCheck = useFlagCheck();
  const charStore = useSelector(state => state.character.chars);
  const attrStore = useSelector(state => state.character.attrs);
  const skillStore = useSelector(state => state.character.skills);
  const [opponentResult, setOpponentResult] = useState({ diceNumber: "", resultLevel: "" });
  const loaded = useRef(false);

  useEffect(() => {
    // console.log(`OpposedCheck useEffect: ${check.key} vs ${check.opponent.key}`);
    if (loaded.current) return;
    loaded.current = true;
    
    const opponentDiceNumber = utils.roll(1, 100);
    const opponentLevel = utils.calculateLevel(opponentDiceNumber[0], check.opponent.value, check.opponent.half, check.opponent.fifth);
    setOpponentResult({ diceNumber: opponentDiceNumber[0], resultLevel: opponentLevel });
    onAction("action_dice_message", {
      title: autoLang(utils.TEXTS.opponentRoll), num: 1, dice: 100, bonus: 0, results: opponentDiceNumber, shouldPlaySound: true 
    });
  }, []);

  const yourSkillValue = getRollValue(check.key, charStore, attrStore, skillStore);
  const yourSkill = { 
    name: getRollName(check.key, characterSheet), 
    value: yourSkillValue, 
    half: Math.floor(yourSkillValue / 2),
    fifth: Math.floor(yourSkillValue / 5),
    bonus: calculateBonus(check, flagCheck) };
  const opponentSkill = { 
    name: getRollName(check.opponent.key, characterSheet), 
    value: check.opponent.value, 
    half: check.opponent.half, 
    fifth: check.opponent.fifth, 
    bonus: 0 };
  const yourCard = {
    role: { name: utils.TEXTS.yourName, isOpponent: false },
    action: { key: "opposed_roll", name: utils.TEXTS.opposedRoll, isInitiating: true },
    skill: yourSkill,
    result: { diceNumber: rollFlags.diceNumber, resultLevel: rollFlags.resultLevel },
    isDisabled: false,
    onAction: onOpposedRoll,
  };
  const opponentCard = {
    role: { name: check.opponent.name, isOpponent: true },
    action: { key: "opposed_roll", name: utils.TEXTS.opposedRoll, isInitiating: true },
    skill: opponentSkill,
    result: opponentResult,
    isDisabled: false,
  }

  function onOpposedRoll() {
    const diceNumber = rollCheck(yourSkill.bonus, yourSkill.name, onAction, autoLang);
    const resultLevel = utils.calculateLevel(diceNumber, yourSkill.value, yourSkill.half, yourSkill.fifth);
    const isPassed = resultLevel === opponentResult.resultLevel ? yourSkill.value > opponentSkill.value : resultLevel > opponentResult.resultLevel;
    setRollFlags({
      // status: "done", 
      diceNumber: diceNumber,
      rollKey: check.key,
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

  const title = autoLang({
    zh: `对抗检定 - ${autoLang(yourSkill.name)} vs ${autoLang(opponentSkill.name)}`,
    en: `Opposed Roll - ${autoLang(yourSkill.name)} vs ${autoLang(opponentSkill.name)}`
  });

  return (
    <div className={"card mb-3" + (rollFlags.result ? (rollFlags.result === "pass" ? " border-success" : " border-danger") : " text-bg-light")}>
      <div className="card-header">{ title }</div>
      <div className={"card-body" + (rollFlags.result ? (rollFlags.result === "pass" ? " text-success" : " text-danger") : "")}>
        <div className="d-flex justify-content-center align-items-stretch">
          <ActionCard {...{ ...yourCard }} />
          <ActionCard {...{ ...opponentCard }} />
        </div>
        <div className="mt-3">
          {rollFlags.result && <strong>{ autoLang(rollFlags.result === "pass" ? opposedCheckWinText : opposedCheckLoseText) }</strong>}
        </div>
      </div>
    </div>
  );
}

// chapter 121
function RollCheck({ check, onAction, rollFlags, setRollFlags }) {
  const { autoLang } = useContext(LanguageContext);
  const characterSheet = useContext(CharacterSheetContext);
  const flagCheck = useFlagCheck();
  const charStore = useSelector(state => state.character.chars);
  const attrStore = useSelector(state => state.character.attrs);
  const skillStore = useSelector(state => state.character.skills);

  if (check.show && !flagCheck(check.show)) {
    return null;
  }

  // let [name, value] = getNameAndValueByKey(check.key, characterSheet, chars, attributes, skills, autoLang);
  const skillName = getRollName(check.key, characterSheet);
  const skillValue = getRollValue(check.key, charStore, attrStore, skillStore);
  const target = check.level === "fifth" ? Math.floor(skillValue / 5) : (check.level === "half" ? Math.floor(skillValue / 2) : skillValue);
  const bonus = calculateBonus(check, flagCheck)
  const isPushed = rollFlags.result;

  function onCheck() {
    if (rollFlags.result && (!check.allowPush || rollFlags.isPushed)) {
      console.error("Check already done, no push allowed or already pushed.");
      return;
    }
    
    const diceNumber = rollCheck(bonus, skillName, onAction, autoLang);
    const isPassed = diceNumber <= target;
    setRollFlags({
      // status: "done", 
      diceNumber: diceNumber,
      rollKey: check.key,
      rollLevel: check.level,
      result: isPassed ? "pass" : "fail",
      resultLevel: utils.calculateLevel(diceNumber, skillValue),
      isFumble: skillValue < 50 ? diceNumber >= 96 : diceNumber === 100,
      isPushed: isPushed,
    });
    if (isPassed && check.onpass) {
      check.onpass.forEach(action => onAction(action.action, action.param));
    }
    if (!isPassed && check.onfail) {
      check.onfail.forEach(action => onAction(action.action, action.param));
    }
  }

  const title = `${
    autoLang(skillName)
  }${
    autoLang(utils.TEXTS.rollSuffix)
  } - ${
    autoLang(checkLevelTexts)[check.level]
  }${
    bonus === 0
      ? ""
      : (bonus > 0
        ? ` - ${autoLang(utils.TEXTS.bonusDie)} x ${bonus}`
        : ` - ${autoLang(utils.TEXTS.penaltyDie)} x ${-bonus}`)
  }`;
  const showCheckButton = !rollFlags.result || (rollFlags.result === "fail" && check.allowPush && !rollFlags.isPushed);

  return (
    <div className={"card mb-3" + (rollFlags.result ? (rollFlags.result === "pass" ? " border-success" : " border-danger") : " text-bg-light")}>
      <div className="card-header">{title}</div>
      <div className={"card-body" + (rollFlags.result ? (rollFlags.result === "pass" ? " text-success" : " text-danger") : "")}>
        {rollFlags.result && <div><strong>{ autoLang(rollFlags.result === "pass" ? checkPassText : checkFailText)}</strong></div>}
        {showCheckButton && <div>{isPushed ? <span>{ autoLang(pushText) }</span> : null}<CheckButton onClick={onCheck} /></div>}
      </div>
    </div>
  )
}

// chapter 144
function RollSelectCheck({ check, onAction, rollFlags, setRollFlags }) {
  const initRolls = check.rolls;
  const [rolls, setRolls] = useState(initRolls);
  function rollSelectSetRollFlags(checkFlagsToSet) {
    if (checkFlagsToSet.result) {
      setRolls(rolls.filter(roll => roll.key === checkFlagsToSet.rollKey && roll.level === checkFlagsToSet.rollLevel));
    }
    setRollFlags(checkFlagsToSet);
  }

  return (
    <div className="card-group">
      {
        rolls
          .filter(roll => !rollFlags.result || (rollFlags.rollKey === roll.key && rollFlags.rollLevel === roll.level))
          .map((roll, i) => <RollCheck key={i} check={roll} setRollFlags={rollSelectSetRollFlags} {...{ onAction, rollFlags }} />)
      }
    </div>
  )
}

export default function Check({ check, onAction, rollFlags, setRollFlags }) {

  switch (check.type) {
    case "roll":
      return <RollCheck {...{ check, onAction, rollFlags, setRollFlags }} />;
    case "roll_select":
      return <RollSelectCheck {...{ check, onAction, rollFlags, setRollFlags }} />;
    case "opposed_roll":
      return <OpposedCheck {...{ check, onAction, rollFlags, setRollFlags }} />;
    case "combat":
      return <Combat {...{ check, onAction, rollFlags, setRollFlags }} />;
    default:
      return null;
  }
}