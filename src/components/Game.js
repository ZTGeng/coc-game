import { useState, useEffect, useRef, useContext } from "react";
import Character from "./character/Character";
import Chapter from "./game/Chapter";
import chapterMap from "./game/chapterMap";

export default function Game({ showCharacter }) {
  const [chapterKey, setChapterKey] = useState(0);

  // Cheet
  function goTo(chapterKey) {
    console.log(`Game - goTo: to chapter ${chapterKey}`);
    setChapterKey(chapterKey);
  }
  window.goTo = goTo;

  function nextChapter(chapterKey, optionKey) {
    const next = chapterMap[chapterKey][optionKey];
    if (next) {
      console.log(`Game - nextChapter: from chapter ${chapterKey} choose option ${optionKey} => to chapter ${next}`);
      setChapterKey(next);
    }
  }

  function onAction(action, param) {
    console.log(`Game - onAction: ${action} with params: ${param}`);
  }
    
  return (
    <div className="d-flex">
      <div id="text-content" className="flex-fill px-2">
        <Chapter {...{ chapterKey, nextChapter, onAction }}/>
      </div>
      <div id="character" className="" hidden={!showCharacter}>
        <Character />
      </div>
    </div>
  )
}
