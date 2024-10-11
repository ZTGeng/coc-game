import { useState, useContext } from "react";
import { LanguageContext } from '../../App';
import { FlagsContext } from "../Game";
import SkillCell from "./SkillCell";

export const artSkills = ["photography", "custom_art1", "custom_art2"];
export const interpersonalSkills = ["charm", "fast_talk", "intimidate", "persuade"];
export const languageSkills = ["latin", "custom_lang1", "custom_lang2"];

const cthulhuCellType = {
  isDisabled: false,
  isEditable: false,
  isClickable: false,
}

export default function Skills({ characterSheet, skills, setSkills, occupation }) {
  const { autoLang } = useContext(LanguageContext);
  const { flagConditionCheck } = useContext(FlagsContext);
  const isOccupationSkillsEditing = flagConditionCheck("flag_occupation_skills_editable");
  const isHobbySkillsEditing = flagConditionCheck("flag_hobby_skills_editable");

  return (
    <div className="row">
      <div className="col px-0">
        <div className="card">
          <h6 className="card-header">
            { autoLang(characterSheet.skillsTitle) }
          </h6>
          {isOccupationSkillsEditing
            ? <SkillsEditableForOccupation {...{ characterSheet, skills, setSkills, occupation }} />
            : isHobbySkillsEditing
              ? <SkillsEditableForHobby {...{ characterSheet, skills, setSkills }} />
              : <SkillsTable cellType={
                Object.keys(skills)
                  .reduce((acc, key) => {
                    // On non-editable page, the unselected custom skills are disabled
                    const isDisabled = characterSheet.skills[key].custom && !skills[key].occupation && !skills[key].hobby;
                    acc[key] = { isDisabled, isEditable: false, isClickable: false };
                    return acc;
                  }, {})
              } {...{ characterSheet, skills }} />}
        </div>
      </div>
    </div>
  );
}

