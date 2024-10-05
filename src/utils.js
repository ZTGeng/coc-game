
export function roll(num, dice) {
    const rolls = [];
    for (let i = 0; i < num; i++) {
        rolls.push(Math.floor(Math.random() * dice) + 1);
    }
    return rolls;
}