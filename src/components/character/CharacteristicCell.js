import { useContext } from "react";
import { useSelector } from "react-redux";
import { LanguageContext, CharacterSheetContext } from '../../App';
import { findHighlight } from '../../store/slices/highlightSlice';

export default function CharacteristicCell({ charKey, isEditable, availableValues = [], onValueSelected = () => {} }) {
  const { autoLang } = useContext(LanguageContext);
  const characterSheet = useContext(CharacterSheetContext);
  // console.log(`CharacteristicCell refresh: ${charKey}, highlight: ${JSON.stringify(highlight)}`);
  const char = useSelector(state => state.character.chars[charKey]);
  const highlightStore = useSelector(state => state.highlight);

  const charName = characterSheet[charKey].name;

  const nameThTag = charKey === "INT" ? (
    <th rowSpan="2" className="border-0 py-0 ps-0" style={{ width: "3.5rem", height: "3rem" }} scope="row">
      { 
        autoLang(charName)
          .split('\n')
          .map(( line, index ) => index === 0 
            ? <span className="d-block" key={ index }>{ line }</span> 
            : <span className="d-block" style={{ fontSize: "0.6rem" }} key={ index }>{ line }</span>)
      }
    </th>
  ) : (
    <th rowSpan="2" className="border-0 py-0 ps-0" style={{ width: "3.5rem", height: "3rem" }} scope="row">{ autoLang(charName) }</th>
  );

  function getHighlightClassName(level) {
    const highlight = findHighlight(highlightStore, charKey);
    if (highlight && (highlight.level === "all" || highlight.level === level)) {
      return ` table-${highlight.color || "warning"}`;
    } else {
      return "";
    }
  }

  if (!isEditable) {
    return (
      <table className="table text-center align-middle cell m-0">
        <tbody>
          <tr>
            { nameThTag }
            <td 
              rowSpan="2" 
              className={"border border-end-0 p-2" + getHighlightClassName("value")}>
                { char.value }
            </td>
            <td className={"border border-bottom-0 small px-2 py-0" + getHighlightClassName("half")} 
                style={{ height: "1.5rem" }}>
                  { char.value && Math.floor(char.value / 2) }
            </td>
          </tr>
          <tr>
            <td className={"border small px-2 py-0" + getHighlightClassName("fifth")} 
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
      onValueSelected(charKey, newValue);
    }
  }

  return (
    <table className="table text-center align-middle cell m-0">
      <tbody>
        <tr>
          { nameThTag }
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