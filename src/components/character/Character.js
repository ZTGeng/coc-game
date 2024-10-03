import { useState, useEffect, useRef, useContext } from "react";
import { LanguageContext } from '../../App';
import CharacteristicCell from './CharacteristicCell';
import SkillCell from "./SkillCell";

const characteristicsTitle = {
  "en": "Characteristic",
  "zh": "属性"
};
const skillsTitle = {
  "en": "Investigator Skills",
  "zh": "调查员技能"
};
const nameTitie = {
  "en": "Name",
  "zh": "姓名"
};
const ageTitie = {
  "en": "Age",
  "zh": "年龄"
};
const occupationTitie = {
  "en": "Occupation",
  "zh": "职业"
};

function Info() {
  const { language } = useContext(LanguageContext);
  return (
    <div className="d-flex flex-column mt-4">
      <div className="form-floating mb-2">
        <input type="text" className="form-control border-0" id="nameInput" placeholder="" />
        <label htmlFor="nameInput" className="small form-label">{ nameTitie[language] || nameTitie["en"] }</label>
        <hr className="" style={{ marginBottom: "0px", marginTop: "-10px"}} />
      </div>
      <div className="form-floating mb-2">
        <input type="number" className="form-control border-0" id="ageInput" placeholder="" />
        <label htmlFor="ageInput" className="small form-label">{ ageTitie[language] || ageTitie["en"] }</label>
        <hr className="" style={{ marginBottom: "0px", marginTop: "-10px"}} />
      </div>
      <div className="form-floating mb-2">
        <input type="text" className="form-control border-0" id="occupationInput" placeholder="" />
        <label htmlFor="occupationInput" className="small form-label">{ occupationTitie[language] || occupationTitie["en"] }</label>
        <hr className="" style={{ marginBottom: "0px", marginTop: "-10px"}} />
      </div>
    </div>
  )
}

function Characteristics({ character, onCharacterAction }) {
  const { language } = useContext(LanguageContext);
  const finishedRef = useRef(false);

  const initValues = [80, 70, 60, 60, 50, 50, 50, 40];
  [character.STR, character.DEX, character.INT, character.CON, character.APP, character.POW, character.SIZ, character.EDU].forEach(char => {
    const index = initValues.indexOf(char.value);
    if (index !== -1) {
      initValues.splice(index, 1)
    }
  });

  const [availableValues, setAvailableValues] = useState(initValues);

  useEffect(() => {
    console.log(`availableValues length: ${availableValues.length}`);
    const isFinished = availableValues.length === 0;
    if (isFinished !== finishedRef.current) {
      finishedRef.current = isFinished;
      onCharacterAction("action_set_flag", { flag: "flag_characteristics_unfinished", value: !isFinished });
    }
  }, [availableValues]);
  

  function onValueSelected(key, value) {
    const characteristic = character[key];
    const index = availableValues.indexOf(value);
    if (index !== -1) {
      availableValues.splice(index, 1)
    }
    if (characteristic.value) {
      availableValues.push(characteristic.value);
      availableValues.sort().reverse();
    }
    characteristic.value = value;
    setAvailableValues([...availableValues]);
  }
  
  return (
    <>
      <h3 className="text-center">{ characteristicsTitle[language] || characteristicsTitle["en"] }</h3>
      <div className="row">
        <div className="col-xl-4 col-md-6 col-sm-4 col-6 mb-1">
          <CharacteristicCell characteristic={ character.STR } {...{availableValues, onValueSelected}} />
        </div>
        <div className="col-xl-4 col-md-6 col-sm-4 col-6 mb-1">
          <CharacteristicCell characteristic={ character.DEX } {...{availableValues, onValueSelected}} />
        </div>
        <div className="col-xl-4 col-md-6 col-sm-4 col-6 mb-1">
          <CharacteristicCell characteristic={ character.INT } {...{availableValues, onValueSelected}} />
        </div>
        <div className="col-xl-4 col-md-6 col-sm-4 col-6 mb-1">
          <CharacteristicCell characteristic={ character.CON } {...{availableValues, onValueSelected}} />
        </div>
        <div className="col-xl-4 col-md-6 col-sm-4 col-6 mb-1">
          <CharacteristicCell characteristic={ character.APP } {...{availableValues, onValueSelected}} />
        </div>
        <div className="col-xl-4 col-md-6 col-sm-4 col-6 mb-1">
          <CharacteristicCell characteristic={ character.POW } {...{availableValues, onValueSelected}} />
        </div>
        <div className="col-xl-4 col-md-6 col-sm-4 col-6 mb-1">
          <CharacteristicCell characteristic={ character.SIZ } {...{availableValues, onValueSelected}} />
        </div>
        <div className="col-xl-4 col-md-6 col-sm-4 col-6 mb-1">
          <CharacteristicCell characteristic={ character.EDU } {...{availableValues, onValueSelected}} />
        </div>
      </div>
    </>
  )
}

