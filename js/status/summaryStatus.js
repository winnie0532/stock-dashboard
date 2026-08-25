export function analyzeSummaryStatus({
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
    shortPositionStatus,
    profitabilityStatus,
    valuationStatus,
    growthStatus
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
            }),

            ...buildFundamentalEvents({
                profitabilityStatus,
                valuationStatus,
                growthStatus
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

// =========================
// 籌碼事件
// =========================

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


    // 三方壓力明顯
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


    // 結構偏弱
    // 信用結構本身惡化 + 另一項負面
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


    // 籌碼分歧
    // 信用籌碼健康，但法人或空方出現壓力
    if (
        credit === "positive" &&
        (
            institutional === "danger" ||
            short === "danger"
        )
    ) {
        events.push({
            type: "warning",
            text: "籌碼出現分歧"
        });

        return events;
    }


    // 結構健康
    // 信用籌碼健康，法人與空方皆無明顯壓力
    if (
        credit === "positive" &&
        institutional !== "danger" &&
        short !== "danger"
    ) {
        events.push({
            type: "positive",
            text: "籌碼結構健康"
        });

        return events;
    }

    // 多空拉鋸
    // 法人與空方方向相反
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


    // 其他
    events.push({
        type: "warning",
        text: "籌碼整理中"
    });

    return events;
}

// =========================
// 基本面事件
// =========================
function buildFundamentalEvents({
    profitabilityStatus,
    valuationStatus,
    growthStatus
}) {
    const profitability = profitabilityStatus?.text;
    const valuation = valuationStatus?.text;
    const growth = growthStatus?.text;

    const isProfitImproving = [
        "獲利成長",
        "獲利明顯成長"
    ].includes(profitability);

    const isProfitWeakening = [
        "獲利轉弱",
        "獲利明顯惡化"
    ].includes(profitability);

    const isProfitDivergence =
        profitability === "獲利分歧";

    const isValuationExtremelyHigh =
        valuation === "估值極高";

    const isValuationLow =
        valuation === "估值偏低";

    const isGrowthAccelerating =
        growth === "成長加速";

    const isGrowthWeakening = [
        "成長減速",
        "成長轉弱",
        "營收衰退"
    ].includes(growth);


    // 獲利轉弱＋成長轉弱
    if (
        isProfitWeakening &&
        isGrowthWeakening
    ) {
        return [{
            type: "danger",
            text: "基本面同步轉弱"
        }];
    }

    // 高估值＋獲利分歧
    if (
        isValuationExtremelyHigh &&
        isProfitDivergence
    ) {
        return [{
            type: "warning",
            text: "高估值下獲利分歧"
        }];
    }


    // 高估值＋獲利改善＋成長加速
    if (
        isValuationExtremelyHigh &&
        isProfitImproving &&
        isGrowthAccelerating
    ) {
        return [{
            type: "warning",
            text: "高估值具成長支撐"
        }];
    }


    // 低估值＋獲利改善＋成長加速
    if (
        isValuationLow &&
        isProfitImproving &&
        isGrowthAccelerating
    ) {
        return [{
            type: "positive",
            text: "低估值基本面改善"
        }];
    }


    // 獲利轉弱＋成長減速
    if (
        isProfitWeakening &&
        isGrowthSlowing
    ) {
        return [{
            type: "danger",
            text: "基本面同步轉弱"
        }];
    }


    // 獲利改善＋成長加速
    if (
        isProfitImproving &&
        isGrowthAccelerating
    ) {
        return [{
            type: "positive",
            text: "基本面動能增強"
        }];
    }


    // 沒有重要的基本面組合事件
    return [];
}

// =========================
// 目前均線位置
// =========================

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