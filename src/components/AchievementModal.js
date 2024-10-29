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
const endingItems = [
  {
    endingKey: "bear",
    descText: {
      en: "You were killed by a bear",
      zh: "你被熊杀死了",
    },
    activeSrc: "images/ending-bear-active.png",
    inactiveSrc: "images/ending-bear-inactive.png",
  },
  {
    endingKey: "cliff",
    descText: {
      en: "You fell from the cliff and died",
      zh: "你掉下悬崖摔死了",
    },
    activeSrc: "images/ending-cliff-active.png",
    inactiveSrc: "images/ending-cliff-inactive.png",
  },
  {
    endingKey: "collapse",
    descText: {
      en: "You were killed by a collapsing church roof",
      zh: "你被坍塌的教堂屋顶砸死了",
    },
    activeSrc: "images/ending-collapse-active.png",
    inactiveSrc: "images/ending-collapse-inactive.png",
  },
  {
    endingKey: "burn",
    descText: {
      en: "You have burned to death in the Beacon",
      zh: "你被烧死在灯塔上",
    },
    activeSrc: "images/ending-burn-active.png",
    inactiveSrc: "images/ending-burn-inactive.png",
  },
  {
    endingKey: "escaped",
    descText: {
      en: "You have escaped the village",
      zh: "你逃出了村子",
    },
    activeSrc: "images/ending-escaped-active.png",
    inactiveSrc: "images/ending-escaped-inactive.png",
  },
  {
    endingKey: "cthulhu",
    descText: {
      en: "You have glimpsed the truth of the universe",
      zh: "你窥见了宇宙的真相",
    },
    activeSrc: "images/ending-cthulhu-active.png",
    inactiveSrc: "images/ending-cthulhu-inactive.png",
    hidden: true,
  },
];
const endingText = {
  en: "Ending ",
  zh: "结局 ",
};

const indexToChapterMapping = [
  0, 1, 263, 8, 23, 38, 233, 134, 59, 261, 71, 102, 226, 239, 249, 265, 128, 144, 162, 174, 194, 251, 257, 267, 4, 14, 21, 31, 39, 51,
  75, 86, 100, 121, 130, 141, 63, 154, 166, 178, 112, 212, 192, 218, 6, 25, 16, 84, 57, 69, 34, 46, 96, 106, 115, 127, 142, 191, 199,
  206, 214, 221, 227, 237, 245, 259, 253, 160, 135, 150, 172, 87, 181, 187, 3, 9, 15, 22, 28, 35, 41, 47, 54, 60, 66, 72, 85, 91, 97,
  103, 110, 143, 129, 149, 155, 161, 167, 179, 186, 193, 173, 201, 116, 136, 122, 79, 240, 234, 208, 222, 228, 246, 252, 258, 215, 264,
  269, 5, 13, 11, 17, 30, 37, 24, 43, 49, 56, 62, 68, 74, 81, 88, 94, 99, 111, 118, 124, 105, 180, 131, 163, 138, 145, 151, 200, 169,
  182, 175, 188, 203, 195, 217, 45, 210, 236, 242, 157, 224, 26, 230, 248, 254, 260, 19, 32, 266, 76, 52, 58, 64, 70, 78, 120, 83, 89,
  95, 114, 101, 126, 133, 147, 153, 165, 177, 197, 202, 207, 213, 184, 190, 159, 140, 219, 225, 232, 238, 244, 250, 256, 262, 268, 20,
  2, 12, 29, 42, 61, 36, 48, 55, 67, 73, 82, 92, 7, 107, 119, 132, 125, 146, 139, 98, 158, 170, 164, 176, 189, 204, 196, 183, 152, 211,
  223, 216, 229, 235, 241, 247, 108, 104, 113, 205, 27, 117, 10, 148, 18, 33, 44, 53, 109, 123, 40, 50, 270, 80, 90, 198, 209, 220, 255,
  243, 231, 65, 77, 93, 137, 156, 168, 185, 171
];

function EndingImage({ index, endingItem, endings }) {
  const { autoLang } = useContext(LanguageContext);
  const { endingKey } = endingItem;

  function imageSrc() {
    return endings.includes(endingKey) ? endingItem.activeSrc : endingItem.inactiveSrc;
  }

  function imageDescription() {
    return endings.includes(endingKey)
      ? autoLang(endingItem.descText)
      : autoLang(endingText) + `${endingItem.hidden ? "?" : (index + 1)}`;
  }

  return (
    <div className="col">
      <img src={imageSrc()} alt={imageDescription()} title={imageDescription()} className="img-fluid" />
    </div>
  );
}

export default function Achievement({ chapterVisits, endings }) {
  const { autoLang } = useContext(LanguageContext);

  function indexToChapterKey(index) {
    return indexToChapterMapping[index];
  }

  function totalVisitedChapters() {
    return chapterVisits.filter(visit => visit).length;
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
                  <span className="badge bg-primary">{ `${totalVisitedChapters()} / 271` }</span>
                </div>
              </div>
              <div className="d-flex flex-wrap">
                {
                  Array
                    .from({ length: 271 }, (_, index) => indexToChapterKey(index))
                    .map((chapterKey, index) => 
                      <div key={index} className={"ms-1 mb-1 p-1 " + (chapterVisits[chapterKey] ? "bg-warning" : "bg-secondary")}></div>)
                }
              </div>
            </div>

            <div className="mb-3">
              <h5>{ autoLang(endingCollectionTitle) }</h5>
              <div className="row row-cols-6">
                { endingItems.map((endingItem, index) => <EndingImage key={index} {...{index, endingItem, endings}} />) }
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