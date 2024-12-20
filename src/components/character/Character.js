import { useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import { LanguageContext, CharacterSheetContext } from '../../App';
import { useFlagCheck } from "../../store/slices/flagSlice";
import { setName, setAge } from "../../store/slices/characterSlice";
import Characteristics from './Characteristics';
import Attributes from "./Attributes";
import Skills from './Skills';
import * as utils from '../../utils/utils';

function Info({}) {
  const { autoLang } = useContext(LanguageContext);
  const characterSheet = useContext(CharacterSheetContext);
  const dispatch = useDispatch();
  const infoStore = useSelector(state => state.character.info);
  const occupationStore = useSelector(state => state.character.occupation);
  const occupationName = autoLang(occupationStore.name);

  return (
    <div className="row">
      <div className="col-xl-12 col-md-4 col-sm-12 form-floating mb-3">
        <input type="text" 
               className="form-control focus-ring focus-ring-light border-0 px-0" 
               id="nameInput" 
               placeholder="" 
               value={infoStore.name}
               onChange={e => dispatch(setName(e.target.value))} />
        <label htmlFor="nameInput" className="small form-label">{ autoLang(characterSheet.nameTitie) }</label>
        <hr className="" style={{ marginBottom: "0px", marginTop: "-10px"}} />
      </div>
      <div className="col-xl-12 col-md-2 col-sm-12 form-floating mb-3">
        <input type="number"
               className="form-control focus-ring focus-ring-light border-0 px-0" 
               id="ageInput" 
               placeholder="" 
               value={infoStore.age}
               onChange={e => dispatch(setAge(e.target.value))} />
        <label htmlFor="ageInput" className="small form-label">{ autoLang(characterSheet.ageTitie) }</label>
        <hr className="" style={{ marginBottom: "0px", marginTop: "-10px"}} />
      </div>
      <div className="col-xl-12 col-md-6 col-sm-12 form-floating mb-3">
        <input type="text" 
               className="form-control focus-ring focus-ring-light border-0 px-0" 
               style={{ fontSize: occupationName.length > 12 ? "0.8rem" : "1rem" }}
               id="occupationInput" 
               placeholder="" 
               readOnly={true} 
               value={ occupationName } />
        <label htmlFor="occupationInput" className="small form-label">{ autoLang(characterSheet.occupationTitie) }</label>
        <hr className="" style={{ marginBottom: "0px", marginTop: "-10px"}} />
      </div>
    </div>
  )
}

function Weapons({}) {
  const { autoLang } = useContext(LanguageContext);
  const characterSheet = useContext(CharacterSheetContext);
  const fightingValue = useSelector(state => state.character.skills.fighting.value);
  const flagCheck = useFlagCheck();
  const hasKnife = flagCheck("flag_bought_knife");

  const blankRow = (
    <tr>
      <td className="pb-0"> &nbsp; </td>
      <td className="pb-0">  </td>
      <td className="pb-0">  </td>
      <td className="pb-0">  </td>
      <td className="pb-0">  </td>
    </tr>
  );

  const knifeRow = (
    <tr className="table-active">
      <td className="pb-0">{ autoLang(characterSheet.weapons.knife.name) }</td>
      <td className="pb-0">{ fightingValue }</td>
      <td className="pb-0">{ Math.floor(fightingValue / 2) }</td>
      <td className="pb-0">{ Math.floor(fightingValue / 5) }</td>
      <td className="pb-0">{ autoLang(characterSheet.weapons.knife.damage) }</td>
    </tr>
  );

  return (
    <div className="card h-100">
      <h6 className="card-header">
        { autoLang(characterSheet.weaponsTitie) }
      </h6>
      <div className="card-body py-0 px-2">
        <table className="table table-sm text-center align-bottom" style={{ fontSize: "0.8rem" }}>
          <thead>
            <tr>
              <th className="border-bottom-0">{ autoLang(characterSheet.weapons.tableHeader.name) }</th>
              <th className="border-bottom-0">{ autoLang(characterSheet.weapons.tableHeader.regular) }</th> 
              <th className="border-bottom-0">{ autoLang(characterSheet.weapons.tableHeader.hard) }</th>
              <th className="border-bottom-0">{ autoLang(characterSheet.weapons.tableHeader.extreme) }</th>
              <th className="border-bottom-0">{ autoLang(characterSheet.weapons.tableHeader.damage) }</th>
            </tr>
          </thead>
          <tbody>
            <tr className={ hasKnife ? "" : "table-active"}>
              <td className="pb-0">{ autoLang(characterSheet.weapons.unarmed.name) }</td>
              <td className="pb-0">{ fightingValue }</td>
              <td className="pb-0">{ Math.floor(fightingValue / 2) }</td>
              <td className="pb-0">{ Math.floor(fightingValue / 5) }</td>
              <td className="pb-0">{ autoLang(characterSheet.weapons.unarmed.damage) }</td>
            </tr>
            { hasKnife ? knifeRow : blankRow }
            { blankRow }
            { blankRow }
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CombatData({}) {
  const { autoLang } = useContext(LanguageContext);
  const characterSheet = useContext(CharacterSheetContext);
  const charStore = useSelector(state => state.character.chars);
  const dodgeValue = useSelector(state => state.character.skills.dodge.value);
  const [damageBonus, build] = !charStore.SIZ.value || !charStore.STR.value
    ? ["", ""]
    : [
      utils.calculateDamageBonus(charStore.STR.value, charStore.SIZ.value), 
      utils.calculateBuild(charStore.STR.value, charStore.SIZ.value)
    ];

  return (
    <div className="card">
      <h6 className="card-header">
        { autoLang(characterSheet.combatTitle) }
      </h6>
      <div className="card-body px-0 py-2">
        <div className="d-flex flex-column">
          <table className="table table-borderless text-center align-middle cell ps-1 pe-3 mb-2">
            <tbody>
              <tr>
                <th className="border-0 py-0 ps-0 lh-1"  scope="row">
                  <small>{ autoLang(characterSheet.combat.damageBonus) }</small>
                </th>
                <td className="border p-2" style={{ width: "4rem", height: "2.4rem", borderRadius : "2rem" }}>
                  { damageBonus }
                </td>
              </tr>
            </tbody>
          </table>
          <table className="table table-borderless text-center align-middle cell ps-1 pe-3 mb-2">
            <tbody>
              <tr>
                <th className="border-0 py-0 ps-0" scope="row">
                  { autoLang(characterSheet.combat.build) }
                </th>
                <td className="border p-2" style={{ width: "4rem", height: "2.4rem", borderRadius : "2rem" }}>
                  { build }
                </td>
              </tr>
            </tbody>
          </table>
          <table className="table text-center align-middle cell m-0 ps-1 pe-3">
            <tbody>
              <tr>
                <th rowSpan="2" className="border-0 py-0 ps-0" scope="row">
                  { autoLang(characterSheet.skills.dodge.name) }
                </th>
                <td rowSpan="2" className="border border-end-0 p-2" style={{ width: "2rem" }}>
                  { dodgeValue }
                </td>
                <td className="border border-bottom-0 small px-2 py-0" style={{ width: "2rem", height: "1.2rem" }}>
                  { dodgeValue && Math.floor(dodgeValue / 2) }
                </td>
              </tr>
              <tr>
                <td className="border small px-2 py-0" style={{ width: "2rem", height: "1.2rem" }}>
                  { dodgeValue && Math.floor(dodgeValue / 5) }
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function Character({ onCharacterAction }) {
  // console.log(`Character refresh: ${JSON.stringify(character)}`);
  console.log(`Character refresh`);

  return (
    <div className="d-flex flex-column bg-white p-2" style={{ "--bs-bg-opacity": .8 }}>
      <div className="row gx-2">
        <div className="col-xl-3 col-md-12 col-sm-3">
          <Info />
        </div>
        <div className="col mb-3">
          <Characteristics />
        </div>
      </div>
      <Attributes />
      <Skills />
      <div className="row gx-2 mt-1">
        <div className="col-8">
          <Weapons />
        </div>
        <div className="col-4 ps-1">
          <CombatData />
        </div>
      </div>
    </div>
  )
}