function SkillsEditableForOccupation({ characterSheet, skills, setSkills, occupation }) {
  const { autoLang } = useContext(LanguageContext);
  const isForHobby = false;
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
    console.error(`SkillsEditableForOccupation - Selected skills number is larger than available values number. Selected: ${selectedSkills}`);
  }
  selectedSkills.forEach(skillKey => {
    const index = initAvailableValues.indexOf(skills[skillKey].value);
    if (index !== -1) {
      initAvailableValues.splice(index, 1);
    } else {
      console.error(`SkillsEditableForOccupation - Cannot find ${skillKey} value ${skills[skillKey].value} in available values ${initAvailableValues}`);
    }

    if (occupation.skills.includes(skillKey)) {
      initAvailableSkills[skillKey] = 0;
    } else if (artSkills.includes(skillKey)) {
      if (initAvailableSkills.art > 0) {
        initAvailableSkills.art -= 1;
      } else {
        initAvailableSkills.universal -= 1;
      }
    } else if (languageSkills.includes(skillKey)) {
      if (initAvailableSkills.language > 0) {
        initAvailableSkills.language -= 1;
      } else {
        initAvailableSkills.universal -= 1;
      }
    } else if (interpersonalSkills.includes(skillKey)) {
      if (initAvailableSkills.interpersonal > 0) {
        initAvailableSkills.interpersonal -= 1;
      } else {
        initAvailableSkills.universal -= 1;
      }
    } else {
      initAvailableSkills.universal -= 1;
    }
    
    if (initAvailableSkills.universal < 0) {
      console.error(`SkillsEditableForOccupation initial - Universal not enough, selectedSkills ${selectedSkills} avaliableSkills ${JSON.stringify(initAvailableSkills)}`);
    }
  });

  const [availableValues, setAvailableValues] = useState(initAvailableValues);
  const [availableSkills, setAvailableSkills] = useState(initAvailableSkills);
  const [lockUnused, setLockUnused] = useState(false);

  function unselectSkills(skillKeys) {
    const availableValuesCopy = [...availableValues];
    const availableSkillsCopy = { ...availableSkills };
    const skillsChanges = {};
    skillKeys.forEach(skillKey => {
      const indexInSelected = selectedSkills.indexOf(skillKey);
      if (indexInSelected === -1) {
        // console.log(`${skillKey} is not in selectedSkills ${selectedSkills} when unselecting`);
        return;
      }
      if (occupation.skills.includes(skillKey)) {
        if (availableSkillsCopy[skillKey] !== 0) {
          console.error(`SkillsEditableForOccupation - ${skillKey} occupation skill is not 0 when unselecting`);
        }
        availableSkillsCopy[skillKey] = 1;
      } else if (artSkills.includes(skillKey)) {
        const selectedArtSkillsNum = selectedSkills.filter(key => artSkills.includes(key)).length;
        if (selectedArtSkillsNum > occupation.art) {
          availableSkillsCopy.universal += 1;
        } else {
          availableSkillsCopy.art += 1;
        }
      } else if (languageSkills.includes(skillKey)) {
        const selectedLangSkillsNum = selectedSkills.filter(key => languageSkills.includes(key)).length;
        if (selectedLangSkillsNum > occupation.language) {
          availableSkillsCopy.universal += 1;
        } else {
          availableSkillsCopy.language += 1;
        }
      } else if (interpersonalSkills.includes(skillKey)) {
        const selectedInterpersonalSkillsNum = selectedSkills.filter(key => interpersonalSkills.includes(key)).length;
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
        console.error(`SkillsEditableForOccupation - ${skillKey} makes available skills point ${JSON.stringify(availableSkillsCopy)} more than in occupation ${JSON.stringify(occupation)} when unselecting`);
      }

      skillsChanges[skillKey] = { ...skills[skillKey], value: skills[skillKey].baseValue, occupation: false };
      availableValuesCopy.push(skills[skillKey].value);
      availableValuesCopy.sort((a, b) => b - a);
      selectedSkills.splice(indexInSelected, 1);
    });

    if (availableValuesCopy.length !== availableValues.length) {
      setSkills({ ...skills, ...skillsChanges });
      setAvailableValues(availableValuesCopy);
      setAvailableSkills(availableSkillsCopy);
    }
  }

  function toggleLockUnused() {
    if (!lockUnused) {
      unselectSkills(Object.keys(skills).filter(skillKey => characterSheet.skills[skillKey].unused && skills[skillKey].occupation));
    }
    setLockUnused(!lockUnused);
  }

  function onValueSelected(key, newValue) {
    const baseValue = skills[key].baseValue;
    const curValue = skills[key].value;
    const fromBase = baseValue === curValue;
    const toBase = baseValue === newValue;

    if (fromBase && toBase) {
      console.error(`SkillsEditableForOccupation - Skill ${key} should not trigger onValueSelevted with the same value`);
      return
    }    

    // Case 1, selected skill change to another value
    if (!fromBase && !toBase) {
      const availableValuesCopy = [...availableValues];
      // No change to availableSkills and selectedSkills, just change values
      const index = availableValuesCopy.indexOf(newValue);
      if (index !== -1) {
        availableValuesCopy.splice(index, 1);
      } else {
        console.error(`SkillsEditableForOccupation - ${key} desired value ${newValue} is not a valid value in availableValues ${availableValuesCopy} - case 1`);
      }
      availableValuesCopy.push(curValue);
      availableValuesCopy.sort((a, b) => b - a);

      setSkills({ ...skills, [key]: { ...skills[key], value: newValue } });
      setAvailableValues(availableValuesCopy);
      return;
    }

    // Case 2, selected skill change to baseValue
    if (toBase) {
      unselectSkills([key]);
      return;
    }

    // Case 3, unselected skill change to a new value
    // fromBase === true
    const availableValuesCopy = [...availableValues];
    const availableSkillsCopy = { ...availableSkills };

    if (occupation.skills.includes(key)) {
      if (availableSkillsCopy[key] === 0) {
        console.error(`SkillsEditableForOccupation - Occupation skill ${key} is 0 before select`);
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
      console.error(`SkillsEditableForOccupation - ${key} desired value ${newValue} is not a valid value in availableValues ${availableValuesCopy} - case 3`);
    }

    setSkills({ ...skills, [key]: { ...skills[key], value: newValue, occupation: true } });
    setAvailableValues(availableValuesCopy);
    setAvailableSkills(availableSkillsCopy);
  }

  const cellType = Object.keys(skills).reduce((acc, key) => {
    // On editable page when lockUnused is true, the unused skills are not editable
    const isEditable = !(characterSheet.skills[key].unused && lockUnused);
    // On editable page, the selected skills are clickable, others are clickable if have available points
    const isClickable = skills[key].occupation
        || availableSkills.universal > 0
        || (artSkills.includes(key) && availableSkills.art > 0)
        || (interpersonalSkills.includes(key) && availableSkills.interpersonal > 0)
        || (languageSkills.includes(key) && availableSkills.language > 0)
        || (Object.keys(availableSkills).includes(key) && availableSkills[key] > 0);
    acc[key] = { isDisabled: false, isEditable, isClickable };
    return acc;
  }, {});

  return (
    <>
      <div className="card-header">
        <div className="d-flex flex-wrap">
          { occupation.skills.map((skillKey, i) => <OccupationSkill key={skillKey} skillKey={skillKey} {...{characterSheet, availableSkills }} />) }
          { occupation.art > 0 ? <OccupationSkill skillKey={"art"} {...{characterSheet, availableSkills }} /> : null }
          { occupation.language > 0 ? <OccupationSkill skillKey={"language"} {...{characterSheet, availableSkills}} /> : null }
          { occupation.interpersonal > 0 ? <OccupationSkill skillKey={"interpersonal"} {...{characterSheet, availableSkills}} /> : null }
          { occupation.universal > 0 ? <OccupationSkill skillKey={"universal"} {...{characterSheet, availableSkills}} /> : null }
          <button className={"btn btn-sm ms-auto" + (lockUnused ? " btn-outline-secondary" : " btn-outline-dark")} onClick={toggleLockUnused}>
            { autoLang(characterSheet.lockUnusedButtonText) }
          </button>
        </div>
      </div>
      <SkillsTable {...{ characterSheet, skills, cellType, isForHobby, availableValues, onValueSelected }} />
    </>
  );
}

