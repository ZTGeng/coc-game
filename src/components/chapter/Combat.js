import { useState, useRef, useEffect, useContext } from "react";
import { LanguageContext } from "../../App";
import { useFlagCheck } from "../../store/slices/flagSlice";
import { calculateBonus, rollCheck } from "./Check";
import ActionCard, { CheckButton } from "./ActionCard";
import * as utils from "../../utils/utils";

const fightAction =     { key: "fight", name: { zh: "攻击", en: "Fight" }, isInitiating: true };
const fightBackAction = { key: "fight_back", name: { zh: "反击", en: "Fight Back" }, isInitiating: false };
const dodgeAction =     { key: "dodge", name: { zh: "闪避", en: "Dodge" }, isInitiating: false };

const initMoveResult = { diceNumber: "", resultLevel: "", skill: "", action: "" };
const nextButtonText = { en: "Next", zh: "下一步" };
const combatWinText = {
  en: "Combat Win",
  zh: "战斗胜利"
};
const combatLoseText = {
  en: "Combat Lose",
  zh: "战斗失败"
};
const combatEscapeText = {
  en: "Combat Escape",
  zh: "逃脱战斗"
};
const conCheckText = {
  en: "You have taken a major wound, make a CON roll",
  zh: "你受了重伤，进行「体质」检定"
};
const conCheckPassText = {
  en: "CON Roll Pass",
  zh: "体质检定通过"
};
const conCheckFailText = {
  en: "CON Roll Fail",
  zh: "体质检定失败"
};
const escapeCheckText = {
  en: "Attempt to escape, make a hard Dodge roll",
  zh: "尝试逃跑，进行困难难度的「闪避」检定"
};
const escapeCheckPassText = {
  en: "Dodge Roll Pass",
  zh: "闪避检定通过"
};
const escapeCheckFailText = {
  en: "Dodge Roll Fail",
  zh: "闪避检定失败"
};

