import { useState, useContext } from "react";
import { LanguageContext } from '../../App';
import { FlagsContext } from "../Game";
import SkillCell from "./SkillCell";

export const artSkills = ["photography", "custom_art1", "custom_art2"];
export const interpersonalSkills = ["charm", "fast_talk", "intimidate", "persuade"];
export const languageSkills = ["latin", "custom_lang1", "custom_lang2"];

export default function Skills({ characterSheet, skills, setSkills, occupation, onCharacterAction }) {
  const { language } = useContext(LanguageContext);
  const { flagConditionCheck } = useContext(FlagsContext);
  const isEditable = flagConditionCheck("flag_skills_editable");
  const isEditingPhase2 = flagConditionCheck("flag_skills_editing_phase_2");

  return (
    <div className="row">
      <div className="col px-0">
        <div className="card">
          <h6 className="card-header">
            {characterSheet.skillsTitle[language] || characterSheet.skillsTitle["en"]}
          </h6>
          {isEditable
            ? (isEditingPhase2
              ? <SkillsEditableForHobby {...{ characterSheet, skills, setSkills, onCharacterAction }} />
              : <SkillsEditableForOccupation {...{ characterSheet, skills, setSkills, occupation, onCharacterAction }} />)
            : <SkillsTable {...{ characterSheet, skills, isEditable }} />}
        </div>
      </div>
    </div>
  );
}

