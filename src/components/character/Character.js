import { useState, useEffect, useRef, useContext } from "react";
import { LanguageContext } from '../../App';
import { FlagsContext } from "../Game";
import CharacteristicCell from './CharacteristicCell';
import SkillCell from "./SkillCell";

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

function CharacteristicsTable({ characterSheet, chars, isEditable, availableValues = [], onValueSelected = () => {} }) {
  const { language } = useContext(LanguageContext);

  return (
    <>
      <h5 className="">
        {characterSheet.characteristicsTitle[language] || characterSheet.characteristicsTitle["en"]}
      </h5>
      <div className="row">
        <div className="col-md-4 col-6 mb-1 px-1">
          <CharacteristicCell char={chars.STR} {...{ characterSheet, isEditable, availableValues, onValueSelected }} />
        </div>
        <div className="col-md-4 col-6 mb-1 px-1">
          <CharacteristicCell char={chars.DEX} {...{ characterSheet, isEditable, availableValues, onValueSelected }} />
        </div>
        <div className="col-md-4 col-6 mb-1 px-1">
          <CharacteristicCell char={chars.INT} {...{ characterSheet, isEditable, availableValues, onValueSelected }} />
        </div>
        <div className="col-md-4 col-6 mb-1 px-1">
          <CharacteristicCell char={chars.CON} {...{ characterSheet, isEditable, availableValues, onValueSelected }} />
        </div>
        <div className="col-md-4 col-6 mb-1 px-1">
          <CharacteristicCell char={chars.APP} {...{ characterSheet, isEditable, availableValues, onValueSelected }} />
        </div>
        <div className="col-md-4 col-6 mb-1 px-1">
          <CharacteristicCell char={chars.POW} {...{ characterSheet, isEditable, availableValues, onValueSelected }} />
        </div>
        <div className="col-md-4 col-6 mb-1 px-1">
          <CharacteristicCell char={chars.SIZ} {...{ characterSheet, isEditable, availableValues, onValueSelected }} />
        </div>
        <div className="col-md-4 col-6 mb-1 px-1">
          <CharacteristicCell char={chars.EDU} {...{ characterSheet, isEditable, availableValues, onValueSelected }} />
        </div>
      </div>
    </>
  );
}

function CharacteristicsEditable({ characterSheet, chars, onCharacterAction }) {
  const isEditable = true;
  const initValues = [80, 70, 60, 60, 50, 50, 50, 40];
  Object.values(chars).forEach(item => {
    const index = initValues.indexOf(item.value);
    if (index !== -1) {
      initValues.splice(index, 1)
    }
  });
  const [availableValues, setAvailableValues] = useState(initValues);
  const finishedRef = useRef(false);

  useEffect(() => {
    // console.log(`availableValues length: ${availableValues.length}`);
    const isFinished = availableValues.length === 0;
    if (isFinished !== finishedRef.current) {
      finishedRef.current = isFinished;
      onCharacterAction("action_set_flag", { flag: "flag_characteristics_unfinished", value: !isFinished });
    }
  }, [availableValues]);

  function onValueSelected(key, value) {
    const characteristic = chars[key];
    const index = availableValues.indexOf(value);
    if (index !== -1) {
      availableValues.splice(index, 1)
    }
    if (characteristic.value) {
      availableValues.push(characteristic.value);
      availableValues.sort((a, b) => b - a);
    }
    characteristic.value = value;
    setAvailableValues([...availableValues]);
  }
  
  return <CharacteristicsTable {...{ characterSheet, chars, isEditable, availableValues, onValueSelected }} />;
}

