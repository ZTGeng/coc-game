import './App.css';
import cover from './assets/cover.jpg';

function App() {
  return (
    <div className="d-flex flex-column align-items-center">
      <img src={cover} alt="Cover" style={{ height: "50vh" }} />
      <h1>Start</h1>
      <h1>Config</h1>
    </div>
  );
}

export default App;
