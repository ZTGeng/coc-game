import { useContext } from "react";
import { LanguageContext } from '../../App';
import { FlagsContext } from "../Game";

const EDITABLE_FLAD = "flag_skills_editable";

export default function SkillCell({ skill, highlight, valueOptions=[], onValueSelected }) {
  const { language } = useContext(LanguageContext);
  const { conditionChecker, setFlag } = useContext(FlagsContext);

  if (skill.disabled) {
    return (
      <table className="table text-center align-middle cell m-0">
        <tbody>
          <tr>
            <td rowSpan="2" className="border-0 p-0" style={{ width: "1rem" }}>
              <input type="checkbox" className={ skill.noBox ? "invisible" : "" } disabled="disabled"/>
            </td> 
            <th rowSpan="2" className="text-body-tertiary text-start border-0 px-1 py-0" scope="row" style={{ fontSize: "0.75rem", width: "5rem", height: "2rem", lineHeight: 1 }}>{ skill.name[language] || skill.name["en"] }</th>
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

  return conditionChecker(EDITABLE_FLAD) ? (
    <table className="table text-center align-middle cell m-0">
      <tbody>
        <tr>
          <td rowSpan="2" className="border-0 p-0" style={{ width: "1rem" }}>
            <input type="checkbox" className={ skill.noBox ? "invisible" : "" } disabled="disabled"/>
          </td>
          <th rowSpan="2" className="text-start border-0 px-1 py-0" scope="row" style={{ fontSize: "0.75rem", width: "5rem", height: "2rem", lineHeight: 1 }}>{ skill.name[language] || skill.name["en"] }</th>
          <td rowSpan="2" className="border p-0" style={{ fontSize: "0.75rem", width: "2.35rem" }}>
            <select className="border-0 " style={{  }} >
              <option>50</option>
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
          <th rowSpan="2" className="text-start border-0 px-1 py-0" scope="row" style={{ fontSize: "0.75rem", width: "5rem", height: "2rem", lineHeight: 1 }}>{ skill.name[language] || skill.name["en"] }</th>
          <td rowSpan="2" className="border border-end-0 p-0" style={{ fontSize: "0.75rem", width: "1.2rem" }}>{ skill.value }</td>
          <td className="border border-bottom-0 small p-0" style={{ fontSize: "0.6rem", width: "1.2rem", height: "1rem" }}>{ skill.value && Math.floor(skill.value / 2) }</td>
        </tr>
        <tr>
          <td className="border small p-0" style={{ fontSize: "0.6rem", height: "1rem" }}>{ skill.value && Math.floor(skill.value / 5) }</td>
        </tr>
      </tbody>
    </table>
  )
}