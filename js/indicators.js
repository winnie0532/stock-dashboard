import { sumRecent } from "./utils/calculations.js";

// =========================
// 價格
// =========================

export function calculatePriceChange(data, days) {
    if (!data || data.length <= days) {
        return null;
    }

    const latestPrice = data[data.length - 1].close;
    const previousPrice = data[data.length - 1 - days].close;

    return ((latestPrice - previousPrice) / previousPrice) * 100;
}

// =========================
// 均線 / 成交量
// =========================

export function calculateMA(data, period) {
    if (data.length < period) {
        return null;
    }

    const recentData = data.slice(-period);

    const total = recentData.reduce(
        (sum, item) => sum + item.close,
        0
    );

    return total / period;
}

export function calculateAverageVolume(data, period = 20) {
    if (data.length < period) {
        return null;
    }

    const recentData = data.slice(-period);

    const totalVolume = recentData.reduce(
        (sum, item) => sum + item.volume,
        0
    );

    return totalVolume / period;
}

// =========================
// RSI / KD / MACD
// =========================

export function calculateRSI(data, period = 14) {
    if (data.length <= period) {
        return null;
    }

    const changes = [];

    for (let i = 1; i < data.length; i++) {
        changes.push(data[i].close - data[i - 1].close);
    }

    // 第一組平均漲幅 / 平均跌幅
    let gains = 0;
    let losses = 0;

    for (let i = 0; i < period; i++) {
        const change = changes[i];

        if (change > 0) {
            gains += change;
        } else {
            losses += Math.abs(change);
        }
    }

    let averageGain = gains / period;
    let averageLoss = losses / period;

    // Wilder smoothing
    for (let i = period; i < changes.length; i++) {
        const change = changes[i];

        const gain = change > 0 ? change : 0;
        const loss = change < 0 ? Math.abs(change) : 0;

        averageGain =
            (averageGain * (period - 1) + gain) / period;

        averageLoss =
            (averageLoss * (period - 1) + loss) / period;
    }

    if (averageLoss === 0) {
        return 100;
    }

    const rs = averageGain / averageLoss;

    return 100 - (100 / (1 + rs));
}

export function calculateKD(data, period = 9) {
    if (data.length < period) {
        return null;
    }

    let k = 50;
    let d = 50;

    const history = [];

    for (let i = period - 1; i < data.length; i++) {
        const recentData = data.slice(i - period + 1, i + 1);

        const highestHigh = Math.max(
            ...recentData.map(item => item.high)
        );

        const lowestLow = Math.min(
            ...recentData.map(item => item.low)
        );

        const close = data[i].close;

        let rsv = 50;

        if (highestHigh !== lowestLow) {
            rsv =
                ((close - lowestLow) /
                    (highestHigh - lowestLow)) *
                100;
        }

        k = (2 / 3) * k + (1 / 3) * rsv;
        d = (2 / 3) * d + (1 / 3) * k;

        history.push({
            date: data[i].date,
            k,
            d
        });
    }

    return history;
}
function calculateEMA(values, period) {
    if (values.length < period) return [];

    const multiplier = 2 / (period + 1);
    const ema = [];

    const firstAverage = values.slice(0, period).reduce((sum, value) => sum + value, 0) / period;
    ema.push(firstAverage);

    for (let i = period; i < values.length; i++) {
        const currentEMA = (values[i] - ema[ema.length - 1]) * multiplier + ema[ema.length - 1];
        ema.push(currentEMA);
    }

    return ema;
}
export function calculateMACD(data, shortPeriod = 12, longPeriod = 26, signalPeriod = 9) {
    if (data.length < longPeriod + signalPeriod) return null;

    const closes = data.map(item => item.close);

    const shortEMA = calculateEMA(closes, shortPeriod);
    const longEMA = calculateEMA(closes, longPeriod);

    const difValues = [];

    for (let i = longPeriod - 1; i < closes.length; i++) {
        const shortIndex = i - (shortPeriod - 1);
        const longIndex = i - (longPeriod - 1);

        difValues.push(shortEMA[shortIndex] - longEMA[longIndex]);
    }

    const signalEMA = calculateEMA(difValues, signalPeriod);
    const history = [];

    for (let i = signalPeriod - 1; i < difValues.length; i++) {
        const dif = difValues[i];
        const signal = signalEMA[i - (signalPeriod - 1)];

        history.push({
            date: data[longPeriod + i - 1].date,
            dif,
            signal,
            histogram: dif - signal
        });
    }

    return history;
}

// =========================
// 三大法人
// =========================

// 整理 FinMind 法人原始資料
export function organizeInstitutionalData(data) {
    const grouped = {};

    data.forEach(item => {
        if (!grouped[item.date]) {
            grouped[item.date] = {
                date: item.date,
                foreign: 0,
                trust: 0,
                dealer: 0
            };
        }

        const netBuy = item.buy - item.sell;

        switch (item.name) {
            case "Foreign_Investor":
                grouped[item.date].foreign += netBuy;
                break;

            case "Investment_Trust":
                grouped[item.date].trust += netBuy;
                break;

            case "Dealer_self":
            case "Dealer_Hedging":
                grouped[item.date].dealer += netBuy;
                break;
        }
    });

    return Object.values(grouped)
        .sort((a, b) => a.date.localeCompare(b.date));
}


