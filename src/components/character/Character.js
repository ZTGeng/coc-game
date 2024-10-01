import { useState, useEffect, useRef, useContext } from "react";
import { LanguageContext } from '../../App';
import CharacteristicCell from './CharacteristicCell';
import SkillCell from "./SkillCell";

const character = {
  STR: { key: "STR", value: undefined, name: { zh: "力量", en: "STR" }, highlight: 'none' },
  CON: { key: "CON", value: undefined, name: { zh: "体质", en: "CON" }, highlight: 'none' },
  POW: { key: "POW", value: undefined, name: { zh: "意志", en: "POW" }, highlight: 'none' },
  DEX: { key: "DEX", value: undefined, name: { zh: "敏捷", en: "DEX" }, highlight: 'none' },
  APP: { key: "APP", value: undefined, name: { zh: "外表", en: "APP" }, highlight: 'none' },
  SIZ: { key: "SIZ", value: undefined, name: { zh: "体型", en: "SIZ" }, highlight: 'none' },
  INT: { key: "INT", value: undefined, name: { zh: "智力\n灵感", en: "INT\nIdea" }, highlight: 'none' },
  EDU: { key: "EDU", value: undefined, name: { zh: "教育", en: "EDU" }, highlight: 'none' },

  HP:   { key: "HP",   value: undefined, maxValue: undefined, name: { zh: "耐久", en: "HIT POINTS" }, highlight: false },
  San:  { key: "San",  value: undefined, maxValue: undefined, name: { zh: "理智", en: "SANITY" }, highlight: false },
  Luck: { key: "Luck", value: undefined, maxValue: undefined, name: { zh: "幸运", en: "LUCK" }, highlight: false },
  MP:   { key: "MP",   value: undefined, maxValue: undefined, name: { zh: "魔法", en: "MAGIC POINTS" }, highlight: false },

  occupation: "",

  skills: {
    accounting:  { key: "accounting", value: 5, name: { zh: "会计", en: "Accounting" }, disabled: true },
    appraise:    { key: "appraise", value: 5, name: { zh: "估价", en: "Appraise" }, highlight: 'none', checked: false },
    archaeology: { key: "archaeology", value: 1, name: { zh: "考古学", en: "Archaeology" }, highlight: 'none', checked: false },
    group_art:   { key: "group_art", name: { zh: "艺术/手艺", en: "Art/Craft" } },
    photography: { key: "photography", value: 5, name: { zh: "摄影", en: "Photography" }, highlight: 'none', checked: false },
    custom_art:  { key: "custom_art", value: 5, highlight: 'none', checked: false },
    charm:       { key: "charm", value: 15, name: { zh: "魅惑", en: "Charm" }, highlight: 'none', checked: false },
    climb:       { key: "climb", value: 20, name: { zh: "攀爬", en: "Climb" }, highlight: 'none', checked: false },
    credit:      { key: "credit", value: undefined, name: { zh: "信用评级", en: "Credit Rating" }, highlight: 'none', checked: false, noBox: true },
    cthulhu:     { key: "cthulhu", value: 0, name: { zh: "克苏鲁神话", en: "Cthulhu Mythos" }, highlight: 'none', checked: false, noBox: true },
    disguise:    { key: "disguise", value: 5, name: { zh: "乔装", en: "Disguise" }, highlight: 'none', checked: false },
    dodge:       { key: "dodge", value: undefined, name: { zh: "闪避", en: "Dodge" }, highlight: 'none', checked: false },
    drive:       { key: "drive", value: 20, name: { zh: "汽车驾驶", en: "Drive Auto" }, highlight: 'none', checked: false },
    fast_talk:   { key: "fast_talk", value: 5, name: { zh: "话术", en: "Fast Talk" }, highlight: 'none', checked: false },
    fighting:    { key: "fighting", value: 25, name: { zh: "格斗(斗殴)", en: "Fighting (Brawl)" }, highlight: 'none', checked: false },
    aid:         { key: "aid", value: 30, name: { zh: "急救", en: "First Aid" }, highlight: 'none', checked: false },
    history:     { key: "history", value: 5, name: { zh: "历史", en: "History" }, highlight: 'none', checked: false },
    intimidate:  { key: "intimidate", value: 15, name: { zh: "恐吓", en: "Intimidate" }, highlight: 'none', checked: false },
    group_lang:  { key: "group_lang", name: { zh: "外语", en: "Language" } },
    latin:       { key: "latin", value: 1, name: { zh: "拉丁语", en: "Latin" }, highlight: 'none', checked: false },
    custom_lang: { key: "custom_lang", value: 1, highlight: 'none', checked: false },
    lang_own:    { key: "lang_own", value: undefined, name: { zh: "母语", en: "Own Language" }, highlight: 'none', checked: false },
    law:         { key: "law", value: 5, name: { zh: "法律", en: "Law" }, highlight: 'none', checked: false },
    library:     { key: "library", value: 20, name: { zh: "图书馆使用", en: "Library Use" }, highlight: 'none', checked: false },
    listen:      { key: "listen", value: 20, name: { zh: "聆听", en: "Listen" }, highlight: 'none', checked: false },
    locksmith:   { key: "locksmith", value: 1, name: { zh: "锁匠", en: "Locksmith" }, highlight: 'none', checked: false },
    medicine:    { key: "medicine", value: 1, name: { zh: "医学", en: "Medicine" }, highlight: 'none', checked: false },
    nature:      { key: "nature", value: 10, name: { zh: "博物学", en: "Nature World" }, highlight: 'none', checked: false },
    persuade:    { key: "persuade", value: 10, name: { zh: "说服", en: "Persuade" }, highlight: 'none', checked: false },
    psychology:  { key: "psychology", value: 10, name: { zh: "心理学", en: "Psychology" }, highlight: 'none', checked: false },
    ride:        { key: "ride", value: 5, name: { zh: "骑术", en: "Ride" }, highlight: 'none', checked: false },
    group_sci:   { key: "group_sci", name: { zh: "科学", en: "Science" } },
    biology:     { key: "biology", value: 1, name: { zh: "生物学", en: "Biology" }, highlight: 'none', checked: false },
    pharmacy:    { key: "pharmacy", value: 1, name: { zh: "药学", en: "Pharmacy" }, highlight: 'none', checked: false },
    custom_sci:  { key: "custom_sci", value: 1, highlight: 'none', checked: false },
    spot:        { key: "spot", value: 25, name: { zh: "侦查", en: "Spot Hidden" }, highlight: 'none', checked: false },
    stealth:     { key: "stealth", value: 20, name: { zh: "潜行", en: "Stealth" }, highlight: 'none', checked: false },
    track:       { key: "track", value: 10, name: { zh: "追踪", en: "Track" }, highlight: 'none', checked: false }
  },

  occupationSkills: [],
  artPoint: 0,
  interpersonalPoint: 0,
  languagePoint: 0,
  universalPoint: 0
};

