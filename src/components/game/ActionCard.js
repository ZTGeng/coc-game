import { useState, useRef, useEffect, useContext } from "react";
import { LanguageContext } from "../../App";

export const resultLevelTexts = {
  en: ["Failure", "Regular Success", "Hard Success", "Extreme Success"],
  zh: ["失败", "普通成功", "困难成功", "极难成功"],
};

export function CheckButton({ onClick }) {
  const { autoLang } = useContext(LanguageContext);
  return <button className="btn btn-sm btn-dark" onClick={onClick}>{ autoLang({ en: "Roll 1D100", zh: "掷骰1D100" }) }</button>
}

// role: { name, isOpponent }, action: { key, name, isInitiating }, skill: { name, value, half, fifth, bonus }, result: { diceNumber, resultLevel, action }
export default function ActionCard({ role, action, skill, result, isDisabled, onAction }) {
  const { autoLang } = useContext(LanguageContext);
  const resultLevelText = autoLang(resultLevelTexts);
  const isUnusedCard = result.action && result.action.key !== action.key;

  const skillDisplay = skill.bonus
    ? skill.bonue > 0
        ? `${autoLang(skill.name)} ${skill.value}${autoLang({ zh: `，奖励骰 x ${skill.bonus}`, en: `, Bonus Die x ${skill.bonus}` })}`
        : `${autoLang(skill.name)} ${skill.value}${autoLang({ zh: `，惩罚骰 x ${-skill.bonus}`, en: `, Penalty Die x ${-skill.bonus}` })}`
    : `${autoLang(skill.name)} ${skill.value}`;

  let cardBodyContent;
  if (role.isOpponent) {
    cardBodyContent = <div className="mb-3 text-end"><div className="h5 fw-light">{ `${result.diceNumber} - ${resultLevelText[result.resultLevel || 0]}` }</div></div>;
  } else if (result.resultLevel === "") {
    cardBodyContent = <div className="mb-2 text-end"><CheckButton onClick={onAction} /></div>;
  } else if (isUnusedCard) {
    cardBodyContent = <div className="mb-3 text-end"><div className="h5 fw-light">&nbsp;</div></div>;
  } else {
    cardBodyContent = <div className="mb-3 text-end"><div className="h5 fw-light">{ `${result.diceNumber} - ${resultLevelText[result.resultLevel || 0]}` }</div></div>;
  }

  const listItemClassName = [
    `list-group-item list-group-item-${role.isOpponent ? "dark" : "light"} ${isDisabled ? "text-secondary" : ""} ${!isUnusedCard && result.resultLevel === 0 ? "active" : ""}`,
    `list-group-item list-group-item-${role.isOpponent ? "dark" : "light"} ${isDisabled ? "text-secondary" : ""} ${!isUnusedCard && result.resultLevel === 1 ? "active" : ""}`,
    `list-group-item list-group-item-${role.isOpponent ? "dark" : "light"} ${isDisabled ? "text-secondary" : ""} ${!isUnusedCard && result.resultLevel === 2 ? "active" : ""}`,
    `list-group-item list-group-item-${role.isOpponent ? "dark" : "light"} ${isDisabled ? "text-secondary" : ""} ${!isUnusedCard && result.resultLevel === 3 ? "active" : ""}`,
  ]

  return (
    <div className={`flex-fill mx-1 ${action.isInitiating ? "" : "pt-4"}`} style={{ maxWidth: "20rem", minWidth: "12rem" }}>
      <div className={`card ${role.isOpponent ? "text-bg-dark" : "text-bg-light"} ${isDisabled ? "text-secondary" : ""} px-0`}>
        <div className="card-header d-flex">
          <h6>{ autoLang(role.name) }</h6>
          <small className="ms-auto">{ skillDisplay }</small>
        </div>
        <div className="card-body">
          <div>{ autoLang(action.name) }</div>
          { cardBodyContent }
        </div>
        <ul className="list-group list-group-flush">
          <li className={listItemClassName[3]}>{resultLevelText[3]}: &le;{skill.fifth || Math.floor(skill.value / 5)}</li>
          <li className={listItemClassName[2]}>{resultLevelText[2]}: &le;{skill.half || Math.floor(skill.value / 2)}</li>
          <li className={listItemClassName[1]}>{resultLevelText[1]}: &le;{skill.value}</li>
          <li className={listItemClassName[0]}>{resultLevelText[0]}: &gt;{skill.value}</li>
        </ul>
      </div>
    </div>
  );
}