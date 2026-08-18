export function sumRecent(data, key, days) {
    return data
        .slice(-days)
        .reduce((sum, item) => sum + item[key], 0);
}