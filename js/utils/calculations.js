export function sumRecent(data, key, days) {
    return data
        .slice(-days)
        .reduce((sum, item) => sum + item[key], 0);
}

export function calculateDeviation(value, baseValue) {
    if (value == null || baseValue == null || baseValue === 0) return null;

    return ((value - baseValue) / baseValue) * 100;
}

