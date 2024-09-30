import { useContext, useState, useEffect } from "react";
import { LanguageContext } from "../../App";

function Loading({ language }) {
  return language === "zh" ? <p>"加载中..."</p> : <p>"Loading..."</p>;
}

function ChapterHtml({chapter}) {
  console.log("ChapterHtml - chapter: ", chapter);
  return (
    <>
      { chapter.jsx }
      <br />
      <div className="px-2">
        { chapter.options.map(option => option.jsx) }
      </div>
    </>
  )
}

export default function Chapter({ chapterKey, nextChapter, onAction }) {
  const { language } = useContext(LanguageContext);
  const [chapter, setChapter] = useState(null);

  console.log(`Chapter: chapterKey: ${chapterKey}, chapter(state): ${chapter && chapter.key}`);

  function onLeave(chapterJson) {
    console.log("Chapter - onLeave: ", chapterJson.key);
    if (chapterJson.onleave) {
      chapterJson.onleave.forEach(action => onAction(action.action, action.param));
    }
  }

  function onLoad(chapterJson) {
    console.log("Chapter - onLoad: ", chapterJson.key);
    if (chapterJson.onload) {
      chapterJson.onload.forEach(action => onAction(action.action, action.param));
    }
  }

  function jsonToJsx(json) {
    return {
      key: json.key,
      jsx: (json.text[language] || json.text["en"]).map((item, index) => {
        return <p key={index}>{ item.content }</p>
      }),
      options: json.options.map(option => {
        return {
          key: option.key,
          jsx: <a key={option.key} 
                  className="link link-secondary link-offset-2 h5" 
                  role="button"
                  href="#" 
                  onClick={(e) => { e.preventDefault();nextChapter(json.key, option.key); }}>
                    &nbsp;{ (option.text[language] || option.text["en"]) }&nbsp;
               </a>
        }
      }),
      onleave: json.onleave,
    }
  }

  useEffect(() => {
    console.log(`Chapter - useEffect: chapterKey: ${chapterKey}, chapter(state): ${chapter && chapter.key}, language: ${language}`);

    if (chapterKey === 0) {
      const CHAPTER_0 = language === "zh" ? {
        key: 0,
        jsx: <>
          <p>本文是一篇《克苏鲁的呼唤》单人冒险。这是一段设定在1920年代的恐怖故事，你是其中的主角，你的选择决定了结果。它在设计上循序渐进，以轻松的方式带你了解游戏的基础规则。虽然大部分模组都要和朋友一起游玩，但这篇冒险只属于你。</p>
          <p>在开始游戏之前，你要准备好一本《克苏鲁的呼唤》第七版快速开始规则，和一张空白角色卡。你可以在 <a href="www.chaosium.com" target="_blank">www.chaosium.com</a> 上下载打印角色卡或交互式PDF角色卡，还有快速开始规则。你还需要铅笔、橡皮和游戏骰子。</p>
          <p>你不需要在游戏之前通读规则书。只需要找一把舒适的椅子，坐在轰鸣的炉火旁。然后读下去，按照说明行事。</p>
          <p>……仔细想来，还是不要离火源太近为妙。</p>
        </>,
        options: [
          {
            key: 0,
            jsx: <a key="0"
              className="link link-secondary link-offset-2 h5"
              role="button"
              href="#"
              onClick={(e) => { e.preventDefault(); nextChapter(0, 0); }}>
              &nbsp;开始冒险&nbsp;
            </a>
          }
        ]
      } : {
        key: 0,
        jsx: <>
          <p>This is a solo adventure for the Call of Cthulhu game. It is a horror story set in the 1920s where you are the main character, and your choices determine the outcome. It is also designed to lead you through the basic rules of the game in a gradual and entertaining fashion. Although most such adventures are played with your friends, this one is just for you.</p>
          <p>Before you begin to play, make sure you have a copy of the Call of Cthulhu Seventh Edition Quick-Start Rules, and a blank investigator sheet. You can download a printable investigator sheet, or an interactive PDF version of the sheet, as well as the Quick-Start Rules from <a href="www.chaosium.com" target="_blank">www.chaosium.com</a>.</p>
          <p>You’ll also need a pencil, an eraser, and some roleplaying dice. You don’t need to read the rules before you start playing. Just settle in a comfortable chair before a roaring fire. Then read on and follow the instructions.</p>
          <p>…On second thoughts, don’t sit too close to the fire.</p>
        </>,
        options: [
          {
            key: 0,
            jsx: <a key="0"
              className="link link-secondary link-offset-2 h5"
              role="button"
              href="#"
              onClick={(e) => { e.preventDefault(); nextChapter(0, 0); }}>
              &nbsp;Start the adventure&nbsp;
            </a>
          }
        ]
      };
      setChapter(CHAPTER_0);
      return;
    }

    fetch(`./chapters/${chapterKey}.json`)
      .then(response => response.json())
      .then(data => {

        if (chapter && (chapter.key !== chapterKey)) {
          onLeave(chapter);
        }

        const chapterByJSX = jsonToJsx(data);
        setChapter(chapterByJSX);

        if (!chapter || (chapter.key !== chapterKey)) {
          onLoad(chapterByJSX);
        }
      });
  }, [chapterKey, language]);

  if (!chapter || chapter.key !== chapterKey) {
    return <Loading language={language} />;
  }

  return (
    <ChapterHtml {...{ chapter }} />
  )
}