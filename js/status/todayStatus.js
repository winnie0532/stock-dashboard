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

    const institutional =
        institutionalStatus?.type;

    const credit =
        creditStatus?.type;

    const short =
        shortPositionStatus?.type;


    // =========================
    // 三方壓力明顯
    // =========================

    if (
        institutional === "danger" &&
        credit === "danger" &&
        short === "danger"
    ) {
        events.push({
            type: "danger",
            text: "籌碼壓力明顯"
        });

        return events;
    }


    // =========================
    // 結構偏弱
    // 信用結構本身惡化 + 另一項負面
    // =========================

    if (
        credit === "danger" &&
        (
            institutional === "danger" ||
            short === "danger"
        )
    ) {
        events.push({
            type: "danger",
            text: "籌碼結構轉弱"
        });

        return events;
    }


    // =========================
    // 結構健康
    // 信用籌碼健康，且沒有兩項明顯壓力
    // =========================

    if (
        credit === "positive" &&
        !(
            institutional === "danger" &&
            short === "danger"
        )
    ) {
        events.push({
            type: "positive",
            text: "籌碼結構健康"
        });

        return events;
    }


    // =========================
    // 多空拉鋸
    // 法人與空方方向相反
    // =========================

    if (
        (
            institutional === "positive" &&
            short === "danger"
        ) ||
        (
            institutional === "danger" &&
            short === "positive"
        )
    ) {
        events.push({
            type: "warning",
            text: "多空籌碼拉鋸"
        });

        return events;
    }


    // =========================
    // 其他
    // =========================

    events.push({
        type: "warning",
        text: "籌碼整理中"
    });

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
    if (price == null || ma == null || ma === 0) {
        return {
            type: "neutral",
            text: "--",
            deviation: null
        };
    }

    const deviation = ((price - ma) / ma) * 100;

    let type = "neutral";

    if (deviation > 1) {
        type = "positive";
    } else if (deviation < -1) {
        type = "danger";
    }

    return {
        type,
        text: deviation >= 0 ? "站上" : "跌破",
        deviation
    };
}