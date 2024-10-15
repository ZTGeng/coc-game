import { useContext } from "react";
import { LanguageContext } from "../App";
import * as utils from "../utils";

const historyTitle = {
  en: "Chapter History",
  zh: "章节历史",
};

function HistoryItem({ characterSheet, historyItem }) {
  const { autoLang } = useContext(LanguageContext);

  if (!historyItem.type) {
    return (
      <button className="list-group-item list-group-item-action" type="button" onClick={() => console.log(`history key: ${historyItem.chapterKey}`)}>
        { autoLang(historyItem.optionText) }
      </button>
    );
  }

  // console.log(JSON.stringify(historyItem));
  let description = "";
  switch (historyItem.type) {
    case "interaction":
      description = historyItem.texts.map(autoLang).join(" ");
      break;
    case "roll":
    case "roll_select":
      description = historyItem.keys
        .map((key, i) => characterSheet[key] || characterSheet.skills[key])
        .map((skill, i) => skill.name)
        .map(autoLang)
        .join("/")
        .concat(autoLang(utils.TEXTS.rollSuffix));
      break;
    case "opposed_roll":
      description = `${autoLang(utils.TEXTS.opposedRoll)} vs ${autoLang(historyItem.opponentName)}`;
      break;
    case "combat":
      description = `${autoLang(utils.TEXTS.combat)} vs ${autoLang(historyItem.opponentName)}`;
      break;
  }
  return (
    <button className="list-group-item list-group-item-action" type="button" onClick={() => {console.log(`history key: ${historyItem.chapterKey}`)}}>
      { `${description} - ${ autoLang(historyItem.optionText) }` }
    </button>
  );
}

export default function HistoryModal({ characterSheet, chapterHistory }) {
  const { autoLang } = useContext(LanguageContext);

  return (
    <div className="offcanvas offcanvas-start" data-bs-scroll="true" tabIndex="-1" id="history-modal" aria-labelledby="history-modal-title">
      <div className="offcanvas-header">
        <h5 className="offcanvas-title" id="history-modal-title">{ autoLang(historyTitle) }</h5>
        <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
      </div>
      <div className="offcanvas-body">
        <div className="list-group">
        { chapterHistory.map((historyItem, i) => <HistoryItem key={i} {...{ characterSheet, historyItem }} />)}
        </div>
      </div>
    </div>
  );
}