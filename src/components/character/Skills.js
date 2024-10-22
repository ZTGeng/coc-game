import { useState, useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import { LanguageContext, CharacterSheetContext } from '../../App';
import { useFlagCheck } from "../../store/slices/flagSlice";
import { resetSkill, setSkill, setSkillOccupation, setSkillHobby, setSkillCustomName } from "../../store/slices/characterSlice";
import SkillCell from "./SkillCell";

export const artSkills = ["photography", "custom_art1", "custom_art2"];
export const interpersonalSkills = ["charm", "fast_talk", "intimidate", "persuade"];
export const languageSkills = ["latin", "custom_lang1", "custom_lang2"];

const cthulhuCellType = {
  isDisabled: false,
  isEditable: false,
  isClickable: false,
}

export default function Skills({}) {
  const { autoLang } = useContext(LanguageContext);
  const characterSheet = useContext(CharacterSheetContext);
  const flagCheck = useFlagCheck();
  const skillStore = useSelector(state => state.character.skills);

  const isOccupationSkillsEditing = flagCheck("flag_occupation_skills_editable");
  const isHobbySkillsEditing = flagCheck("flag_hobby_skills_editable");

  return (
    <div className="row">
      <div className="col px-0">
        <div className="card">
          <h6 className="card-header">
            { autoLang(characterSheet.skillsTitle) }
          </h6>
          {isOccupationSkillsEditing
            ? <SkillsEditableForOccupation />
            : isHobbySkillsEditing
              ? <SkillsEditableForHobby />
              : <SkillsTable cellType={
                Object.keys(skillStore)
                  .reduce((acc, key) => {
                    // On non-editable page, the unselected custom skills are disabled
                    const isDisabled = characterSheet.skills[key].custom && !skillStore[key].occupation && !skillStore[key].hobby;
                    acc[key] = { isDisabled, isEditable: false, isClickable: false };
                    return acc;
                  }, {})
              } />}
        </div>
      </div>
    </div>
  );
}


function SkillsEditableForOccupation({}) {
  const { autoLang } = useContext(LanguageContext);
  const characterSheet = useContext(CharacterSheetContext);
  const skillStore = useSelector(state => state.character.skills);
  const occupationStore = useSelector(state => state.character.occupation);
  const [lockUnused, setLockUnused] = useState(false);
  const dispatch = useDispatch();

  const isForHobby = false;
  const availableValues = [70, 60, 60, 50, 50, 50, 40, 40];
  const availableSkills = {
    ...occupationStore.skills.reduce((acc, skillKey) => ({ ...acc, [skillKey]: 1 }), {}),
    art: occupationStore.art,
    language: occupationStore.language,
    interpersonal: occupationStore.interpersonal,
    universal: occupationStore.universal,
  };
  
  const selectedSkills = Object.keys(skillStore).filter(skillKey => skillStore[skillKey].occupation);
  if (selectedSkills.length > availableValues.length) {
    console.error(`SkillsEditableForOccupation - Selected skills number is larger than available values number. Selected: ${selectedSkills}`);
  }
  selectedSkills.forEach(skillKey => {
    const index = availableValues.indexOf(skillStore[skillKey].value);
    if (index !== -1) {
      availableValues.splice(index, 1);
    } else {
      console.error(`SkillsEditableForOccupation - Cannot find ${skillKey} value ${skillStore[skillKey].value} in available values ${availableValues}`);
    }

    if (occupationStore.skills.includes(skillKey)) {
      availableSkills[skillKey] = 0;
    } else if (artSkills.includes(skillKey)) {
      if (availableSkills.art > 0) {
        availableSkills.art -= 1;
      } else {
        availableSkills.universal -= 1;
      }
    } else if (languageSkills.includes(skillKey)) {
      if (availableSkills.language > 0) {
        availableSkills.language -= 1;
      } else {
        availableSkills.universal -= 1;
      }
    } else if (interpersonalSkills.includes(skillKey)) {
      if (availableSkills.interpersonal > 0) {
        availableSkills.interpersonal -= 1;
      } else {
        availableSkills.universal -= 1;
      }
    } else {
      availableSkills.universal -= 1;
    }
    
    if (availableSkills.universal < 0) {
      console.error(`SkillsEditableForOccupation initial - Universal not enough, avaliableSkills ${JSON.stringify(availableSkills)}`);
    }
  });

  function unselectSkills(skillKeys) {
    // const skillsChanges = {};
    skillKeys.forEach(skillKey => {
      if (!skillStore[skillKey].occupation) {
        console.error(`SkillsEditableForOccupation - Skill ${skillKey} is not selected when unselecting`);
        return;
      }

      // skillsChanges[skillKey] = { ...skillStore[skillKey], value: skillStore[skillKey].baseValue, occupation: false, customName: "" };
      dispatch(resetSkill(skillKey));
    });

    // if (Object.keys(skillsChanges).length > 0) {
    //   setSkills({ ...skills, ...skillsChanges });
    // }
  }

  function toggleLockUnused() {
    if (!lockUnused) {
      unselectSkills(Object.keys(skillStore).filter(skillKey => characterSheet.skills[skillKey].unused && skillStore[skillKey].occupation));
    }
    setLockUnused(!lockUnused);
  }

  function onValueSelected(key, newValue, fromBase, toBase, customName) {
    console.log(`SkillsEditableForOccupation - onValueSelected: ${key} ${newValue} fromBase: ${fromBase} toBase: ${toBase}`);

    if (fromBase && toBase) {
      console.error(`SkillsEditableForOccupation - Skill ${key} should not trigger onValueSelevted with the same value`);
      return
    }    

    // Case 1, selected skill change to another value
    if (!fromBase && !toBase) {
      // const availableValuesCopy = [...availableValues];
      // No change to availableSkills and selectedSkills, just change values
      if (availableValues.indexOf(newValue) === -1) {
        console.error(`SkillsEditableForOccupation - ${key} desired value ${newValue} is not a valid value in availableValues ${availableValues} - case 1`);
      }

      // setSkills({ ...skills, [key]: { ...skills[key], value: newValue, customName: customName } });
      dispatch(setSkill({ skillKey: key, value: newValue }));
      customName && dispatch(setSkillCustomName({ skillKey: key, customName }));
      return;
    }

    // Case 2, selected skill change to baseValue
    if (toBase) {
      unselectSkills([key]);
      return;
    }

    // Case 3, unselected skill change to a new value
    // fromBase === true
    if (availableValues.indexOf(newValue) === -1) {
      console.error(`SkillsEditableForOccupation - ${key} desired value ${newValue} is not a valid value in availableValues ${availableValues} - case 3`);
    }

    // setSkills({ ...skills, [key]: { ...skills[key], value: newValue, occupation: true, customName: customName } });
    dispatch(setSkillOccupation({ skillKey: key }));
    dispatch(setSkill({ skillKey: key, value: newValue }));
    customName && dispatch(setSkillCustomName({ skillKey: key, customName }));
  }

  function onCustomName(key, customName) {
    // setSkills({ ...skills, [key]: { ...skills[key], customName } });
    dispatch(setSkillCustomName({ skillKey: key, customName }));
  }

  const cellType = Object.keys(skillStore).reduce((acc, key) => {
    // On editable page when lockUnused is true, the unused skills are not editable
    const isEditable = !(characterSheet.skills[key].unused && lockUnused);
    // On editable page, the selected skills are clickable, others are clickable if have available points
    const isClickable = skillStore[key].occupation
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
          { occupationStore.skills.map((skillKey, i) => <OccupationSkill key={skillKey} skillKey={skillKey} {...{ availableSkills }} />) }
          { occupationStore.art > 0 ? <OccupationSkill skillKey={"art"} {...{ availableSkills }} /> : null }
          { occupationStore.language > 0 ? <OccupationSkill skillKey={"language"} {...{ availableSkills}} /> : null }
          { occupationStore.interpersonal > 0 ? <OccupationSkill skillKey={"interpersonal"} {...{ availableSkills}} /> : null }
          { occupationStore.universal > 0 ? <OccupationSkill skillKey={"universal"} {...{ availableSkills}} /> : null }
          <button className={"btn btn-sm ms-auto" + (lockUnused ? " btn-outline-secondary" : " btn-outline-dark")} onClick={toggleLockUnused}>
            { autoLang(characterSheet.lockUnusedButtonText) }
          </button>
        </div>
      </div>
      <SkillsTable {...{ cellType, isForHobby, availableValues, onValueSelected, onCustomName }} />
    </>
  );
}

function SkillsEditableForHobby({}) {
  const { autoLang } = useContext(LanguageContext);
  const characterSheet = useContext(CharacterSheetContext);
  const skillStore = useSelector(state => state.character.skills);
  const [lockUnused, setLockUnused] = useState(false);
  const dispatch = useDispatch();
  
  const isForHobby = true;
  const occupationSkills = Object.keys(skillStore).filter(skillKey => skillStore[skillKey].occupation);
  const selectedSkills = Object.keys(skillStore).filter(skillKey => skillStore[skillKey].hobby);
  const availableValues = [20];
  const availableNum = 4;

  function unselectSkills(skillKeys) {
    // const skillsChanges = {};
    skillKeys.forEach(skillKey => {
      if (skillStore[skillKey].hobby === false) {
        console.error(`SkillsEditableForHobby - Skill ${skillKey} is not selected when unselecting`);
        return;
      }

      dispatch(resetSkill(skillKey));
      // skillsChanges[skillKey] = { ...skills[skillKey], value: skills[skillKey].baseValue, hobby: false, customName: "" };
    });

    // if (Object.keys(skillsChanges).length > 0) {
    //   setSkills({ ...skills, ...skillsChanges });
    // }
  }

  function toggleLockUnused() {
    if (!lockUnused) {
      unselectSkills(Object.keys(skillStore).filter(skillKey => characterSheet.skills[skillKey].unused && skillStore[skillKey].hobby));
    }
    setLockUnused(!lockUnused);
  }

  function onValueSelected(key, newValue, fromBase, toBase, customName) {
    if (fromBase && toBase) {
      console.error(`SkillsEditableForHobby - Skill ${key} should not trigger onValueSelevted with the same value`);
      return;
    }    
    if (!fromBase && !toBase) {
      console.error(`SkillsEditableForHobby - Skill ${key}: ${skillStore[key].value} should not change to value ${newValue}`);
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
    // setSkills({ ...skills, [key]: { ...skills[key], value: newValue, hobby: true, customName: customName } });
    dispatch(setSkill({ skillKey: key, value: newValue }));
    dispatch(setSkillHobby({ skillKey: key }));
    customName && dispatch(setSkillCustomName({ skillKey: key, customName }));
  }

  function onCustomName(key, customName) {
    // setSkills({ ...skills, [key]: { ...skills[key], customName } });
    dispatch(setSkillCustomName({ skillKey: key, customName }));
  }

  const cellType = Object.keys(skillStore).reduce((acc, key) => {
    // On editable page when lockUnused is true, the unused skills are not editable
    // Occupation skills are not editable neither
    const isEditable = !skillStore[key].occupation && !(characterSheet.skills[key].unused && lockUnused);
    // On editable page, the selected skills are clickable, others are clickable if not reach limit
    const isClickable = skillStore[key].hobby || selectedSkills.length < availableNum;
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
      <SkillsTable {...{ cellType, isForHobby, availableValues, onValueSelected, onCustomName }} />
    </>
  );
}

function OccupationSkill({ skillKey, availableSkills }) {
  const { autoLang } = useContext(LanguageContext);
  const characterSheet = useContext(CharacterSheetContext);
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

function SkillsTable({ cellType, isForHobby, availableValues, onValueSelected, onCustomName }) {
  return (
    <div className="card-body">
      <div className="row">
        <div className="col-xl-3 col-6 order-1 vstack gap-1 px-1">
          <SkillCell skillKey={ "accounting" }       {...{ cellType, isForHobby, availableValues, onValueSelected }} />
          <SkillCell skillKey={ "anthropology" }     {...{ cellType, isForHobby, availableValues, onValueSelected }} />
          <SkillCell skillKey={ "appraise" }         {...{ cellType, isForHobby, availableValues, onValueSelected }} />
          <SkillCell skillKey={ "archaeology" }      {...{ cellType, isForHobby, availableValues, onValueSelected }} />
          <SkillCell skillKey={ "group_art" } />
          <SkillCell skillKey={ "photography" }      {...{ cellType, isForHobby, availableValues, onValueSelected }} />
          <SkillCell skillKey={ "custom_art1" }      {...{ cellType, isForHobby, availableValues, onValueSelected, onCustomName }} />
          <SkillCell skillKey={ "custom_art2" }      {...{ cellType, isForHobby, availableValues, onValueSelected, onCustomName }} />
          <SkillCell skillKey={ "charm" }            {...{ cellType, isForHobby, availableValues, onValueSelected }} />
          <SkillCell skillKey={ "climb" }            {...{ cellType, isForHobby, availableValues, onValueSelected }} />
          <SkillCell skillKey={ "credit" }           {...{ cellType, isForHobby, availableValues, onValueSelected }} />
          <SkillCell skillKey={ "cthulhu" } cellType={cthulhuCellType} />
          <SkillCell skillKey={ "disguise" }         {...{ cellType, isForHobby, availableValues, onValueSelected }} />
          <SkillCell skillKey={ "dodge" }            {...{ cellType, isForHobby, availableValues, onValueSelected }} />
          <SkillCell skillKey={ "drive" }            {...{ cellType, isForHobby, availableValues, onValueSelected }} />
          <SkillCell skillKey={ "elec_repair" }      {...{ cellType, isForHobby, availableValues, onValueSelected }} />
        </div>
        <div className="col-xl-3 col-6 order-3 order-xl-2 vstack gap-1 px-1">
          <SkillCell skillKey={ "fast_talk" }        {...{ cellType, isForHobby, availableValues, onValueSelected }} />
          <SkillCell skillKey={ "fighting" }         {...{ cellType, isForHobby, availableValues, onValueSelected }} />
          <SkillCell skillKey={ "custom_fight1" }    {...{ cellType, isForHobby, availableValues, onValueSelected, onCustomName }} />
          <SkillCell skillKey={ "custom_fight2" }    {...{ cellType, isForHobby, availableValues, onValueSelected, onCustomName }} />
          <SkillCell skillKey={ "firearms_handgun" } {...{ cellType, isForHobby, availableValues, onValueSelected }} />
          <SkillCell skillKey={ "firearms_rifle" }   {...{ cellType, isForHobby, availableValues, onValueSelected }} />
          <SkillCell skillKey={ "custom_firearms" }  {...{ cellType, isForHobby, availableValues, onValueSelected, onCustomName }} />
          <SkillCell skillKey={ "first_aid" }        {...{ cellType, isForHobby, availableValues, onValueSelected }} />
          <SkillCell skillKey={ "history" }          {...{ cellType, isForHobby, availableValues, onValueSelected }} />
          <SkillCell skillKey={ "intimidate" }       {...{ cellType, isForHobby, availableValues, onValueSelected }} />
          <SkillCell skillKey={ "jump" }             {...{ cellType, isForHobby, availableValues, onValueSelected }} />
          <SkillCell skillKey={ "group_lang" } />
          <SkillCell skillKey={ "latin" }            {...{ cellType, isForHobby, availableValues, onValueSelected }} />
          <SkillCell skillKey={ "custom_lang1" }     {...{ cellType, isForHobby, availableValues, onValueSelected, onCustomName }} />
          <SkillCell skillKey={ "custom_lang2" }     {...{ cellType, isForHobby, availableValues, onValueSelected, onCustomName }} />
          <SkillCell skillKey={ "group_lang_own" } />
          <SkillCell skillKey={ "lang_own" }         {...{ cellType, isForHobby, availableValues, onValueSelected, onCustomName }} />
        </div>
        <div className="col-xl-3 col-6 order-2 order-xl-3 vstack gap-1 px-1">
          <SkillCell skillKey={ "law" }              {...{ cellType, isForHobby, availableValues, onValueSelected }} />
          <SkillCell skillKey={ "library" }          {...{ cellType, isForHobby, availableValues, onValueSelected }} />
          <SkillCell skillKey={ "listen" }           {...{ cellType, isForHobby, availableValues, onValueSelected }} />
          <SkillCell skillKey={ "locksmith" }        {...{ cellType, isForHobby, availableValues, onValueSelected }} />
          <SkillCell skillKey={ "mech_repair" }      {...{ cellType, isForHobby, availableValues, onValueSelected }} />
          <SkillCell skillKey={ "medicine" }         {...{ cellType, isForHobby, availableValues, onValueSelected }} />
          <SkillCell skillKey={ "nature" }           {...{ cellType, isForHobby, availableValues, onValueSelected }} />
          <SkillCell skillKey={ "navigate" }         {...{ cellType, isForHobby, availableValues, onValueSelected }} />
          <SkillCell skillKey={ "occult" }           {...{ cellType, isForHobby, availableValues, onValueSelected }} />
          <SkillCell skillKey={ "op_machine" }       {...{ cellType, isForHobby, availableValues, onValueSelected }} />
          <SkillCell skillKey={ "persuade" }         {...{ cellType, isForHobby, availableValues, onValueSelected }} />
          <SkillCell skillKey={ "group_pilot" } />
          <SkillCell skillKey={ "custom_pilot" }     {...{ cellType, isForHobby, availableValues, onValueSelected, onCustomName }} />
          <SkillCell skillKey={ "psychology" }       {...{ cellType, isForHobby, availableValues, onValueSelected }} />
          <SkillCell skillKey={ "psychoanalysis" }   {...{ cellType, isForHobby, availableValues, onValueSelected }} />
          <SkillCell skillKey={ "ride" }             {...{ cellType, isForHobby, availableValues, onValueSelected }} />
        </div>
        <div className="col-xl-3 col-6 order-4 vstack gap-1 px-1">
          <SkillCell skillKey={ "group_sci" } />
          <SkillCell skillKey={ "biology" }          {...{ cellType, isForHobby, availableValues, onValueSelected }} />
          <SkillCell skillKey={ "pharmacy" }         {...{ cellType, isForHobby, availableValues, onValueSelected }} />
          <SkillCell skillKey={ "custom_sci" }       {...{ cellType, isForHobby, availableValues, onValueSelected, onCustomName }} />
          <SkillCell skillKey={ "sleight" }          {...{ cellType, isForHobby, availableValues, onValueSelected }} />
          <SkillCell skillKey={ "spot" }             {...{ cellType, isForHobby, availableValues, onValueSelected }} />
          <SkillCell skillKey={ "stealth" }          {...{ cellType, isForHobby, availableValues, onValueSelected }} />
          <SkillCell skillKey={ "group_survival" } />
          <SkillCell skillKey={ "custom_survival" }  {...{ cellType, isForHobby, availableValues, onValueSelected, onCustomName }} />
          <SkillCell skillKey={ "swim" }             {...{ cellType, isForHobby, availableValues, onValueSelected }} />
          <SkillCell skillKey={ "throw" }            {...{ cellType, isForHobby, availableValues, onValueSelected }} />
          <SkillCell skillKey={ "track" }            {...{ cellType, isForHobby, availableValues, onValueSelected }} />
          <SkillCell skillKey={ "custom_unused1" }   {...{ cellType, isForHobby, availableValues, onValueSelected, onCustomName }} />
          <SkillCell skillKey={ "custom_unused2" }   {...{ cellType, isForHobby, availableValues, onValueSelected, onCustomName }} />
          <SkillCell skillKey={ "custom_unused3" }   {...{ cellType, isForHobby, availableValues, onValueSelected, onCustomName }} />
          <SkillCell skillKey={ "custom_unused4" }   {...{ cellType, isForHobby, availableValues, onValueSelected, onCustomName }} />
          <SkillCell skillKey={ "custom_unused5" }   {...{ cellType, isForHobby, availableValues, onValueSelected, onCustomName }} />
        </div>
      </div>
    </div>
  )
}
