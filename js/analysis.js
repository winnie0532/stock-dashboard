export function analyzeTechnical({ 
    latestPrice, 
    ma5, 
    ma20, 
    ma60, 
    ma120, 
    ma240, 
    volumeRatio, 
    rsi, 
    todayKD, 
    yesterdayKD, 
    todayMACD, 
    yesterdayMACD 
}) { 
    return { 
        trend: analyzeTrend(latestPrice, ma20, ma60, ma120, ma240), 
        shortTerm: analyzeShortTerm(latestPrice, ma5, todayKD, yesterdayKD), 
        volume: analyzeVolume(volumeRatio), 
        rsi: analyzeRSI(rsi), 
        macd: analyzeMACD(todayMACD, yesterdayMACD), 
        kd: analyzeKD(todayKD, yesterdayKD),

        signals: buildSignals({ 
            latestPrice, 
            ma5, 
            ma20, 
            ma60, 
            ma120, 
            ma240, 
            todayKD, 
            yesterdayKD, 
            todayMACD, 
            yesterdayMACD 
        }) 
    }; 
}

function analyzeTrend(price, ma20, ma60, ma120, ma240) {
    if (price > ma20 && price > ma60 && price > ma120 && price > ma240) {
        return {
            type: "positive",
            text: "中期偏多"
        };
    }

    if (price < ma20 && price < ma60 && price < ma120 && price < ma240) {
        return {
            type: "danger",
            text: "中期偏空"
        };
    }

    return {
        type: "warning",
        text: "趨勢整理"
    };
}
function analyzeShortTerm(price, ma5, todayKD, yesterdayKD) {
    const kdDeathCross = yesterdayKD.k >= yesterdayKD.d && todayKD.k < todayKD.d;
    const kdGoldenCross = yesterdayKD.k <= yesterdayKD.d && todayKD.k > todayKD.d;

    if (price < ma5 && kdDeathCross) {
        return {
            type: "warning",
            text: "動能轉弱"
        };
    }

    if (price > ma5 && kdGoldenCross) {
        return {
            type: "positive",
            text: "動能轉強"
        };
    }

    return {
        type: "neutral",
        text: "短線中性"
    };
}
function analyzeVolume(ratio) {
    if (ratio >= 2) {
        return {
            type: "danger",
            text: `爆量 ${ratio.toFixed(2)}x`
        };
    }

    if (ratio >= 1.5) {
        return {
            type: "warning",
            text: `明顯放量 ${ratio.toFixed(2)}x`
        };
    }

    if (ratio >= 1.2) {
        return {
            type: "warning",
            text: `小幅放量 ${ratio.toFixed(2)}x`
        };
    }

    if (ratio < 0.8) {
        return {
            type: "neutral",
            text: `量縮 ${ratio.toFixed(2)}x`
        };
    }

    return {
        type: "neutral",
        text: `正常 ${ratio.toFixed(2)}x`
    };
}

function analyzeRSI(rsi) {
    if (rsi >= 70) {
        return {
            type: "danger",
            text: `過熱 ${rsi.toFixed(2)}`
        };
    }

    if (rsi >= 60) {
        return {
            type: "positive",
            text: `偏強 ${rsi.toFixed(2)}`
        };
    }

    if (rsi >= 40) {
        return {
            type: "neutral",
            text: `中性 ${rsi.toFixed(2)}`
        };
    }

    if (rsi >= 30) {
        return {
            type: "warning",
            text: `偏弱 ${rsi.toFixed(2)}`
        };
    }

    return {
        type: "warning",
        text: `超賣 ${rsi.toFixed(2)}`
    };
}

function analyzeMACD(today, yesterday) {
    if (today.histogram > 0 && today.histogram > yesterday.histogram) {
        return {
            type: "positive",
            text: "多方動能增強"
        };
    }

    if (today.histogram > 0 && today.histogram < yesterday.histogram) {
        return {
            type: "warning",
            text: "多方動能減弱"
        };
    }

    if (today.histogram < 0 && today.histogram < yesterday.histogram) {
        return {
            type: "danger",
            text: "空方動能增強"
        };
    }

    if (today.histogram < 0 && today.histogram > yesterday.histogram) {
        return {
            type: "warning",
            text: "空方動能減弱"
        };
    }

    return {
        type: "neutral",
        text: "動能持平"
    };
}
function analyzeKD(todayKD, yesterdayKD) {
    if (yesterdayKD.k <= yesterdayKD.d && todayKD.k > todayKD.d) {
        return {
            text: "黃金交叉",
            type: "positive"
        };
    }

    if (yesterdayKD.k >= yesterdayKD.d && todayKD.k < todayKD.d) {
        return {
            text: "死亡交叉",
            type: "danger"
        };
    }

    if (todayKD.k > todayKD.d) {
        return {
            text: "動能偏多",
            type: "positive"
        };
    }

    if (todayKD.k < todayKD.d) {
        return {
            text: "動能偏空",
            type: "danger"
        };
    }

    return {
        text: "中性",
        type: "neutral"
    };
}
function buildSignals({
    latestPrice,
    ma5,
    ma20,
    ma60,
    ma120,
    ma240,
    todayKD,
    yesterdayKD,
    todayMACD,
    yesterdayMACD
}) {
    const signals = [];

    if (yesterdayKD.k <= yesterdayKD.d && todayKD.k > todayKD.d) {
        signals.push({ type: "positive", text: "KD 黃金交叉" });
    }

    if (yesterdayKD.k >= yesterdayKD.d && todayKD.k < todayKD.d) {
        signals.push({ type: "danger", text: "KD 死亡交叉" });
    }

    if (yesterdayMACD.dif <= yesterdayMACD.signal && todayMACD.dif > todayMACD.signal) {
        signals.push({ type: "positive", text: "MACD 黃金交叉" });
    }

    if (yesterdayMACD.dif >= yesterdayMACD.signal && todayMACD.dif < todayMACD.signal) {
        signals.push({ type: "danger", text: "MACD 死亡交叉" });
    }

    signals.push({
        type: latestPrice >= ma5 ? "positive" : "warning",
        text: latestPrice >= ma5 ? "站上 5 日線" : "跌破 5 日線"
    });

    signals.push({
        type: latestPrice >= ma20 ? "positive" : "warning",
        text: latestPrice >= ma20 ? "仍守住月線" : "跌破月線"
    });

    signals.push({
        type: latestPrice >= ma60 ? "positive" : "danger",
        text: latestPrice >= ma60 ? "仍守住季線" : "跌破季線"
    });

    signals.push({
        type: latestPrice >= ma120 ? "positive" : "danger",
        text: latestPrice >= ma120 ? "仍守住半年線" : "跌破半年線"
    });

    signals.push({
        type: latestPrice >= ma240 ? "positive" : "danger",
        text: latestPrice >= ma240 ? "仍守住年線" : "跌破年線"
    });

    return signals;
}