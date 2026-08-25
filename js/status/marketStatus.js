export function analyzeMarketStatus({
    latestPrice,
    ma5,
    ma20,
    ma60,
    ma120,
    ma240,
    volumeRatio,
    rsi,
    rsiFiveDaysAgo,
    todayKD,
    yesterdayKD,
    todayMACD,
    yesterdayMACD,
    institutionalIndicators,
    priceChange5,
    priceChange20,
    marginIndicators,
    shortSaleIndicators,
    profitability,
    valuation,
    growth
}) {
    return {
        trend: analyzeTrend(latestPrice, ma20, ma60, ma120, ma240),
        shortTerm: analyzeShortTerm(
            latestPrice,
            ma5,
            todayKD,
            yesterdayKD
        ),
        volume: analyzeVolume(volumeRatio),
        rsi: analyzeRSI(rsi, rsiFiveDaysAgo),
        macd: analyzeMACD(todayMACD, yesterdayMACD),
        institutional: analyzeInstitutionalEvent(institutionalIndicators),
        credit: analyzeCreditStatus(
            priceChange5,
            priceChange20,
            marginIndicators
        ),
        shortPosition: analyzeShortPositionStatus(
            marginIndicators,
            shortSaleIndicators
        ),
        profitability: analyzeProfitabilityStatus(profitability),
        valuation: analyzeValuationStatus(valuation),
        growth: analyzeGrowthStatus(growth)            
    };
}

// =========================
// 首頁欄位：趨勢
// 判斷依據：目前股價與 20 / 60 / 120 / 240 日均線位置
// =========================

function analyzeTrend(price, ma20, ma60, ma120, ma240) {

    // =========================
    // 多頭排列
    // 股價 > MA20 > MA60 > MA120 > MA240
    // =========================

    if (
        price > ma20 &&
        ma20 > ma60 &&
        ma60 > ma120 &&
        ma120 > ma240
    ) {
        return {
            type: "positive",
            text: "多頭排列",
            description: "股價與主要均線呈完整多頭排列，中長期趨勢強勢"
        };
    }


    // =========================
    // 中期偏多
    // 股價站上所有主要均線
    // 但均線尚未形成完整多頭排列
    // =========================

    if (
        price > ma20 &&
        price > ma60 &&
        price > ma120 &&
        price > ma240
    ) {
        return {
            type: "positive",
            text: "中期偏多",
            description: "股價站上月線、季線、半年線與年線，但均線尚未形成完整多頭排列"
        };
    }


    // =========================
    // 空頭排列
    // 股價 < MA20 < MA60 < MA120 < MA240
    // =========================

    if (
        price < ma20 &&
        ma20 < ma60 &&
        ma60 < ma120 &&
        ma120 < ma240
    ) {
        return {
            type: "danger",
            text: "空頭排列",
            description: "股價與主要均線呈完整空頭排列，中長期趨勢弱勢"
        };
    }


    // =========================
    // 中期偏空
    // 股價跌破所有主要均線
    // 但均線尚未形成完整空頭排列
    // =========================

    if (
        price < ma20 &&
        price < ma60 &&
        price < ma120 &&
        price < ma240
    ) {
        return {
            type: "danger",
            text: "中期偏空",
            description: "股價跌破月線、季線、半年線與年線，但均線尚未形成完整空頭排列"
        };
    }


    // =========================
    // 趨勢整理
    // 股價與主要均線位置交錯
    // =========================

    return {
        type: "warning",
        text: "趨勢整理",
        description: "股價與主要均線位置交錯，中長期方向尚未形成一致趨勢"
    };
}

// =========================
// 首頁欄位：短線
// 判斷依據：目前股價相對 MA5 + KD 是否剛發生交叉
// =========================

function analyzeShortTerm(price, ma5, todayKD, yesterdayKD) {
    const kdDeathCross =
        yesterdayKD.k >= yesterdayKD.d &&
        todayKD.k < todayKD.d;

    const kdGoldenCross =
        yesterdayKD.k <= yesterdayKD.d &&
        todayKD.k > todayKD.d;

    if (price > ma5 && kdGoldenCross) {
        return {
            type: "positive",
            text: "動能轉強",
            description: "股價站上 5 日線，且 KD 今日出現黃金交叉"
        };
    }

    if (price < ma5 && kdDeathCross) {
        return {
            type: "danger",
            text: "動能轉弱",
            description: "股價跌破 5 日線，且 KD 今日出現死亡交叉"
        };
    }

    if (price > ma5 && todayKD.k > todayKD.d) {
        return {
            type: "positive",
            text: "短線偏強",
            description: "股價站上 5 日線，且 K 值高於 D 值，短線動能偏多"
        };
    }

    if (price < ma5 && todayKD.k < todayKD.d) {
        return {
            type: "danger",
            text: "短線偏弱",
            description: "股價跌破 5 日線，且 K 值低於 D 值，短線動能偏空"
        };
    }

    return {
        type: "neutral",
        text: "短線中性",
        description: "股價與 MA5、KD 訊號方向不一致，短線尚未形成明確方向"
    };
}

