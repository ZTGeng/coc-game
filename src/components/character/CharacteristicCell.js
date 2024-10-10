import { useContext } from "react";
import { LanguageContext } from '../../App';
import { HighlightContext } from "../Game";

export default function CharacteristicCell({ char, characterSheet, isEditable, availableValues = [], onValueSelected = () => {} }) {
  const { language } = useContext(LanguageContext);
  const { highlight } = useContext(HighlightContext);
  // console.log(`CharacteristicCell refresh: ${char.key}, highlight: ${JSON.stringify(highlight)}`);

  function shouldHighlight(level) {
    return highlight && highlight.some(h => h.key === char.key && (h.level === "all" || h.level === level));
  }

  if (!isEditable) {
    return (
      <table className="table text-center align-middle cell m-0">
        <tbody>
          <tr>
            { char.key === "INT" ? (
              <th rowSpan="2" className="border-0 py-0 ps-0" style={{ width: "3.5rem", height: "3rem" }} scope="row">{ 
                (characterSheet[char.key].name[language] || characterSheet[char.key].name["en"])
                .split('\n')
                .map(( line, index ) => index === 0 ? <span className="d-block" key={ index }>{ line }</span> : <span className="d-block" style={{ fontSize: "0.6rem" }} key={ index }>{ line }</span>)
              }</th>
            ) : (
              <th rowSpan="2" className="border-0 py-0 ps-0" style={{ width: "3.5rem", height: "3rem" }} scope="row">{ characterSheet[char.key].name[language] || characterSheet[char.key].name["en"] }</th>
            ) }
            <td 
              rowSpan="2" 
              className={"border border-end-0 p-2" + (shouldHighlight("value") ? " table-warning" : "")}>
                { char.value }
            </td>
            <td className={"border border-bottom-0 small px-2 py-0" + (shouldHighlight("half") ? " table-warning" : "")} 
                style={{ height: "1.5rem" }}>
                  { char.value && Math.floor(char.value / 2) }
            </td>
          </tr>
          <tr>
            <td className={"border small px-2 py-0" + (shouldHighlight("fifth") ? " table-warning" : "")} 
              style={{ height: "1.5rem" }}>
                { char.value && Math.floor(char.value / 5) }
            </td>
          </tr>
        </tbody>
      </table>
    );
  }

  const values = [...availableValues];
  if (char.value) {
    values.push(char.value);
    values.sort((a, b) => b - a);
  }

  function onSelectChange(e) {
    const newValue = e.target.value ? parseInt(e.target.value) : e.target.value; // Int or ""
    if (char.value !== newValue) {
      onValueSelected(char.key, newValue);
    }
  }

  return (
    <table className="table text-center align-middle cell m-0">
      <tbody>
        <tr>
          { char.key === "INT" ? (
            <th rowSpan="2" className="border-0 py-0 ps-0" style={{ width: "3.5rem", height: "3rem" }} scope="row">{ 
              (characterSheet[char.key].name[language] || characterSheet[char.key].name["en"])
                .split('\n')
                .map(( line, index ) => index === 0 ? <span className="d-block" key={ index }>{ line }</span> : <span className="d-block" style={{ fontSize: "0.6rem" }} key={ index }>{ line }</span>)
            }</th>
          ) : (
            <th rowSpan="2" className="border-0 py-0 ps-0" style={{ width: "3.5rem", height: "3rem" }} scope="row">{ characterSheet[char.key].name[language] || characterSheet[char.key].name["en"] }</th>
          ) }
          <td rowSpan="2" className="border p-2">
            <select className="border-0 mx-1" style={{ paddingTop: "3px" }} value={char.value} onChange={onSelectChange}>
              <option key="empty" value="">{ "" }</option>
              { values.map((v, i) => <option key={i} value={v}>{ v }</option>) }
            </select>
          </td>
        </tr>
      </tbody>
    </table>
  );
}