export function analyzeTodayStatus({
    latestPrice,
    ma5,
    ma20,
    ma60,
    ma120,
    ma240,
    todayKD,
    yesterdayKD,
    todayMACD,
    yesterdayMACD,
    institutionalStatus,
    creditStatus,
    shortPositionStatus
}) {
    return {
        events: [
            ...buildTechnicalEvents({
                todayKD,
                yesterdayKD,
                todayMACD,
                yesterdayMACD
            }),

            ...buildChipEvents({
                institutionalStatus,
                creditStatus,
                shortPositionStatus
            })
        ],

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
function buildTechnicalEvents({
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
// 籌碼事件
function buildChipEvents({
    institutionalStatus,
    creditStatus,
    shortPositionStatus
}) {
    const events = [];

    const statuses = [
        institutionalStatus,
        creditStatus,
        shortPositionStatus
    ];

    const positiveCount = statuses.filter(
        status => status?.type === "positive"
    ).length;

    const dangerCount = statuses.filter(
        status => status?.type === "danger"
    ).length;

    if (positiveCount === 3) {
        events.push({
            type: "positive",
            text: "籌碼明顯轉強"
        });
        return events;
    }

    if (dangerCount === 3) {
        events.push({
            type: "danger",
            text: "籌碼明顯轉弱"
        });
        return events;
    }

    if (positiveCount === 2 && dangerCount === 1) {
        events.push({
            type: "warning",
            text: "籌碼偏多但有分歧"
        });
        return events;
    }

    if (dangerCount === 2 && positiveCount === 1) {
        events.push({
            type: "warning",
            text: "籌碼偏空但有分歧"
        });
        return events;
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