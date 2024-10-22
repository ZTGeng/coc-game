import { useContext } from "react";
import { LanguageContext, CharacterSheetContext } from "../App";
import * as utils from "../utils/utils";

const historyTitle = {
  en: "Chapter History",
  zh: "章节历史",
};

const firstItem = {
  en: "Start the adventure",
  zh: "开始冒险",
};

const jumpToConfirmText = {
  en: "Jump to previous chapter?",
  zh: "跳转到以前的章节？",
};

function HistoryItem({ historyItem, historyIndex, onJumpToChapter }) {
  const { autoLang } = useContext(LanguageContext);
  const characterSheet = useContext(CharacterSheetContext);

  function jumpToChapter() {
    if (window.confirm(autoLang(jumpToConfirmText))) {
      console.log(`history chapter key: ${historyItem.chapterKey}, index: ${historyIndex}`);
      onJumpToChapter(historyIndex);
    }
  }

  if (!historyItem.type) {
    return (
      <button className="list-group-item list-group-item-action" type="button" onClick={jumpToChapter}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16">
          <path d="M6.22 3.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042L9.94 8 6.22 4.28a.75.75 0 0 1 0-1.06Z"></path>
        </svg>
        <small className="ms-2">{ autoLang(historyItem.optionText) }</small>
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
    <button className="list-group-item list-group-item-action" type="button" onClick={jumpToChapter}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16">
        <path d="M6.22 3.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042L9.94 8 6.22 4.28a.75.75 0 0 1 0-1.06Z"></path>
      </svg>
      <small className="ms-2">{ `${description} - ${ autoLang(historyItem.optionText) }` }</small>
    </button>
  );
}

export default function HistoryModal({ chapterHistory, onJumpToChapter }) {
  const { autoLang } = useContext(LanguageContext);

  return (
    <div className="offcanvas offcanvas-start" data-bs-scroll="true" tabIndex="-1" id="history-modal" aria-labelledby="history-modal-title">
      <div className="offcanvas-header">
        <h5 className="offcanvas-title" id="history-modal-title">{ autoLang(historyTitle) }</h5>
        <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
      </div>
      <div className="offcanvas-body">
        <div className="list-group">
          <button className="list-group-item list-group-item-action" type="button" disabled>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16">
              <path d="M6.22 3.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042L9.94 8 6.22 4.28a.75.75 0 0 1 0-1.06Z"></path>
            </svg>
            <small className="ms-2">{ autoLang(firstItem) }</small>
          </button>
          { chapterHistory.map((historyItem, i) => <HistoryItem key={i} historyIndex={i} {...{ historyItem, onJumpToChapter }} />)}
        </div>
      </div>
    </div>
  );
}