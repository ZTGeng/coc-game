import { useContext } from "react";
import { LanguageContext } from '../../App';
import { FlagsContext } from "../Game";

const EDITABLE_FLAD = "flag_characteristics_editable";

export default function CharacteristicCell({ characteristic, highlight, availableValues=[], onValueSelected }) {
  const { language } = useContext(LanguageContext);
  const { flagConditionCheck } = useContext(FlagsContext);

  const values = [...availableValues];
  if (characteristic.value) {
    values.push(characteristic.value);
    values.sort().reverse();
  }

  function onSelectChange(e) {
    const newValue = e.target.value ? parseInt(e.target.value) : e.target.value; // Int or ""
    if (characteristic.value !== newValue) {
      onValueSelected(characteristic.key, newValue);
    }
  }

  return flagConditionCheck(EDITABLE_FLAD) ? (
    <table className="table text-center align-middle cell m-0">
      <tbody>
        <tr>
          { characteristic.key === "INT" ? (
            <th rowSpan="2" className="border-0 py-0 ps-0" style={{ width: "3.5rem", height: "3rem" }} scope="row">{ 
              (characteristic.name[language] || characteristic.name["en"])
                .split('\n')
                .map(( line, index ) => index === 0 ? <span className="d-block" key={ index }>{ line }</span> : <span className="d-block" style={{ fontSize: "0.6rem" }} key={ index }>{ line }</span>)
            }</th>
          ) : (
            <th rowSpan="2" className="border-0 py-0 ps-0" style={{ width: "3.5rem", height: "3rem" }} scope="row">{ characteristic.name[language] || characteristic.name["en"] }</th>
          ) }
          <td rowSpan="2" className="border p-2">
            <select className="border-0 mx-1" style={{ paddingTop: "3px", paddingRight: "1.5px" }} value={characteristic.value} onChange={onSelectChange}>
              <option key="empty" value="">{ "" }</option>
              { values.map((v, i) => <option key={i} value={v}>{ v }</option>) }
            </select>
          </td>
        </tr>
      </tbody>
    </table>
  ) : (
    <table className="table text-center align-middle cell m-0">
      <tbody>
        <tr>
          { characteristic.key === "INT" ? (
            <th rowSpan="2" className="border-0 py-0 ps-0" style={{ width: "3.5rem", height: "3rem" }} scope="row">{ 
              (characteristic.name[language] || characteristic.name["en"])
              .split('\n')
              .map(( line, index ) => index === 0 ? <span className="d-block" key={ index }>{ line }</span> : <span className="d-block" style={{ fontSize: "0.6rem" }} key={ index }>{ line }</span>)
            }</th>
          ) : (
            <th rowSpan="2" className="border-0 py-0 ps-0" style={{ width: "3.5rem", height: "3rem" }} scope="row">{ characteristic.name[language] || characteristic.name["en"] }</th>
          ) }
          <td rowSpan="2" className="border border-end-0 p-2">{ characteristic.value }</td>
          <td className="border border-bottom-0 small px-2 py-0" style={{ height: "1.5rem" }}>{ characteristic.value && Math.floor(characteristic.value / 2) }</td>
        </tr>
        <tr>
          <td className="border small px-2 py-0" style={{ height: "1.5rem" }}>{ characteristic.value && Math.floor(characteristic.value / 5) }</td>
        </tr>
      </tbody>
    </table>
  )
}