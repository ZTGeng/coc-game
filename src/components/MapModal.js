import { useContext, useRef } from 'react';
import { LanguageContext } from '../App';

const title = {
  en: "Emberhead Map",
  zh: "烬头村地图",
};
const locations = {
  street: [34, 52],
  ledbetter: [22, 21],
  general_store: [36, 83],
  village_hall: [57, 36],
  eastern_road: [48, 94],
  beacon: [63, 60],
  church: [20, 62],
  workshops: [47, 20],
  chamber: [75, 60],
  woodland: [99, 87],
  school: [49, 80],
  southern_road: [29, 87],
  narrow_path: [53, 80],
  beacon_2: [58, 76],
  prison: [22, 21],
  beacon_center: [63, 60],
  church_inside: [18, 67],
};

export default function MapModal({ mapLocation }) {
  const { autoLang } = useContext(LanguageContext);
  const coordinate = useRef([50, 50]);

  if (locations[mapLocation]) {
    coordinate.current = locations[mapLocation];
  }

  return (
    <div className="modal fade" id="map-modal" data-bs-keyboard="true" tabIndex="-1" aria-labelledby="mapModalLabel" aria-hidden="true">
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content text-dark">
          <div className="modal-header">
            <h1 className="modal-title fs-5" id="staticBackdropLabel">{ autoLang(title) }</h1>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div className="modal-body">
            <div className="position-relative">
              <div className="text-danger position-absolute" style={{ left: coordinate.current[0] + "%", top: coordinate.current[1] + "%", transform: "translate(-50%, -100%)" }}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                  <path strokeWidth="1" stroke="currentColor" d="M12 13.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"></path>
                  <path strokeWidth="1" stroke="currentColor" d="M19.071 3.429h.001c3.905 3.905 3.905 10.237 0 14.142l-5.403 5.403a2.36 2.36 0 0 1-3.336 0l-5.375-5.375-.028-.028c-3.905-3.905-3.905-10.237 0-14.142 3.904-3.905 10.236-3.905 14.141 0ZM5.99 4.489v.001a8.5 8.5 0 0 0 0 12.02l.023.024.002.002 5.378 5.378a.859.859 0 0 0 1.214 0l5.403-5.404a8.5 8.5 0 0 0-.043-11.977A8.5 8.5 0 0 0 5.99 4.489Z"></path>
                </svg>
              </div>
              <img src={ autoLang({ zh: "/images/map-zh.png", en: "/images/map-en.png" })} className="img-fluid" alt="Map" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}