const characteristicsTitle = {
  "en": "Characteristic",
  "zh": "属性"
};
const skillsTitle = {
  "en": "Investigator Skills",
  "zh": "调查员技能"
};

function Info() {
  return (
    <div className="d-flex flex-column mt-4">
      <div className="form-floating mb-2">
        <input type="text" className="form-control border-0" id="nameInput" placeholder="" />
        <label htmlFor="nameInput" className="small form-label">Name</label>
        <hr className="" style={{ marginBottom: "0px", marginTop: "-10px"}} />
      </div>
      <div className="form-floating mb-2">
        <input type="number" className="form-control border-0" id="ageInput" placeholder="" />
        <label htmlFor="ageInput" className="small form-label">Age</label>
        <hr className="" style={{ marginBottom: "0px", marginTop: "-10px"}} />
      </div>
      <div className="form-floating mb-2">
        <input type="text" className="form-control border-0" id="occupationInput" placeholder="" />
        <label htmlFor="occupationInput" className="small form-label">Occupation</label>
        <hr className="" style={{ marginBottom: "0px", marginTop: "-10px"}} />
      </div>
    </div>
  )
}

function Characteristics() {
  const { language } = useContext(LanguageContext);
  return (
    <>
      <h3 className="text-center">{ characteristicsTitle[language] || characteristicsTitle["en"] }</h3>
      <div className="row">
        <div className="col-xl-4 col-md-6 col-sm-4 col-6 mb-1">
          <CharacteristicCell characteristic={ character.STR } />
        </div>
        <div className="col-xl-4 col-md-6 col-sm-4 col-6 mb-1">
          <CharacteristicCell characteristic={ character.DEX } />
        </div>
        <div className="col-xl-4 col-md-6 col-sm-4 col-6 mb-1">
          <CharacteristicCell characteristic={ character.INT } />
        </div>
        <div className="col-xl-4 col-md-6 col-sm-4 col-6 mb-1">
          <CharacteristicCell characteristic={ character.CON } />
        </div>
        <div className="col-xl-4 col-md-6 col-sm-4 col-6 mb-1">
          <CharacteristicCell characteristic={ character.APP } />
        </div>
        <div className="col-xl-4 col-md-6 col-sm-4 col-6 mb-1">
          <CharacteristicCell characteristic={ character.POW } />
        </div>
        <div className="col-xl-4 col-md-6 col-sm-4 col-6 mb-1">
          <CharacteristicCell characteristic={ character.SIZ } />
        </div>
        <div className="col-xl-4 col-md-6 col-sm-4 col-6 mb-1">
          <CharacteristicCell characteristic={ character.EDU } />
        </div>
      </div>
    </>
  )
}

