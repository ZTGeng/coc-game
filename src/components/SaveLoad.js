import { useContext, useState } from "react";
import { LanguageContext } from "../App";
import { Modal } from 'bootstrap';

const saveModalId = "save-modal";
const loadModalId = "load-modal";

const saveTitle = {
  en: "Save",
  zh: "存档",
};
const loadTitle = {
  en: "Load",
  zh: "读档",
};
const slotTitle = {
  en: "Slot",
  zh: "存档",
};
const emptyText = {
  en: "Empty",
  zh: "空",
};
const saveConfirmText = {
  en: "Save progress?",
  zh: "保存进度？",
};
const overwriteConfirmText = {
  en: "Overwrite the previous save?",
  zh: "覆盖之前的存档？",
};
const loadConfirmText = {
  en: "Discard unsaved progress?",
  zh: "舍弃未保存的进度？",
};
const deleteConfirmText = {
  en: "⚠️ Delete this save? This action cannot be undone.",
  zh: "⚠️ 删除此存档？删除后无法恢复。",
};

function Slot({ slotNum, isSave, hasSave, saveTime, onAction, onDeleteSave }) {
  const { autoLang } = useContext(LanguageContext);
  const [isHovered, setIsHovered] = useState(false);

  const isClickable = isSave || hasSave;

  return (
    <div className="col d-flex">
      <div
        className={"card flex-fill" + (isClickable ? (isHovered ? " text-bg-primary" : " text-bg-light") : " border-light")} 
        style={isClickable ? { cursor: "pointer" } : { cursor: "default" }}
        onMouseEnter={() => isClickable && setIsHovered(true)}
        onMouseLeave={() => isClickable && setIsHovered(false)}
        onClick={() => isClickable && onAction(slotNum)}>
          <div className="card-header d-flex align-items-center">
            <h6 className="card-title mb-0">{`${autoLang(slotTitle)} ${slotNum}`}</h6>
            <button type="button" className="btn btn-sm ms-auto p-0" onClick={(e) => { e.stopPropagation(); hasSave && onDeleteSave(slotNum); }}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12" width="12" height="12" fill="currentColor">
                <path d="M2.22 2.22a.749.749 0 0 1 1.06 0L6 4.939 8.72 2.22a.749.749 0 1 1 1.06 1.06L7.061 6 9.78 8.72a.749.749 0 1 1-1.06 1.06L6 7.061 3.28 9.78a.749.749 0 1 1-1.06-1.06L4.939 6 2.22 3.28a.749.749 0 0 1 0-1.06Z"></path>
              </svg>
            </button>
          </div>
          <div className="card-body d-flex align-items-center">
            <p className="card-text">{hasSave ? saveTime : autoLang(emptyText)}</p>
          </div>
      </div>
    </div>
  );
}

function SaveLoadModal({ id, isSave, saveStatus, onAction, onDeleteSave }) {
  const { autoLang } = useContext(LanguageContext);

  return (
    <div className="modal fade" id={id} tabIndex="-1" aria-labelledby="saveloadModalLabel" aria-hidden="true">
      <div className="modal-dialog modal-md modal-dialog-centered">
        <div className="modal-content text-primary">
          <div className="modal-header">
            <h1 className="modal-title fs-5" id="saveloadModalLabel">{ isSave ? autoLang(saveTitle) : autoLang(loadTitle) }</h1>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div className="modal-body">
            <div className="row row-cols-3">
              { [1, 2, 3].map(slotNum => <Slot key={slotNum} hasSave={saveStatus[slotNum].hasSave} saveTime={saveStatus[slotNum].saveTime} {...{ slotNum, isSave, onAction, onDeleteSave }} />) }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SaveLoad({ onSaveGame, onLoadGame }) {
  const localStorageTimeKey = "coc-state-time";
  const { autoLang } = useContext(LanguageContext);
  const saveTimes = JSON.parse(localStorage.getItem(localStorageTimeKey) || "{}");
  const initSaveStatus = {
    1: { hasSave: localStorageKey(1) in localStorage, saveTime: saveTimes[1] },
    2: { hasSave: localStorageKey(2) in localStorage, saveTime: saveTimes[2] },
    3: { hasSave: localStorageKey(3) in localStorage, saveTime: saveTimes[3] },
  };
  const [saveStatus, setSaveStatus] = useState(initSaveStatus);

  function localStorageKey(slotNum) {
    return `coc-state-${slotNum}`;
  }

  function onSave(slotNum) {
    const text = saveStatus[slotNum].hasSave ? overwriteConfirmText : saveConfirmText;
    if (window.confirm(autoLang(text))) {
      onSaveGame(localStorageKey(slotNum));
      Modal.getInstance(document.getElementById(saveModalId)).hide();

      const now = new Date().toLocaleString();
      localStorage.setItem(localStorageTimeKey, JSON.stringify({ ...saveTimes, [slotNum]: now }));
      setSaveStatus({ ...saveStatus, [slotNum]: { hasSave: true, saveTime: now } });
    }
  }

  function onLoad(slotNum) {
    if (window.confirm(autoLang(loadConfirmText))) {
      onLoadGame(localStorageKey(slotNum));
      Modal.getInstance(document.getElementById(loadModalId)).hide();
    }
  }

  function onDeleteSave(slotNum) {
    if (window.confirm(autoLang(deleteConfirmText))) {
      localStorage.removeItem(localStorageKey(slotNum));
      localStorage.setItem(localStorageTimeKey, JSON.stringify({ ...saveTimes, [slotNum]: "" }));
      setSaveStatus({ ...saveStatus, [slotNum]: { hasSave: false, saveTime: "" } });
    }
  }

  return (
    <>
      <SaveLoadModal id={saveModalId} isSave={true} onAction={onSave} {...{ saveStatus, onDeleteSave }} />
      <SaveLoadModal id={loadModalId} isSave={false} onAction={onLoad} {...{ saveStatus, onDeleteSave }} />
    </>
  );
}