// =========================
// 首頁欄位：成交量
// 判斷依據：今日成交量 ÷ 20 日平均成交量
// =========================

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

export function analyzePriceVolume(priceChange, volumeRatio) {
    const isVolumeUp = volumeRatio >= 1;

    if (priceChange > 0 && isVolumeUp) {
        return {
            type: "positive",
            text: "價漲量增",
            description: "股價上漲且成交量高於近期平均，多方交易動能增強"
        };
    }

    if (priceChange > 0 && !isVolumeUp) {
        return {
            type: "warning",
            text: "價漲量縮",
            description: "股價上漲但成交量低於近期平均，上漲動能仍需觀察"
        };
    }

    if (priceChange < 0 && isVolumeUp) {
        return {
            type: "danger",
            text: "價跌量增",
            description: "股價下跌且成交量高於近期平均，市場賣壓增加"
        };
    }

    if (priceChange < 0 && !isVolumeUp) {
        return {
            type: "neutral",
            text: "價跌量縮",
            description: "股價下跌但成交量低於近期平均，賣壓相對有限"
        };
    }

    return {
        type: "neutral",
        text: "價平",
        description: isVolumeUp
            ? "股價變化不大，但成交量高於近期平均"
            : "股價變化不大，成交量亦低於近期平均"
    };
}

// =========================
// 首頁欄位：RSI
// 判斷依據：14 日 RSI 數值區間
// =========================

export function analyzeRSI(value, fiveDaysAgo) {
    const change5 =
        fiveDaysAgo != null
            ? value - fiveDaysAgo
            : null;

    let type;
    let range;

    if (value >= 70) {
        type = "danger";
        range = "過熱";
    } else if (value >= 60) {
        type = "positive";
        range = "偏強";
    } else if (value >= 40) {
        type = "neutral";
        range = "中性";
    } else if (value >= 30) {
        type = "warning";
        range = "偏弱";
    } else {
        type = "warning";
        range = "超賣";
    }

    let description = `RSI 目前位於${range}區間`;

    if (change5 > 0) {
        description += "，近 5 日動能上升";
    } else if (change5 < 0) {
        description += "，近 5 日動能下降";
    } else if (change5 === 0) {
        description += "，近 5 日動能持平";
    }

    return {
        type,
        text: `${range} ${value.toFixed(2)}`,
        value,
        range,
        change5,
        description
    };
}

// =========================
// 首頁欄位：MACD
// 判斷依據：今日 Histogram 與昨日 Histogram 的正負與變化
// =========================

function analyzeMACD(today, yesterday) {
    const histogramChange =
        today.histogram - yesterday.histogram;

    let type;
    let text;
    let description;

    if (
        today.histogram > 0 &&
        histogramChange > 0
    ) {
        type = "positive";
        text = "多方動能增強";
        description =
            "MACD Histogram 位於零軸上方且持續增加，多方動能正在增強";
    } else if (
        today.histogram > 0 &&
        histogramChange < 0
    ) {
        type = "warning";
        text = "多方動能減弱";
        description =
            "MACD Histogram 仍位於零軸上方，但柱體縮短，多方動能正在減弱";
    } else if (
        today.histogram < 0 &&
        histogramChange < 0
    ) {
        type = "danger";
        text = "空方動能增強";
        description =
            "MACD Histogram 位於零軸下方且持續下降，空方動能正在增強";
    } else if (
        today.histogram < 0 &&
        histogramChange > 0
    ) {
        type = "warning";
        text = "空方動能減弱";
        description =
            "MACD Histogram 仍位於零軸下方，但柱體縮短，空方動能正在減弱";
    } else {
        type = "neutral";
        text = "動能持平";
        description =
            "MACD Histogram 與前一交易日變化有限，動能暫時持平";
    }

    return {
        type,
        text,
        dif: today.dif,
        signal: today.signal,
        histogram: today.histogram,
        histogramChange,
        description
    };
}

