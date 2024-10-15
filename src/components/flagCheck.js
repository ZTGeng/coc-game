export default function flagConditionCheckProvider(flags, flagFunctions, parentCheck) {
    const flagConditionCheck = (condition) => {
        // if condition is an object
        if (Object.prototype.toString.call(condition) === "[object Object]") {
            if (condition.type === "and") {
                return condition.flags.every(flag => flagConditionCheck(flag));
            } else if (condition.type === "or") {
                return condition.flags.some(flag => flagConditionCheck(flag));
            } else if (condition.flag) {
                if (flagFunctions && flagFunctions[condition.flag]) {
                    return flagFunctions[condition.flag](condition.param);
                }
            }
        } else if (Array.isArray(condition)) {
            return condition.every(cond => flagConditionCheck(cond));
        } else if (typeof condition === 'boolean') {
            return condition;
        } else if (typeof condition === 'string') {
            if (condition.startsWith("!")) {
                return !flagConditionCheck(condition.slice(1));
            }
            if (flags && condition in flags) {
                return flags[condition];
            }
            if (flagFunctions && flagFunctions[condition]) {
                return flagFunctions[condition]();
            }
        }

        if (parentCheck) {
            return parentCheck(condition);
        }
        console.log(`Un-handled condition: ${condition}`);
        return false;
    };
    return flagConditionCheck;
}