function Attributes({ character, attributes }) {
  const { language } = useContext(LanguageContext);
  return (
    <div className="row">
      <div className="col-xl-3 col-6">
      <table className="table table-borderless text-center align-middle">
          <tbody>
              <tr>
                <th>{ character.HP.name[language] || character.HP.name["en"] }</th>
                <td className="border">{ attributes.HP.value }/{ attributes.HP.maxValue }</td>
              </tr>
          </tbody>
        </table>
      </div>
      <div className="col-xl-3 col-6">
      <table className="table table-borderless text-center align-middle">
          <tbody>
              <tr>
                <th>{ character.San.name[language] || character.San.name["en"] }</th>
                <td className="border">{ attributes.San.value }/{ attributes.San.maxValue }</td>
              </tr>
          </tbody>
        </table>
      </div>
      <div className="col-xl-3 col-6">
      <table className="table table-borderless text-center align-middle">
          <tbody>
              <tr>
                <th>{ character.Luck.name[language] || character.Luck.name["en"] }</th>
                <td className="border">{ attributes.Luck.value }</td>
              </tr>
          </tbody>
        </table>
      </div>
      <div className="col-xl-3 col-6">
        <table className="table table-borderless text-center align-middle">
          <tbody>
              <tr>
                <th>{ character.MP.name[language] || character.MP.name["en"] }</th>
                <td className="border">{ attributes.MP.value }/{ attributes.MP.maxValue }</td>
              </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Skills({ character }) {
  const { language } = useContext(LanguageContext);
  return (
    <>
      <h4 className="text-center">{ skillsTitle[language] || skillsTitle["en"] }</h4>
      <div className="row">
        <div className="col-xl-3 col-6 order-1 vstack gap-1 px-1">
          <SkillCell skill={ character.skills.accounting } />
          <SkillCell skill={ character.skills.anthropology } />
          <SkillCell skill={ character.skills.appraise } />
          <SkillCell skill={ character.skills.archaeology } />
          <SkillCell skill={ character.skills.group_art } />
          <SkillCell skill={ character.skills.photography } />
          <SkillCell skill={ character.skills.custom_art1 } />
          <SkillCell skill={ character.skills.custom_art2 } />
          <SkillCell skill={ character.skills.charm } />
          <SkillCell skill={ character.skills.climb } />
          <SkillCell skill={ character.skills.credit } />
          <SkillCell skill={ character.skills.cthulhu } />
          <SkillCell skill={ character.skills.disguise } />
          <SkillCell skill={ character.skills.dodge } />
          <SkillCell skill={ character.skills.drive } />
          <SkillCell skill={ character.skills.elec_repair } />
        </div>
        <div className="col-xl-3 col-6 order-3 order-xl-2 vstack gap-1 px-1">
          <SkillCell skill={ character.skills.fast_talk } />
          <SkillCell skill={ character.skills.fighting } />
          <SkillCell skill={ character.skills.custom_fight1 } />
          <SkillCell skill={ character.skills.custom_fight2 } />
          <SkillCell skill={ character.skills.firearms_handgun } />
          <SkillCell skill={ character.skills.firearms_rifle } />
          <SkillCell skill={ character.skills.custom_firearms } />
          <SkillCell skill={ character.skills.first_aid } />
          <SkillCell skill={ character.skills.history } />
          <SkillCell skill={ character.skills.intimidate } />
          <SkillCell skill={ character.skills.jump } />
          <SkillCell skill={ character.skills.group_lang } />
          <SkillCell skill={ character.skills.latin } />
          <SkillCell skill={ character.skills.custom_lang1 } />
          <SkillCell skill={ character.skills.custom_lang2 } />
          <SkillCell skill={ character.skills.group_lang_own } />
          <SkillCell skill={ character.skills.lang_own } />
        </div>
        <div className="col-xl-3 col-6 order-2 order-xl-3 vstack gap-1 px-1">
          <SkillCell skill={ character.skills.law } />
          <SkillCell skill={ character.skills.library } />
          <SkillCell skill={ character.skills.listen } />
          <SkillCell skill={ character.skills.locksmith } />
          <SkillCell skill={ character.skills.mech_repair } />
          <SkillCell skill={ character.skills.medicine } />
          <SkillCell skill={ character.skills.nature } />
          <SkillCell skill={ character.skills.navigate } />
          <SkillCell skill={ character.skills.occult } />
          <SkillCell skill={ character.skills.op_machine } />
          <SkillCell skill={ character.skills.persuade } />
          <SkillCell skill={ character.skills.group_pilot } />
          <SkillCell skill={ character.skills.custom_pilot } />
          <SkillCell skill={ character.skills.psychology } />
          <SkillCell skill={ character.skills.psychoanalysis } />
          <SkillCell skill={ character.skills.ride } />
        </div>
        <div className="col-xl-3 col-6 order-4 vstack gap-1 px-1">
          <SkillCell skill={ character.skills.group_sci } />
          <SkillCell skill={ character.skills.biology } />
          <SkillCell skill={ character.skills.pharmacy } />
          <SkillCell skill={ character.skills.custom_sci } />
          <SkillCell skill={ character.skills.sleight } />
          <SkillCell skill={ character.skills.spot } />
          <SkillCell skill={ character.skills.stealth } />
          <SkillCell skill={ character.skills.group_survival } />
          <SkillCell skill={ character.skills.custom_survival } />
          <SkillCell skill={ character.skills.swim } />
          <SkillCell skill={ character.skills.throw } />
          <SkillCell skill={ character.skills.track } />
          <SkillCell skill={ character.skills.custom_unused1 } />
          <SkillCell skill={ character.skills.custom_unused2 } />
          <SkillCell skill={ character.skills.custom_unused3 } />
          <SkillCell skill={ character.skills.custom_unused4 } />
          <SkillCell skill={ character.skills.custom_unused5 } />
        </div>
      </div>
    </>
  )
}

export default function Character({ character, attributes, onCharacterAction }) {
  // console.log(`Character refresh: ${JSON.stringify(character)}`);
  console.log(`Character refresh`);

  return (
    <div className="d-flex flex-column ms-2">
      <div className="row">
        <div className="col-lg-3">
          <Info />
        </div>
        <div className="col">
          <Characteristics {...{ character, onCharacterAction }} />
        </div>
      </div>
      <br />
      <Attributes {...{ character, attributes }} />
      <Skills {...{ character }} />
    </div>
  )
}