function Attributes() {
  const { language } = useContext(LanguageContext);
  return (
    <div className="d-flex justify-content-center">
      <table className="table table-borderless text-center align-middle">
        <tbody>
            <tr>
              <th>{ character.HP.name[language] || character.HP.name["en"] }</th>
              <td className="border">{ character.HP.value }/{ character.HP.maxValue }</td>
              <th>{ character.San.name[language] || character.San.name["en"] }</th>
              <td className="border">{ character.San.value }/{ character.San.maxValue }</td>
              <th>{ character.Luck.name[language] || character.Luck.name["en"] }</th>
              <td className="border">{ character.Luck.value }</td>
              <th>{ character.MP.name[language] || character.MP.name["en"] }</th>
              <td className="border">{ character.MP.value }/{ character.MP.maxValue }</td>
            </tr>
        </tbody>
      </table>
    </div>
  )
}

function Skills() {
  const { language } = useContext(LanguageContext);
  return (
    <>
      <h4 className="text-center">{ skillsTitle[language] || skillsTitle["en"] }</h4>
      <div className="row">
        <div className="col-xl-3 col-6 order-1 vstack gap-1 px-1">
          <SkillCell skill={ character.skills.accounting } />
          <SkillCell skill={ character.skills.appraise } />
          <SkillCell skill={ character.skills.archaeology } />
          <SkillCell skill={ character.skills.credit } />
          <SkillCell skill={ character.skills.cthulhu } />
          <div>1</div>
        </div>
        <div className="col-xl-3 col-6 order-3 order-xl-2 vstack gap-1 px-1">
          <SkillCell skill={ character.skills.fast_talk } />
          <SkillCell skill={ character.skills.fighting } />
          <div>2</div>
        </div>
        <div className="col-xl-3 col-6 order-2 order-xl-3 vstack gap-1 px-1">
          <SkillCell skill={ character.skills.law } />
          <SkillCell skill={ character.skills.library } />
          <div>3</div>
        </div>
        <div className="col-xl-3 col-6 order-4 vstack gap-1 px-1">
          <SkillCell skill={ character.skills.biology } />
          <SkillCell skill={ character.skills.pharmacy } />
          <div>4</div>
        </div>
      </div>
    </>
  )
}

export default function Character({  }) {

  const { language } = useContext(LanguageContext);
  return (
    <div className="d-flex flex-column ms-2">
      <div className="row">
        <div className="col-lg-3">
          <Info />
        </div>
        <div className="col">
          <Characteristics />
        </div>
      </div>
      <br />
      <Attributes />
      <Skills />
    </div>
  )
}