export function calculatePriceChange(data, days) {
    if (!data || data.length <= days) {
        return null;
    }

    const latestPrice = data[data.length - 1].close;
    const previousPrice = data[data.length - 1 - days].close;

    return ((latestPrice - previousPrice) / previousPrice) * 100;
}

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