// chapter 173
export default function Combat({ check, characterSheet, chars, attributes, skills, onAction, checkFlags, setCheckFlags }) {
  const { autoLang } = useContext(LanguageContext);
  const flagCheck = useFlagCheck();
  const [progress, setProgress] = useState({ round: 0, turn: 0, move: 0 });
  const [yourMoveResult, setYourMoveResult] = useState(initMoveResult);
  const [opponentMoveResult, setOpponentMoveResult] = useState(initMoveResult);
  const [opponentHp, setOpponentHp] = useState(check.opponent.HP);
  const [showConCheck, setShowConCheck] = useState(false);
  const [showEscapeCheck, setShowEscapeCheck] = useState(false);
  const loaded = useRef(false);
  
  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;

    // Cannot do this in render code due to React strict mode
    opponentRollResult();
  }, []);

  const you = { name: utils.TEXTS.yourName, isOpponent: false, HP: attributes.HP.value, DEX: chars.DEX.value };
  const opponent = { ...check.opponent, isOpponent: true, HP: opponentHp };
  const turns = you.DEX >= opponent.DEX ? ["you", "opponent"] : ["opponent", "you"];
  const isOpponentActing = turns[progress.turn] === "opponent";

  const yourDamage = flagCheck("flag_bought_knife") ? "1d4" : "1d3";
  const yourDamageBonus = utils.calculateDamageBonus(chars.STR.value, chars.SIZ.value);
  const bonus = calculateBonus(check, flagCheck);
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
    damage: `${yourDamage}+${yourDamageBonus}`,
  };

  function getOpponentCurrentSkill() {
    if (isOpponentActing) {
      const moves = opponent.moves[progress.round % opponent.moves.length];
      const move = moves[progress.move];
      return opponent.skills[move];
    } else {
      const moveDefend = opponent.moveDefend;
      if (moveDefend.length ===1) {
        return opponent.skills[moveDefend[0]];
      }
      const move = moveDefend[Math.floor(Math.random() * moveDefend.length)];
      return opponent.skills[move];
    }
  }

  function opponentRollResult() {
    const opponentSkill = getOpponentCurrentSkill();
    const opponentDiceNumbers = utils.roll(1, 100);
    const opponentLevel = utils.calculateLevel(opponentDiceNumbers[0], opponentSkill.value, opponentSkill.half, opponentSkill.fifth);
    setOpponentMoveResult({ 
      diceNumber: opponentDiceNumbers[0], 
      resultLevel: opponentLevel, 
      skill: opponentSkill,
    });
    onAction("action_dice_message", { 
      title: autoLang(utils.TEXTS.opponentRoll), num: 1, dice: 100, bonus: 0, results: opponentDiceNumbers, shouldPlaySound: true 
    });
  }

  function youRollResult(action, skill) {
    const diceNumber = rollCheck(bonus, skill.name, onAction, autoLang);
    const resultLevel = utils.calculateLevel(diceNumber, skill.value, skill.half, skill.fifth);
    setYourMoveResult({ diceNumber: diceNumber, resultLevel, skill, action });
    return resultLevel;
  }

  function onOpponentHitYou() {
    let hpReduce = 0, allDiceNumbers = [];
    if (typeof opponentMoveResult.skill.damage === "string") {
      opponentMoveResult.skill.damage.toLowerCase().split("+").forEach(diceDamage => {
        const [num, dice] = diceDamage.split("d").map(s => parseInt(s));
        const diceNumbers = utils.roll(num, dice);
        hpReduce += diceNumbers.reduce((acc, cur) => acc + cur, 0);
        allDiceNumbers.push(...diceNumbers);
      });
      onAction("action_dice_message", {
        title: autoLang(utils.TEXTS.damage), 
        num: allDiceNumbers.length, dice: 0, bonus: 0, 
        results: allDiceNumbers, 
        shouldPlaySound: true, 
        alterNumDice: opponentMoveResult.skill.damage
      });
    } else if (typeof opponentMoveResult.skill.damage === "number") {
      hpReduce = opponentMoveResult.skill.damage;
    }
    console.log("hpReduce", hpReduce);
    if (hpReduce > 0) {
      if (hpReduce >= attributes.HP.value) {
        setCheckFlags({ result: "fail" });
      } else if (hpReduce >= attributes.HP.maxValue / 2 && !flagCheck("flag_major_wound")) {
        onAction("action_set_flag", { flag: "flag_major_wound", value: true });
        setShowConCheck(true);
        onAction("action_set_highlight", { key: "CON", level: "value" });
      }

      onAction("action_adjust_attribute", { key: "HP", delta: -hpReduce });
    }
  }

  function onYouHitOpponent(resultLevel, isFightBack) {
    let hpReduce = 0, alterNumDice = "", diceNumbers = [];
    if (!isFightBack && resultLevel === 3) {
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
      if (flagCheck("flag_bought_knife")) {
        const diceNumbers = utils.roll(1, 4);
        hpReduce += diceNumbers.reduce((acc, cur) => acc + cur, 0);
        onAction("action_dice_message", {
          title: autoLang(utils.TEXTS.damage), 
          num: 1, dice: 4, bonus: 0, 
          results: diceNumbers, 
          shouldPlaySound: true,
          alterNumDice: `${hpReduce}+1d4`
        });
      }
      if (hpReduce > opponent.armor) {
        const opponentNewHp = opponentHp - hpReduce + opponent.armor;
        setOpponentHp(opponentNewHp);
        if (opponentNewHp <= opponent.thresholdHP) {
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
      if (opponentNewHp <= opponent.thresholdHP) {
        setCheckFlags({ result: "pass" });
      }
    }
  }

  function onDodge() {
    // console.log("onDodge");
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
    // console.log("onFightBack");
    const resultLevel = youRollResult(fightBackAction, fightSkill);
    if (resultLevel <= opponentMoveResult.resultLevel) {
      // opponent hit you
      onAction("action_message", { title: autoLang(utils.TEXTS.combat), text: autoLang({ zh: "反击失败", en: "Fight back failed" }), color: "danger" });
      onOpponentHitYou();
    } else {
      // you hit opponent
      onAction("action_message", { title: autoLang(utils.TEXTS.combat), text: autoLang({ zh: "反击成功", en: "Fight back succeeded" }), color: "success" });
      onYouHitOpponent(resultLevel, true);
    }
  }

  function onFight() {
    // console.log("onFight");
    const resultLevel = youRollResult(fightAction, fightSkill);
    const isOpponentDodging = !opponentMoveResult.skill.damage;
    if (isOpponentDodging) {
      if (resultLevel <= opponentMoveResult.resultLevel) {
        // opponent dodged
        onAction("action_message", { title: autoLang(utils.TEXTS.combat), text: autoLang({ zh: "攻击被闪避", en: "Your attack was dodged" }), color: "danger" }); 
      } else {
        // opponent failed to dodge
        onAction("action_message", { 
          title: autoLang(utils.TEXTS.combat), 
          text: resultLevel === 3 
            ? autoLang({ zh: "攻击命中，造成极限伤害", en: "You hit and dealt extreme damage" }) 
            : autoLang({ zh: "攻击命中", en: "You hit" }), 
          color: "success" });
        onYouHitOpponent(resultLevel, false);
      }
    } else {
      if (resultLevel < opponentMoveResult.resultLevel) {
        // opponent hit you
        onAction("action_message", { title: autoLang(utils.TEXTS.combat), text: autoLang({ zh: "被对手反击", en: "You were fought back" }), color: "danger" });
        onOpponentHitYou();
      } else {
        // you hit opponent
        onAction("action_message", { 
          title: autoLang(utils.TEXTS.combat), 
          text: resultLevel === 3 
            ? autoLang({ zh: "攻击命中，造成极限伤害", en: "You hit and dealt extreme damage" }) 
            : autoLang({ zh: "攻击命中", en: "You hit" }), 
          color: "success" });
        onYouHitOpponent(resultLevel, false);
      }
    }
  }

  function onConCheck() {
    // console.log("onConCheck");
    setShowConCheck(false);
    onAction("action_set_highlight", { key: "CON", level: "none" });
    const diceNumber = rollCheck(bonus, characterSheet.CON.name, onAction, autoLang);
    if (diceNumber > chars.CON.value) {
      setCheckFlags({
        // status: "done", 
        diceNumber: diceNumber,
        rollKey: "CON",
        result: "fail",
      });
      onAction("action_message", { title: autoLang(utils.TEXTS.combat), text: autoLang(conCheckFailText), color: "danger" });
    } else {
      onAction("action_message", { title: autoLang(utils.TEXTS.combat), text: autoLang(conCheckPassText), color: "success" });
    }
  }

  function onEscapeCheck() {
    // console.log("onEscapeCheck");
    setShowEscapeCheck(false);
    onAction("action_set_highlight", { key: "dodge", level: "all" });
    const diceNumber = rollCheck(bonus, dodgeSkill.name, onAction, autoLang);
    if (diceNumber > dodgeSkill.half) {
      onAction("action_message", { title: autoLang(utils.TEXTS.combat), text: autoLang(escapeCheckFailText), color: "danger" });
      setCheckFlags({ result: "draw" }); // TODO: con check
      onOpponentHitYou();
    } else {
      onAction("action_message", { title: autoLang(utils.TEXTS.combat), text: autoLang(escapeCheckPassText), color: "success" });
      setCheckFlags({ result: "draw" });
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
    // console.log("combat over");
    if (check.roundRunOut === "escape") {
      setShowEscapeCheck(true);
      onAction("action_set_highlight", { key: "dodge", level: "half" });
    } else if (check.roundRunOut === "lose") {
      setCheckFlags({ result: "fail" });
    } else {
      setCheckFlags({ result: "pass" });
    }
  }

  if (!opponentMoveResult.skill) return <div>Loading...</div>

  const cardTitle = `${autoLang(utils.TEXTS.combat)} ${autoLang(you.name)} vs ${autoLang(opponent.name)}`;
  const roundText = autoLang({ zh: `第 ${progress.round + 1} 轮`, en: `Round ${progress.round + 1}` });

  let yourCards = [], opponentCard;
  if (isOpponentActing) {
    const opponentSkill = opponentMoveResult.skill;
    opponentCard = { 
      role: opponent, 
      action: fightAction, 
      skill: opponentSkill,
      result: opponentMoveResult, 
      isDisabled: showConCheck || showEscapeCheck
    };

    yourCards.push({ 
      role: you, 
      action: fightBackAction, 
      skill: fightSkill,
      result: yourMoveResult, 
      onAction: onFightBack, 
      isDisabled: showConCheck || showEscapeCheck || (yourMoveResult.action && yourMoveResult.action.key !== fightBackAction.key) 
    });
    yourCards.push({ 
      role: you, 
      action: dodgeAction, 
      skill: dodgeSkill,
      result: yourMoveResult, 
      onAction: onDodge, 
      isDisabled: showConCheck || showEscapeCheck || (yourMoveResult.action && yourMoveResult.action.key !== dodgeAction.key) 
    });
  } else {
    const opponentSkill = opponentMoveResult.skill;
    opponentCard = { 
      role: opponent, 
      action: opponentSkill.damage ? fightBackAction : dodgeAction,
      skill: opponentSkill,
      result: opponentMoveResult, 
      isDisabled: showConCheck || showEscapeCheck
    };

    yourCards.push({ 
      role: you, 
      action: fightAction, 
      skill: fightSkill,
      result: yourMoveResult, 
      onAction: onFight, 
      isDisabled: showConCheck || showEscapeCheck 
    });
  }

  return (
    <div className={"card mb-3" + (checkFlags.result ? (checkFlags.result === "fail" ? " border-danger" : " border-success") : " text-bg-light")}>
      <div className="card-header d-flex">
        <h6>{ cardTitle }</h6>
        <div className="ms-auto">{ roundText }</div>
      </div>
      <div className="card-body">
        <div className="d-flex justify-content-center align-items-center">
          { checkFlags.result && (
            <strong className={checkFlags.result === "fail" ? " text-danger" : " text-success"}>
              { autoLang(checkFlags.result === "pass" ? combatWinText : (checkFlags.result === "fail" ? combatLoseText : combatEscapeText)) }
            </strong>
          ) }
          { !checkFlags.result && showConCheck && <><div>{ autoLang(conCheckText) }</div><div className="ms-3"><CheckButton onClick={onConCheck} /></div></> }
          { !checkFlags.result && showEscapeCheck && <><div>{ autoLang(escapeCheckText) }</div><div className="ms-3"><CheckButton onClick={onEscapeCheck} /></div></> }
          { !checkFlags.result && !showConCheck && !showEscapeCheck && <button className="btn btn-sm btn-dark" onClick={next} disabled={yourMoveResult.resultLevel === ""}>{ autoLang(nextButtonText) }</button> }
        </div>
      </div>
      <hr className="my-0" />
      <div className="card-body text-secondary">
      <div className="d-flex justify-content-between align-items-center mb-1">
          <div className="badge text-bg-light">{ `${autoLang(characterSheet.HP.name)} ${you.HP}` }</div>
          <div className="badge text-bg-dark">{ `${autoLang(characterSheet.HP.name)} ${opponent.HP}` }</div>
        </div>
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