// =========================
// 首頁欄位：籌碼
// 判斷依據：三大法人近期統計
// 目的：挑出最值得注意的法人事件
// =========================

function analyzeInstitutionalEvent(indicators) {
    if (!indicators) {
        return {
            type: "neutral",
            text: "資料不足",
            description: "目前法人資料不足，無法判斷近期籌碼方向"
        };
    }

    const { foreign, trust, dealer } = indicators.recent;

    if (foreign.day20 < 0 && foreign.day5 > 0) {
        return {
            type: "positive",
            text: "外資短線轉買",
            description: "外資 20 日仍為賣超，但近 5 日已轉為買超，短線買盤開始回流"
        };
    }

    if (foreign.day20 > 0 && foreign.day5 < 0) {
        return {
            type: "danger",
            text: "外資短線轉賣",
            description: "外資 20 日仍為買超，但近 5 日已轉為賣超，短線籌碼開始轉弱"
        };
    }

    if (trust.day20 < 0 && trust.day5 > 0) {
        return {
            type: "positive",
            text: "投信短線轉買",
            description: "投信 20 日仍為賣超，但近 5 日已轉為買超，短線買盤開始回流"
        };
    }

    if (trust.day20 > 0 && trust.day5 < 0) {
        return {
            type: "danger",
            text: "投信短線轉賣",
            description: "投信 20 日仍為買超，但近 5 日已轉為賣超，短線籌碼開始轉弱"
        };
    }

    if (dealer.day20 < 0 && dealer.day5 > 0) {
        return {
            type: "positive",
            text: "自營商短線轉買",
            description: "自營商 20 日仍為賣超，但近 5 日已轉為買超，短線買盤開始回流"
        };
    }

    if (dealer.day20 > 0 && dealer.day5 < 0) {
        return {
            type: "danger",
            text: "自營商短線轉賣",
            description: "自營商 20 日仍為買超，但近 5 日已轉為賣超，短線籌碼開始轉弱"
        };
    }

    return {
        type: "neutral",
        text: "籌碼動向中性",
        description: "三大法人近期買賣方向未出現明顯反轉訊號"
    };
}

// =========================
// 首頁欄位：信用籌碼
//
// 主要判斷：
// 20 日股價 × 20 日融資
// 5 日用來偵測近期轉折
// =========================

function analyzeCreditStatus(
    priceChange5,
    priceChange20,
    indicators
) {
    if (
        priceChange5 === null ||
        priceChange20 === null ||
        !indicators?.margin
    ) {
        return {
            type: "neutral",
            text: "資料不足",
            description: "目前資料不足，無法判斷信用籌碼"
        };
    }

    const margin5 = indicators.margin.day5Percent;
    const margin20 = indicators.margin.day20Percent;


    // =========================
    // 近期籌碼反轉
    // =========================

    // 中期籌碼沉澱，但最近轉成弱勢加碼
    if (
        priceChange20 >= 5 &&
        margin20 <= -3 &&
        priceChange5 <= -3 &&
        margin5 >= 3
    ) {
        return {
            type: "warning",
            text: "短線籌碼轉弱",
            description: "中期籌碼偏健康，但近期股價轉弱、融資重新增加"
        };
    }

    // 中期偏弱，但最近開始改善
    if (
        priceChange20 <= -5 &&
        margin20 >= 3 &&
        priceChange5 >= 3 &&
        margin5 <= -3
    ) {
        return {
            type: "positive",
            text: "短線籌碼改善",
            description: "中期籌碼偏弱，但近期股價轉強、融資開始下降"
        };
    }


    // =========================
    // 20 日主要結構
    // =========================

    // 股價上漲 + 融資下降
    if (priceChange20 >= 5 && margin20 <= -3) {
        return {
            type: "positive",
            text: "籌碼沉澱",
            description: "股價走強，融資籌碼持續下降"
        };
    }

    // 股價上漲 + 融資增加
    if (priceChange20 >= 5 && margin20 >= 3) {
        if (margin20 >= 10) {
            return {
                type: "danger",
                text: "融資過熱",
                description: "股價走強，但融資大幅增加，槓桿籌碼快速升溫"
            };
        }

        return {
            type: "warning",
            text: "融資追價",
            description: "股價走強，融資同步增加"
        };
    }

    // 股價下跌 + 融資下降
    if (priceChange20 <= -5 && margin20 <= -3) {
        return {
            type: "warning",
            text: "融資清洗",
            description: "股價走弱，融資籌碼同步退出"
        };
    }

    // 股價下跌 + 融資增加
    if (priceChange20 <= -5 && margin20 >= 3) {
        return {
            type: "danger",
            text: "弱勢加碼",
            description: "股價走弱，但融資反而增加"
        };
    }


    // =========================
    // 股價沒有明顯方向
    // =========================

    if (margin20 <= -3) {
        return {
            type: "positive",
            text: "融資減壓",
            description: "股價震盪，融資籌碼持續下降"
        };
    }

    if (margin20 >= 3) {
        return {
            type: "warning",
            text: "融資升溫",
            description: "股價震盪，融資籌碼持續增加"
        };
    }

    return {
        type: "neutral",
        text: "信用籌碼穩定",
        description: "股價與融資餘額皆未出現明顯變化"
    };
}

