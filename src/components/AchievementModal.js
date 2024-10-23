import { useContext } from "react";
import { LanguageContext } from "../App";

const title = {
  en: "Achievement",
  zh: "成就",
};
const visitedChaptersTitle = {
  en: "Visited Chapters",
  zh: "已访问章节",
};
const endingCollectionTitle = {
  en: "Ending Collection",
  zh: "结局收集",
};
const trophyCollectionTitle = {
  en: "Trophy Collection",
  zh: "奖杯收集",
};

export default function Achievement({ chapterVisits }) {
  const { autoLang } = useContext(LanguageContext);

  // const chapterVisits = toBooleanArray();

  function indexToChapterKey(index) {
    return index;
  }

  // 统计用户访问过的章节总数
  function totalVisitedChapters() {
    return chapterVisits.filter(visit => visit).length;
  }

  // 将 chapterStatus 转换为长度为 270 的布尔数组
  function toBooleanArray() {
    // const boolArray = new Array(270).fill(false);  // 创建一个初始为 false 的布尔数组
    // for (let i = 0; i < 270; i++) {
    //   const arrayIndex = Math.floor(i / 32);
    //   const bitPosition = i % 32;
    //   boolArray[i] = (chapterStatus[arrayIndex] & (1 << bitPosition)) !== 0;
    // }
    // return boolArray;
  }

  return (
    <div className="modal fade" id="achievement-modal" tabIndex="-1" aria-labelledby="achievementModalLabel" aria-hidden="true">
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content text-primary">
          <div className="modal-header">
            <h1 className="modal-title fs-5" id="achievementModalLabel">{autoLang(title)}</h1>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div className="modal-body">
            <div className="mb-3">
              <div className="d-flex">
                <h5>{ autoLang(visitedChaptersTitle) }</h5>
                <div className="ms-auto">
                  <span className="badge bg-primary">{ `${totalVisitedChapters()} / 270` }</span>
                </div>
              </div>
              <div className="d-flex flex-wrap">
                {
                  Array
                    .from({ length: 270 }, (_, index) => indexToChapterKey(index))
                    .map((chapterKey, index) => 
                      <div key={index} className={"ms-1 mb-1 p-1 " + (chapterVisits[chapterKey] ? "bg-warning" : "bg-secondary")}></div>)
                }
              </div>
            </div>

            <div className="mb-3">
              <h5>{ autoLang(endingCollectionTitle) }</h5>
              <div className="d-flex">
              </div>
            </div>
            
            <div className="mb-3">
              <h5>{ autoLang(trophyCollectionTitle) }</h5>
              <div className="d-flex">
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}