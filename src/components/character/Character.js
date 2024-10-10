import { useContext } from "react";
import { LanguageContext } from '../../App';
import { HighlightContext } from "../Game";
import { FlagsContext } from "../Game";
import Characteristics from './Characteristics';
import Skills from './Skills';

function Info({ characterSheet, occupation }) {
  const { language } = useContext(LanguageContext);
  const occupationName = occupation.name[language] || occupation.name["en"];

  return (
    <div className="row mt-4">
      <div className="col-xl-12 col-md-4 col-8 form-floating mb-2">
        <input type="text" className="form-control focus-ring focus-ring-light border-0 px-0" id="nameInput" placeholder="" />
        <label htmlFor="nameInput" className="small form-label">{ characterSheet.nameTitie[language] || characterSheet.nameTitie["en"] }</label>
        <hr className="" style={{ marginBottom: "0px", marginTop: "-10px"}} />
      </div>
      <div className="col-xl-12 col-md-2 col-4 form-floating mb-2">
        <input type="number" className="form-control focus-ring focus-ring-light border-0 px-0" id="ageInput" placeholder="" />
        <label htmlFor="ageInput" className="small form-label">{ characterSheet.ageTitie[language] || characterSheet.ageTitie["en"] }</label>
        <hr className="" style={{ marginBottom: "0px", marginTop: "-10px"}} />
      </div>
      <div className="col-xl-12 col-md-6 col-12 form-floating mb-2">
        <input type="text" 
               className="form-control focus-ring focus-ring-light border-0 px-0" 
               style={{ fontSize: occupationName.length > 12 ? "0.8rem" : "1rem" }}
               id="occupationInput" 
               placeholder="" 
               readOnly={true} 
               value={ occupationName } />
        <label htmlFor="occupationInput" className="small form-label">{ characterSheet.occupationTitie[language] || characterSheet.occupationTitie["en"] }</label>
        <hr className="" style={{ marginBottom: "0px", marginTop: "-10px"}} />
      </div>
    </div>
  )
}

