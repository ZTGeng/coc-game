import { useContext } from 'react';
import { LanguageContext } from './App';

export default function Cover({ onStart }) {
  const { language } = useContext(LanguageContext);
  const start = {
    en: "Start",
    zh: "开始",
  }
  const config = {
    en: "Config",
    zh: "设置",
  }
  
  return (
    <div className="d-flex flex-column align-items-center mt-2">
      <img src="/images/cover.jpg" alt="Cover" style={{ height: "40vh" }} />
      <button className="btn btn-outline-secondary px-5 mt-2" onClick={onStart}>{ start[language] || start["en"] }</button>
      <button className="btn btn-outline-secondary px-5 mt-2" data-bs-toggle="modal" data-bs-target="#config-modal">{ config[language] || config["en"] }</button>
    </div>
  )
}