function SkillsEditableForHobby({ characterSheet, skills, setSkills }) {
  const { autoLang } = useContext(LanguageContext);
  const isForHobby = true;
  
  const occupationSkills = Object.keys(skills).filter(skillKey => skills[skillKey].occupation);
  const selectedSkills = Object.keys(skills).filter(skillKey => skills[skillKey].hobby);
  const availableValues = [20];
  const availableNum = 4;
  const [lockUnused, setLockUnused] = useState(false);

  function unselectSkills(skillKeys) {
    const skillsChanges = {};
    skillKeys.forEach(skillKey => {
      const indexInSelected = selectedSkills.indexOf(skillKey);
      if (indexInSelected === -1) {
        // console.log(`${skillKey} is not in selectedSkills ${selectedSkills} when unselecting`);
        return;
      }

      skillsChanges[skillKey] = { ...skills[skillKey], value: skills[skillKey].baseValue, hobby: false };
      selectedSkills.splice(indexInSelected, 1);
    });

    if (Object.keys(skillsChanges).length > 0) {
      setSkills({ ...skills, ...skillsChanges });
    }
  }

  function toggleLockUnused() {
    if (!lockUnused) {
      unselectSkills(Object.keys(skills).filter(skillKey => characterSheet.skills[skillKey].unused && skills[skillKey].hobby));
    }
    setLockUnused(!lockUnused);
  }

  function onValueSelected(key, newValue) {
    const baseValue = skills[key].baseValue;
    const curValue = skills[key].value;
    const fromBase = baseValue === curValue;
    const toBase = baseValue === newValue;

    if (fromBase && toBase) {
      console.error(`SkillsEditableForHobby - Skill ${key} should not trigger onValueSelevted with the same value`);
      return;
    }    
    if (!fromBase && !toBase) {
      console.error(`SkillsEditableForHobby - Skill ${key}: ${skills[key].value} should not change to value ${newValue}`);
      return;
    }
    if (toBase) {
      unselectSkills([key]);
      return;
    }
    // fromBase === true
    if (selectedSkills.length >= availableNum) {
      console.error(`SkillsEditableForHobby - Skill ${key} cannot be selected, having ${selectedSkills.length} hobby skills reached the limit ${availableNum}`);
      return;
    }
    if (occupationSkills.includes(key)) {
      console.error(`SkillsEditableForHobby - Skill ${key} is occupation skill, cannot select as hobby`);
      return;
    }

    selectedSkills.push(key);
    setSkills({ ...skills, [key]: { ...skills[key], value: newValue, hobby: true } });
  }

  const cellType = Object.keys(skills).reduce((acc, key) => {
    // On editable page when lockUnused is true, the unused skills are not editable
    // Occupation skills are not editable neither
    const isEditable = !skills[key].occupation && !(characterSheet.skills[key].unused && lockUnused);
    // On editable page, the selected skills are clickable, others are clickable if not reach limit
    const isClickable = skills[key].hobby || selectedSkills.length < availableNum;
    acc[key] = { isDisabled: false, isEditable, isClickable };
    return acc;
  }, {});

  return (
    <>
      <div className="card-header">
        <div className="d-flex flex-wrap">
          <div className="ms-3">兴趣技能点：<span className="badge text-bg-light">{ availableNum - selectedSkills.length }</span></div>
          <button className={"btn btn-sm ms-auto" + (lockUnused ? " btn-outline-secondary" : " btn-outline-dark")} onClick={toggleLockUnused}>
            { autoLang(characterSheet.lockUnusedButtonText) }
          </button>
        </div>
      </div>
      <SkillsTable {...{ characterSheet, skills, cellType, isForHobby, availableValues, onValueSelected }} />
    </>
  );
}

