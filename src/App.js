import { useState, useEffect, useRef, createContext, useContext } from 'react';
import './App.css';
import Cover from './components/Cover';
import ConfigModal from './components/ConfigModal';
import ToastMessages from './components/ToastMessage';
import Game from './components/Game';

export const LanguageContext = createContext();

function Header({ gameStarted, toggleShowCharacter, mapEnabled }) {
  const { autoLang } = useContext(LanguageContext);
  const title = {
    en: "Alone Against the Flames",
    zh: "向火独行",
  };
  const showCharacterTooltip = {
    en: "Show Character Sheet",
    zh: "显示人物卡",
  };
  const showMapTooltip = {
    en: "Show Map",
    zh: "显示地图",
  };
  const configTooltip = {
    en: "Configuration",
    zh: "设置",
  };

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

        <div title={ autoLang(showMapTooltip) }>
          <button className="btn btn-outline-light" data-bs-toggle="modal" data-bs-target="#map-modal" disabled={!mapEnabled}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="24" height="24">
              <path d="m29 6.94-8.52-2.83h-.06A1 1 0 0 0 20 4a.89.89 0 0 0-.43.11h-.08l-2.85 1.08a5 5 0 0 0-1-1.59 5 5 0 0 0-7.9.77 4.87 4.87 0 0 0-.47 1L3.94 4.26A1.47 1.47 0 0 0 2 5.66V7a1 1 0 0 0 2 0v-.61l3 1a5 5 0 0 0 .51 1.87l3.57 7.19a1 1 0 0 0 1.8 0l3.57-7.19A5.06 5.06 0 0 0 17 7.41a1.47 1.47 0 0 0 0-.21l2-.76v18.87l-6 2.25V20a1 1 0 0 0-2 0v7.61l-7-2.33V11a1 1 0 0 0-2 0v14.66a1.48 1.48 0 0 0 1 1.4l8.51 2.83h.07A.92.92 0 0 0 12 30a1 1 0 0 0 .44-.11h.07L20 27.06l2.66.89a1 1 0 0 0 .64-1.9l-2.3-.77V6.39l7 2.33v18.89l-.68-.23a1 1 0 0 0-.64 1.9l1.38.46a1.48 1.48 0 0 0 .46.08 1.53 1.53 0 0 0 .87-.28 1.5 1.5 0 0 0 .61-1.2v-20a1.48 1.48 0 0 0-1-1.4zM14.68 8.37 12 13.75 9.32 8.37a3 3 0 0 1 .14-2.95A3 3 0 0 1 14.19 5a3.07 3.07 0 0 1 .8 2.3 3.18 3.18 0 0 1-.31 1.07z"/>
              <path d="M12 6a1 1 0 1 0 1 1 1 1 0 0 0-1-1z"/>
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
  const [language, setLanguage] = useState("zh");
  const [musicVolume, setMusicVolume] = useState(1);
  const [sfxVolume, setSfxVolume] = useState(1);
  const [gameStarted, setGameStarted] = useState(false);
  const [showCharacter, setShowCharacter] = useState(false);
  const [mapEnabled, setMapEnabled] = useState(false);
  const musicRef = useRef();
  const diceSfxRef = useRef();
  const hpSfxRef = useRef();

  function autoLang(texts) { // texts = { en: "English", zh: "中文" }
    return texts[language] || texts["en"];
  }
  
  useEffect(() => {
    if (musicRef.current) {
      musicRef.current.volume = musicVolume;
    }
  }, [musicVolume]);

  useEffect(() => {
    if (diceSfxRef.current) {
      diceSfxRef.current.volume = sfxVolume;
    }
    if (hpSfxRef.current) {
      hpSfxRef.current.volume = sfxVolume;
    }
  }, [sfxVolume]);

  function startGame() {
    console.log("Game started.");
    setGameStarted(true);
    if (musicRef.current) {
      // musicRef.current.stop();
      // musicRef.current.play(); 
    }
  }

  function toggleShowCharacter() {
    setShowCharacter(!showCharacter);
  }

  function enableMap() {
    setMapEnabled(true);
  }

  function playSound(sound) {
    const src = `./audio/${sound}.mp3`;
    if (sound === "dice" || sound === "one-die") {
      if (diceSfxRef.current) {
        diceSfxRef.current.pause();
        diceSfxRef.current.currentTime = 0;
        diceSfxRef.current.src = src;
        diceSfxRef.current.play().catch(error => console.error(`Failed to play sound: ${error}`));
      }
    } else {
      if (hpSfxRef.current) {
        hpSfxRef.current.pause();
        hpSfxRef.current.currentTime = 0;
        hpSfxRef.current.src = src;
        hpSfxRef.current.play().catch(error => console.error(`Failed to play sound: ${error}`));
      }
    }
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, autoLang }}>
      <div className="d-flex flex-column vh-100">
        <Header {...{ gameStarted, toggleShowCharacter, mapEnabled }} />
        <div className="flex-grow-1">
          {gameStarted ? <Game {...{ showCharacter, setShowCharacter, enableMap, playSound }} /> : <Cover onStart={startGame} />}
        </div>
        <Footer />
      </div>
      <ToastMessages />
      <ConfigModal {...{ gameStarted, onRestart: startGame, musicVolume, setMusicVolume, sfxVolume, setSfxVolume }} />
      <audio ref={musicRef} src="" type="audio/mpeg" loop volume={musicVolume} />
      <audio ref={diceSfxRef} src="" type="audio/mpeg" volume={sfxVolume} />
      <audio ref={hpSfxRef} src="" type="audio/mpeg" volume={sfxVolume} />
    </LanguageContext.Provider>
  )
}

export default App;
