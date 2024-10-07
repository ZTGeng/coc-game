import { useContext } from "react";
import { LanguageContext } from '../../App';
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
  return (
    <div className="row">
      <div className="col-xl-6 col-12 d-flex">
        <table className="table table-borderless text-center align-middle">
          <tbody>
              <tr>
                <th>{ characterSheet.HP.name[language] || characterSheet.HP.name["en"] }</th>
                <td className="border">{ attributes.HP.value }/{ attributes.HP.maxValue }</td>
              </tr>
          </tbody>
        </table>
        <table className="table table-borderless text-center align-middle">
          <tbody>
              <tr>
                <th>{ characterSheet.San.name[language] || characterSheet.San.name["en"] }</th>
                <td className="border">{ attributes.San.value }/{ attributes.San.maxValue }</td>
              </tr>
          </tbody>
        </table>
      </div>
      <div className="col-xl-6 col-12 d-flex">
        <table className="table table-borderless text-center align-middle">
          <tbody>
              <tr>
                <th>{ characterSheet.Luck.name[language] || characterSheet.Luck.name["en"] }</th>
                <td className="border">{ attributes.Luck.value }</td>
              </tr>
          </tbody>
        </table>
        <table className="table table-borderless text-center align-middle">
          <tbody>
              <tr>
                <th>{ characterSheet.MP.name[language] || characterSheet.MP.name["en"] }</th>
                <td className="border">{ attributes.MP.value }/{ attributes.MP.maxValue }</td>
              </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
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
    </div>
  )
}