// =========================
// 首頁欄位：空方籌碼
//
// 主要判斷：
// 20 日決定主要空方結構
// 5 日用來偵測近期轉折
// =========================
function analyzeShortPositionStatus(
    marginIndicators,
    shortSaleIndicators
) {
    if (
        !marginIndicators?.short ||
        !shortSaleIndicators
    ) {
        return {
            type: "neutral",
            text: "資料不足",
            description: "目前資料不足，無法判斷空方籌碼"
        };
    }

    const marginShort20 =
        marginIndicators.short.day20Percent;

    const sblShort20 =
        shortSaleIndicators.day20Percent;

    const marginShortBalance =
        marginIndicators.latestBalance.short;

    // 借券賣出 API 為股，轉成張
    const sblShortBalance =
        shortSaleIndicators.latestBalance / 1000;


    // =========================
    // 判斷方向
    // =========================

    function getDirection(value) {
        if (value >= 3) {
            return "increase";
        }

        if (value <= -3) {
            return "decrease";
        }

        return "neutral";
    }

    const marginDirection =
        getDirection(marginShort20);

    const sblDirection =
        getDirection(sblShort20);


    // =========================
    // 融券規模過小
    //
    // 融券餘額 < 100 張時，
    // 不讓融券百分比主導空方判斷，
    // 改以借券賣出為主要訊號。
    // =========================

    if (marginShortBalance < 100) {

        if (sblDirection === "increase") {
            return {
                type: "danger",
                text: "借券空方升溫",
                description:
                    "融券部位規模偏小，借券賣出餘額明顯增加"
            };
        }

        if (sblDirection === "decrease") {
            return {
                type: "positive",
                text: "借券空方回補",
                description:
                    "融券部位規模偏小，借券賣出餘額明顯下降"
            };
        }

        return {
            type: "neutral",
            text: "空方中性",
            description:
                "融券部位規模偏小，借券賣出餘額亦無明顯變化"
        };
    }


    // =========================
    // 融券 ↑ + 借券賣出 ↑
    // =========================

    if (
        marginDirection === "increase" &&
        sblDirection === "increase"
    ) {
        return {
            type: "danger",
            text: "空方升溫",
            description:
                "融券與借券賣出餘額同步增加"
        };
    }


    // =========================
    // 融券 ↓ + 借券賣出 ↓
    // =========================

    if (
        marginDirection === "decrease" &&
        sblDirection === "decrease"
    ) {
        return {
            type: "positive",
            text: "空方回補",
            description:
                "融券與借券賣出餘額同步下降"
        };
    }


    // =========================
    // 一增一減
    // =========================

    if (
        (
            marginDirection === "increase" &&
            sblDirection === "decrease"
        ) ||
        (
            marginDirection === "decrease" &&
            sblDirection === "increase"
        )
    ) {
        return {
            type: "warning",
            text: "空方分歧",
            description:
                marginDirection === "decrease"
                    ? "融券部位回補，但借券賣出餘額持續增加"
                    : "融券部位增加，但借券賣出餘額持續下降"
        };
    }


    // =========================
    // 只有借券賣出明顯變化
    // =========================

    if (sblDirection === "increase") {
        return {
            type: "warning",
            text: "借券空方升溫",
            description:
                "借券賣出餘額增加，融券變化有限"
        };
    }

    if (sblDirection === "decrease") {
        return {
            type: "positive",
            text: "借券空方回補",
            description:
                "借券賣出餘額下降，融券變化有限"
        };
    }


    // =========================
    // 只有融券明顯變化
    // =========================

    if (marginDirection === "increase") {
        return {
            type: "warning",
            text: "融券增加",
            description:
                "融券餘額增加，借券賣出變化有限"
        };
    }

    if (marginDirection === "decrease") {
        return {
            type: "positive",
            text: "融券回補",
            description:
                "融券餘額下降，借券賣出變化有限"
        };
    }


    // =========================
    // 都沒有明顯變化
    // =========================

    return {
        type: "neutral",
        text: "空方中性",
        description:
            "融券與借券賣出餘額皆無明顯變化"
    };
}

