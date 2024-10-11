import { useState, useContext } from "react";
import { LanguageContext } from "../../App";
import * as utils from "../../utils";

export default function Combat({ check, characterSheet, chars, attributes, skills, onAction, checkFlags, setCheckFlags }) {
  const { language } = useContext(LanguageContext);
  const [progress, setProgress] = useState({ round: 0, turn: 0, move: 0 });

  const turns = chars.DEX.value >= opponent.DEX ? ["you", "opponent"] : ["opponent", "you"];

  function combatOver() {

  }

  function next() {
    const progressCopy = { ...progress };
    const acting = turns[progressCopy.turn];
    if (acting === "opponent") {
      const moves = opponent.moves[progressCopy.round % opponent.moves.length];
      progressCopy.move += 1;
      if (progressCopy.move < moves.length) {
        setProgress(progressCopy);
        return;
      }
    }
    progressCopy.move = 0;
    progressCopy.turn += 1;
    if (progressCopy.turn < turns.length) {
      setProgress(progressCopy);
      return;
    }
    progressCopy.turn = 0;
    progressCopy.round += 1;
    if (progressCopy.round <= check.rounds) {
      setProgress(progressCopy);
      return;
    }
    combatOver();
  }


  const opponent = check.opponent;

  const cardTitle = `${language === "zh" ? "战斗：你" : "Combat: You"} vs ${opponent.name[language] || opponent.name["en"]}`;

  return (
    <div className={"card mb-3" + (checkFlags.result ? (checkFlags.result === "pass" ? " border-success" : " border-danger") : " text-bg-light")}>
      <div className="card-header">{ cardTitle }</div>
      <div className="card-body text-secondary">
        {JSON.stringify(check)}
        {JSON.stringify(opponent)}
      </div>
    </div>
  );
}
        