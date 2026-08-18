export function analyzeTechnicalStatus({
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
    return {
        events: buildEvents({
            todayKD,
            yesterdayKD,
            todayMACD,
            yesterdayMACD
        }),

        movingAverages: buildMovingAverageStatus({
            latestPrice,
            ma5,
            ma20,
            ma60,
            ma120,
            ma240
        })
    };
}

// 今日技術事件
function buildEvents({
    todayKD,
    yesterdayKD,
    todayMACD,
    yesterdayMACD
}) {
    const events = [];

    if (yesterdayKD.k <= yesterdayKD.d && todayKD.k > todayKD.d) {
        events.push({
            type: "positive",
            text: "KD 黃金交叉"
        });
    }

    if (yesterdayKD.k >= yesterdayKD.d && todayKD.k < todayKD.d) {
        events.push({
            type: "danger",
            text: "KD 死亡交叉"
        });
    }

    if (
        yesterdayMACD.dif <= yesterdayMACD.signal &&
        todayMACD.dif > todayMACD.signal
    ) {
        events.push({
            type: "positive",
            text: "MACD 黃金交叉"
        });
    }

    if (
        yesterdayMACD.dif >= yesterdayMACD.signal &&
        todayMACD.dif < todayMACD.signal
    ) {
        events.push({
            type: "danger",
            text: "MACD 死亡交叉"
        });
    }

    return events;
}

// 目前均線位置
function buildMovingAverageStatus({
    latestPrice,
    ma5,
    ma20,
    ma60,
    ma120,
    ma240
}) {
    return {
        ma5: createMAStatus(latestPrice, ma5),
        ma20: createMAStatus(latestPrice, ma20),
        ma60: createMAStatus(latestPrice, ma60),
        ma120: createMAStatus(latestPrice, ma120),
        ma240: createMAStatus(latestPrice, ma240)
    };
}

function createMAStatus(price, ma) {
    if (price >= ma) {
        return {
            type: "positive",
            text: "站上"
        };
    }

    return {
        type: "danger",
        text: "跌破"
    };
}