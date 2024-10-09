export default function flagConditionCheckProvider(flagStringCheck) {
    const flagConditionCheck = (condition) => {
        // if condition is an object
        if (Object.prototype.toString.call(condition) === "[object Object]") {
            if (condition.type === "and") {
                return condition.flags.every(flag => flagConditionCheck(flag));
            } else if (condition.type === "or") {
                return condition.flags.some(flag => flagConditionCheck(flag));
            } else {
                console.log(`Un-handled condition type: ${JSON.stringify(condition)}`);
                return false;
            }
        } else if (Array.isArray(condition)) {
            return condition.every(cond => flagConditionCheck(cond));
        } else if (typeof condition === 'boolean') {
            return condition;
        } else if (typeof condition === 'string') {
            if (condition.startsWith("!")) {
                return !flagStringCheck(condition.slice(1));
            }
            return flagStringCheck(condition);
        } else {
            console.log(`Un-handled condition: ${condition}`);
            return false;
        }
    };
    return flagConditionCheck;
}
