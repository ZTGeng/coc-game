import { useContext } from "react";
import { useSelector } from "react-redux";
import { LanguageContext } from "../App";

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

function HistoryItem({ historyItem, index, onHistorySelected }) {
  const { autoLang } = useContext(LanguageContext);
  const historyStore = useSelector(state => state.history);

  function jumpToChapter() {
    if (window.confirm(autoLang(jumpToConfirmText))) {
      console.log(`history chapter key: ${historyItem.chapterKey}, index: ${index}`);
      onHistorySelected(index);
    }
  }

  // console.log(JSON.stringify(historyItem));
  const contextText = historyItem.contentTexts ? historyItem.contentTexts.map(autoLang).join("").concat(" - ") : "";
  return (
    <button className={"list-group-item list-group-item-action" + (index === historyStore.index ? " active" : "")} type="button" onClick={jumpToChapter}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16">
        <path d="M6.22 3.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042L9.94 8 6.22 4.28a.75.75 0 0 1 0-1.06Z"></path>
      </svg>
      <small className="ms-2">{ `${ contextText }${ autoLang(historyItem.optionText) }` }</small>
    </button>
  );
}

export default function HistoryModal({ onHistorySelected }) {
  const { autoLang } = useContext(LanguageContext);
  const historyStore = useSelector(state => state.history);

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
          { historyStore.items.map((historyItem, i) => <HistoryItem key={i} index={i} {...{ historyItem, onHistorySelected }} />)}
        </div>
      </div>
    </div>
  );
}