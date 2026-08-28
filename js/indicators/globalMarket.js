function sortByDate(rows) {
    return [...rows].sort(
        (a, b) => new Date(a.date) - new Date(b.date)
    );
}

function getNumber(row, keys) {
    for (const key of keys) {
        const value = Number(row[key]);

        if (Number.isFinite(value)) {
            return value;
        }
    }

    return null;
}

function normalizeHistory(rows, valueKeys) {
    return sortByDate(rows)
        .map(row => ({
            date: row.date?.slice(0, 10),
            value: getNumber(row, valueKeys)
        }))
        .filter(item =>
            item.date &&
            Number.isFinite(item.value)
        );
}

function calculateChange(current, previous) {
    if (
        !Number.isFinite(current) ||
        !Number.isFinite(previous) ||
        previous === 0
    ) {
        return null;
    }

    return ((current - previous) / previous) * 100;
}

function calculateMovingAverage(history, index, period) {
    if (index < period - 1) {
        return null;
    }

    const values = history
        .slice(index - period + 1, index + 1)
        .map(item => item.value);

    return values.reduce((sum, value) => sum + value, 0) / period;
}

function addMovingAverages(history) {
    return history.map((item, index) => ({
        ...item,
        ma20: calculateMovingAverage(history, index, 20),
        ma60: calculateMovingAverage(history, index, 60)
    }));
}

function getDateMonthsAgo(dateText, months) {
    const date = new Date(dateText);

    date.setMonth(date.getMonth() - months);

    return date;
}

function findValueAtOrBefore(history, targetDate) {
    return [...history]
        .reverse()
        .find(item => new Date(item.date) <= targetDate);
}

function calculatePeriodChange(history, months) {
    const latest = history.at(-1);

    if (!latest) {
        return null;
    }

    const targetDate = getDateMonthsAgo(latest.date, months);
    const base = findValueAtOrBefore(history, targetDate);

    return base
        ? calculateChange(latest.value, base.value)
        : null;
}

function filterHistoryByMonths(history, months) {
    const latest = history.at(-1);

    if (!latest) {
        return [];
    }

    const startDate = getDateMonthsAgo(latest.date, months);

    return history.filter(item =>
        new Date(item.date) >= startDate
    );
}

function calculateRangePosition(history) {
    if (history.length === 0) {
        return null;
    }

    const values = history.map(item => item.value);
    const low = Math.min(...values);
    const high = Math.max(...values);
    const latest = values.at(-1);

    return {
        low,
        high,
        position:
            high === low
                ? 50
                : ((latest - low) / (high - low)) * 100
    };
}

function buildPriceMarket({
    id,
    category,
    name,
    rows,
    valueKeys,
    decimals = 2,
    prefix = "",
    suffix = ""
}) {
    const history = normalizeHistory(rows, valueKeys);
    const latest = history.at(-1);
    const previous = history.at(-2);

    if (!latest || !previous) {
        return null;
    }

    return {
        id,
        category,
        name,
        value: latest.value,
        change: calculateChange(latest.value, previous.value),
        changeType: "percent",
        decimals,
        prefix,
        suffix
    };
}

function buildYieldMarket({ id, name, rows }) {
    const history = normalizeHistory(rows, ["value"]);
    const latest = history.at(-1);
    const previous = history.at(-2);

    if (!latest || !previous) {
        return null;
    }

    return {
        id,
        category: "利率",
        name,
        value: latest.value,
        // 殖利率 0.01 個百分點 = 1 bp
        change: (latest.value - previous.value) * 100,
        changeType: "basisPoint",
        decimals: 2,
        suffix: "%"
    };
}

export function calculateUsdTwdIndicators(rawHistory) {
    const history = addMovingAverages(
        normalizeHistory(rawHistory, ["spot_sell"])
    );

    const latest = history.at(-1);
    const oneYearHistory = filterHistoryByMonths(history, 12);

    if (!latest) {
        return null;
    }

    return {
        latest: latest.value,

        changes: {
            oneMonth: calculatePeriodChange(history, 1),
            threeMonths: calculatePeriodChange(history, 3),
            sixMonths: calculatePeriodChange(history, 6)
        },

        range: calculateRangePosition(oneYearHistory),

        history
    };
}

export function calculateGlobalMarketIndicators(rawData) {
    const usdTwd = calculateUsdTwdIndicators(rawData.usdTwd);

    const markets = [
        buildPriceMarket({
            id: "sp500",
            category: "美股",
            name: "S&P 500",
            rows: rawData.sp500,
            valueKeys: ["close", "Close", "Adj_Close"]
        }),

        buildPriceMarket({
            id: "nasdaq",
            category: "美股",
            name: "NASDAQ",
            rows: rawData.nasdaq,
            valueKeys: ["close", "Close", "Adj_Close"]
        }),

        buildPriceMarket({
            id: "sox",
            category: "美股",
            name: "費城半導體",
            rows: rawData.sox,
            valueKeys: ["close", "Close", "Adj_Close"]
        }),

        usdTwd
            ? {
                id: "usdTwd",
                category: "匯率",
                name: "美元／台幣",
                value: usdTwd.latest,
                change: calculateChange(
                    usdTwd.history.at(-1).value,
                    usdTwd.history.at(-2).value
                ),
                changeType: "percent",
                decimals: 3
            }
            : null,

        buildYieldMarket({
            id: "us2Y",
            name: "美國 2Y 殖利率",
            rows: rawData.us2Y
        }),

        buildYieldMarket({
            id: "us10Y",
            name: "美國 10Y 殖利率",
            rows: rawData.us10Y
        }),

        buildPriceMarket({
            id: "gold",
            category: "商品",
            name: "黃金",
            rows: rawData.gold,
            valueKeys: ["Price", "price"],
            decimals: 1,
            prefix: "$"
        }),

        buildPriceMarket({
            id: "wti",
            category: "商品",
            name: "WTI 原油",
            rows: rawData.wti,
            valueKeys: ["price", "Price"],
            decimals: 2,
            prefix: "$"
        })
    ].filter(Boolean);

    return {
        overview: {
            source: "FinMind daily",
            markets
        },

        usdTwd
    };
}

export function getUsdTwdHistoryByPeriod(history, period) {
    const months = {
        "1M": 1,
        "3M": 3,
        "6M": 6,
        "1Y": 12
    };

    return filterHistoryByMonths(history, months[period] ?? 6);
}