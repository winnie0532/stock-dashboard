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
        {
            name: "法人",
            status: institutionalStatus
        },
        {
            name: "信用籌碼",
            status: creditStatus
        },
        {
            name: "空方籌碼",
            status: shortPositionStatus
        }
    ];

    const positive = statuses.filter(
        item => item.status?.type === "positive"
    );

    const danger = statuses.filter(
        item => item.status?.type === "danger"
    );

    // 三項一致偏多
    if (positive.length === 3) {
        events.push({
            type: "positive",
            text: "籌碼一致偏多｜法人、信用籌碼、空方籌碼皆偏多"
        });

        return events;
    }

    // 三項一致偏空
    if (danger.length === 3) {
        events.push({
            type: "danger",
            text: "籌碼一致偏空｜法人、信用籌碼、空方籌碼皆偏空"
        });

        return events;
    }

    // 兩多一空
    if (positive.length === 2 && danger.length === 1) {
        events.push({
            type: "warning",
            text:
                `籌碼偏多｜` +
                `${positive.map(item => item.name).join("、")}偏多；` +
                `${danger[0].name}偏空`
        });

        return events;
    }

    // 兩空一多
    if (danger.length === 2 && positive.length === 1) {
        events.push({
            type: "warning",
            text:
                `籌碼偏空｜` +
                `${danger.map(item => item.name).join("、")}偏空；` +
                `${positive[0].name}偏多`
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