function Attributes({ characterSheet, attributes }) {
  const { language } = useContext(LanguageContext);
  const { highlight } = useContext(HighlightContext);

  function getHighlightClassName(attr) {
    const attrHighlight = highlight.find(h => h.key === attr);
    if (!attrHighlight) return "";
    switch (attrHighlight.level) {
      case "danger":
        return " text-bg-danger";
      case "success":
        return " table-success";
      default:
        return " table-warning";
    }
  }

  return (
    <div className="row">
      <div className="col-xl-6 col-12 d-flex">
        <table className="table table-borderless text-center align-middle">
          <tbody>
              <tr>
                <th>{ characterSheet.HP.name[language] || characterSheet.HP.name["en"] }</th>
                <td className={"border" + getHighlightClassName("HP")}>{ attributes.HP.value }/{ attributes.HP.maxValue }</td>
              </tr>
          </tbody>
        </table>
        <table className="table table-borderless text-center align-middle">
          <tbody>
              <tr>
                <th>{ characterSheet.San.name[language] || characterSheet.San.name["en"] }</th>
                <td className={"border" + getHighlightClassName("San")}>{ attributes.San.value }/{ attributes.San.maxValue }</td>
              </tr>
          </tbody>
        </table>
      </div>
      <div className="col-xl-6 col-12 d-flex">
        <table className="table table-borderless text-center align-middle">
          <tbody>
              <tr>
                <th>{ characterSheet.Luck.name[language] || characterSheet.Luck.name["en"] }</th>
                <td className={"border" + getHighlightClassName("Luck")}>{ attributes.Luck.value }</td>
              </tr>
          </tbody>
        </table>
        <table className="table table-borderless text-center align-middle">
          <tbody>
              <tr>
                <th>{ characterSheet.MP.name[language] || characterSheet.MP.name["en"] }</th>
                <td className={"border" + getHighlightClassName("MP")}>{ attributes.MP.value }/{ attributes.MP.maxValue }</td>
              </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Weapons({ characterSheet, skills }) {
  const { language } = useContext(LanguageContext);
  const { flagConditionCheck } = useContext(FlagsContext);
  const hasKnife = flagConditionCheck("flag_bought_knife");

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
      <td className="pb-0">{ characterSheet.weapons.knife.name[language] || characterSheet.weapons.knife.name["en"] }</td>
      <td className="pb-0">{ skills.fighting.value }</td>
      <td className="pb-0">{ Math.floor(skills.fighting.value / 2) }</td>
      <td className="pb-0">{ Math.floor(skills.fighting.value / 5) }</td>
      <td className="pb-0">{ characterSheet.weapons.knife.damage[language] || characterSheet.weapons.knife.damage["en"] }</td>
    </tr>
  );

  return (
    <div className="card h-100">
      <h6 className="card-header">
        { characterSheet.weaponsTitie[language] || characterSheet.weaponsTitie["en"] }
      </h6>
      <div className="card-body py-0 px-2">
        <table className="table table-sm text-center align-bottom" style={{ fontSize: "0.8rem" }}>
          <thead>
            <tr>
              <th className="border-bottom-0">{ characterSheet.weapons.tableHeader.name[language] || characterSheet.weapons.tableHeader.name["en"]}</th>
              <th className="border-bottom-0">{ characterSheet.weapons.tableHeader.regular[language] || characterSheet.weapons.tableHeader.regular["en"]}</th> 
              <th className="border-bottom-0">{ characterSheet.weapons.tableHeader.hard[language] || characterSheet.weapons.tableHeader.hard["en"]}</th>
              <th className="border-bottom-0">{ characterSheet.weapons.tableHeader.extreme[language] || characterSheet.weapons.tableHeader.extreme["en"]}</th>
              <th className="border-bottom-0">{ characterSheet.weapons.tableHeader.damage[language] || characterSheet.weapons.tableHeader.damage["en"]}</th>
            </tr>
          </thead>
          <tbody>
            <tr className={ hasKnife ? "" : "table-active"}>
              <td className="pb-0">{ characterSheet.weapons.unarmed.name[language] || characterSheet.weapons.unarmed.name["en"] }</td>
              <td className="pb-0">{ skills.fighting.value }</td>
              <td className="pb-0">{ Math.floor(skills.fighting.value / 2) }</td>
              <td className="pb-0">{ Math.floor(skills.fighting.value / 5) }</td>
              <td className="pb-0">{ characterSheet.weapons.unarmed.damage[language] || characterSheet.weapons.unarmed.damage["en"] }</td>
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

function Combat({ characterSheet, chars, skills }) {
  const { language } = useContext(LanguageContext);
  let damageBonus, build;
  if (!chars.SIZ.value || !chars.STR.value) {
    damageBonus = "";
    build = "";
  } else if (chars.SIZ.value + chars.STR.value > 164) {
    damageBonus = "1d6";
    build = 2;
  } else if (chars.SIZ.value + chars.STR.value > 124) {
    damageBonus = "1d4";
    build = 1;
  } else if (chars.SIZ.value + chars.STR.value > 84) {
    damageBonus = 0;
    build = 0;
  } else if (chars.SIZ.value + chars.STR.value > 64) {
    damageBonus = -1;
    build = -1;
  } else {
    damageBonus = -2;
    build = -2;
  }

  return (
    <div className="card">
      <h6 className="card-header">
        {characterSheet.combatTitle[language] || characterSheet.combatTitle["en"]}
      </h6>
      <div className="card-body px-0 py-2">
        <div className="d-flex flex-column">
          <table className="table table-borderless text-center align-middle cell ps-1 pe-3 mb-2">
            <tbody>
              <tr>
                <th className="border-0 py-0 ps-0 lh-1"  scope="row">
                  <small>{ characterSheet.combat.damageBonus[language] || characterSheet.combat.damageBonus["en"] }</small>
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
                  { characterSheet.combat.build[language] || characterSheet.combat.build["en"] }
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
                  { characterSheet.skills.dodge.name[language] || characterSheet.skills.dodge.name["en"] }
                </th>
                <td rowSpan="2" className="border border-end-0 p-2" style={{ width: "2rem" }}>
                  { skills.dodge.value }
                </td>
                <td className="border border-bottom-0 small px-2 py-0" style={{ width: "2rem", height: "1.2rem" }}>
                  { skills.dodge.value && Math.floor(skills.dodge.value / 2) }
                </td>
              </tr>
              <tr>
                <td className="border small px-2 py-0" style={{ width: "2rem", height: "1.2rem" }}>
                  { skills.dodge.value && Math.floor(skills.dodge.value / 5) }
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function Character({ characterSheet, chars, setChars, attributes, skills, setSkills, occupation, onCharacterAction }) {
  // console.log(`Character refresh: ${JSON.stringify(character)}`);
  console.log(`Character refresh`);

  return (
    <div className="d-flex flex-column ms-2">
      <div className="row">
        <div className="col-xl-3">
          <Info {...{ characterSheet, occupation }} />
        </div>
        <div className="col mb-3 px-0">
          <Characteristics {...{ characterSheet, chars, setChars }} />
        </div>
      </div>
      <Attributes {...{ characterSheet, attributes }} />
      <Skills {...{ characterSheet, skills, setSkills, occupation, onCharacterAction }} />
      <div className="row mt-1">

        <div className="col-8 px-0">
          <Weapons {...{ characterSheet, skills }} />
        </div>
        <div className="col-4 pe-0 ps-1">
          <Combat {...{ characterSheet, chars, skills }} />
        </div>
      </div>
    </div>
  )
}