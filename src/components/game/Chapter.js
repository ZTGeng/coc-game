import { useContext, useState, useEffect } from "react";
import { LanguageContext } from "../../App";
import { FlagsContext } from "../Game";
import Chapter0 from "./Chapter0";
import GoToOptions from "./GoToOptions";

function Loading({ language }) {
  return language === "zh" ? <p>"加载中..."</p> : <p>"Loading..."</p>;
}

function ChapterContent({ chapterText }) {
  const { language } = useContext(LanguageContext);

  return (chapterText[language] || chapterText["en"]).map((item, index) => {
    if (item.tag === "div") {
      return item.imageOn === "left" ? (
        <div key={index} className='row'>
          <div className='col-md-4'><img src={item.imageSrc} className='img-fluid' /></div>
          <div className='col-md-8'>{ item.text.map((line, i) => <p key={i}>{ line.content }</p>) }</div>
        </div>
      ) : (
        <div key={index} className='row'>
          <div className='col-md-8'>{ item.text.map((line, i) => <p key={i}>{ line.content }</p>) }</div>
          <div className='col-md-4'><img src={item.imageSrc} className='img-fluid' /></div>
        </div>
      );
    }
    if (item.tag === "info") {
      return (
        <div key={index} className='alert alert-info'>
          { item.text.map((line, i) => <p key={i}>{ line.content }</p>) }
        </div>
      )
    }
    if (item.tag === "img") {
      return <img key={index} src={item.imageSrc} className='img-fluid' />
    }
    if (item.tag === "h") {
      return <h2 key={index}>{ item.content }</h2>
    }
    return <p key={index}>{ item.content }</p>
  });
}

function Interactions({ interactions, onAction }) {
  const { language } = useContext(LanguageContext);
  const { flagConditionCheck } = useContext(FlagsContext);

  return (
    <div className="alert alert-warning">
      <div className="d-flex justify-content-center">
        { 
          interactions
            .filter(interaction => !interaction.show || flagConditionCheck(interaction.show))
            .map((interaction, i) => {
              console.log("Interaction: ", interaction);
              if (interaction.disable && flagConditionCheck(interaction.disable)) {
                return <button key={i} className='btn btn-dark mx-2' disabled>{ interaction.text[language] || interaction.text["en"] }</button>
              } else {
                return (
                  <button key={i} className='btn btn-dark mx-2' onClick={() => { onAction(interaction.action, interaction.param) }}>
                    { interaction.text[language] || interaction.text["en"] }
                  </button>
                )
              }
            })
        }
      </div>
    </div>
  )
}

export default function Chapter({ chapterKey, nextChapter, onChapterAction }) {
  const { language } = useContext(LanguageContext);
  const [chapter, setChapter] = useState(null);
  console.log(`Chapter refresh: ${chapter ? chapter.key : "start"} => ${chapterKey}`);

  function onLeave(chapterJson) {
    console.log(`Chapter ${chapterJson.key} onLeave`);
    if (chapterJson.onleave) {
      chapterJson.onleave.forEach(action => onChapterAction(action.action, action.param));
    }
  }

  function onLoad(chapterJson) {
    console.log(`Chapter ${chapterJson.key} onLoad`);
    if (chapterJson.onload) {
      chapterJson.onload.forEach(action => onChapterAction(action.action, action.param));
    }
  }

  function onInteraction(action, param) {
    console.log(`Chapter ${chapter.key} onInteraction: ${action}(${JSON.stringify(param)})`);
    if (action === "action_roll_luck_and_update_chapter") {
      // param is the new chapter json with the same key
      setChapter(param);
      // will do DEX check, highlisht is needed
      onChapterAction("action_set_highlight", { "key": "DEX", "level": "value" });
      // no return on purpose to let parent initial the Luck value
    }
    onChapterAction(action, param);
  }

  useEffect(() => {
    console.log(`Chapter - useEffect: chapterKey: ${chapterKey}, chapter(state): ${chapter && chapter.key}, language: ${language}`);

    if (chapterKey === 0) return;

    fetch(`./chapters/${chapterKey}.json`)
      .then(response => response.json())
      .then(data => {
        // useEffect may be triggered multiple times with the same chapterKey
        // run onLeave only for the first time
        if (chapter && (chapter.key !== chapterKey)) {
          onLeave(chapter);
        }

        setChapter(data);

        // useEffect may be triggered multiple times with the same chapterKey
        // run onLoad only for the first time
        if (!chapter || (chapter.key !== chapterKey)) {
          onLoad(data);
        }
      });
  }, [chapterKey, language]);

  if (chapterKey === 0) {
    return <Chapter0 {...{ nextChapter }} />;
  }

  if (!chapter || chapter.key !== chapterKey) {
    return <Loading language={language} />;
  }

  return (
    <>
      <ChapterContent chapterText={chapter.text} />
      {chapter.interactions && <Interactions interactions={chapter.interactions} onAction={onInteraction} />}
      <br />
      <div className="px-2">
        <GoToOptions options={chapter.options} {...{ chapterKey, nextChapter }} />
      </div>
    </>
  )
}