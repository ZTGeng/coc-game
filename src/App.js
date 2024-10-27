
import { useState, useEffect, useRef, createContext, useContext } from 'react';
import { useDispatch } from 'react-redux';
import './App.css';
import Cover from './components/Cover';
import ConfigModal from './components/ConfigModal';
import ToastMessages from './components/ToastMessage';
import Game from './components/Game';
import { resetCharacter } from './store/slices/characterSlice';
import { clearHighlights } from './store/slices/highlightSlice';
import { resetFlag } from './store/slices/flagSlice';
import { clearHistory } from './store/slices/historySlice';
import characterSheet from './utils/characterSheet';

export const LanguageContext = createContext();
export const CharacterSheetContext = createContext(characterSheet);
const localStorageKey = "coc-state";
const initLanguage = window.navigator.language.startsWith("zh") ? "zh" : "en";

const title = {
  en: "Alone Against the Flames",
  zh: "向火独行",
};
const showCharacterTooltip = {
  en: "Show Character Sheet",
  zh: "显示人物卡",
};
const showHistoryTooltip = {
  en: "Show Chapter History",
  zh: "显示章节历史",
};
const showMapTooltip = {
  en: "Show Map",
  zh: "显示地图",
};
const showAchievementTooltip = {
  en: "Show Achievement",
  zh: "显示成就",
};
const saveTooltip = {
  en: "Save Game",
  zh: "保存游戏",
};
const loadTooltip = {
  en: "Load Game",
  zh: "读取存档",
};  
const configTooltip = {
  en: "Configuration",
  zh: "设置",
};
const saveConfirmText = {
  en: "Save progress?",
  zh: "保存进度？",
};
const overwriteConfirmText = {
  zh: "覆盖之前的存档？",
  en: "Overwrite the previous save?"
};
const loadConfirmText = {
  zh: "舍弃未保存的进度？",
  en: "Discard unsaved progress?"
};

