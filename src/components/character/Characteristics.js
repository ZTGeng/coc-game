import { useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import { LanguageContext, CharacterSheetContext } from '../../App';
import { useFlagCheck } from "../../store/slices/flagSlice";
import { initChar } from "../../store/slices/characterSlice";
import CharacteristicCell from './CharacteristicCell';

export default function Characteristics({}) {
  const flagCheck = useFlagCheck();
  const isEditable = flagCheck("flag_characteristics_editable");

  if (!isEditable) {
    return <CharacteristicsTable isEditable={false} />;
  }
  return <CharacteristicsEditable />;
}

function CharacteristicsEditable({}) {
  const charStore = useSelector(state => state.character.chars);
  const dispatch = useDispatch();
  const isEditable = true;
  const availableValues = [80, 70, 60, 60, 50, 50, 50, 40];
  Object.values(charStore).forEach(item => {
    const index = availableValues.indexOf(item.value);
    if (index !== -1) {
      availableValues.splice(index, 1)
    }
  });

  function onValueSelected(key, value) {
    dispatch(initChar({ charKey: key, value }));
  }

  return <CharacteristicsTable {...{ isEditable, availableValues, onValueSelected }} />;
}

function CharacteristicsTable({ isEditable, availableValues = [], onValueSelected = () => { } }) {
  const { autoLang } = useContext(LanguageContext);
  const characterSheet = useContext(CharacterSheetContext);

  return (
    <div className="card">
      <h5 className="card-header">
        { autoLang(characterSheet.characteristicsTitle) }
      </h5>
      <div className="card-body">
        <div className="row">
          <div className="col-md-4 col-6 mb-1 px-1">
            <CharacteristicCell charKey={"STR"} {...{ isEditable, availableValues, onValueSelected }} />
          </div>
          <div className="col-md-4 col-6 mb-1 px-1">
            <CharacteristicCell charKey={"DEX"} {...{ isEditable, availableValues, onValueSelected }} />
          </div>
          <div className="col-md-4 col-6 mb-1 px-1">
            <CharacteristicCell charKey={"INT"} {...{ isEditable, availableValues, onValueSelected }} />
          </div>
          <div className="col-md-4 col-6 mb-1 px-1">
            <CharacteristicCell charKey={"CON"} {...{ isEditable, availableValues, onValueSelected }} />
          </div>
          <div className="col-md-4 col-6 mb-1 px-1">
            <CharacteristicCell charKey={"APP"} {...{ isEditable, availableValues, onValueSelected }} />
          </div>
          <div className="col-md-4 col-6 mb-1 px-1">
            <CharacteristicCell charKey={"POW"} {...{ isEditable, availableValues, onValueSelected }} />
          </div>
          <div className="col-md-4 col-6 mb-1 px-1">
            <CharacteristicCell charKey={"SIZ"} {...{ isEditable, availableValues, onValueSelected }} />
          </div>
          <div className="col-md-4 col-6 mb-1 px-1">
            <CharacteristicCell charKey={"EDU"} {...{ isEditable, availableValues, onValueSelected }} />
          </div>
        </div>
      </div>
    </div>
  );
}
