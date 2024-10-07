import { useContext, useRef } from "react";
import { LanguageContext } from '../../App';
import { HighlightContext } from "../Game";
import { artSkills, interpersonalSkills, languageSkills } from "./Skills";

export default function SkillCell({ skillKey, characterSheet, skills, isEditable, lockUnused, availableValues, availableSkills, onValueSelected }) {
  const skillUI = characterSheet.skills[skillKey];
  if (skillUI.group) {
    return <GroupSkillCell skillUI={skillUI} />;
  }

  const skill = skills[skillKey];
  // On non-editable page, the unselected custom skills are disabled
  const isDisabled = !isEditable && skillUI.custom && !skill.occupation && !skill.hobby;
  if (isDisabled) {
    return <DisabledSkillCell skillUI={skillUI} />;
  }

  // When lockUnused is true, the unused skills are not editable
  if (isEditable && !(skillUI.unused && lockUnused)) {
    const unselectable = !skill.occupation && !skill.hobby 
      && !(availableSkills.universal > 0
        || (artSkills.includes(skillKey) && availableSkills.art > 0)
        || (interpersonalSkills.includes(skillKey) && availableSkills.interpersonal > 0)
        || (languageSkills.includes(skillKey) && availableSkills.language > 0)
        || (Object.keys(availableSkills).includes(skillKey) && availableSkills[skillKey] > 0));
    return <EditableSkillCell {...{ skillKey, skillUI, skill, unselectable, availableValues, onValueSelected }} />;
  }

  return <PlainSkillCell {...{ skillKey, skillUI, skill }} />;
}

function GroupSkillCell({ skillUI }) {
  const { language } = useContext(LanguageContext);
  return (
    <div className="d-flex z-1" >
      <div className="fw-bold lh-1 ms-3" style={{ fontSize: "0.75rem", marginBottom: "-0.7rem", marginTop: "-0.3rem" }}>{ skillUI.name[language] || skillUI.name["en"] }</div>
      <div className="ms-5" ></div>
    </div>
  );
}

function NameThTag({ isDisabled, skillUI }) {
  const { language } = useContext(LanguageContext);
  const nameString = skillUI.name ? (skillUI.name[language] || skillUI.name["en"]) : "";
  const nameWidth = Math.max(...nameString.split(" ").map(word => word.length)); // Length of the longest word
  return (
    <th rowSpan="2" 
        scope="row"
        className={"text-start border-0 lh-1 px-1 py-0" + (isDisabled ? " text-body-tertiary" : "") + (skillUI.line ? " fw-normal" : "")}
        style={{ fontSize: nameWidth > 14 ? "0.6rem" : (nameWidth > 10 ? "0.65rem" : "0.75rem"), width: "5rem", height: "2rem" }}>
      { nameString || (isDisabled ? <span>&nbsp;</span> : <input type="text" className="border-0 p-0" style={{ width: "95%" }} />) }
      { skillUI.line ? <hr className="m-0 mt-1" /> : null }
    </th>
  );
}

function DisabledSkillCell({ skillUI }) {
  return (
    <table className="table text-center align-middle cell m-0">
      <tbody>
        <tr>
          <td rowSpan="2" className="border-0 p-0" style={{ width: "1rem" }}>
            <input type="checkbox" className={ skillUI.noBox ? "invisible" : "" } disabled="disabled"/>
          </td> 
            <NameThTag isDisabled={true} skillUI={skillUI} />
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
  const { highlight } = useContext(HighlightContext);

  function shouldHighlight(level) {
    return highlight && highlight.some(h => h.key === skillKey && h.level === level);
  }

  return (
    <table className="table text-center align-middle cell m-0">
      <tbody>
        <tr>
          <td rowSpan="2" className="border-0 p-0" style={{ width: "1rem" }}>
            <input type="checkbox" className={skillUI.noBox ? "invisible" : ""} disabled="disabled" checked={skill.checked} />
          </td>
            <NameThTag isDisabled={false} skillUI={skillUI} />
          <td rowSpan="2" className={"border border-end-0 p-0" + (shouldHighlight("value") ? " table-warning" : "")} style={{ fontSize: "0.75rem", width: "1.2rem" }}>{skill.value}</td>
          <td className={"border border-bottom-0 small p-0" + (shouldHighlight("half") ? " table-warning" : "")} style={{ fontSize: "0.6rem", width: "1.2rem", height: "1rem" }}>{skill.value && Math.floor(skill.value / 2)}</td>
        </tr>
        <tr>
          <td className={"border small p-0" + (shouldHighlight("fifth") ? " table-warning" : "")} style={{ fontSize: "0.6rem", height: "1rem" }}>{skill.value && Math.floor(skill.value / 5)}</td>
        </tr>
      </tbody>
    </table>
  );
}

function EditableSkillCell({ skillKey, skillUI, skill, unselectable, availableValues, onValueSelected }) {
  const isSelectedValue = skill.occupation || skill.hobby;

  const values = [...availableValues];
  if (isSelectedValue) {
    values.push(skill.value);
    values.sort((a, b) => b - a);
  }

  function onSelectChange(e) {
    const newValue = e.target.value ? parseInt(e.target.value) : e.target.value; // Int or ""
    if (skill.value !== newValue) {
      onValueSelected(skillKey,  newValue);
    }
  }

  return (
    <table className="table text-center align-middle cell m-0">
      <tbody>
        <tr>
          <td rowSpan="2" className="border-0 p-0" style={{ width: "1rem" }}>
            <input type="checkbox" className={ skillUI.noBox ? "invisible" : "" } disabled="disabled" checked={ skill.checked }/>
          </td>
            <NameThTag isDisabled={false} skillUI={skillUI} />
          <td rowSpan="2" className={"border p-0" + (isSelectedValue ? " bg-warning" : "")} style={{ fontSize: "0.75rem", width: "2.35rem" }}>
            <select className={"border-0" + (isSelectedValue ? " bg-warning" : "")} value={skill.value} onChange={onSelectChange} disabled={unselectable}>
              <option key="origin" className="bg-light" value={skill.baseValue}>{ skill.baseValue }</option>
              { values.map((v, i) => <option key={i} value={v}>{ v }</option>) }
            </select>
          </td>
        </tr>
      </tbody>
    </table>
  );
}