function SkillsEditableForOccupation({ characterSheet, skills, setSkills, occupation, onCharacterAction }) {
  const isEditable = true;
  const initAvailableValues = [70, 60, 60, 50, 50, 50, 40, 40];
  const initAvailableSkills = {
    ...occupation.skills.reduce((acc, skillKey) => ({ ...acc, [skillKey]: 1 }), {}),
    art: occupation.art,
    language: occupation.language,
    interpersonal: occupation.interpersonal,
    universal: occupation.universal,
  };
  
  const selectedSkills = Object.keys(skills).filter(skillKey => skills[skillKey].occupation);
  if (selectedSkills.length > initAvailableValues.length) {
    console.error(`Selected skills number is larger than available values number. Selected: ${selectedSkills}`);
  }
  selectedSkills.forEach(skillKey => {
    const index = initAvailableValues.indexOf(skills[skillKey].value);
    if (index !== -1) {
      initAvailableValues.splice(index, 1);
    } else {
      console.error(`Cannot find ${skillKey} value ${skills[skillKey].value} in available values ${initAvailableValues}`);
    }

    if (occupation.skills.includes(skillKey)) {
      initAvailableSkills[skillKey] = 0;
    } else if (artSkills.includes(skillKey)) {
      if (initAvailableSkills.art <= 0) {
        console.error(`Art skill point is not enough when removing ${skillKey} from ${JSON.stringify(initAvailableSkills)}`);
      }
      initAvailableSkills.art -= 1;
    } else if (languageSkills.includes(skillKey)) {
      if (initAvailableSkills.language <= 0) {
        console.error(`Language skill point is not enough when removing ${skillKey} from ${JSON.stringify(initAvailableSkills)}`);
      }
      initAvailableSkills.language -= 1;
    } else if (interpersonalSkills.includes(skillKey)) {
      if (initAvailableSkills.interpersonal <= 0) {
        console.error(`Interpersonal skill point is not enough when removing ${skillKey} from ${JSON.stringify(initAvailableSkills)}`);
      }
      initAvailableSkills.interpersonal -= 1;
    } else {
      if (initAvailableSkills.universal <= 0) {
        console.error(`Universal skill point is not enough when removing ${skillKey} from ${JSON.stringify(initAvailableSkills)}`);
      }
      initAvailableSkills.universal -= 1;
    }
  });

  const [availableValues, setAvailableValues] = useState(initAvailableValues);
  const [availableSkills, setAvailableSkills] = useState(initAvailableSkills);
  const [lockUnused, setLockUnused] = useState(false);

  function toggleLockUnused() {
    // tuidian
    setLockUnused(!lockUnused);
  }

  function onValueSelected(key, newValue) {
    const baseValue = skills[key].baseValue;
    const curValue = skills[key].value;
    const fromBase = baseValue === curValue;
    const toBase = baseValue === newValue;

    if (fromBase && toBase) {
      console.error(`Skill ${key} should not trigger onValueSelevted with the same value`);
      return
    }

    const availableValuesCopy = [...availableValues];

    // Case 1, selected skill change to another value
    if (!fromBase && !toBase) {
      // No change to availableSkills and selectedSkills, just change values
      const index = availableValuesCopy.indexOf(newValue);
      if (index !== -1) {
        availableValuesCopy.splice(index, 1);
      } else {
        console.error(`${key} desired value ${newValue} is not a valid value in availableValues ${availableValuesCopy} - case 1`);
      }
      availableValuesCopy.push(curValue);
      availableValuesCopy.sort((a, b) => b - a);

      setSkills({ ...skills, [key]: { ...skills[key], value: newValue } });
      setAvailableValues(availableValuesCopy);
      return;
    }

    const availableSkillsCopy = { ...availableSkills };

    // Case 2, selected skill change to baseValue
    if (toBase) {
      // (1) recover the skill point in availableSkills; 
      // (2) remove skill from selectedSkills;
      // (3) put the value back to availableValues.
      // (4) set finish flag if needed
      if (occupation.skills.includes(key)) {
        if (availableSkillsCopy[key] !== 0) {
          console.error(`Occupation skill ${key} is not 0 before reset`);
        }
        availableSkillsCopy[key] = 1;
      } else if (artSkills.includes(key)) {
        const selectedArtSkillsNum = selectedSkills.filter(skillKey => artSkills.includes(skillKey)).length;
        if (selectedArtSkillsNum > occupation.art) {
          availableSkillsCopy.universal += 1;
        } else {
          availableSkillsCopy.art += 1;
        }
      } else if (languageSkills.includes(key)) {
        const selectedLangSkillsNum = selectedSkills.filter(skillKey => languageSkills.includes(skillKey)).length;
        if (selectedLangSkillsNum > occupation.language) {
          availableSkillsCopy.universal += 1;
        } else {
          availableSkillsCopy.language += 1;
        }
      } else if (interpersonalSkills.includes(key)) {
        const selectedInterpersonalSkillsNum = selectedSkills.filter(skillKey => interpersonalSkills.includes(skillKey)).length;
        if (selectedInterpersonalSkillsNum > occupation.interpersonal) {
          availableSkillsCopy.universal += 1;
        } else {
          availableSkillsCopy.interpersonal += 1;
        }
      } else {
        availableSkillsCopy.universal += 1;
      }
      if (availableSkillsCopy.art > occupation.art 
        || availableSkillsCopy.language > occupation.language 
        || availableSkillsCopy.interpersonal > occupation.interpersonal 
        || availableSkillsCopy.universal > occupation.universal) {
        console.error(`Available skills point is larger than occupation point ${JSON.stringify(availableSkillsCopy)} vs ${JSON.stringify(occupation)}`);
      }

      const index = selectedSkills.indexOf(key);
      if (index !== -1) {
        selectedSkills.splice(index, 1);
      } else {
        console.error(`Selected skill ${key}: ${curValue} is not in selectedSkills ${selectedSkills} - case 2`);
      }
      availableValuesCopy.push(curValue);
      availableValuesCopy.sort((a, b) => b - a);

      setSkills({ ...skills, [key]: { ...skills[key], value: newValue, occupation: false } });
      setAvailableValues(availableValuesCopy);
      setAvailableSkills(availableSkillsCopy);

      onCharacterAction("action_set_flag", { flag: "flag_skills1_unfinished", value: true });
      return;
    }

    // Case 3, unselected skill change to a new value
    // fromBase === true
    // (1) check if having enough skill point, then consume point;
    // (2) add skill to selectedSkills
    // (3) remove the value from availableValues
    // (4) set finish flag if needed
    if (occupation.skills.includes(key)) {
      if (availableSkillsCopy[key] === 0) {
        console.error(`Occupation skill ${key} is 0 before select`);
      }
      availableSkillsCopy[key] = 0;
    } else if (artSkills.includes(key)) {
      if (availableSkillsCopy.art > 0) {
        availableSkillsCopy.art -= 1;
      } else if (availableSkillsCopy.universal > 0) {
        availableSkillsCopy.universal -= 1;
      } else {
        console.log(`Cannot select this, key: ${key} availableSkillsCopy: ${JSON.stringify(availableSkillsCopy)}`);
        return;
      }
    } else if (languageSkills.includes(key)) {
      if (availableSkillsCopy.language > 0) {
        availableSkillsCopy.language -= 1;
      } else if (availableSkillsCopy.universal > 0) {
        availableSkillsCopy.universal -= 1;
      } else {
        console.log(`Cannot select this, key: ${key} availableSkillsCopy: ${JSON.stringify(availableSkillsCopy)}`);
        return;
      }
    } else if (interpersonalSkills.includes(key)) {
      if (availableSkillsCopy.interpersonal > 0) {
        availableSkillsCopy.interpersonal -= 1;
      } else if (availableSkillsCopy.universal > 0) {
        availableSkillsCopy.universal -= 1;
      } else {
        console.log(`Cannot select this, key: ${key} availableSkillsCopy: ${JSON.stringify(availableSkillsCopy)}`);
        return;
      }
    } else if (availableSkillsCopy.universal > 0) {
      availableSkillsCopy.universal -= 1;
    } else {
      console.log(`Cannot select this, key: ${key} availableSkillsCopy: ${JSON.stringify(availableSkillsCopy)}`);
      return;
    }

    selectedSkills.push(key);
    const index = availableValuesCopy.indexOf(newValue);
    if (index !== -1) {
        availableValuesCopy.splice(index, 1)
    } else {
      console.error(`${key} desired value ${newValue} is not a valid value in availableValues ${availableValuesCopy} - case 3`);
    }

    setSkills({ ...skills, [key]: { ...skills[key], value: newValue, occupation: true } });
    setAvailableValues(availableValuesCopy);
    setAvailableSkills(availableSkillsCopy);

    if (availableValuesCopy.length === 0) {
      onCharacterAction("action_set_flag", { flag: "flag_skills1_unfinished", value: false });
    }
  }

  return (
    <>
      <div className="card-header">
        <div className="d-flex flex-wrap">
          { occupation.skills.map((skill, i) => <OccupationSkill key={skill} skillKey={skill} {...{characterSheet, availableSkills }} />) }
          { occupation.art > 0 ? <OccupationSkill skillKey={"art"} {...{characterSheet, availableSkills }} /> : null }
          { occupation.language > 0 ? <OccupationSkill skillKey={"language"} {...{characterSheet, availableSkills}} /> : null }
          { occupation.interpersonal > 0 ? <OccupationSkill skillKey={"interpersonal"} {...{characterSheet, availableSkills}} /> : null }
          { occupation.universal > 0 ? <OccupationSkill skillKey={"universal"} {...{characterSheet, availableSkills}} /> : null }
          <button className="btn btn-sm btn-secondary ms-auto" onClick={toggleLockUnused}>hide</button>
        </div>
      </div>
      <SkillsTable {...{ characterSheet, skills, isEditable, lockUnused, availableValues, availableSkills, onValueSelected }} />
    </>
  );
}

