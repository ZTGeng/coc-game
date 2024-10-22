import { useContext, useState } from "react";
import { useSelector } from "react-redux";
import { LanguageContext } from '../../App';
import { findHighlight } from '../../store/slices/highlightSlice';

export default function SkillCell({ skillKey, characterSheet, skills, cellType, isForHobby, availableValues, onValueSelected, onCustomName }) {
  const skillUI = characterSheet.skills[skillKey];
  if (skillUI.group) {
    return <GroupSkillCell skillUI={skillUI} />;
  }

  const skill = skills[skillKey];
  
  const isEditable = cellType[skillKey] && cellType[skillKey].isEditable;
  if (!isEditable) {
    const isDisabled = cellType[skillKey] && cellType[skillKey].isDisabled;
    if (isDisabled) {
      return <DisabledSkillCell {...{ skillUI, skill }} />;
    }
    return <PlainSkillCell {...{ skillKey, skillUI, skill }} />;
  }
  
  const isClickable = cellType[skillKey] && cellType[skillKey].isClickable;
  return <EditableSkillCell {...{ skillKey, skillUI, skill, isClickable, isForHobby, availableValues, onValueSelected, onCustomName }} />;
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

function NameThTag({ skillUI, skill, isDisabled, isEditable, latestCustomName, onCustomNameChange }) {
  const { autoLang } = useContext(LanguageContext);
  const nameString = skillUI.name ? autoLang(skillUI.name) : "";
  if (nameString) {
    const nameWidth = Math.max(...nameString.split(" ").map(word => word.length)); // Length of the longest word
    return (
      <th rowSpan="2" 
          scope="row"
          className={"text-start border-0 lh-1 px-1 py-0" + (isDisabled ? " text-body-tertiary" : "") + (skillUI.line ? " fw-normal" : "")}
          style={{ fontSize: nameWidth > 14 ? "0.6rem" : (nameWidth > 10 ? "0.65rem" : "0.75rem"), width: "5rem", height: "2rem" }}>
        { nameString }
        { skillUI.line ? <hr className="m-0 mt-1" /> : null }
      </th>
    );
  }
  return (
    <th rowSpan="2" 
        scope="row"
        className={"text-start border-0 lh-1 px-1 py-0" + (isDisabled ? " text-body-tertiary" : "") + (skillUI.line ? " fw-normal" : "")}
        style={{ fontSize: "0.75rem", width: "5rem", height: "2rem" }}>
      { isEditable 
        ? <input type="text" className="border-0 p-0" style={{ width: "95%" }} value={latestCustomName} onChange={e => onCustomNameChange(e.target.value)} /> 
        : skill.customName || <span>&nbsp;</span> }
      { skillUI.line ? <hr className="m-0 mt-1" /> : null }
    </th>
  );  
}

function DisabledSkillCell({ skillUI, skill }) {
  const isDisabled = true;
  const isEditable = false;
  return (
    <table className="table text-center align-middle cell m-0">
      <tbody>
        <tr>
          <td rowSpan="2" className="border-0 p-0" style={{ width: "1rem" }}>
            <input type="checkbox" className={ skillUI.noBox ? "invisible" : "" } disabled="disabled"/>
          </td> 
            <NameThTag {...{ skillUI, skill, isDisabled, isEditable }} />
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

function PlainSkillCell({ skillKey, skillUI, skill }) {
  const highlightStore = useSelector(state => state.highlight);
  const isDisabled = false;
  const isEditable = false;

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
            <input type="checkbox" className={skillUI.noBox ? "invisible" : ""} disabled="disabled" checked={skill.checked} />
          </td>
            <NameThTag {...{ skillUI, skill, isDisabled, isEditable }} />
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

function EditableSkillCell({ skillKey, skillUI, skill, isClickable, isForHobby, availableValues, onValueSelected, onCustomName }) {
  const [latestCustomName, setLatestCustomName] = useState(skill.customName || "");
  const isDisabled = false;
  const isEditable = true;
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
    onValueSelected(skillKey, newValue, fromBase, toBase, latestCustomName);
  }

  function onCustomNameChange(customName) {
    setLatestCustomName(customName);
    if (onCustomName && (skill.occupation || skill.hobby)) {
      onCustomName(skillKey, customName);
    }
  }

  return (
    <table className="table text-center align-middle cell m-0">
      <tbody>
        <tr>
          <td rowSpan="2" className="border-0 p-0" style={{ width: "1rem" }}>
            <input type="checkbox" className={ skillUI.noBox ? "invisible" : "" } disabled="disabled" checked={ skill.checked }/>
          </td>
            <NameThTag {...{ skillUI, skill, isDisabled, isEditable, latestCustomName, onCustomNameChange }} />
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
