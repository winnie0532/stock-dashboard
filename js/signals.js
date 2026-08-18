export function buildSignals({
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
        signals.push({
            type: "positive",
            text: "KD 黃金交叉"
        });
    }

    if (yesterdayKD.k >= yesterdayKD.d && todayKD.k < todayKD.d) {
        signals.push({
            type: "danger",
            text: "KD 死亡交叉"
        });
    }

    if (
        yesterdayMACD.dif <= yesterdayMACD.signal &&
        todayMACD.dif > todayMACD.signal
    ) {
        signals.push({
            type: "positive",
            text: "MACD 黃金交叉"
        });
    }

    if (
        yesterdayMACD.dif >= yesterdayMACD.signal &&
        todayMACD.dif < todayMACD.signal
    ) {
        signals.push({
            type: "danger",
            text: "MACD 死亡交叉"
        });
    }

    signals.push({
        type: latestPrice >= ma5 ? "positive" : "warning",
        text: latestPrice >= ma5
            ? "站上 5 日線"
            : "跌破 5 日線"
    });

    signals.push({
        type: latestPrice >= ma20 ? "positive" : "warning",
        text: latestPrice >= ma20
            ? "仍守住月線"
            : "跌破月線"
    });

    signals.push({
        type: latestPrice >= ma60 ? "positive" : "danger",
        text: latestPrice >= ma60
            ? "仍守住季線"
            : "跌破季線"
    });

    signals.push({
        type: latestPrice >= ma120 ? "positive" : "danger",
        text: latestPrice >= ma120
            ? "仍守住半年線"
            : "跌破半年線"
    });

    signals.push({
        type: latestPrice >= ma240 ? "positive" : "danger",
        text: latestPrice >= ma240
            ? "仍守住年線"
            : "跌破年線"
    });

    return signals;
}