function SkillsEditableForHobby({ characterSheet, skills, setSkills, onCharacterAction }) {
}

function OccupationSkill({ skillKey, characterSheet, availableSkills }) {
  const { language } = useContext(LanguageContext);
  let text, selected;
  switch (skillKey) {
    case "art":
      text = characterSheet.skills.group_art.name;
      selected = availableSkills.art === 0;
      return (
        <div className={ "ms-3" + (selected ? " text-body-tertiary" : "") }>
          { text[language] || text["en"] }
          <span className={ "badge" + (selected ? " text-body-tertiary" : " text-bg-light") }>{ availableSkills.art }</span>
        </div>
      );
    case "language":
      text = characterSheet.skills.group_lang.name;
      selected = availableSkills.language === 0;
      return (
        <div className={ "ms-3" + (selected ? " text-body-tertiary" : "") }>
          { text[language] }
          <span className={ "badge" + (selected ? " text-body-tertiary" : " text-bg-light") }>{ availableSkills.language }</span>
        </div>
      );
    case "interpersonal":
      text = {
        zh: `${interpersonalSkills.map(key => characterSheet.skills[key].name.zh).join("、")}其中一项`,
        en: `One of either ${
          interpersonalSkills
            .slice(0, -1)
            .map(key => characterSheet.skills[key].name.en)
            .join(", ")
            .concat(", or ")
            .concat(characterSheet.skills[interpersonalSkills[interpersonalSkills.length - 1]].name.en)
        }`,
      };
      selected = availableSkills.interpersonal === 0;
      return (
        <div className={ "ms-3" + (selected ? " text-body-tertiary" : "") }>
          { text[language] }
          <span className={ "badge" + (selected ? " text-body-tertiary" : " text-bg-light") }>{ availableSkills.interpersonal }</span>
        </div>
      );
    case "universal":
      text = { zh: "任意", en: "Any", };
      selected = availableSkills.universal === 0;
      return (
        <div className={ "ms-3" + (selected ? " text-body-tertiary" : "") }>
          { text[language] }
          <span className={ "badge" + (selected ? " text-body-tertiary" : " text-bg-light") }>{ availableSkills.universal }</span>
        </div>
      );
    case "lang_own":
      text = characterSheet.skills.group_lang_own.name;
      selected = availableSkills[skillKey] === 0;
      return <div className={ "ms-3" + (selected ? " text-body-tertiary" : "") }>{ text[language] || text["en"] }</div>
    default:
      text = characterSheet.skills[skillKey].name;
      selected = availableSkills[skillKey] === 0;
      return <div className={ "ms-3" + (selected ? " text-body-tertiary" : "") }>{ text[language] || text["en"] }</div>;
  };
}