function Characteristics({ characterSheet, chars, onCharacterAction }) {
  const { flagConditionCheck } = useContext(FlagsContext);
  const isEditable = flagConditionCheck("flag_characteristics_editable");

  if (!isEditable) {
    return <CharacteristicsTable {...{ characterSheet, chars, isEditable }} />;
  }
  return <CharacteristicsEditable {...{ characterSheet, chars, onCharacterAction }} />;
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

function SkillsTable({ characterSheet, skills, isEditable, availableValues, onValueSelected }) {
  const { language } = useContext(LanguageContext);

  return (
    <>
      <h5 className="">
        { characterSheet.skillsTitle[language] || characterSheet.skillsTitle["en"] }
      </h5>
      <div className="row">
        <div className="col-xl-3 col-6 order-1 vstack gap-1 px-1">
          <SkillCell skillKey={ "accounting" } {...{ characterSheet, skills, isEditable, availableValues, onValueSelected }} />
          <SkillCell skillKey={ "anthropology" } {...{ characterSheet, skills, isEditable, availableValues, onValueSelected }} />
          <SkillCell skillKey={ "appraise" } {...{ characterSheet, skills, isEditable, availableValues, onValueSelected }} />
          <SkillCell skillKey={ "archaeology" } {...{ characterSheet, skills, isEditable, availableValues, onValueSelected }} />
          <SkillCell skillKey={ "group_art" } {...{ characterSheet, skills, isEditable, availableValues, onValueSelected }} />
          <SkillCell skillKey={ "photography" } {...{ characterSheet, skills, isEditable, availableValues, onValueSelected }} />
          <SkillCell skillKey={ "custom_art1" } {...{ characterSheet, skills, isEditable, availableValues, onValueSelected }} />
          <SkillCell skillKey={ "custom_art2" } {...{ characterSheet, skills, isEditable, availableValues, onValueSelected }} />
          <SkillCell skillKey={ "charm" } {...{ characterSheet, skills, isEditable, availableValues, onValueSelected }} />
          <SkillCell skillKey={ "climb" } {...{ characterSheet, skills, isEditable, availableValues, onValueSelected }} />
          <SkillCell skillKey={ "credit" } {...{ characterSheet, skills, isEditable, availableValues, onValueSelected }} />
          <SkillCell skillKey={ "cthulhu" } {...{ characterSheet, skills, isEditable, availableValues, onValueSelected }} />
          <SkillCell skillKey={ "disguise" } {...{ characterSheet, skills, isEditable, availableValues, onValueSelected }} />
          <SkillCell skillKey={ "dodge" } {...{ characterSheet, skills, isEditable, availableValues, onValueSelected }} />
          <SkillCell skillKey={ "drive" } {...{ characterSheet, skills, isEditable, availableValues, onValueSelected }} />
          <SkillCell skillKey={ "elec_repair" } {...{ characterSheet, skills, isEditable, availableValues, onValueSelected }} />
        </div>
        <div className="col-xl-3 col-6 order-3 order-xl-2 vstack gap-1 px-1">
          <SkillCell skillKey={ "fast_talk" } {...{ characterSheet, skills, isEditable, availableValues, onValueSelected }} />
          <SkillCell skillKey={ "fighting" } {...{ characterSheet, skills, isEditable, availableValues, onValueSelected }} />
          <SkillCell skillKey={ "custom_fight1" } {...{ characterSheet, skills, isEditable, availableValues, onValueSelected }} />
          <SkillCell skillKey={ "custom_fight2" } {...{ characterSheet, skills, isEditable, availableValues, onValueSelected }} />
          <SkillCell skillKey={ "firearms_handgun" } {...{ characterSheet, skills, isEditable, availableValues, onValueSelected }} />
          <SkillCell skillKey={ "firearms_rifle" } {...{ characterSheet, skills, isEditable, availableValues, onValueSelected }} />
          <SkillCell skillKey={ "custom_firearms" } {...{ characterSheet, skills, isEditable, availableValues, onValueSelected }} />
          <SkillCell skillKey={ "first_aid" } {...{ characterSheet, skills, isEditable, availableValues, onValueSelected }} />
          <SkillCell skillKey={ "history" } {...{ characterSheet, skills, isEditable, availableValues, onValueSelected }} />
          <SkillCell skillKey={ "intimidate" } {...{ characterSheet, skills, isEditable, availableValues, onValueSelected }} />
          <SkillCell skillKey={ "jump" } {...{ characterSheet, skills, isEditable, availableValues, onValueSelected }} />
          <SkillCell skillKey={ "group_lang" } {...{ characterSheet, skills, isEditable, availableValues, onValueSelected }} />
          <SkillCell skillKey={ "latin" } {...{ characterSheet, skills, isEditable, availableValues, onValueSelected }} />
          <SkillCell skillKey={ "custom_lang1" } {...{ characterSheet, skills, isEditable, availableValues, onValueSelected }} />
          <SkillCell skillKey={ "custom_lang2" } {...{ characterSheet, skills, isEditable, availableValues, onValueSelected }} />
          <SkillCell skillKey={ "group_lang_own" } {...{ characterSheet, skills, isEditable, availableValues, onValueSelected }} />
          <SkillCell skillKey={ "lang_own" } {...{ characterSheet, skills, isEditable, availableValues, onValueSelected }} />
        </div>
        <div className="col-xl-3 col-6 order-2 order-xl-3 vstack gap-1 px-1">
          <SkillCell skillKey={ "law" } {...{ characterSheet, skills, isEditable, availableValues, onValueSelected }} />
          <SkillCell skillKey={ "library" } {...{ characterSheet, skills, isEditable, availableValues, onValueSelected }} />
          <SkillCell skillKey={ "listen" } {...{ characterSheet, skills, isEditable, availableValues, onValueSelected }} />
          <SkillCell skillKey={ "locksmith" } {...{ characterSheet, skills, isEditable, availableValues, onValueSelected }} />
          <SkillCell skillKey={ "mech_repair" } {...{ characterSheet, skills, isEditable, availableValues, onValueSelected }} />
          <SkillCell skillKey={ "medicine" } {...{ characterSheet, skills, isEditable, availableValues, onValueSelected }} />
          <SkillCell skillKey={ "nature" } {...{ characterSheet, skills, isEditable, availableValues, onValueSelected }} />
          <SkillCell skillKey={ "navigate" } {...{ characterSheet, skills, isEditable, availableValues, onValueSelected }} />
          <SkillCell skillKey={ "occult" } {...{ characterSheet, skills, isEditable, availableValues, onValueSelected }} />
          <SkillCell skillKey={ "op_machine" } {...{ characterSheet, skills, isEditable, availableValues, onValueSelected }} />
          <SkillCell skillKey={ "persuade" } {...{ characterSheet, skills, isEditable, availableValues, onValueSelected }} />
          <SkillCell skillKey={ "group_pilot" } {...{ characterSheet, skills, isEditable, availableValues, onValueSelected }} />
          <SkillCell skillKey={ "custom_pilot" } {...{ characterSheet, skills, isEditable, availableValues, onValueSelected }} />
          <SkillCell skillKey={ "psychology" } {...{ characterSheet, skills, isEditable, availableValues, onValueSelected }} />
          <SkillCell skillKey={ "psychoanalysis" } {...{ characterSheet, skills, isEditable, availableValues, onValueSelected }} />
          <SkillCell skillKey={ "ride" } {...{ characterSheet, skills, isEditable, availableValues, onValueSelected }} />
        </div>
        <div className="col-xl-3 col-6 order-4 vstack gap-1 px-1">
          <SkillCell skillKey={ "group_sci" } {...{ characterSheet, skills, isEditable, availableValues, onValueSelected }} />
          <SkillCell skillKey={ "biology" } {...{ characterSheet, skills, isEditable, availableValues, onValueSelected }} />
          <SkillCell skillKey={ "pharmacy" } {...{ characterSheet, skills, isEditable, availableValues, onValueSelected }} />
          <SkillCell skillKey={ "custom_sci" } {...{ characterSheet, skills, isEditable, availableValues, onValueSelected }} />
          <SkillCell skillKey={ "sleight" } {...{ characterSheet, skills, isEditable, availableValues, onValueSelected }} />
          <SkillCell skillKey={ "spot" } {...{ characterSheet, skills, isEditable, availableValues, onValueSelected }} />
          <SkillCell skillKey={ "stealth" } {...{ characterSheet, skills, isEditable, availableValues, onValueSelected }} />
          <SkillCell skillKey={ "group_survival" } {...{ characterSheet, skills, isEditable, availableValues, onValueSelected }} />
          <SkillCell skillKey={ "custom_survival" } {...{ characterSheet, skills, isEditable, availableValues, onValueSelected }} />
          <SkillCell skillKey={ "swim" } {...{ characterSheet, skills, isEditable, availableValues, onValueSelected }} />
          <SkillCell skillKey={ "throw" } {...{ characterSheet, skills, isEditable, availableValues, onValueSelected }} />
          <SkillCell skillKey={ "track" } {...{ characterSheet, skills, isEditable, availableValues, onValueSelected }} />
          <SkillCell skillKey={ "custom_unused1" } {...{ characterSheet, skills, isEditable, availableValues, onValueSelected }} />
          <SkillCell skillKey={ "custom_unused2" } {...{ characterSheet, skills, isEditable, availableValues, onValueSelected }} />
          <SkillCell skillKey={ "custom_unused3" } {...{ characterSheet, skills, isEditable, availableValues, onValueSelected }} />
          <SkillCell skillKey={ "custom_unused4" } {...{ characterSheet, skills, isEditable, availableValues, onValueSelected }} />
          <SkillCell skillKey={ "custom_unused5" } {...{ characterSheet, skills, isEditable, availableValues, onValueSelected }} />
        </div>
      </div>
    </>
  )
}

function SkillsEditable({ characterSheet, skills, onCharacterAction }) {
  const isEditable = true;
  const initValues = [70, 60, 60, 50, 50, 50, 40, 40];
  const [availableValues, setAvailableValues] = useState(initValues);
  const finishedRef = useRef(false);

  useEffect(() => {
    // console.log(`availableValues length: ${availableValues.length}`);
    const isFinished = availableValues.length === 0;
    if (isFinished !== finishedRef.current) {
      finishedRef.current = isFinished;
      onCharacterAction("action_set_flag", { flag: "flag_skills1_unfinished", value: !isFinished });
    }
  }, [availableValues]);

  function onValueSelected(key, value) {
    const skill = skills[key];
    const index = availableValues.indexOf(value);
    if (index !== -1) {
      availableValues.splice(index, 1)
    }
    if (skill.value) {
      availableValues.push(skill.value);
      availableValues.sort((a, b) => b - a);
    }
    skill.value = value;
    setAvailableValues([...availableValues]);
  }

  return <SkillsTable {...{ characterSheet, skills, isEditable, availableValues, onValueSelected }} />;
}

function Skills({ characterSheet, skills, onCharacterAction }) {
  const { flagConditionCheck } = useContext(FlagsContext);
  const isEditable = flagConditionCheck("flag_skills_editable");

  if (!isEditable) {
    return <SkillsTable {...{ characterSheet, skills, isEditable }} />;
  }
  return <SkillsEditable {...{ characterSheet, skills, onCharacterAction }} />;
}

export default function Character({ characterSheet, chars, attributes, skills, occupation, onCharacterAction }) {
  // console.log(`Character refresh: ${JSON.stringify(character)}`);
  console.log(`Character refresh`);

  return (
    <div className="d-flex flex-column ms-2">
      <div className="row">
        <div className="col-xl-3">
          <Info {...{ characterSheet, occupation }} />
        </div>
        <div className="col mb-3">
          <Characteristics {...{ characterSheet, chars, onCharacterAction }} />
        </div>
      </div>
      <Attributes {...{ characterSheet, attributes }} />
      <Skills {...{ characterSheet, skills, onCharacterAction }} />
    </div>
  )
}