import { useContext } from "react";
import { useSelector } from "react-redux";
import { LanguageContext, CharacterSheetContext } from '../../App';
import { useFlagCheck } from "../../store/slices/flagSlice";
import { findHighlight } from "../../store/slices/highlightSlice";

export default function Attributes({ }) {
  const { autoLang } = useContext(LanguageContext);
  const characterSheet = useContext(CharacterSheetContext);
  const attrStore = useSelector(state => state.character.attrs);
  const highlightStore = useSelector(state => state.highlight);
  const flagCheck = useFlagCheck();

  const isMajorWound = flagCheck("flag_major_wound");
  const isUnconscious = attrStore.HP.value === 0 || attrStore.HP.value < 0;
  const isDying = isMajorWound && isUnconscious;

  function getHighlightClassName(attrKey) {
    const highlight = findHighlight(highlightStore, attrKey);
    if (highlight) {
      if (highlight.color === "danger") {
        return ` text-bg-danger`;
      }
      return ` table-${highlight.color || "warning"}`;
    } else {
      return "";
    }
  }

  return (
    <>
      <div className="d-flex align-items-center">
        <div>
          <table className="table table-borderless flex-shrink-1 text-center align-middle mb-2">
            <tbody>
              <tr>
                <th className="bg-transparent">{autoLang(characterSheet.majorWound)}</th>
                <td className="bg-transparent"><input type="checkbox" checked={isMajorWound} disabled /></td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="flex-grow-1">
          <table className="table table-borderless flex-shrink-1 text-center align-middle mb-2">
            <tbody>
              <tr>
                <th className="bg-transparent text-end">{autoLang(characterSheet.HP.name)}</th>
                <td className={"border" + getHighlightClassName("HP")}>{attrStore.HP.value}/{attrStore.HP.maxValue}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="flex-grow-1">
          <table className="table table-borderless text-center align-middle mb-2">
            <tbody>
              <tr>
                <th className="bg-transparent text-end">{autoLang(characterSheet.San.name)}</th>
                <td className={"border" + getHighlightClassName("San")}>{attrStore.San.value}/{attrStore.San.maxValue}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="d-flex align-items-center">
        <div className="flex-grow-1">
          <table className="table text-center align-middle mb-2">
            <tbody>
              <tr>
                <td className={"border" + (isDying ? " text-bg-danger" : "")}>{autoLang(characterSheet.dying)}</td>
                <td className={"border" + (isUnconscious ? " table-warning" : "")}>{autoLang(characterSheet.unconscious)}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="flex-grow-1">
          <table className="table table-borderless text-center align-middle mb-2">
            <tbody>
              <tr>
                <th className="bg-transparent text-end">{autoLang(characterSheet.Luck.name)}</th>
                <td className={"border" + getHighlightClassName("Luck")}>{attrStore.Luck.value}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="flex-grow-1">
          <table className="table table-borderless text-center align-middle mb-2">
            <tbody>
              <tr>
                <th className="bg-transparent text-end">{autoLang(characterSheet.MP.name)}</th>
                <td className={"border" + getHighlightClassName("MP")}>{attrStore.MP.value}/{attrStore.MP.maxValue}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
    
    
  )
}