function Header({ gameStarted, toggleShowCharacter, mapEnabled, onSaveGame, onLoadGame }) {
  const { autoLang } = useContext(LanguageContext);

  return (
    <nav className="navbar bg-body-tertiary shadow-sm mb-2">
      <div className="container-fluid">
        <span className="navbar-brand mb-0 h1">{ autoLang(title) }</span>
        
        <div className="ms-auto" title={ autoLang(showCharacterTooltip) }>
          <button className="btn btn-outline-light" onClick={toggleShowCharacter} disabled={!gameStarted}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
              <path d="M12 2.5a5.5 5.5 0 0 1 3.096 10.047 9.005 9.005 0 0 1 5.9 8.181.75.75 0 1 1-1.499.044 7.5 7.5 0 0 0-14.993 0 .75.75 0 0 1-1.5-.045 9.005 9.005 0 0 1 5.9-8.18A5.5 5.5 0 0 1 12 2.5ZM8 8a4 4 0 1 0 8 0 4 4 0 0 0-8 0Z"></path>
            </svg>
          </button>
        </div>

        <div title={ autoLang(showHistoryTooltip) }>
          <button className="btn btn-outline-light" data-bs-toggle="offcanvas" data-bs-target="#history-modal" aria-controls="history-modal" disabled={!gameStarted}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
              <path d="M9.197 10a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5Zm-2.382 4a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5Zm-1.581 4a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5Z"></path>
              <path d="M4.125 0h15.75a4.11 4.11 0 0 1 2.92 1.205A4.11 4.11 0 0 1 24 4.125c0 1.384-.476 2.794-1.128 4.16-.652 1.365-1.515 2.757-2.352 4.104l-.008.013c-.849 1.368-1.669 2.691-2.28 3.97-.614 1.283-.982 2.45-.982 3.503a2.625 2.625 0 1 0 4.083-2.183.75.75 0 1 1 .834-1.247A4.126 4.126 0 0 1 19.875 24H4.5a4.125 4.125 0 0 1-4.125-4.125c0-2.234 1.258-4.656 2.59-6.902.348-.586.702-1.162 1.05-1.728.8-1.304 1.567-2.553 2.144-3.738H3.39c-.823 0-1.886-.193-2.567-1.035A3.647 3.647 0 0 1 0 4.125 4.125 4.125 0 0 1 4.125 0ZM15.75 19.875c0-1.38.476-2.786 1.128-4.15.649-1.358 1.509-2.743 2.343-4.086l.017-.028c.849-1.367 1.669-2.692 2.28-3.972.614-1.285.982-2.457.982-3.514A2.615 2.615 0 0 0 19.875 1.5a2.625 2.625 0 0 0-2.625 2.625c0 .865.421 1.509 1.167 2.009A.75.75 0 0 1 18 7.507H7.812c-.65 1.483-1.624 3.069-2.577 4.619-.334.544-.666 1.083-.98 1.612-1.355 2.287-2.38 4.371-2.38 6.137A2.625 2.625 0 0 0 4.5 22.5h12.193a4.108 4.108 0 0 1-.943-2.625ZM1.5 4.125c-.01.511.163 1.008.487 1.403.254.313.74.479 1.402.479h12.86a3.648 3.648 0 0 1-.499-1.882 4.11 4.11 0 0 1 .943-2.625H4.125A2.625 2.625 0 0 0 1.5 4.125Z"></path>
            </svg>
          </button>
        </div>

        <div title={ autoLang(showMapTooltip) }>
          <button className="btn btn-outline-light" data-bs-toggle="modal" data-bs-target="#map-modal" disabled={!mapEnabled}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="24" height="24">
              <path d="m29 6.94-8.52-2.83h-.06A1 1 0 0 0 20 4a.89.89 0 0 0-.43.11h-.08l-2.85 1.08a5 5 0 0 0-1-1.59 5 5 0 0 0-7.9.77 4.87 4.87 0 0 0-.47 1L3.94 4.26A1.47 1.47 0 0 0 2 5.66V7a1 1 0 0 0 2 0v-.61l3 1a5 5 0 0 0 .51 1.87l3.57 7.19a1 1 0 0 0 1.8 0l3.57-7.19A5.06 5.06 0 0 0 17 7.41a1.47 1.47 0 0 0 0-.21l2-.76v18.87l-6 2.25V20a1 1 0 0 0-2 0v7.61l-7-2.33V11a1 1 0 0 0-2 0v14.66a1.48 1.48 0 0 0 1 1.4l8.51 2.83h.07A.92.92 0 0 0 12 30a1 1 0 0 0 .44-.11h.07L20 27.06l2.66.89a1 1 0 0 0 .64-1.9l-2.3-.77V6.39l7 2.33v18.89l-.68-.23a1 1 0 0 0-.64 1.9l1.38.46a1.48 1.48 0 0 0 .46.08 1.53 1.53 0 0 0 .87-.28 1.5 1.5 0 0 0 .61-1.2v-20a1.48 1.48 0 0 0-1-1.4zM14.68 8.37 12 13.75 9.32 8.37a3 3 0 0 1 .14-2.95A3 3 0 0 1 14.19 5a3.07 3.07 0 0 1 .8 2.3 3.18 3.18 0 0 1-.31 1.07z"/>
              <path d="M12 6a1 1 0 1 0 1 1 1 1 0 0 0-1-1z"/>
            </svg>
          </button>
        </div>

        <div title={ autoLang(showAchievementTooltip) }>
          <button className="btn btn-outline-light" data-bs-toggle="modal" data-bs-target="#achievement-modal" disabled={!gameStarted}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
              <path d="M5.09 10.121A5.251 5.251 0 0 1 1 5V3.75C1 2.784 1.784 2 2.75 2h2.364c.236-.586.81-1 1.48-1h10.812c.67 0 1.244.414 1.48 1h2.489c.966 0 1.75.784 1.75 1.75V5a5.252 5.252 0 0 1-4.219 5.149 7.01 7.01 0 0 1-4.644 5.478l.231 3.003a.5.5 0 0 0 .034.031c.079.065.303.203.836.282.838.124 1.637.81 1.637 1.807v.75h2.25a.75.75 0 0 1 0 1.5H4.75a.75.75 0 0 1 0-1.5H7v-.75c0-.996.8-1.683 1.637-1.807.533-.08.757-.217.836-.282a.5.5 0 0 0 .034-.031l.231-3.003A7.012 7.012 0 0 1 5.09 10.12ZM6.5 2.594V9a5.5 5.5 0 1 0 11 0V2.594a.094.094 0 0 0-.094-.094H6.594a.094.094 0 0 0-.094.094Zm4.717 13.363-.215 2.793-.001.021-.003.043a1.212 1.212 0 0 1-.022.147c-.05.237-.194.567-.553.86-.348.286-.853.5-1.566.605a.478.478 0 0 0-.274.136.264.264 0 0 0-.083.188v.75h7v-.75a.264.264 0 0 0-.083-.188.478.478 0 0 0-.274-.136c-.713-.105-1.218-.32-1.567-.604-.358-.294-.502-.624-.552-.86a1.22 1.22 0 0 1-.025-.19l-.001-.022-.215-2.793a7.069 7.069 0 0 1-1.566 0ZM19 8.578A3.751 3.751 0 0 0 21.625 5V3.75a.25.25 0 0 0-.25-.25H19ZM5 3.5H2.75a.25.25 0 0 0-.25.25V5A3.752 3.752 0 0 0 5 8.537Z"></path>
            </svg>
          </button>
        </div>

        <div title={ autoLang(saveTooltip) }>
          <button className="btn btn-outline-light" onClick={onSaveGame} disabled={!gameStarted}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
              <path d="M4.75 0A2.75 2.75 0 0 0 2 2.75v16.5A2.75 2.75 0 0 0 4.75 22h11a.75.75 0 0 0 0-1.5h-11c-.69 0-1.25-.56-1.25-1.25V18A1.5 1.5 0 0 1 5 16.5h7.25a.75.75 0 0 0 0-1.5H5c-.546 0-1.059.146-1.5.401V2.75c0-.69.56-1.25 1.25-1.25H18.5v7a.75.75 0 0 0 1.5 0V.75a.75.75 0 0 0-.75-.75H4.75Z"></path>
              <path d="m20 13.903 2.202 2.359a.75.75 0 0 0 1.096-1.024l-3.5-3.75a.75.75 0 0 0-1.096 0l-3.5 3.75a.75.75 0 1 0 1.096 1.024l2.202-2.36v9.348a.75.75 0 0 0 1.5 0v-9.347Z"></path>
            </svg>
          </button>
        </div>

        <div title={ autoLang(loadTooltip) }>
          <button className="btn btn-outline-light" onClick={onLoadGame} disabled={!(localStorageKey in localStorage)}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
              <path d="M1.875 2.875a2.5 2.5 0 0 1 2.5-2.5h14a.75.75 0 0 1 .75.75v9.125a.75.75 0 0 1-1.5 0V1.875H4.375a1 1 0 0 0-1 1v11.208a2.486 2.486 0 0 1 1-.208h5.937a.75.75 0 1 1 0 1.5H4.375a1 1 0 0 0-1 1v1.75a1 1 0 0 0 1 1h6a.75.75 0 0 1 0 1.5h-6a2.5 2.5 0 0 1-2.5-2.5V2.875Z"></path>
              <path d="M18.643 20.484a.749.749 0 1 0 1.061 1.06l3.757-3.757a.75.75 0 0 0 0-1.06l-3.757-3.757a.75.75 0 0 0-1.061 1.06l2.476 2.477H13a.75.75 0 0 0 0 1.5h8.12l-2.477 2.477Z"></path>
            </svg>
          </button>
        </div>
        
        <div title={ autoLang(configTooltip) }>
          <button className="btn btn-outline-light" data-bs-toggle="modal" data-bs-target="#config-modal">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
              <path d="M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Zm-1.5 0a2.5 2.5 0 1 0-5 0 2.5 2.5 0 0 0 5 0Z"></path>
              <path d="M12 1c.266 0 .532.009.797.028.763.055 1.345.617 1.512 1.304l.352 1.45c.019.078.09.171.225.221.247.089.49.19.728.302.13.061.246.044.315.002l1.275-.776c.603-.368 1.411-.353 1.99.147.402.349.78.726 1.128 1.129.501.578.515 1.386.147 1.99l-.776 1.274c-.042.069-.058.185.002.315.112.238.213.481.303.728.048.135.142.205.22.225l1.45.352c.687.167 1.249.749 1.303 1.512.038.531.038 1.063 0 1.594-.054.763-.616 1.345-1.303 1.512l-1.45.352c-.078.019-.171.09-.221.225-.089.248-.19.491-.302.728-.061.13-.044.246-.002.315l.776 1.275c.368.603.353 1.411-.147 1.99-.349.402-.726.78-1.129 1.128-.578.501-1.386.515-1.99.147l-1.274-.776c-.069-.042-.185-.058-.314.002a8.606 8.606 0 0 1-.729.303c-.135.048-.205.142-.225.22l-.352 1.45c-.167.687-.749 1.249-1.512 1.303-.531.038-1.063.038-1.594 0-.763-.054-1.345-.616-1.512-1.303l-.352-1.45c-.019-.078-.09-.171-.225-.221a8.138 8.138 0 0 1-.728-.302c-.13-.061-.246-.044-.315-.002l-1.275.776c-.603.368-1.411.353-1.99-.147-.402-.349-.78-.726-1.128-1.129-.501-.578-.515-1.386-.147-1.99l.776-1.274c.042-.069.058-.185-.002-.314a8.606 8.606 0 0 1-.303-.729c-.048-.135-.142-.205-.22-.225l-1.45-.352c-.687-.167-1.249-.749-1.304-1.512a11.158 11.158 0 0 1 0-1.594c.055-.763.617-1.345 1.304-1.512l1.45-.352c.078-.019.171-.09.221-.225.089-.248.19-.491.302-.728.061-.13.044-.246.002-.315l-.776-1.275c-.368-.603-.353-1.411.147-1.99.349-.402.726-.78 1.129-1.128.578-.501 1.386-.515 1.99-.147l1.274.776c.069.042.185.058.315-.002.238-.112.481-.213.728-.303.135-.048.205-.142.225-.22l.352-1.45c.167-.687.749-1.249 1.512-1.304C11.466 1.01 11.732 1 12 1Zm-.69 1.525c-.055.004-.135.05-.161.161l-.353 1.45a1.832 1.832 0 0 1-1.172 1.277 7.147 7.147 0 0 0-.6.249 1.833 1.833 0 0 1-1.734-.074l-1.274-.776c-.098-.06-.186-.036-.228 0a9.774 9.774 0 0 0-.976.976c-.036.042-.06.131 0 .228l.776 1.274c.314.529.342 1.18.074 1.734a7.147 7.147 0 0 0-.249.6 1.831 1.831 0 0 1-1.278 1.173l-1.45.351c-.11.027-.156.107-.16.162a9.63 9.63 0 0 0 0 1.38c.004.055.05.135.161.161l1.45.353a1.832 1.832 0 0 1 1.277 1.172c.074.204.157.404.249.6.268.553.24 1.204-.074 1.733l-.776 1.275c-.06.098-.036.186 0 .228.301.348.628.675.976.976.042.036.131.06.228 0l1.274-.776a1.83 1.83 0 0 1 1.734-.075c.196.093.396.176.6.25a1.831 1.831 0 0 1 1.173 1.278l.351 1.45c.027.11.107.156.162.16a9.63 9.63 0 0 0 1.38 0c.055-.004.135-.05.161-.161l.353-1.45a1.834 1.834 0 0 1 1.172-1.278 6.82 6.82 0 0 0 .6-.248 1.831 1.831 0 0 1 1.733.074l1.275.776c.098.06.186.036.228 0 .348-.301.675-.628.976-.976.036-.042.06-.131 0-.228l-.776-1.275a1.834 1.834 0 0 1-.075-1.733c.093-.196.176-.396.25-.6a1.831 1.831 0 0 1 1.278-1.173l1.45-.351c.11-.027.156-.107.16-.162a9.63 9.63 0 0 0 0-1.38c-.004-.055-.05-.135-.161-.161l-1.45-.353c-.626-.152-1.08-.625-1.278-1.172a6.576 6.576 0 0 0-.248-.6 1.833 1.833 0 0 1 .074-1.734l.776-1.274c.06-.098.036-.186 0-.228a9.774 9.774 0 0 0-.976-.976c-.042-.036-.131-.06-.228 0l-1.275.776a1.831 1.831 0 0 1-1.733.074 6.88 6.88 0 0 0-.6-.249 1.835 1.835 0 0 1-1.173-1.278l-.351-1.45c-.027-.11-.107-.156-.162-.16a9.63 9.63 0 0 0-1.38 0Z"></path>
            </svg>
          </button>
        </div>
      </div>
    </nav>
  )
}