// =========================
// 首頁欄位：獲利
// 判斷依據：TTM EPS 年增率 + ROE(TTM) 年變化
// 目的：判斷公司獲利能力是否成長、穩健、分歧或轉弱
// =========================

function analyzeProfitabilityStatus(profitability) {
    const {
        ttmEPSHistory,
        roeHistory
    } = profitability ?? {};
    

    if (
        !ttmEPSHistory ||
        ttmEPSHistory.length < 5 ||
        !roeHistory ||
        roeHistory.length < 5
    ) {
        return {
            text: "資料不足",
            type: "neutral",
            epsGrowth: null,
            roeChange: null
        };
    }

    const latestEPS = ttmEPSHistory.at(-1).eps;
    const previousYearEPS = ttmEPSHistory.at(-5).eps;

    const latestROE = roeHistory.at(-1).roe;
    const previousYearROE = roeHistory.at(-5).roe;

    const epsGrowth = ((latestEPS - previousYearEPS) / Math.abs(previousYearEPS)) * 100;
    const roeChange =  latestROE - previousYearROE;

    // =========================
    // 明顯成長
    // =========================

    if (epsGrowth >= 20 && roeChange >= 5) {
        return {
            text: "獲利明顯成長",
            type: "positive",
            epsGrowth,
            roeChange
        };
    }

    // =========================
    // 明顯惡化
    // =========================

    if (epsGrowth <= -20 && roeChange <= -5) {
        return {
            text: "獲利明顯惡化",
            type: "danger",
            epsGrowth,
            roeChange
        };
    }

    // =========================
    // 分歧
    // =========================

    if (
        (epsGrowth > 10 && roeChange < -3) ||
        (epsGrowth < -10 && roeChange > 3)
    ) {
        return {
            text: "獲利分歧",
            type: "warning",
            epsGrowth,
            roeChange
        };
    }

    // =========================
    // 成長
    // =========================

    if (
        (epsGrowth > 10 && roeChange >= -3) ||
        (roeChange > 3 && epsGrowth >= -10)
    ) {
        return {
            text: "獲利成長",
            type: "positive",
            epsGrowth,
            roeChange
        };
    }

    // =========================
    // 轉弱
    // =========================

    if (
        (epsGrowth < -10 && roeChange <= 3) ||
        (roeChange < -3 && epsGrowth <= 10)
    ) {
        return {
            text: "獲利轉弱",
            type: "warning",
            epsGrowth,
            roeChange
        };
    }
    return {
        text: "獲利穩健",
        type: "neutral",
        epsGrowth,
        roeChange
    };
}

// =========================
// 首頁欄位：估值
//
// 主要判斷：
// 近 5 年 P/E percentile + P/B percentile
//
// P/E：主要估值依據
// P/B：輔助估值依據
// 殖利率：補充資訊，不進主分數
// =========================

