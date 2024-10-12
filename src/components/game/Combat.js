import { useState, useRef, useEffect, useContext } from "react";
import { LanguageContext } from "../../App";
import { FlagsContext } from "../Game";
import { resultLevelTexts, checkButtonText, calculateLevel } from "./Check";
import * as utils from "../../utils";

const fightAction =     { key: "fight", name: { zh: "攻击", en: "Fight" }, isInitiating: true };
const fightBackAction = { key: "fight_back", name: { zh: "反击", en: "Fight Back" }, isInitiating: false };
const dodgeAction =     { key: "dodge", name: { zh: "闪避", en: "Dodge" }, isInitiating: false };

const yourName = { en: "You", zh: "你" };
const initMoveResult = { diceNumber: "", resultLevel: "", skill: "", action: "" };
const nextButtonText = { en: "Next", zh: "下一步" };

// role: { name, isOpponent }, action: { key, name, isInitiating }, skill: { name, value, half, fifth }, result: { diceNumber, resultLevel }
function ActionCard({ role, action, skill, result, hpName, onAction, next }) {
  const { autoLang } = useContext(LanguageContext);
  const resultLevelText = autoLang(resultLevelTexts);

  let cardContent, isDisabled = false;
  if (role.isOpponent) {
    cardContent = <div className="h5 fw-light ms-auto">{ `${result.diceNumber} - ${resultLevelText[result.resultLevel || 0]}` }</div>;
  } else if (result.action === "") {
    cardContent = <button className="btn btn-sm btn-dark" onClick={onAction}>{ autoLang(checkButtonText) }</button>;
  } else if (result.action.key === action.key) {
    cardContent = (
      <>
        <button className="btn btn-sm btn-dark" onClick={next}>{ autoLang(nextButtonText) }</button>
        <div className="h5 fw-light ms-auto">{ `${result.diceNumber} - ${resultLevelText[result.resultLevel || 0]}` }</div>
      </>
    );
  } else {
    cardContent = <div className="h5 fw-light ms-auto">&nbsp;</div>;
    isDisabled = true; // TODO to arg
  }

  function liTagClassName(level) {
    return `list-group-item list-group-item-${role.isOpponent ? "dark" : "secondary"} ${isDisabled ? "text-secondary" : result.resultLevel === level ? "active" : ""}`;
  }

  return (
    <div className={`flex-fill mx-1 ${action.isInitiating ? "" : "pt-4"}`} style={{ maxWidth: "20rem" }}>
      <div className={`card ${role.isOpponent ? "text-bg-dark" : isDisabled ? "text-secondary" : "text-bg-light"} px-0`}>
        <div className="card-header d-flex">
          <h6>{ autoLang(role.name) }</h6>
          <small className="mx-2">{ autoLang(hpName) } { role.HP }</small>
          <small className="ms-auto">{ autoLang(skill.name) } { skill.value }</small>
        </div>
        <div className="card-body">
          <div>{ autoLang(action.name) }</div>
          <div className="mb-3 d-flex">
            { cardContent }
          </div>
          <ul className="list-group list-group-flush">
            <li className={liTagClassName(3)}>{ resultLevelText[3]}: &le;{skill.fifth || Math.floor(skill.value / 5) }</li>
            <li className={liTagClassName(2)}>{ resultLevelText[2]}: &le;{skill.half || Math.floor(skill.value / 2) }</li>
            <li className={liTagClassName(1)}>{ resultLevelText[1]}: &le;{skill.value }</li>
            <li className={liTagClassName(0)}>{ resultLevelText[0]}: &gt;{skill.value }</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function Combat({ check, characterSheet, chars, attributes, skills, onAction, checkFlags, setCheckFlags }) {
  const { autoLang } = useContext(LanguageContext);
  const { flagConditionCheck } = useContext(FlagsContext);
  const [progress, setProgress] = useState({ round: 0, turn: 0, move: 0 });
  const [yourMoveResult, setYourMoveResult] = useState(initMoveResult);
  const [opponentMoveResult, setOpponentMoveResult] = useState(initMoveResult);
  const [opponentHp, setOpponentHp] = useState(check.opponent.HP);
  const loaded = useRef(false);
  
  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;

    // Cannot do this in render code due to React strict mode
    opponentRollResult();
  }, []);

  const you = { name: yourName, isOpponent: false, HP: attributes.HP.value, DEX: chars.DEX.value };
  const opponent = { ...check.opponent, isOpponent: true, HP: opponentHp };
  const turns = you.DEX >= opponent.DEX ? ["you", "opponent"] : ["opponent", "you"];
  const isOpponentActing = turns[progress.turn] === "opponent";

  const dodgeSkill = {
    name: characterSheet.skills.dodge.name,
    value: skills.dodge.value,
    half: Math.floor(skills.dodge.value / 2),
    fifth: Math.floor(skills.dodge.value / 5),
  };
  const fightSkill = { 
    name: characterSheet.skills.fighting.name,
    value: skills.fighting.value,
    half: Math.floor(skills.fighting.value / 2),
    fifth: Math.floor(skills.fighting.value / 5),
  };
  const hpName = characterSheet.HP.name;

  const yourDamage = flagConditionCheck("flag_bought_knife") ? "1d4" : "1d3";
  const yourDamageBonus = utils.calculateDamageBonus(chars.STR.value, chars.SIZ.value);

  function getOpponentCurrentMovel() {
    const moves = opponent.moves[progress.round % opponent.moves.length];
    return moves[progress.move];
  }

  function getOpponentCurrentSkill() {
    return opponent.skills[getOpponentCurrentMovel()];
  }

  function opponentRollResult() {
    const opponentSkill = getOpponentCurrentSkill();
    const opponentDiceNumber = utils.roll(1, 100);
    const opponentLevel = calculateLevel(opponentDiceNumber[0], opponentSkill.value, opponentSkill.half, opponentSkill.fifth);
    setOpponentMoveResult({ 
      diceNumber: opponentDiceNumber[0], 
      resultLevel: opponentLevel, 
      skill: opponentSkill,
    });
    onAction("action_dice_message", { 
      title: autoLang(utils.TEXTS.opponentRoll), num: 1, dice: 100, bonus: 0, results: opponentDiceNumber, shouldPlaySound: true 
    });
  }

  function youRollResult(action, skill) {
    const diceNumber = utils.roll(1, 100);
    const resultLevel = calculateLevel(diceNumber[0], skill.value, skill.half, skill.fifth);
    setYourMoveResult({ diceNumber: diceNumber[0], resultLevel, skill, action });
    onAction("action_dice_message", {
      title: autoLang(utils.TEXTS.yourRoll), num: 1, dice: 100, bonus: 0, results: diceNumber, shouldPlaySound: true 
    });
    return resultLevel;
  }

  function onOpponentHitYou() {
    let hpReduce;
    if (typeof opponentMoveResult.skill.damage === "string") {
      const [num, dice] = opponentMoveResult.skill.damage.toLowerCase().split("d").map(s => parseInt(s));
      const diceNumbers = utils.roll(num, dice);
      hpReduce = diceNumbers.reduce((acc, cur) => acc + cur, 0);
      onAction("action_dice_message", {
        title: autoLang(utils.TEXTS.damage), num: num, dice: dice, bonus: 0, results: diceNumbers, shouldPlaySound: true 
      });
    } else if (typeof opponentMoveResult.skill.damage === "number") {
      hpReduce = opponentMoveResult.skill.damage;
    }
    if (hpReduce > 0) {
      if (hpReduce >= attributes.HP.maxValue / 2) {
        onAction("action_set_flag", { flag: "flag_major_wound", value: true });
      }
      if (hpReduce >= attributes.HP.value) {
        setCheckFlags({ result: "fail" });
      }

      onAction("action_adjust_attribute", { key: "HP", delta: -hpReduce });
      onAction("action_set_highlight", { key: "HP", level: "danger" });
    }
  }

  function onYouHitOpponent(resultLevel) {
    let hpReduce = 0, alterNumDice = "", diceNumbers = [];
    if (resultLevel === 3) {
      // Extreme damage
      if (typeof yourDamage === "string") {
        const [num, dice] = yourDamage.toLowerCase().split("d").map(s => parseInt(s));
        hpReduce += num * dice;
      } else if (typeof yourDamage === "number") {
        hpReduce += yourDamage;
      }
      if (typeof yourDamageBonus === "string") {
        const [num, dice] = yourDamageBonus.toLowerCase().split("d").map(s => parseInt(s));
        hpReduce += num * dice;
      } else if (typeof yourDamageBonus === "number") {
        hpReduce += yourDamageBonus;
      }
      if (hpReduce > opponent.armor) {
        const opponentNewHp = opponentHp - hpReduce + opponent.armor;
        setOpponentHp(opponentNewHp);
        if (opponentNewHp <= 0) {
          setCheckFlags({ result: "pass" });
        }
      }
      return;
    }

    if (typeof yourDamage === "string") {
      const [num, dice] = yourDamage.toLowerCase().split("d").map(s => parseInt(s));
      const diceNumbers1 = utils.roll(num, dice);
      hpReduce += diceNumbers1.reduce((acc, cur) => acc + cur, 0);
      diceNumbers.push(...diceNumbers1);
      alterNumDice += yourDamage;
    } else if (typeof yourDamage === "number") {
      hpReduce += yourDamage;
      alterNumDice += `${yourDamage}`;
    }
    if (typeof yourDamageBonus === "string") {
      const [num, dice] = yourDamageBonus.toLowerCase().split("d").map(s => parseInt(s));
      const diceNumbers2 = utils.roll(num, dice);
      hpReduce += diceNumbers2.reduce((acc, cur) => acc + cur, 0);
      diceNumbers.push(...diceNumbers2);
      alterNumDice += `+${yourDamageBonus}`;
    } else if (typeof yourDamageBonus === "number") {
      hpReduce += yourDamageBonus;
      alterNumDice += `+${yourDamageBonus}`;
    }
    if (diceNumbers.length > 0) {
      onAction("action_dice_message", {
        title: autoLang(utils.TEXTS.damage), 
        num: diceNumbers.length, dice: 0, bonus: 0, 
        results: diceNumbers, 
        shouldPlaySound: true,
        alterNumDice: alterNumDice
      });
    }
    if (hpReduce > opponent.armor) {
      const opponentNewHp = opponentHp - hpReduce + opponent.armor;
      setOpponentHp(opponentNewHp);
      if (opponentNewHp <= 0) {
        setCheckFlags({ result: "pass" });
      }
    }
  }

  function onDodge() {
    console.log("onDodge");
    const resultLevel = youRollResult(dodgeAction, dodgeSkill);
    if (resultLevel < opponentMoveResult.resultLevel) {
      // dodge failed
      onAction("action_message", { title: autoLang(utils.TEXTS.combat), text: autoLang({ zh: "闪避失败", en: "Dodge failed" }), color: "danger" });
      onOpponentHitYou();
    } else {
      // dodge success
      onAction("action_message", { title: autoLang(utils.TEXTS.combat), text: autoLang({ zh: "闪避成功", en: "Dodge succeeded" }), color: "success" });
    }
  }

  function onFightBack() {
    console.log("onFightBack");
    const resultLevel = youRollResult(fightBackAction, fightSkill);
    if (resultLevel <= opponentMoveResult.resultLevel) {
      // opponent hit you
      onAction("action_message", { title: autoLang(utils.TEXTS.combat), text: autoLang({ zh: "反击失败", en: "Fight back failed" }), color: "danger" });
      onOpponentHitYou();
    } else {
      // you hit opponent
      onAction("action_message", { title: autoLang(utils.TEXTS.combat), text: autoLang({ zh: "反击成功", en: "Fight back succeeded" }), color: "success" });
      onYouHitOpponent(resultLevel);
    }
  }

  function onFight() {
    console.log("onFight");
    const resultLevel = youRollResult(fightAction, fightSkill);
    const isOpponentDodging = getOpponentCurrentMovel() === dodgeAction.key;
    if (isOpponentDodging) {
      if (resultLevel <= opponentMoveResult.resultLevel) {
        // opponent dodged
        onAction("action_message", { title: autoLang(utils.TEXTS.combat), text: autoLang({ zh: "攻击被闪避", en: "Your attack was dodged" }), color: "danger" }); 
      } else {
        // opponent failed to dodge
        onAction("action_message", { title: autoLang(utils.TEXTS.combat), text: autoLang({ zh: "攻击命中", en: "You hit" }), color: "success" });
        onYouHitOpponent(resultLevel);
      }
    } else {
      if (resultLevel < opponentMoveResult.resultLevel) {
        // opponent hit you
        onAction("action_message", { title: autoLang(utils.TEXTS.combat), text: autoLang({ zh: "被对手反击", en: "You were fought back" }), color: "danger" });
        onOpponentHitYou();
      } else {
        // you hit opponent
        onAction("action_message", { title: autoLang(utils.TEXTS.combat), text: autoLang({ zh: "攻击命中", en: "You hit" }), color: "success" });
        onYouHitOpponent(resultLevel);
      }
    }
  }

  function next() {
    const progressCopy = { ...progress };
    if (isOpponentActing) {
      const moves = opponent.moves[progressCopy.round % opponent.moves.length];
      progressCopy.move += 1;
      if (progressCopy.move < moves.length) {
        setYourMoveResult(initMoveResult);
        opponentRollResult()
        setProgress(progressCopy);
        return;
      }
    }
    progressCopy.move = 0;
    progressCopy.turn += 1;
    if (progressCopy.turn < turns.length) {
      setYourMoveResult(initMoveResult);
      opponentRollResult()
      setProgress(progressCopy);
      return;
    }
    progressCopy.turn = 0;
    progressCopy.round += 1;
    if (progressCopy.round < check.rounds) {
      setYourMoveResult(initMoveResult);
      opponentRollResult()
      setProgress(progressCopy);
      return;
    }
    combatOver();
  }
  window.next = next;

  function combatOver() {
    console.log("combat over");
  }

  const cardTitle = `${autoLang({ zh: "战斗：", en: "Combat: " })}${autoLang(yourName)} vs ${autoLang(opponent.name)}`;
  const roundText = autoLang({ zh: `第 ${progress.round + 1} 轮`, en: `Round ${progress.round + 1}` });

  let yourCards = [], opponentCard;
  if (isOpponentActing) {
    const opponentSkill = getOpponentCurrentSkill();
    opponentCard = { role: opponent, action: fightAction, skill: opponentSkill, result: opponentMoveResult, hpName };

    yourCards.push({ role: you, action: fightBackAction, skill: fightSkill, result: yourMoveResult, onAction: onFightBack, hpName, next });
    yourCards.push({ role: you, action: dodgeAction, skill: dodgeSkill, result: yourMoveResult, onAction: onDodge, hpName, next });
  } else {
    const opponentSkill = opponent.skills[opponent.moveDefend];
    opponentCard = { role: opponent, action: fightBackAction, skill: opponentSkill, result: opponentMoveResult, hpName };

    yourCards.push({ role: you, action: fightAction, skill: fightSkill, result: yourMoveResult, onAction: onFight, hpName, next });
  }

  return (
    <div className={"card mb-3" + (checkFlags.result ? (checkFlags.result === "pass" ? " border-success" : " border-danger") : " text-bg-light")}>
      <div className="card-header d-flex">
        <h6>{ cardTitle }</h6>
        <div className="ms-auto">{ roundText }</div>
      </div>
      <div className="card-body text-secondary">
        <div className="d-flex justify-content-center align-items-stretch">
          { 
            yourCards
              // .filter(card => !yourMoveResult.action || yourMoveResult.action === card.action)
              .map(card => <ActionCard key={card.role.name.en + card.action.name.en} { ...card } />) 
          }
          { <ActionCard {...opponentCard} /> }
        </div>
      </div>
    </div>
  );
}
        