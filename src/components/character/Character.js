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
    accounting:  { key: "accounting", name: { zh: "会计", en: "Accounting" }, description: { en: "The Understanding of accountancy procedures; reveals the financial functioning of a business or person." }, disabled: true },
    anthropology:{ key: "anthropology", name: { zh: "人类学", en: "Anthropology" }, description: { en: "Can identify and understand an individual’s (or culture’s) way of life through observation." }, disabled: true },
    appraise:    { key: "appraise", value: 5, name: { zh: "估价", en: "Appraise" }, description: { en: "Can estimate the value of a particular item, including the quality, material used, and workmanship." }, highlight: 'none', checked: false },
    archaeology: { key: "archaeology", value: 1, name: { zh: "考古学", en: "Archaeology" }, description: { en: "Allows dating and identification of artifacts from past cultures, and the detection of fakes." }, highlight: 'none', checked: false },
    group_art:   { key: "group_art", name: { zh: "艺术/手艺", en: "Art/Craft" }, description: { en: "An ability with this skill enables the creation, making, or repair of an item, which could be artistic (like painting or singing) or craft (like woodwork or cookery). Choose a suitable specialization and write this in the space provided on the sheet." } },
    photography: { key: "photography", value: 5, name: { zh: "摄影", en: "Photography" }, highlight: 'none', checked: false, line: true },
    custom_art1:  { key: "custom_art1", value: 5, highlight: 'none', checked: false, line: true },
    custom_art2:  { key: "custom_art2", disabled: true, line: true },
    charm:       { key: "charm", value: 15, name: { zh: "魅惑", en: "Charm" }, description: { en: "Charm takes many forms, including physical attraction, seduction, flattery, or simply warmth of personality. Charm may be used to compel someone to act in a certain way, but not in a manner completely contrary to that person’s normal behavior. This skill can be opposed by Charm or Psychology." }, highlight: 'none', checked: false },
    climb:       { key: "climb", value: 20, name: { zh: "攀爬", en: "Climb" }, description: { en: "Can climb trees, walls, and other vertical surfaces with or without ropes and climbing gear." }, highlight: 'none', checked: false },
    credit:      { key: "credit", value: undefined, name: { zh: "信用评级", en: "Credit Rating" }, description: {}, highlight: 'none', noBox: true },
    cthulhu:     { key: "cthulhu", value: 0, name: { zh: "克苏鲁神话", en: "Cthulhu Mythos" }, description: {}, highlight: 'none', noBox: true },
    disguise:    { key: "disguise", value: 5, name: { zh: "乔装", en: "Disguise" }, description: { en: "This is used whenever you wish to appear to be someone other than whom you are." }, highlight: 'none', checked: false },
    dodge:       { key: "dodge", value: undefined, name: { zh: "闪避", en: "Dodge" }, description: { en: "Dodge allows an investigator to instinctively evade blows, thrown missiles, and so forth. A character may attempt to use dodge any number of times in a combat round (but only once per attack). If an attack can be seen, a character can try to dodge it, thus it is impossible to dodge bullets because they cannot be seen when in motion; the best a character can do is to take evasive action that results in being harder to hit. Determine starting Dodge value by halving the character’s Regular DEX value." }, highlight: 'none', checked: false },
    drive:       { key: "drive", value: 20, name: { zh: "汽车驾驶", en: "Drive Auto" }, description: { en: "Drive a car or light truck, make ordinary maneuvers, and cope with ordinary vehicle problems. If the investigator wants to lose a pursuer or tail someone, a Drive roll would be appropriate." }, highlight: 'none', checked: false },
    elec_repair: { key: "elec_repair", name: { zh: "电气维修", en: "Elec Repair" }, description: { en: "Repair or reconfigure electrical equipment, such as auto ignitions, electric motors, fuse boxes, and burglar alarms." }, disabled: true },

    fast_talk:   { key: "fast_talk", value: 5, name: { zh: "话术", en: "Fast Talk" }, description: { en: "Specifically limited to verbal trickery, deception, and misdirection, such as bamboozling a bouncer to let you inside a club, getting someone to sign a form they haven’t read, making a policeman look the other way, and so on. This skill can be opposed by Fast Talk or Psychology." }, highlight: 'none', checked: false },
    fighting:    { key: "fighting", value: 25, name: { zh: "格斗(斗殴)", en: "Fighting (Brawl)" }, description: { en: "A character’s skill in melee combat. You may spend skill points to purchase any skill specialization from Brawl (includes knives and clubs, as well as fisticuffs and martial arts), Sword, Axe, Spear, or Whip." }, highlight: 'none', checked: false },
    custom_fight1:{ key: "custom_fight1", disabled: true, line: true },
    custom_fight2:{ key: "custom_fight2", disabled: true, line: true },
    firearms_handgun:{ key: "firearms_handgun", name: { zh: "射击(手枪)", en: "Firearms (Handgun)" }, description: { en: "Covers all manner of firearms, as well as bows and crossbows. You may spend skill points to purchase any skill specialization from Handgun, Rifle/ Shotgun, Bow, or Crossbow." }, disabled: true },
    firearms_rifle:{ key: "firearms_rifle", name: { zh: "射击(步枪/霰弹枪)", en: "Firearms (Rifle/Shotgun)" }, description: { en: "Covers all manner of firearms, as well as bows and crossbows. You may spend skill points to purchase any skill specialization from Handgun, Rifle/ Shotgun, Bow, or Crossbow." }, disabled: true },
    custom_firearms:{ key: "custom_firearms", disabled: true, line: true },
    first_aid:   { key: "first_aid", value: 30, name: { zh: "急救", en: "First Aid" }, description: { en: "Emergency medical care, it cannot be used to treat diseases (where the Medicine skill is required). To be effective, First Aid must be delivered within one hour of injury, in which case it grants 1 hit point and can rouse an unconscious person." }, highlight: 'none', checked: false },
    history:     { key: "history", value: 5, name: { zh: "历史", en: "History" }, description: { en: "Recall a historical detail or event, the significance of a country, city, region, or person, as pertinent." }, highlight: 'none', checked: false },
    intimidate:  { key: "intimidate", value: 15, name: { zh: "恐吓", en: "Intimidate" }, description: { en: "The use of threats (physical or psychological) to compel someone to act or reveal information. This skill can be opposed by Intimidate or Psychology." }, highlight: 'none', checked: false },
    jump:        { key: "jump", name: { zh: "跳跃", en: "Jump" }, disabled: true },
    group_lang:  { key: "group_lang", name: { zh: "外语", en: "Language (Other)" }, description: { en: "When choosing this skill, the exact language must be specified and written next to the skill. An individual can know any number of languages, but each must be paid for in skill points. The skill represents the investigator’s chance to understand, speak, read, and write in a language other than their own." } },
    latin:       { key: "latin", value: 1, name: { zh: "拉丁语", en: "Latin" }, highlight: 'none', checked: false, line: true },
    custom_lang1: { key: "custom_lang1", value: 1, highlight: 'none', checked: false, line: true },
    custom_lang2: { key: "custom_lang2", disabled: true, line: true },
    group_lang_own: { key: "group_lang_own", name: { zh: "母语", en: "Language (Own)" }, description: { en: "A character’s Mother Tongue. Choose the language best known to your investigator, such as English. The starting value is equal to the character’s Regular EDU score." } },
    lang_own:    { key: "lang_own", value: undefined, highlight: 'none', checked: false, line: true },
    
    law:         { key: "law", value: 5, name: { zh: "法律", en: "Law" }, description: { en: "Represents the chance of knowing pertinent law, precedent, legal maneuvers, or court procedure. Helps when dealing with the police, lawyers, and courts." }, highlight: 'none', checked: false },
    library:     { key: "library", value: 20, name: { zh: "图书馆使用", en: "Library Use" }, description: { en: "Find a piece of information, such as a certain book, newspaper, reference in a library, or collection of documents (assuming the information is there to be found). Use of this skill marks several hours of continuous search." }, highlight: 'none', checked: false },
    listen:      { key: "listen", value: 20, name: { zh: "聆听", en: "Listen" }, description: { en: "Interpret and understand sound, including overheard conversations, mutters behind a closed door, and whispered words in a cafe." }, highlight: 'none', checked: false },
    locksmith:   { key: "locksmith", value: 1, name: { zh: "锁匠", en: "Locksmith" }, description: { en: "Open car doors, hot-wire autos, jimmy library windows, figure out Chinese puzzle boxes, and penetrate ordinary alarm systems. May repair locks, make keys, or open locks with the aid of skeleton keys, pick tools, or other tools." }, highlight: 'none', checked: false },
    mech_repair: { key: "mech_repair", name: { zh: "机械维修", en: "Mech. Repair" }, description: { en: "Repair a broken machine or create a new one. Basic carpentry and plumbing projects can be performed, as well as constructing items (such as a pulley system) and repairing items (such as a steam pump). Can be used to open common household locks, but more complex locks require the Locksmith skill." }, disabled: true },
    medicine:    { key: "medicine", value: 1, name: { zh: "医学", en: "Medicine" }, description: { en: "Diagnose and treat accidents, injuries, diseases, poisonings, etc. Treatment takes a minimum of one hour and can be delivered any time after damage is taken, but if this is not performed on the same day, the difficulty level of the roll is increased (requiring a Hard success). A person treated successfully with Medicine recovers 1D3 hit points (in addition to any First Aid they have received), except in the case of a dying character, who must initially receive successful First Aid to stabilize them before a Medicine roll is made." }, highlight: 'none', checked: false },
    nature:      { key: "nature", value: 10, name: { zh: "博物学", en: "Nature World" }, description: { en: "Represents the traditional (unscientific) knowledge and personal observation of farmers, fishermen, inspired amateurs, and hobbyists. It can identify plant and animal species, habits, and habitats in a general way, as well as identify tracks, spoors, and animal or bird calls." }, highlight: 'none', checked: false },
    navigate:    { key: "navigate", name: { zh: "领航", en: "Navigate" }, description: { en: "Take the correct path to a destination, whether in a strange city or in the wilderness. Read maps and judge distances and terrain." }, disabled: true },
    occult:      { key: "occult", name: { zh: "神秘学", en: "Occult" }, description: { en: "Recognize occult paraphernalia, words, and concepts, as well as folk traditions; can also identify grimoires of magic and occult codes. Recall secret mystical knowledge learned from books, teachings, or experience." }, disabled: true },
    op_machine:  { key: "op_machine", name: { zh: "操作重型机械", en: "Op. Hv. Machine" }, description: { en: "Required to drive and operate a train, steam engine, bulldozer, or other large-scale land machine." }, disabled: true },
    persuade:    { key: "persuade", value: 10, name: { zh: "说服", en: "Persuade" }, description: { en: "Convince a person about a particular idea, concept, or belief through reasoned argument, debate, and discussion. Persuade may be employed without reference to truth. The successful application of Persuade takes time: at least half an hour. If you want to persuade someone quickly, use Fast Talk. This skill can be opposed by Persuade or Psychology." }, highlight: 'none', checked: false },
    group_pilot: { key: "group_pilot", name: { zh: "驾驶", en: "Pilot" }, description: { en: "Pick a specialization, such as Boat, Aircraft, or Dirigible; each type must be paid for with skill points. Allows the safe operation of such modes of transport." } },
    custom_pilot:{ key: "custom_pilot", disabled: true, line: true },
    psychology:  { key: "psychology", value: 10, name: { zh: "心理学", en: "Psychology" }, description: { en: "Perception, common to all humans, to form an idea of another person’s motives and character, and detect if a person is lying. The Keeper may choose to make concealed Psychology skill rolls on the player’s behalf, announcing only the information, true or false, that the user gained by employing it." }, highlight: 'none', checked: false },
    psychoanalysis: { key: "psychoanalysis", name: { zh: "精神分析", en: "Psychoanalysis" }, description: { en: "Refers to the range of emotional therapies. Psychoanalysis can return Sanity points to an investigator patient: once per game month, to learn the progress of the therapy, make a 1D100 roll against the analyst or doctor’s Psychoanalysis skill. If the roll succeeds, the patient gains 1D3 Sanity points. If the roll fails, add no points. If the roll is fumbled, then the patient loses 1D6 Sanity points, and treatment by that analyst concludes. In the game, psychoanalysis alone does not speed recovery from indefinite insanity, which requires 1D6 months of institutional (or similar) care, of which psychotherapy may form a part. Successful use of this skill can allow a character to cope with the subject of a phobia or mania for a short time, or to see delusions for what they are." }, disabled: true },
    ride:        { key: "ride", value: 5, name: { zh: "骑术", en: "Ride" }, description: { en: "Applies to saddle horses, donkeys, and mules, granting knowledge of basic care of the riding animal, riding gear, and how to handle the steed at a gallop or on difficult terrain. Should a steed unexpectedly rear or stumble, the rider’s chance of remaining mounted equals their Ride skill." }, highlight: 'none', checked: false },

    group_sci:   { key: "group_sci", name: { zh: "科学", en: "Science" }, description: { en: "Practical and theoretical ability with a science specialty gained from some degree of formalized education and training, although a well-read amateur scientist may also be a possibility. Understanding and scope is limited by the era of play. Spend skill points to purchase any skill Specialization, for example: Astronomy, Biology, Botany, Chemistry, Cryptography, Geology, Pharmacy, Physics, Zoology, etc. When a character does not have the obvious discipline specialty, they may roll against an allied specialty with the level of difficulty increased (or a penalty die) at the Keeper’s discretion." } },
    biology:     { key: "biology", value: 1, name: { zh: "生物学", en: "Biology" }, highlight: 'none', checked: false, line: true },
    pharmacy:    { key: "pharmacy", value: 1, name: { zh: "药学", en: "Pharmacy" }, highlight: 'none', checked: false, line: true },
    custom_sci:  { key: "custom_sci", highlight: 'none', checked: false, line: true },
    sleight: { key: "sleight", name: { zh: "巧手", en: "Sleight of Hand" }, description: { en: "Allows the visual covering-up, secreting, or masking of an object or objects, perhaps with debris, cloth, or other illusion-promoting materials. Also, fine dexterity and manipulation of objects." }, disabled: true },
    spot:        { key: "spot", value: 25, name: { zh: "侦查", en: "Spot Hidden" }, description: { en: "Find a secret door or compartment, notice a hidden intruder, see an inconspicuous clue, recognize a repainted automobile, become aware of ambushers, notice a bulging pocket, etc.—an important skill in the armory of an investigator. When an investigator is searching for a character who is hiding, the opponent’s Stealth skill is used to set the difficulty level for the roll." }, highlight: 'none', checked: false },
    stealth:     { key: "stealth", value: 20, name: { zh: "潜行", en: "Stealth" }, description: { en: "When attempting to avoid detection, moving quietly, and hiding without alerting those who might hear or see." }, highlight: 'none', checked: false },
    group_survival: { key: "group_survival", name: { zh: "生存", en: "Survival" }, description: { en: "Expertise required to survive in extreme environments, such as in desert or arctic conditions, as well as upon the sea or in wilderness terrain. Inherent is the knowledge of hunting, building shelters, hazards (such as the avoidance of poisonous plants), etc. Spend skill points to purchase any skill specialization, choosing which type of environment from Wilderness, Arctic, Desert, Sea, etc. When a character does not have the obvious survival specialty, they may roll against an allied specialty with the level of difficulty increased (or a penalty die) at the Keeper’s discretion." } },
    custom_survival:{ key: "custom_survival", disabled: true, line: true },
    swim:        { key: "swim", name: { zh: "游泳", en: "Swim" }, description: { en: "Ability to float and to move through water or other liquid. Only roll for Swim in times of crisis or danger. Failing a pushed Swim roll can result in loss of hit points. It may also lead to the person being washed away downstream, or partially or completely drowned." }, disabled: true },
    throw:       { key: "throw", name: { zh: "投掷", en: "Throw" }, description: { en: "Hit a target with an object. A palm-sized object can be hurled a distance up to STR divided by 5 in yards. If the Throw roll fails, the object lands at a random distance from the target, determined by the Keeper. Use this skill in combat when throwing rocks, spears, grenades, or boomerangs." }, disabled: true },
    track:       { key: "track", value: 10, name: { zh: "追踪", en: "Track" }, description: { en: "Follow a person, vehicle, or animal over earth, and through plants. Factors such as time passed since the tracks were made, rain, and the type of ground covered may affect the difficulty level of the roll." }, highlight: 'none', checked: false }
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
          <SkillCell skill={ character.skills.anthropology } />
          <SkillCell skill={ character.skills.appraise } />
          <SkillCell skill={ character.skills.archaeology } />
          <SkillCell skill={ character.skills.group_art } />
          <SkillCell skill={ character.skills.photography } />
          <SkillCell skill={ character.skills.custom_art1 } />
          <SkillCell skill={ character.skills.custom_art2 } />
          <SkillCell skill={ character.skills.charm } />
          <SkillCell skill={ character.skills.climb } />
          <SkillCell skill={ character.skills.credit } />
          <SkillCell skill={ character.skills.cthulhu } />
          <SkillCell skill={ character.skills.disguise } />
          <SkillCell skill={ character.skills.dodge } />
          <SkillCell skill={ character.skills.drive } />
          <SkillCell skill={ character.skills.elec_repair } />
        </div>
        <div className="col-xl-3 col-6 order-3 order-xl-2 vstack gap-1 px-1">
          <SkillCell skill={ character.skills.fast_talk } />
          <SkillCell skill={ character.skills.fighting } />
          <SkillCell skill={ character.skills.custom_fight1 } />
          <SkillCell skill={ character.skills.custom_fight2 } />
          <SkillCell skill={ character.skills.firearms_handgun } />
          <SkillCell skill={ character.skills.firearms_rifle } />
          <SkillCell skill={ character.skills.custom_firearms } />
          <SkillCell skill={ character.skills.first_aid } />
          <SkillCell skill={ character.skills.history } />
          <SkillCell skill={ character.skills.intimidate } />
          <SkillCell skill={ character.skills.jump } />
          <SkillCell skill={ character.skills.group_lang } />
          <SkillCell skill={ character.skills.latin } />
          <SkillCell skill={ character.skills.custom_lang1 } />
          <SkillCell skill={ character.skills.custom_lang2 } />
          <SkillCell skill={ character.skills.group_lang_own } />
          <SkillCell skill={ character.skills.lang_own } />
        </div>
        <div className="col-xl-3 col-6 order-2 order-xl-3 vstack gap-1 px-1">
          <SkillCell skill={ character.skills.law } />
          <SkillCell skill={ character.skills.library } />
          <SkillCell skill={ character.skills.listen } />
          <SkillCell skill={ character.skills.locksmith } />
          <SkillCell skill={ character.skills.mech_repair } />
          <SkillCell skill={ character.skills.medicine } />
          <SkillCell skill={ character.skills.nature } />
          <SkillCell skill={ character.skills.navigate } />
          <SkillCell skill={ character.skills.occult } />
          <SkillCell skill={ character.skills.op_machine } />
          <SkillCell skill={ character.skills.persuade } />
          <SkillCell skill={ character.skills.group_pilot } />
          <SkillCell skill={ character.skills.custom_pilot } />
          <SkillCell skill={ character.skills.psychology } />
          <SkillCell skill={ character.skills.psychoanalysis } />
          <SkillCell skill={ character.skills.ride } />
        </div>
        <div className="col-xl-3 col-6 order-4 vstack gap-1 px-1">
          <SkillCell skill={ character.skills.group_sci } />
          <SkillCell skill={ character.skills.biology } />
          <SkillCell skill={ character.skills.pharmacy } />
          <SkillCell skill={ character.skills.custom_sci } />
          <SkillCell skill={ character.skills.sleight } />
          <SkillCell skill={ character.skills.spot } />
          <SkillCell skill={ character.skills.stealth } />
          <SkillCell skill={ character.skills.group_survival } />
          <SkillCell skill={ character.skills.custom_survival } />
          <SkillCell skill={ character.skills.swim } />
          <SkillCell skill={ character.skills.throw } />
          <SkillCell skill={ character.skills.track } />
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