function OccupationSkill({ skillKey, characterSheet, availableSkills }) {
  const { autoLang } = useContext(LanguageContext);
  let text, points;
  switch (skillKey) {
    case "art":
      text = characterSheet.skills.group_art.name;
      points = availableSkills.art;
      break;
    case "language":
      text = characterSheet.skills.group_lang.name;
      points = availableSkills.language;
      break;
    case "interpersonal":
      text = {
        zh: `${interpersonalSkills.map(skillKey => characterSheet.skills[skillKey].name.zh).join("、")}其中一项`,
        en: `One of either ${
          interpersonalSkills
            .slice(0, -1)
            .map(skillKey => characterSheet.skills[skillKey].name.en)
            .join(", ")
            .concat(", or ")
            .concat(characterSheet.skills[interpersonalSkills[interpersonalSkills.length - 1]].name.en)
        }`,
      };
      points = availableSkills.interpersonal;
      break;
    case "universal":
      text = { zh: "任意", en: "Any", };
      points = availableSkills.universal;
      break;
    case "lang_own":
      text = characterSheet.skills.group_lang_own.name;
      points = availableSkills[skillKey];
      break;
    default:
      if (!characterSheet.skills[skillKey]) {
        console.error(`Cannot find skill ${skillKey} in characterSheet.skills`);
      }
      text = characterSheet.skills[skillKey].name;
      points = availableSkills[skillKey];
  };

  const selected = points === 0;
  if ([ "art", "language", "interpersonal", "universal" ].includes(skillKey)) {
    return (
      <div className={ "ms-3" + (selected ? " text-body-tertiary" : "") }>
        { autoLang(text) }
        <span className={ "badge" + (selected ? " text-body-tertiary" : " text-bg-light") }>{ points }</span>
      </div>
    );
  }
  return <div className={ "ms-3" + (selected ? " text-body-tertiary" : "") }>{ autoLang(text) }</div>;
}

