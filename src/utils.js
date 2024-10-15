
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
  

export const TEXTS = {
    yourName: { zh: "你", en: "You" },
    opponentName: { zh: "对手", en: "Opponent" },
    damage: { zh: "伤害", en: "Damage" },
    yourRoll: { zh: "你的检定", en: "Your roll" },
    opponentRoll: { zh: "对手检定", en: "Opponent's roll" },
    opposedRoll: { zh: "对抗检定", en: "Opposed roll" },
    combat: { zh: "战斗", en: "Combat" },
    rollSuffix: { zh: "检定", en: " Roll" },
}