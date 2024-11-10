import { useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import { LanguageContext, CharacterSheetContext } from '../../App';
import { setSkillCustomName } from "../../store/slices/characterSlice";
import { findHighlight } from '../../store/slices/highlightSlice';

export default function SkillCell({ skillKey, cellType, isForHobby, availableValues, onValueSelected }) {
  const characterSheet = useContext(CharacterSheetContext);
  const skillStore = useSelector(state => state.character.skills);

  const skillUI = characterSheet.skills[skillKey];
  if (skillUI.group) {
    return <GroupSkillCell skillUI={skillUI} />;
  }
  
  const skill = skillStore[skillKey];
  
  const isEditable = cellType[skillKey] && cellType[skillKey].isEditable;
  if (!isEditable) {
    const isDisabled = cellType[skillKey] && cellType[skillKey].isDisabled;
    if (isDisabled) {
      return <DisabledSkillCell {...{ skillKey }} />;
    }
    return <PlainSkillCell {...{ skillKey }} />;
  }
  
  const isClickable = cellType[skillKey] && cellType[skillKey].isClickable;
  return <EditableSkillCell {...{ skillKey, skillUI, skill, isClickable, isForHobby, availableValues, onValueSelected }} />;
}

function GroupSkillCell({ skillUI }) {
  const { autoLang } = useContext(LanguageContext);
  return (
    <div className="d-flex z-1" >
      <div className="fw-bold lh-1 ms-3" style={{ fontSize: "0.75rem", marginBottom: "-0.7rem", marginTop: "-0.3rem" }}>{ autoLang(skillUI.name) }</div>
      <div className="ms-5" ></div>
    </div>
  );
}

function NameThTag({ skillKey, isDisabled }) {
  const { autoLang } = useContext(LanguageContext);
  const skillUI = useContext(CharacterSheetContext).skills[skillKey];
  const customName = useSelector(state => state.character.skillCustomNames[skillKey]);
  const dispatch = useDispatch();

  const nameString = skillUI.name ? autoLang(skillUI.name) : "";
  const className = "text-start border-0 lh-1 px-1 py-0" + (isDisabled ? " text-body-tertiary" : "") + (skillUI.line ? " fw-normal" : "");
  if (nameString) {
    const nameWidth = Math.max(...nameString.split(" ").map(word => word.length)); // Length of the longest word
    return (
      <th rowSpan="2" 
          scope="row"
          className={className}
          style={{ fontSize: nameWidth > 14 ? "0.6rem" : (nameWidth > 10 ? "0.65rem" : "0.75rem"), width: "5rem", height: "2rem" }}>
        { nameString }
        { skillUI.line ? <hr className="m-0 mt-1" /> : null }
      </th>
    );
  }

  const isMultilingualCustomName = Object.prototype.toString.call(customName) === "[object Object]";
  return (
    <th rowSpan="2" 
        scope="row"
        className={className}
        style={{ fontSize: "0.75rem", width: "5rem", height: "2rem" }}>
      {
        isMultilingualCustomName // Multilingual custom names are from the occupation, hence not editable
          ? autoLang(customName)
          : <input
              type="text"
              className="border-0 p-0"
              style={{ width: "95%" }}
              value={customName || ""}
              onChange={e => dispatch(setSkillCustomName({ skillKey, customName: e.target.value}))} />
      }
      { skillUI.line ? <hr className="m-0 mt-1" /> : null }
    </th>
  );  
}

function DisabledSkillCell({ skillKey }) {
  const characterSheet = useContext(CharacterSheetContext);
  const skillUI = characterSheet.skills[skillKey];
  const isDisabled = true;
  return (
    <table className="table text-center align-middle cell m-0">
      <tbody>
        <tr>
          <td rowSpan="2" className="border-0 p-0" style={{ width: "1rem" }}>
            <input type="checkbox" className={ skillUI.noBox ? "invisible" : "" } disabled="disabled"/>
          </td> 
            <NameThTag {...{ skillKey, isDisabled }} />
          <td rowSpan="2" className="table-light border border-end-0 p-0" style={{ width: "1.2rem" }}></td>
          <td className="table-light border border-bottom-0 small p-0" style={{ width: "1.2rem", height: "1rem" }}></td>
        </tr>
        <tr>
          <td className="table-light border small p-0" style={{ height: "1rem" }}></td>
        </tr>
      </tbody>
    </table>
  );
}

function PlainSkillCell({ skillKey }) {
  const skill = useSelector(state => state.character.skills[skillKey]);
  const isChecked = useSelector(state => state.character.checkedSkills.includes(skillKey));
  const characterSheet = useContext(CharacterSheetContext);
  const skillUI = characterSheet.skills[skillKey];
  const highlightStore = useSelector(state => state.highlight);
  const isDisabled = false;

  function getHighlightClassName(level) {
    const highlight = findHighlight(highlightStore, skillKey);
    if (highlight && (highlight.level === "all" || highlight.level === level)) {
      return ` table-${highlight.color || "warning"}`;
    } else {
      return "";
    }
  }

  return (
    <table className="table text-center align-middle cell m-0">
      <tbody>
        <tr>
          <td rowSpan="2" className="border-0 p-0" style={{ width: "1rem" }}>
            <input type="checkbox" className={skillUI.noBox ? "invisible" : ""} disabled="disabled" checked={isChecked} />
          </td>
            <NameThTag {...{ skillKey, isDisabled }} />
          <td rowSpan="2" className={"border border-end-0 p-0" + getHighlightClassName("value")} style={{ fontSize: "0.75rem", width: "1.2rem" }}>{skill.value}</td>
          <td className={"border border-bottom-0 small p-0" + getHighlightClassName("half")} style={{ fontSize: "0.6rem", width: "1.2rem", height: "1rem" }}>{skill.value && Math.floor(skill.value / 2)}</td>
        </tr>
        <tr>
          <td className={"border small p-0" + getHighlightClassName("fifth")} style={{ fontSize: "0.6rem", height: "1rem" }}>{skill.value && Math.floor(skill.value / 5)}</td>
        </tr>
      </tbody>
    </table>
  );
}

function EditableSkillCell({ skillKey, isClickable, isForHobby, availableValues, onValueSelected }) {
  const skill = useSelector(state => state.character.skills[skillKey]);
  const isChecked = useSelector(state => state.character.checkedSkills.includes(skillKey));
  const characterSheet = useContext(CharacterSheetContext);
  const skillUI = characterSheet.skills[skillKey];
  const isDisabled = false;
  const isSelectedValue = skill.occupation || skill.hobby;

  const values = [...availableValues];
  if (isForHobby) {
    values.forEach((v, i) => values[i] = v + skill.baseValue);
  } else if (skill.occupation) {
    values.push(skill.value);
    values.sort((a, b) => b - a);
  }
  values.splice(0, 0, skill.baseValue);

  function onSelectChange(e) {
    const newValue = e.target.value ? parseInt(e.target.value) : e.target.value; // Int or ""
    const fromBase = !skill.occupation && !skill.hobby;
    const toBase = e.target.selectedIndex === 0;
    if (fromBase && toBase) {
      return;
    }
    if (!fromBase && !toBase && skill.value === newValue) {
      return;
    }
    onValueSelected(skillKey, newValue, fromBase, toBase);
  }

  return (
    <table className="table text-center align-middle cell m-0">
      <tbody>
        <tr>
          <td rowSpan="2" className="border-0 p-0" style={{ width: "1rem" }}>
            <input type="checkbox" className={ skillUI.noBox ? "invisible" : "" } disabled="disabled" checked={isChecked}/>
          </td>
            <NameThTag {...{ skillKey, isDisabled }} />
          <td rowSpan="2" className={"border p-0" + (isSelectedValue ? " bg-warning" : "")} style={{ fontSize: "0.75rem", width: "2.35rem" }}>
            <select className={"border-0" + (isSelectedValue ? " bg-warning" : "")} value={skill.value} onChange={onSelectChange} disabled={!isClickable}>
              { values.map((v, i) => <option className="bg-light" key={i} value={v}>{ v }</option>) }
            </select>
          </td>
        </tr>
      </tbody>
    </table>
  );
}
