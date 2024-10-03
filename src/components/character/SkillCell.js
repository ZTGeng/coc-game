import { useContext } from "react";
import { LanguageContext } from '../../App';
import { FlagsContext } from "../Game";
import { HighlightContext } from "../Game";

const EDITABLE_FLAD = "flag_skills_editable";

export default function SkillCell({ skill, valueOptions=[], onValueSelected }) {
  const { language } = useContext(LanguageContext);
  const { flagConditionCheck } = useContext(FlagsContext);
  const { highlight } = useContext(HighlightContext);

  if (skill.key.startsWith("group_")) {
    return <div className="d-flex z-1" >
      <div className="fw-bold lh-1 ms-4" style={{ fontSize: "0.75rem", marginBottom: "-0.7rem", marginTop: "-0.3rem" }}>{ skill.name[language] || skill.name["en"] }</div>
      <div className="ms-5" ></div>
    </div>
  }

  const nameWidth = skill.name ? Math.max(...(skill.name[language] || skill.name["en"]).split(" ").map(word => word.length)) : 0;
  const nameTh = <th rowSpan="2" scope="row"
                     className={"text-start border-0 lh-1 px-1 py-0" + (skill.disabled ? " text-body-tertiary" : "") + (skill.line && skill.name ? " fw-normal" : "")}
                     style={{ fontSize: nameWidth > 14 ? "0.6rem" : (nameWidth > 11 ? "0.65rem" : "0.75rem"), width: "5rem", height: "2rem" }}>
    { skill.name ? skill.name[language] || skill.name["en"] : (skill.disabled ? <span>&nbsp;</span> : <input type="text" className="border-0 p-0" style={{ width: "95%" }} />) }
    { skill.line ? <hr className="m-0 mt-1" /> : null }
  </th>;

  function shouldHighlight(level) {
    return highlight && highlight.key === skill.key && highlight.level === level;
  }

  if (skill.disabled) {
    return (
      <table className="table text-center align-middle cell m-0">
        <tbody>
          <tr>
            <td rowSpan="2" className="border-0 p-0" style={{ width: "1rem" }}>
              <input type="checkbox" className={ skill.noBox ? "invisible" : "" } disabled="disabled"/>
            </td> 
            { nameTh }
            <td rowSpan="2" className="table-light border border-end-0 p-0" style={{ width: "1.2rem" }}></td>
            <td className="table-light border border-bottom-0 small p-0" style={{ width: "1.2rem", height: "1rem" }}></td>
          </tr>
          <tr>
            <td className="table-light border small p-0" style={{ height: "1rem" }}></td>
          </tr>
        </tbody>
      </table>
    )
  }

  return flagConditionCheck(EDITABLE_FLAD) ? (
    <table className="table text-center align-middle cell m-0">
      <tbody>
        <tr>
          <td rowSpan="2" className="border-0 p-0" style={{ width: "1rem" }}>
            <input type="checkbox" className={ skill.noBox ? "invisible" : "" } disabled="disabled"/>
          </td>
          { nameTh }
          <td rowSpan="2" className="border p-0" style={{ fontSize: "0.75rem", width: "2.35rem" }}>
            <select className="border-0 " style={{  }} >
              { valueOptions.map(v => <option key={v.key} value={v}>{ v }</option>) }
            </select>
          </td>
        </tr>
      </tbody>
    </table>
  ) : (
    <table className="table text-center align-middle cell m-0">
      <tbody>
        <tr>
          <td rowSpan="2" className="border-0 p-0" style={{ width: "1rem" }}>
            <input type="checkbox" className={ skill.noBox ? "invisible" : "" } disabled="disabled" checked={ skill.checked }/>
          </td> 
          { nameTh }
          <td rowSpan="2" className={"border border-end-0 p-0" + (shouldHighlight("value") ? " table-warning" : "")} style={{ fontSize: "0.75rem", width: "1.2rem" }}>{ skill.value }</td>
          <td className={"border border-bottom-0 small p-0" + (shouldHighlight("half") ? " table-warning" : "")} style={{ fontSize: "0.6rem", width: "1.2rem", height: "1rem" }}>{ skill.value && Math.floor(skill.value / 2) }</td>
        </tr>
        <tr>
          <td className={"border small p-0" + (shouldHighlight("fifth") ? " table-warning" : "")} style={{ fontSize: "0.6rem", height: "1rem" }}>{ skill.value && Math.floor(skill.value / 5) }</td>
        </tr>
      </tbody>
    </table>
  )
}