function SkillsTable({ characterSheet, skills, cellType, isForHobby, availableValues, onValueSelected }) {
  return (
    <div className="card-body">
      <div className="row">
        <div className="col-xl-3 col-6 order-1 vstack gap-1 px-1">
          <SkillCell skillKey={ "accounting" }       {...{ characterSheet, skills, cellType, isForHobby, availableValues, onValueSelected }} />
          <SkillCell skillKey={ "anthropology" }     {...{ characterSheet, skills, cellType, isForHobby, availableValues, onValueSelected }} />
          <SkillCell skillKey={ "appraise" }         {...{ characterSheet, skills, cellType, isForHobby, availableValues, onValueSelected }} />
          <SkillCell skillKey={ "archaeology" }      {...{ characterSheet, skills, cellType, isForHobby, availableValues, onValueSelected }} />
          <SkillCell skillKey={ "group_art" }        {...{ characterSheet }} />
          <SkillCell skillKey={ "photography" }      {...{ characterSheet, skills, cellType, isForHobby, availableValues, onValueSelected }} />
          <SkillCell skillKey={ "custom_art1" }      {...{ characterSheet, skills, cellType, isForHobby, availableValues, onValueSelected }} />
          <SkillCell skillKey={ "custom_art2" }      {...{ characterSheet, skills, cellType, isForHobby, availableValues, onValueSelected }} />
          <SkillCell skillKey={ "charm" }            {...{ characterSheet, skills, cellType, isForHobby, availableValues, onValueSelected }} />
          <SkillCell skillKey={ "climb" }            {...{ characterSheet, skills, cellType, isForHobby, availableValues, onValueSelected }} />
          <SkillCell skillKey={ "credit" }           {...{ characterSheet, skills, cellType, isForHobby, availableValues, onValueSelected }} />
          <SkillCell skillKey={ "cthulhu" }          cellType={cthulhuCellType} {...{ characterSheet, skills }} />
          <SkillCell skillKey={ "disguise" }         {...{ characterSheet, skills, cellType, isForHobby, availableValues, onValueSelected }} />
          <SkillCell skillKey={ "dodge" }            {...{ characterSheet, skills, cellType, isForHobby, availableValues, onValueSelected }} />
          <SkillCell skillKey={ "drive" }            {...{ characterSheet, skills, cellType, isForHobby, availableValues, onValueSelected }} />
          <SkillCell skillKey={ "elec_repair" }      {...{ characterSheet, skills, cellType, isForHobby, availableValues, onValueSelected }} />
        </div>
        <div className="col-xl-3 col-6 order-3 order-xl-2 vstack gap-1 px-1">
          <SkillCell skillKey={ "fast_talk" }        {...{ characterSheet, skills, cellType, isForHobby, availableValues, onValueSelected }} />
          <SkillCell skillKey={ "fighting" }         {...{ characterSheet, skills, cellType, isForHobby, availableValues, onValueSelected }} />
          <SkillCell skillKey={ "custom_fight1" }    {...{ characterSheet, skills, cellType, isForHobby, availableValues, onValueSelected }} />
          <SkillCell skillKey={ "custom_fight2" }    {...{ characterSheet, skills, cellType, isForHobby, availableValues, onValueSelected }} />
          <SkillCell skillKey={ "firearms_handgun" } {...{ characterSheet, skills, cellType, isForHobby, availableValues, onValueSelected }} />
          <SkillCell skillKey={ "firearms_rifle" }   {...{ characterSheet, skills, cellType, isForHobby, availableValues, onValueSelected }} />
          <SkillCell skillKey={ "custom_firearms" }  {...{ characterSheet, skills, cellType, isForHobby, availableValues, onValueSelected }} />
          <SkillCell skillKey={ "first_aid" }        {...{ characterSheet, skills, cellType, isForHobby, availableValues, onValueSelected }} />
          <SkillCell skillKey={ "history" }          {...{ characterSheet, skills, cellType, isForHobby, availableValues, onValueSelected }} />
          <SkillCell skillKey={ "intimidate" }       {...{ characterSheet, skills, cellType, isForHobby, availableValues, onValueSelected }} />
          <SkillCell skillKey={ "jump" }             {...{ characterSheet, skills, cellType, isForHobby, availableValues, onValueSelected }} />
          <SkillCell skillKey={ "group_lang" }       {...{ characterSheet }} />
          <SkillCell skillKey={ "latin" }            {...{ characterSheet, skills, cellType, isForHobby, availableValues, onValueSelected }} />
          <SkillCell skillKey={ "custom_lang1" }     {...{ characterSheet, skills, cellType, isForHobby, availableValues, onValueSelected }} />
          <SkillCell skillKey={ "custom_lang2" }     {...{ characterSheet, skills, cellType, isForHobby, availableValues, onValueSelected }} />
          <SkillCell skillKey={ "group_lang_own" }   {...{ characterSheet }} />
          <SkillCell skillKey={ "lang_own" }         {...{ characterSheet, skills, cellType, isForHobby, availableValues, onValueSelected }} />
        </div>
        <div className="col-xl-3 col-6 order-2 order-xl-3 vstack gap-1 px-1">
          <SkillCell skillKey={ "law" }              {...{ characterSheet, skills, cellType, isForHobby, availableValues, onValueSelected }} />
          <SkillCell skillKey={ "library" }          {...{ characterSheet, skills, cellType, isForHobby, availableValues, onValueSelected }} />
          <SkillCell skillKey={ "listen" }           {...{ characterSheet, skills, cellType, isForHobby, availableValues, onValueSelected }} />
          <SkillCell skillKey={ "locksmith" }        {...{ characterSheet, skills, cellType, isForHobby, availableValues, onValueSelected }} />
          <SkillCell skillKey={ "mech_repair" }      {...{ characterSheet, skills, cellType, isForHobby, availableValues, onValueSelected }} />
          <SkillCell skillKey={ "medicine" }         {...{ characterSheet, skills, cellType, isForHobby, availableValues, onValueSelected }} />
          <SkillCell skillKey={ "nature" }           {...{ characterSheet, skills, cellType, isForHobby, availableValues, onValueSelected }} />
          <SkillCell skillKey={ "navigate" }         {...{ characterSheet, skills, cellType, isForHobby, availableValues, onValueSelected }} />
          <SkillCell skillKey={ "occult" }           {...{ characterSheet, skills, cellType, isForHobby, availableValues, onValueSelected }} />
          <SkillCell skillKey={ "op_machine" }       {...{ characterSheet, skills, cellType, isForHobby, availableValues, onValueSelected }} />
          <SkillCell skillKey={ "persuade" }         {...{ characterSheet, skills, cellType, isForHobby, availableValues, onValueSelected }} />
          <SkillCell skillKey={ "group_pilot" }      {...{ characterSheet }} />
          <SkillCell skillKey={ "custom_pilot" }     {...{ characterSheet, skills, cellType, isForHobby, availableValues, onValueSelected }} />
          <SkillCell skillKey={ "psychology" }       {...{ characterSheet, skills, cellType, isForHobby, availableValues, onValueSelected }} />
          <SkillCell skillKey={ "psychoanalysis" }   {...{ characterSheet, skills, cellType, isForHobby, availableValues, onValueSelected }} />
          <SkillCell skillKey={ "ride" }             {...{ characterSheet, skills, cellType, isForHobby, availableValues, onValueSelected }} />
        </div>
        <div className="col-xl-3 col-6 order-4 vstack gap-1 px-1">
          <SkillCell skillKey={ "group_sci" }        {...{ characterSheet }} />
          <SkillCell skillKey={ "biology" }          {...{ characterSheet, skills, cellType, isForHobby, availableValues, onValueSelected }} />
          <SkillCell skillKey={ "pharmacy" }         {...{ characterSheet, skills, cellType, isForHobby, availableValues, onValueSelected }} />
          <SkillCell skillKey={ "custom_sci" }       {...{ characterSheet, skills, cellType, isForHobby, availableValues, onValueSelected }} />
          <SkillCell skillKey={ "sleight" }          {...{ characterSheet, skills, cellType, isForHobby, availableValues, onValueSelected }} />
          <SkillCell skillKey={ "spot" }             {...{ characterSheet, skills, cellType, isForHobby, availableValues, onValueSelected }} />
          <SkillCell skillKey={ "stealth" }          {...{ characterSheet, skills, cellType, isForHobby, availableValues, onValueSelected }} />
          <SkillCell skillKey={ "group_survival" }   {...{ characterSheet }} />
          <SkillCell skillKey={ "custom_survival" }  {...{ characterSheet, skills, cellType, isForHobby, availableValues, onValueSelected }} />
          <SkillCell skillKey={ "swim" }             {...{ characterSheet, skills, cellType, isForHobby, availableValues, onValueSelected }} />
          <SkillCell skillKey={ "throw" }            {...{ characterSheet, skills, cellType, isForHobby, availableValues, onValueSelected }} />
          <SkillCell skillKey={ "track" }            {...{ characterSheet, skills, cellType, isForHobby, availableValues, onValueSelected }} />
          <SkillCell skillKey={ "custom_unused1" }   {...{ characterSheet, skills, cellType, isForHobby, availableValues, onValueSelected }} />
          <SkillCell skillKey={ "custom_unused2" }   {...{ characterSheet, skills, cellType, isForHobby, availableValues, onValueSelected }} />
          <SkillCell skillKey={ "custom_unused3" }   {...{ characterSheet, skills, cellType, isForHobby, availableValues, onValueSelected }} />
          <SkillCell skillKey={ "custom_unused4" }   {...{ characterSheet, skills, cellType, isForHobby, availableValues, onValueSelected }} />
          <SkillCell skillKey={ "custom_unused5" }   {...{ characterSheet, skills, cellType, isForHobby, availableValues, onValueSelected }} />
        </div>
      </div>
    </div>
  )
}