function analyzeValuationStatus(valuation) {
    if (
        !valuation ||
        valuation.pePercentile == null ||
        valuation.pbPercentile == null
    ) {
        return {
            text: "資料不足",
            type: "neutral",
            score: null,
            pePercentile: null,
            pbPercentile: null,
            dividendYieldPercentile: null,
            description: "目前估值歷史資料不足"
        };
    }

    const {
        pe,
        pb,
        dividendYield,
        pePercentile,
        pbPercentile,
        dividendYieldPercentile
    } = valuation;

    // P/E 主導、P/B 輔助
    const score =
        pePercentile * 0.7 +
        pbPercentile * 0.3;


    // =========================
    // 極高估值
    // =========================

    if (score >= 90) {
        return {
            text: "估值極高",
            type: "danger",
            score,
            pe,
            pb,
            dividendYield,
            pePercentile,
            pbPercentile,
            dividendYieldPercentile,
            description:
                "目前 P/E 與 P/B 位於近 5 年歷史非常高的區間"
        };
    }


    // =========================
    // 偏高
    // =========================

    if (score >= 75) {
        return {
            text: "估值偏高",
            type: "warning",
            score,
            pe,
            pb,
            dividendYield,
            pePercentile,
            pbPercentile,
            dividendYieldPercentile,
            description:
                "目前 P/E 與 P/B 位於近 5 年歷史偏高區間"
        };
    }


    // =========================
    // 偏低
    // =========================

    if (score <= 25) {
        return {
            text: "估值偏低",
            type: "positive",
            score,
            pe,
            pb,
            dividendYield,
            pePercentile,
            pbPercentile,
            dividendYieldPercentile,
            description:
                "目前 P/E 與 P/B 位於近 5 年歷史偏低區間"
        };
    }


    // =========================
    // 合理
    // =========================

    return {
        text: "估值合理",
        type: "neutral",
        score,
        pe,
        pb,
        dividendYield,
        pePercentile,
        pbPercentile,
        dividendYieldPercentile,
        description:
            "目前 P/E 與 P/B 位於近 5 年歷史中間區間"
    };
}

// =========================
// 首頁欄位：成長
// 判斷依據：月營收 YoY
// 最近 3 個月判斷目前成長強度
// 前 3 個月 vs 最近 3 個月判斷成長加速 / 減速
// =========================

function analyzeGrowthStatus(growth) {
    const history = growth?.revenueYoYHistory;

    if (!history || history.length < 6) {
        return {
            text: "資料不足",
            type: "neutral",
            latestYoY: null,
            avg3M: null,
            avg6M: null,
            momentum: null,
            description: "目前月營收歷史資料不足，無法判斷成長趨勢"
        };
    }

    const recent6 = history.slice(-6);
    const previous3 = recent6.slice(0, 3);
    const recent3 = recent6.slice(3);

    const average = items => items.reduce((sum, item) => sum + item.yoy, 0) / items.length;

    const latestYoY = recent3.at(-1).yoy;
    const avg3M = average(recent3);
    const previous3Avg = average(previous3);
    const avg6M = average(recent6);
    const momentum = avg3M - previous3Avg;

    const positiveMonths = recent3.filter(item => item.yoy > 0).length;
    const negativeMonths = recent3.filter(item => item.yoy < 0).length;

    // 明顯衰退
    if (avg3M <= -10 || (negativeMonths >= 2 && latestYoY <= -10)) {
        return {
            text: "營收衰退",
            type: "danger",
            latestYoY,
            avg3M,
            avg6M,
            momentum,
            description: "近期月營收年增率明顯為負，營收成長進入衰退狀態"
        };
    }

    // 由正轉負 / 多數月份負成長
    if (avg3M < 0 || negativeMonths >= 2) {
        return {
            text: "成長轉弱",
            type: "warning",
            latestYoY,
            avg3M,
            avg6M,
            momentum,
            description: "近期月營收成長轉弱，最近 3 個月平均年增率已接近或跌破零"
        };
    }

    // 高成長且明顯加速
    if (avg3M >= 10 && momentum >= 5 && positiveMonths === 3) {
        return {
            text: "成長加速",
            type: "positive",
            latestYoY,
            avg3M,
            avg6M,
            momentum,
            description: "近期月營收持續正成長，且最近 3 個月平均年增率明顯高於前 3 個月"
        };
    }

    // 仍成長，但速度下降
    if (avg3M > 0 && momentum <= -5) {
        return {
            text: "成長減速",
            type: "warning",
            latestYoY,
            avg3M,
            avg6M,
            momentum,
            description: "月營收仍維持正成長，但最近 3 個月平均年增率較前 3 個月明顯下降"
        };
    }

    // 穩定正成長
    if (avg3M >= 10 && positiveMonths >= 2) {
        return {
            text: "穩健成長",
            type: "positive",
            latestYoY,
            avg3M,
            avg6M,
            momentum,
            description: "近期月營收維持穩定正成長，成長動能沒有明顯惡化"
        };
    }

    // 小幅正成長
    if (avg3M > 0) {
        return {
            text: "溫和成長",
            type: "neutral",
            latestYoY,
            avg3M,
            avg6M,
            momentum,
            description: "近期月營收維持正成長，但成長幅度相對有限"
        };
    }

    return {
        text: "成長持平",
        type: "neutral",
        latestYoY,
        avg3M,
        avg6M,
        momentum,
        description: "近期月營收年增率接近持平，尚未形成明確成長方向"
    };
}