// 今日、前一日、5 / 20 / 60 日法人統計
export function calculateInstitutionalIndicators(data) {
    if (!data || data.length === 0) {
        return null;
    }

    const latest = data[data.length - 1];
    const previous = data[data.length - 2];

    return {
        today: {
            foreign: latest.foreign,
            trust: latest.trust,
            dealer: latest.dealer
        },

        recent: {
            foreign: {
                day5: sumRecent(data, "foreign", 5),
                day20: sumRecent(data, "foreign", 20),
                day60: sumRecent(data, "foreign", 60)
            },

            trust: {
                day5: sumRecent(data, "trust", 5),
                day20: sumRecent(data, "trust", 20),
                day60: sumRecent(data, "trust", 60)
            },

            dealer: {
                day5: sumRecent(data, "dealer", 5),
                day20: sumRecent(data, "dealer", 20),
                day60: sumRecent(data, "dealer", 60)
            }
        },

        previous: {
            foreign: previous?.foreign ?? 0,
            trust: previous?.trust ?? 0,
            dealer: previous?.dealer ?? 0
        }
    };
}

// MA 歷史資料
export function calculateMAHistory(data, period) {
    return data.map((item, index) => {
        if (index < period - 1) {
            return {
                date: item.date,
                value: null
            };
        }

        const recentData = data.slice(
            index - period + 1,
            index + 1
        );

        const total = recentData.reduce(
            (sum, item) => sum + item.close,
            0
        );

        return {
            date: item.date,
            value: total / period
        };
    });
}

// 計算技術面指標
export function calculateTechnicalIndicators(data) {
    const latest = data[data.length - 1];

    const ma5 = calculateMA(data, 5);
    const ma20 = calculateMA(data, 20);
    const ma60 = calculateMA(data, 60);
    const ma120 = calculateMA(data, 120);
    const ma240 = calculateMA(data, 240);

    const ma5History = calculateMAHistory(data, 5);
    const ma20History = calculateMAHistory(data, 20);
    const ma60History = calculateMAHistory(data, 60);
    const ma120History = calculateMAHistory(data, 120);
    const ma240History = calculateMAHistory(data, 240);

    const avgVolume20 = calculateAverageVolume(data, 20);
    const volumeRatio = latest.volume / avgVolume20;

    const rsi14 = calculateRSI(data, 14);

    const kdHistory = calculateKD(data);
    const todayKD = kdHistory[kdHistory.length - 1];
    const yesterdayKD = kdHistory[kdHistory.length - 2];

    const macdHistory = calculateMACD(data);
    const todayMACD = macdHistory[macdHistory.length - 1];
    const yesterdayMACD = macdHistory[macdHistory.length - 2];

    return {
        latest,

        movingAverages: {
            ma5,
            ma20,
            ma60,
            ma120,
            ma240
        },

        movingAverageHistory: {
            ma5: ma5History,
            ma20: ma20History,
            ma60: ma60History,
            ma120: ma120History,
            ma240: ma240History
        },

        volume: {
            current: latest.volume,
            average20: avgVolume20,
            ratio: volumeRatio
        },

        rsi14,

        kd: {
            history: kdHistory,
            today: todayKD,
            yesterday: yesterdayKD
        },

        macd: {
            history: macdHistory,
            today: todayMACD,
            yesterday: yesterdayMACD
        }
    };
}

// 融資／融券的「今日、5 日、20 日」餘額差
export function calculateMarginIndicators(data) {
    if (!data || data.length === 0) {
        return null;
    }

    const sorted = [...data].sort(
        (a, b) => new Date(a.date) - new Date(b.date)
    );

    const latest = sorted[sorted.length - 1];

    function getBalanceChange(field, days) {
        const currentBalance = latest[field];

        if (days === 1) {
            const yesterdayField =
                field === "MarginPurchaseTodayBalance"
                    ? "MarginPurchaseYesterdayBalance"
                    : "ShortSaleYesterdayBalance";

            return currentBalance - latest[yesterdayField];
        }

        if (sorted.length <= days) {
            return null;
        }

        const previous = sorted[sorted.length - 1 - days];

        return currentBalance - previous[field];
    }
    function getBalanceChangePercent(field, days) {
        if (sorted.length <= days) {
            return null;
        }

        const currentBalance = latest[field];
        const previous = sorted[sorted.length - 1 - days];
        const previousBalance = previous[field];

        if (!previousBalance) {
            return null;
        }

        return (
            (currentBalance - previousBalance) /
            previousBalance
        ) * 100;
    }

    return {
        margin: {
            today: getBalanceChange("MarginPurchaseTodayBalance", 1),

            day5: getBalanceChange("MarginPurchaseTodayBalance", 5),
            day5Percent: getBalanceChangePercent(
                "MarginPurchaseTodayBalance",
                5
            ),

            day20: getBalanceChange("MarginPurchaseTodayBalance", 20),
            day20Percent: getBalanceChangePercent(
                "MarginPurchaseTodayBalance",
                20
            )
        },

        short: {
            today: getBalanceChange("ShortSaleTodayBalance", 1),
            day5: getBalanceChange("ShortSaleTodayBalance", 5),
            day20: getBalanceChange("ShortSaleTodayBalance", 20)
        },

        latestBalance: {
            margin: latest.MarginPurchaseTodayBalance,
            short: latest.ShortSaleTodayBalance
        }
    };
}