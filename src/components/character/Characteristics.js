import { useState, useContext } from "react";
import { LanguageContext } from '../../App';
import { FlagsContext } from "../Game";
import CharacteristicCell from './CharacteristicCell';

export default function Characteristics({ characterSheet, chars, setChars }) {
  const { flagConditionCheck } = useContext(FlagsContext);
  const isEditable = flagConditionCheck("flag_characteristics_editable");

  if (!isEditable) {
    return <CharacteristicsTable {...{ characterSheet, chars, isEditable }} />;
  }
  return <CharacteristicsEditable {...{ characterSheet, chars, setChars }} />;
}

function CharacteristicsEditable({ characterSheet, chars, setChars }) {
  const isEditable = true;
  const initValues = [80, 70, 60, 60, 50, 50, 50, 40];
  Object.values(chars).forEach(item => {
    const index = initValues.indexOf(item.value);
    if (index !== -1) {
      initValues.splice(index, 1)
    }
  });
  const [availableValues, setAvailableValues] = useState(initValues);

  function onValueSelected(key, value) {
    const characteristic = chars[key];
    const availables = [...availableValues]
    const index = availables.indexOf(value);
    if (index !== -1) {
      availables.splice(index, 1)
    }
    if (characteristic.value) {
      availables.push(characteristic.value);
      availables.sort((a, b) => b - a);
    }
    setChars({ ...chars, [key]: { ...characteristic, value } });
    setAvailableValues(availables);
  }

  return <CharacteristicsTable {...{ characterSheet, chars, isEditable, availableValues, onValueSelected }} />;
}

function CharacteristicsTable({ characterSheet, chars, isEditable, availableValues = [], onValueSelected = () => { } }) {
  const { language } = useContext(LanguageContext);

  return (
    <div className="card">
      <h5 className="card-header">
        {characterSheet.characteristicsTitle[language] || characterSheet.characteristicsTitle["en"]}
      </h5>
      <div className="card-body">
        <div className="row">
          <div className="col-md-4 col-6 mb-1 px-1">
            <CharacteristicCell char={chars.STR} {...{ characterSheet, isEditable, availableValues, onValueSelected }} />
          </div>
          <div className="col-md-4 col-6 mb-1 px-1">
            <CharacteristicCell char={chars.DEX} {...{ characterSheet, isEditable, availableValues, onValueSelected }} />
          </div>
          <div className="col-md-4 col-6 mb-1 px-1">
            <CharacteristicCell char={chars.INT} {...{ characterSheet, isEditable, availableValues, onValueSelected }} />
          </div>
          <div className="col-md-4 col-6 mb-1 px-1">
            <CharacteristicCell char={chars.CON} {...{ characterSheet, isEditable, availableValues, onValueSelected }} />
          </div>
          <div className="col-md-4 col-6 mb-1 px-1">
            <CharacteristicCell char={chars.APP} {...{ characterSheet, isEditable, availableValues, onValueSelected }} />
          </div>
          <div className="col-md-4 col-6 mb-1 px-1">
            <CharacteristicCell char={chars.POW} {...{ characterSheet, isEditable, availableValues, onValueSelected }} />
          </div>
          <div className="col-md-4 col-6 mb-1 px-1">
            <CharacteristicCell char={chars.SIZ} {...{ characterSheet, isEditable, availableValues, onValueSelected }} />
          </div>
          <div className="col-md-4 col-6 mb-1 px-1">
            <CharacteristicCell char={chars.EDU} {...{ characterSheet, isEditable, availableValues, onValueSelected }} />
          </div>
        </div>
      </div>
    </div>
  );
}
