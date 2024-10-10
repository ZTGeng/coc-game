import { useContext, useRef } from 'react';
import { LanguageContext } from '../../App';

const title = {
  en: "Emberhead Map",
  zh: "烬头村地图",
};
const locations = [
  {
    name: "Street",
    chapterKeys: [3, 6, 9, 15, 25],
    position: [34, 52]
  },
  {
    name: "Ledbetter",
    chapterKeys: [],
    position: [21, 22, 23]
  },
  {
    name: "General Store",
    chapterKeys: [16],
    position: [33, 84]
  },
  {
    name: "Village Hall",
    chapterKeys: [84],
    position: [57, 36]
  },
  {
    name: "Eastern Road",
    chapterKeys: [47, 115, 127, 135, 150, 160, 161, 167, 172],
    position: [48, 94]
  },
  {
    name: "Beacon",
    chapterKeys: [57, 69],
    position: [63, 60]
  },
  {
    name: "Church",
    chapterKeys: [34, 46],
    position: [20, 62]
  },
  {
    name: "Workshops",
    chapterKeys: [96, 106],
    position: [47, 20]
  },
  {
    name: "Chamber",
    chapterKeys: [87, 142, 181, 187, 191, 199, 206, 214, 221, 227, 237, 245, 253, 259, ],
    position: [75, 60]
  },
  {
    name: "Woodland",
    chapterKeys: [28, 35, 41, 54, 60, 66, 72, 79, 85, 91, 97, 103, 110, 116, 122, 129, 136, 143, 149, 155, 173, 193, 201],
    position: [99, 87]
  },
];

export default function MapModal({ chapterKey }) {
  const { language } = useContext(LanguageContext);
  const lastPosition = useRef([50, 50]);

  // let x = 50, y = 50;
  let [x, y] = lastPosition.current;
  const newLocation = locations.find(location => location.chapterKeys.includes(chapterKey));
  if (newLocation) {
    [x, y] = newLocation.position;
    lastPosition.current = newLocation.position;
  }

  return (
    <div className="modal fade" id="map-modal" data-bs-keyboard="true" tabIndex="-1" aria-labelledby="mapModalLabel" aria-hidden="true">
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content text-dark">
          <div className="modal-header">
            <h1 className="modal-title fs-5" id="staticBackdropLabel">{ title[language] || title["en"] }</h1>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div className="modal-body">
            <div className="position-relative">
              <div className="text-danger position-absolute" style={{ left: x + "%", top: y + "%", transform: "translate(-50%, -100%)" }}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                  <path strokeWidth="1" stroke="currentColor" d="M12 13.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"></path>
                  <path strokeWidth="1" stroke="currentColor" d="M19.071 3.429h.001c3.905 3.905 3.905 10.237 0 14.142l-5.403 5.403a2.36 2.36 0 0 1-3.336 0l-5.375-5.375-.028-.028c-3.905-3.905-3.905-10.237 0-14.142 3.904-3.905 10.236-3.905 14.141 0ZM5.99 4.489v.001a8.5 8.5 0 0 0 0 12.02l.023.024.002.002 5.378 5.378a.859.859 0 0 0 1.214 0l5.403-5.404a8.5 8.5 0 0 0-.043-11.977A8.5 8.5 0 0 0 5.99 4.489Z"></path>
                </svg>
              </div>
              <img src={language === "zh" ? "./images/map-zh.png" : "./images/map-en.png"} className="img-fluid" alt="Map" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}