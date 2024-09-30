import { useContext } from 'react';
import { LanguageContext } from '../App';

export default function ConfigModal({ gameStarted, onRestart, volume, setVolume }) {
  const { language, setLanguage } = useContext(LanguageContext);
  const title = {
    en: "Configuration",
    zh: "设置",
  };
  const languageSetting = {
    label: {
      en: "Language",
      zh: "语言",
    },
    english_option: "English",
    chinese_option: "中文",
  };
  const volumeSetting = {
    label: {
      en: "Volume",
      zh: "音量",
    },
    min: 0,
    max: 1,
    step: 0.2,
  };
  const reset = {
    en: "Reset Game",
    zh: "重新开始",
  };

  return (
    <div className="modal fade" id="config-modal" data-bs-backdrop="static" data-bs-keyboard="true" tabIndex="-1" aria-labelledby="configModalLabel" aria-hidden="true">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content text-primary">
          <div className="modal-header">
            <h1 className="modal-title fs-5" id="staticBackdropLabel">{title[language] || title["en"]}</h1>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div className="modal-body">
            <div className="row mb-3">
              <label htmlFor="btnradio1" className="col-sm-2 col-form-label">
                {languageSetting.label[language] || languageSetting.label["en"]}
              </label>
              <div className="btn-group col-sm-10" role="group" aria-label="Basic radio toggle button group">
                <input type="radio" className="btn-check" name="btnradio" id="btnradio1" autoComplete="off" onChange={() => setLanguage("en")} checked={language === "en"} />
                <label className="btn btn-outline-primary" htmlFor="btnradio1">
                  {languageSetting.english_option}
                </label>

                <input type="radio" className="btn-check" name="btnradio" id="btnradio2" autoComplete="off" onChange={() => setLanguage("zh")} checked={language === "zh"} />
                <label className="btn btn-outline-primary" htmlFor="btnradio2">
                  {languageSetting.chinese_option}
                </label>
              </div>
            </div>

            <div className="row mb-3">
              <label htmlFor="volumeRange" className="col-sm-2 col-form-label">
                {volumeSetting.label[language] || volumeSetting.label["en"]}
              </label>
              <div className="col-sm-10 d-flex align-items-center">
                <input type="range" className="flex-fill" min={volumeSetting.min} max={volumeSetting.max} step={volumeSetting.step} id="volumeRange" value={volume} onChange={e => setVolume(e.target.value)} />
              </div>
            </div>

            <div className="row mb-3">
              <button type="button" className="btn btn-primary col-sm-5 mx-auto" data-bs-dismiss="modal" onClick={onRestart} disabled={!gameStarted} >{reset[language] || reset["en"]}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}