function SkillsTable({ characterSheet, skills, isEditable, lockUnused, availableValues, availableSkills, onValueSelected }) {
  return (
    <div className="card-body">
      <div className="row">
        <div className="col-xl-3 col-6 order-1 vstack gap-1 px-1">
          <SkillCell skillKey={ "accounting" }       {...{ characterSheet, skills, isEditable, lockUnused, availableValues, availableSkills, onValueSelected }} />
          <SkillCell skillKey={ "anthropology" }     {...{ characterSheet, skills, isEditable, lockUnused, availableValues, availableSkills, onValueSelected }} />
          <SkillCell skillKey={ "appraise" }         {...{ characterSheet, skills, isEditable, lockUnused, availableValues, availableSkills, onValueSelected }} />
          <SkillCell skillKey={ "archaeology" }      {...{ characterSheet, skills, isEditable, lockUnused, availableValues, availableSkills, onValueSelected }} />
          <SkillCell skillKey={ "group_art" }        {...{ characterSheet }} />
          <SkillCell skillKey={ "photography" }      {...{ characterSheet, skills, isEditable, lockUnused, availableValues, availableSkills, onValueSelected }} />
          <SkillCell skillKey={ "custom_art1" }      {...{ characterSheet, skills, isEditable, lockUnused, availableValues, availableSkills, onValueSelected }} />
          <SkillCell skillKey={ "custom_art2" }      {...{ characterSheet, skills, isEditable, lockUnused, availableValues, availableSkills, onValueSelected }} />
          <SkillCell skillKey={ "charm" }            {...{ characterSheet, skills, isEditable, lockUnused, availableValues, availableSkills, onValueSelected }} />
          <SkillCell skillKey={ "climb" }            {...{ characterSheet, skills, isEditable, lockUnused, availableValues, availableSkills, onValueSelected }} />
          <SkillCell skillKey={ "credit" }           {...{ characterSheet, skills, isEditable, lockUnused, availableValues, availableSkills, onValueSelected }} />
          <SkillCell skillKey={ "cthulhu" }          isEditable={false} {...{ characterSheet, skills, lockUnused }} />
          <SkillCell skillKey={ "disguise" }         {...{ characterSheet, skills, isEditable, lockUnused, availableValues, availableSkills, onValueSelected }} />
          <SkillCell skillKey={ "dodge" }            {...{ characterSheet, skills, isEditable, lockUnused, availableValues, availableSkills, onValueSelected }} />
          <SkillCell skillKey={ "drive" }            {...{ characterSheet, skills, isEditable, lockUnused, availableValues, availableSkills, onValueSelected }} />
          <SkillCell skillKey={ "elec_repair" }      {...{ characterSheet, skills, isEditable, lockUnused, availableValues, availableSkills, onValueSelected }} />
        </div>
        <div className="col-xl-3 col-6 order-3 order-xl-2 vstack gap-1 px-1">
          <SkillCell skillKey={ "fast_talk" }        {...{ characterSheet, skills, isEditable, lockUnused, availableValues, availableSkills, onValueSelected }} />
          <SkillCell skillKey={ "fighting" }         {...{ characterSheet, skills, isEditable, lockUnused, availableValues, availableSkills, onValueSelected }} />
          <SkillCell skillKey={ "custom_fight1" }    {...{ characterSheet, skills, isEditable, lockUnused, availableValues, availableSkills, onValueSelected }} />
          <SkillCell skillKey={ "custom_fight2" }    {...{ characterSheet, skills, isEditable, lockUnused, availableValues, availableSkills, onValueSelected }} />
          <SkillCell skillKey={ "firearms_handgun" } {...{ characterSheet, skills, isEditable, lockUnused, availableValues, availableSkills, onValueSelected }} />
          <SkillCell skillKey={ "firearms_rifle" }   {...{ characterSheet, skills, isEditable, lockUnused, availableValues, availableSkills, onValueSelected }} />
          <SkillCell skillKey={ "custom_firearms" }  {...{ characterSheet, skills, isEditable, lockUnused, availableValues, availableSkills, onValueSelected }} />
          <SkillCell skillKey={ "first_aid" }        {...{ characterSheet, skills, isEditable, lockUnused, availableValues, availableSkills, onValueSelected }} />
          <SkillCell skillKey={ "history" }          {...{ characterSheet, skills, isEditable, lockUnused, availableValues, availableSkills, onValueSelected }} />
          <SkillCell skillKey={ "intimidate" }       {...{ characterSheet, skills, isEditable, lockUnused, availableValues, availableSkills, onValueSelected }} />
          <SkillCell skillKey={ "jump" }             {...{ characterSheet, skills, isEditable, lockUnused, availableValues, availableSkills, onValueSelected }} />
          <SkillCell skillKey={ "group_lang" }       {...{ characterSheet }} />
          <SkillCell skillKey={ "latin" }            {...{ characterSheet, skills, isEditable, lockUnused, availableValues, availableSkills, onValueSelected }} />
          <SkillCell skillKey={ "custom_lang1" }     {...{ characterSheet, skills, isEditable, lockUnused, availableValues, availableSkills, onValueSelected }} />
          <SkillCell skillKey={ "custom_lang2" }     {...{ characterSheet, skills, isEditable, lockUnused, availableValues, availableSkills, onValueSelected }} />
          <SkillCell skillKey={ "group_lang_own" }   {...{ characterSheet }} />
          <SkillCell skillKey={ "lang_own" }         {...{ characterSheet, skills, isEditable, lockUnused, availableValues, availableSkills, onValueSelected }} />
        </div>
        <div className="col-xl-3 col-6 order-2 order-xl-3 vstack gap-1 px-1">
          <SkillCell skillKey={ "law" }              {...{ characterSheet, skills, isEditable, lockUnused, availableValues, availableSkills, onValueSelected }} />
          <SkillCell skillKey={ "library" }          {...{ characterSheet, skills, isEditable, lockUnused, availableValues, availableSkills, onValueSelected }} />
          <SkillCell skillKey={ "listen" }           {...{ characterSheet, skills, isEditable, lockUnused, availableValues, availableSkills, onValueSelected }} />
          <SkillCell skillKey={ "locksmith" }        {...{ characterSheet, skills, isEditable, lockUnused, availableValues, availableSkills, onValueSelected }} />
          <SkillCell skillKey={ "mech_repair" }      {...{ characterSheet, skills, isEditable, lockUnused, availableValues, availableSkills, onValueSelected }} />
          <SkillCell skillKey={ "medicine" }         {...{ characterSheet, skills, isEditable, lockUnused, availableValues, availableSkills, onValueSelected }} />
          <SkillCell skillKey={ "nature" }           {...{ characterSheet, skills, isEditable, lockUnused, availableValues, availableSkills, onValueSelected }} />
          <SkillCell skillKey={ "navigate" }         {...{ characterSheet, skills, isEditable, lockUnused, availableValues, availableSkills, onValueSelected }} />
          <SkillCell skillKey={ "occult" }           {...{ characterSheet, skills, isEditable, lockUnused, availableValues, availableSkills, onValueSelected }} />
          <SkillCell skillKey={ "op_machine" }       {...{ characterSheet, skills, isEditable, lockUnused, availableValues, availableSkills, onValueSelected }} />
          <SkillCell skillKey={ "persuade" }         {...{ characterSheet, skills, isEditable, lockUnused, availableValues, availableSkills, onValueSelected }} />
          <SkillCell skillKey={ "group_pilot" }      {...{ characterSheet }} />
          <SkillCell skillKey={ "custom_pilot" }     {...{ characterSheet, skills, isEditable, lockUnused, availableValues, availableSkills, onValueSelected }} />
          <SkillCell skillKey={ "psychology" }       {...{ characterSheet, skills, isEditable, lockUnused, availableValues, availableSkills, onValueSelected }} />
          <SkillCell skillKey={ "psychoanalysis" }   {...{ characterSheet, skills, isEditable, lockUnused, availableValues, availableSkills, onValueSelected }} />
          <SkillCell skillKey={ "ride" }             {...{ characterSheet, skills, isEditable, lockUnused, availableValues, availableSkills, onValueSelected }} />
        </div>
        <div className="col-xl-3 col-6 order-4 vstack gap-1 px-1">
          <SkillCell skillKey={ "group_sci" }        {...{ characterSheet }} />
          <SkillCell skillKey={ "biology" }          {...{ characterSheet, skills, isEditable, lockUnused, availableValues, availableSkills, onValueSelected }} />
          <SkillCell skillKey={ "pharmacy" }         {...{ characterSheet, skills, isEditable, lockUnused, availableValues, availableSkills, onValueSelected }} />
          <SkillCell skillKey={ "custom_sci" }       {...{ characterSheet, skills, isEditable, lockUnused, availableValues, availableSkills, onValueSelected }} />
          <SkillCell skillKey={ "sleight" }          {...{ characterSheet, skills, isEditable, lockUnused, availableValues, availableSkills, onValueSelected }} />
          <SkillCell skillKey={ "spot" }             {...{ characterSheet, skills, isEditable, lockUnused, availableValues, availableSkills, onValueSelected }} />
          <SkillCell skillKey={ "stealth" }          {...{ characterSheet, skills, isEditable, lockUnused, availableValues, availableSkills, onValueSelected }} />
          <SkillCell skillKey={ "group_survival" }   {...{ characterSheet }} />
          <SkillCell skillKey={ "custom_survival" }  {...{ characterSheet, skills, isEditable, lockUnused, availableValues, availableSkills, onValueSelected }} />
          <SkillCell skillKey={ "swim" }             {...{ characterSheet, skills, isEditable, lockUnused, availableValues, availableSkills, onValueSelected }} />
          <SkillCell skillKey={ "throw" }            {...{ characterSheet, skills, isEditable, lockUnused, availableValues, availableSkills, onValueSelected }} />
          <SkillCell skillKey={ "track" }            {...{ characterSheet, skills, isEditable, lockUnused, availableValues, availableSkills, onValueSelected }} />
          <SkillCell skillKey={ "custom_unused1" }   {...{ characterSheet, skills, isEditable, lockUnused, availableValues, availableSkills, onValueSelected }} />
          <SkillCell skillKey={ "custom_unused2" }   {...{ characterSheet, skills, isEditable, lockUnused, availableValues, availableSkills, onValueSelected }} />
          <SkillCell skillKey={ "custom_unused3" }   {...{ characterSheet, skills, isEditable, lockUnused, availableValues, availableSkills, onValueSelected }} />
          <SkillCell skillKey={ "custom_unused4" }   {...{ characterSheet, skills, isEditable, lockUnused, availableValues, availableSkills, onValueSelected }} />
          <SkillCell skillKey={ "custom_unused5" }   {...{ characterSheet, skills, isEditable, lockUnused, availableValues, availableSkills, onValueSelected }} />
        </div>
      </div>
    </div>
  )
}
