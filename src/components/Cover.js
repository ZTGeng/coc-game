import { useContext } from 'react';
import { LanguageContext } from '../App';

export default function Cover({ onStart }) {
  const { autoLang } = useContext(LanguageContext);
  const start = {
    en: "Start",
    zh: "开始",
  }
  const config = {
    en: "Config",
    zh: "设置",
  }
  
  return (
    <div className="d-flex justify-content-center vh-100 pt-5 pb-4">
      <img src="images/cover.jpg" alt="Cover" className="h-100 z-n1" />
      <div className="position-absolute w-25 align-self-center d-grid gap-2" >
        <button className="btn btn-light shadow-lg px-5" onClick={onStart}>{ autoLang(start) }</button>
        <button className="btn btn-light shadow-lg px-5" data-bs-toggle="modal" data-bs-target="#config-modal">{ autoLang(config) }</button>
      </div>
    </div>
  )
}