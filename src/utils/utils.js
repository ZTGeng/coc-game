
export function roll(num, dice) {
    const rolls = [];
    for (let i = 0; i < num; i++) {
        rolls.push(Math.floor(Math.random() * dice) + 1);
    }
    return rolls;
}

export function calculateDamageBonus(STR, SIZ) {
    const value = STR + SIZ;
    if (value > 164) {
        return "1d6";
    } else if (value > 124) {
        return "1d4";
    } else if (value > 84) {
        return 0;
    } else if (value > 64) {
        return -1;
    } else {
        return -2;
    }
}

export function calculateBuild(STR, SIZ) {
    const value = STR + SIZ;
    if (value > 164) {
        return 2;
    } else if (value > 124) {
        return 1;
    } else if (value > 84) {
        return 0;
    } else if (value > 64) {
        return -1;
    } else {
        return -2;
    }
}

export function calculateLevel(diceNumber, value, half, fifth) { // 0: fail, 1: value, 2: half, 3: fifth
    if (!half && half !== 0) half = Math.floor(value / 2);
    if (!fifth && fifth !== 0) fifth = Math.floor(value / 5);
    return diceNumber <= fifth ? 3 : diceNumber <= half ? 2 : diceNumber <= value ? 1 : 0;
}

export function int32ToBooleanArray(int32Array, total) {
    const boolArray = new Array(total).fill(false);
    for (let i = 0; i < total; i++) {
      const arrayIndex = Math.floor(i / 32);
      const bitPosition = i % 32;
      boolArray[i] = (int32Array[arrayIndex] & (1 << bitPosition)) !== 0;
    }
    return boolArray;
}

export function booleanToInt32Array(boolArray) {
    const total = boolArray.length;
    const int32Array = new Uint32Array(Math.ceil(total / 32)).fill(0);
    for (let i = 0; i < total; i++) {
      const arrayIndex = Math.floor(i / 32);
      const bitPosition = i % 32;
      if (boolArray[i]) {
        int32Array[arrayIndex] |= 1 << bitPosition;
      }
    }
    return int32Array;
}
  

export const TEXTS = {
    yourName: { zh: "你", en: "You" },
    opponentName: { zh: "对手", en: "Opponent" },
    damage: { zh: "伤害", en: "Damage" },
    yourRoll: { zh: "你的检定", en: "Your roll" },
    opponentRoll: { zh: "对手检定", en: "Opponent's roll" },
    opposedRoll: { zh: "对抗检定", en: "Opposed Roll" },
    combat: { zh: "战斗", en: "Combat" },
    rollSuffix: { zh: "检定", en: " Roll" },
    rollLuck: { zh: "投掷幸运点数", en: "Roll Luck Score" },
    bonusDie: { zh: "奖励骰", en: "Bonus Die" },
    penaltyDie: { zh: "惩罚骰", en: "Penalty Die" },
    or: { zh: "或", en: " or " },
    vs: { zh: " vs ", en: " vs " },
}