function Footer() {
  return (
    <footer className="pb-3">
      <hr className="mb-0" />
      <span className="text-secondary">Game content belongs to the original creators. © 2024 by @ztgeng for the software.</span>
    </footer>
  )
}

function App() {
  const [language, setLanguage] = useState(initLanguage);
  const [musicVolume, setMusicVolume] = useState(0);
  const [sfxVolume, setSfxVolume] = useState(1);
  const [gameStarted, setGameStarted] = useState(false);
  const [showCharacter, setShowCharacter] = useState(false);
  const [mapEnabled, setMapEnabled] = useState(false);
  const [saveLoad, setSaveLoad] = useState({});
  const musicRef = useRef();
  const dispatch = useDispatch();

  function autoLang(texts) { // texts = { en: "English", zh: "中文" }
    return texts[language] || texts["en"];
  }

  useEffect(() => {
    if (musicRef.current) {
      if (musicRef.current.volume === 0 && musicVolume > 0) {
        musicRef.current.play().catch(error => console.error(`Failed to play music: ${error}`));
      } else if (musicRef.current.volume > 0 && musicVolume === 0) {
        musicRef.current.pause();
      }
      musicRef.current.volume = musicVolume;
    }
  }, [musicVolume]);

  function startGame() {
    console.log("Game started.");
    setGameStarted(true);
  }

  function onRestart() {
    setGameStarted(false);
    setShowCharacter(false);
    setMapEnabled(false);
    dispatch(resetCharacter());
    dispatch(clearHighlights());
    dispatch(resetFlag());
    dispatch(clearHistory());
  }

  function toggleShowCharacter() {
    setShowCharacter(!showCharacter);
  }

  function onSaveGame() {
    if (window.confirm(autoLang(saveConfirmText))) {
      setSaveLoad({ action: "save", saveKey: localStorageKey });
    }
  }

  function onLoadGame() {
    console.log("Load game.");
    if (localStorageKey in localStorage) {
      if (window.confirm(autoLang(loadConfirmText))) {
        setGameStarted(true);
        setSaveLoad({ action: "load", saveKey: localStorageKey });
      }
    }
  }

  function playSound(sound) {
    const src = `audio/${sound}.mp3`;
    const audio = new Audio(src);
    audio.volume = sfxVolume;
    audio.play()
      .finally(() => audio.remove())
      .catch(error => console.error(`Failed to play sound: ${error}`));
  }
  window.playSound = playSound;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, autoLang }}>
      <CharacterSheetContext.Provider value={characterSheet}>
        <div className="d-flex flex-column vh-100">
          <Header {...{ gameStarted, toggleShowCharacter, mapEnabled, onSaveGame, onLoadGame }} />
          <div className="flex-grow-1">
            {gameStarted ? <Game {...{ showCharacter, setShowCharacter, mapEnabled, setMapEnabled, saveLoad, playSound }} /> : <Cover onStart={startGame} />}
          </div>
          <Footer />
        </div>
        <ToastMessages />
        <ConfigModal {...{ gameStarted, onRestart, musicVolume, setMusicVolume, sfxVolume, setSfxVolume }} />
        <audio ref={musicRef} src="audio/music.mp3" type="audio/mpeg" loop volume={musicVolume} />
      </CharacterSheetContext.Provider>
    </LanguageContext.Provider>
  )
}

export default App;
