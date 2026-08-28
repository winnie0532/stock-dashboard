export function getGlobalMarketChangeClass(change) {
    if (change > 0) return "value-up";
    if (change < 0) return "value-down";
    return "value-neutral";
}

export function formatGlobalMarketValue({
    value,
    decimals = 2,
    prefix = "",
    suffix = ""
}) {
    return `${prefix}${Number(value).toLocaleString("en-US", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    })}${suffix}`;
}

export function formatGlobalMarketChange({
    change,
    changeType = "percent"
}) {
    const sign = change > 0 ? "+" : "";

    if (changeType === "basisPoint") {
        return `${sign}${change.toFixed(0)} bp`;
    }

    return `${sign}${change.toFixed(2)}%`;
}