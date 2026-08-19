export function analyzeMarketStatus({
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
    yesterdayMACD,
    institutionalIndicators,
    priceChange5,
    priceChange20,
    marginIndicators
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
        rsi: analyzeRSI(rsi),
        macd: analyzeMACD(todayMACD, yesterdayMACD),
        institutional: analyzeInstitutionalEvent(institutionalIndicators),
        credit: analyzeCreditStatus(
            priceChange5,
            priceChange20,
            marginIndicators
        )
    };
}

// =========================
// 首頁欄位：趨勢
// 判斷依據：目前股價與 20 / 60 / 120 / 240 日均線位置
// =========================

function analyzeTrend(price, ma20, ma60, ma120, ma240) {

    // 股價與均線完整多頭排列
    if (
        price > ma20 &&
        ma20 > ma60 &&
        ma60 > ma120 &&
        ma120 > ma240
    ) {
        return {
            type: "positive",
            text: "多頭排列"
        };
    }

    // 股價站上所有主要均線
    if (
        price > ma20 &&
        price > ma60 &&
        price > ma120 &&
        price > ma240
    ) {
        return {
            type: "positive",
            text: "中期偏多"
        };
    }

    // 股價與均線完整空頭排列
    if (
        price < ma20 &&
        ma20 < ma60 &&
        ma60 < ma120 &&
        ma120 < ma240
    ) {
        return {
            type: "danger",
            text: "空頭排列"
        };
    }

    // 股價跌破所有主要均線
    if (
        price < ma20 &&
        price < ma60 &&
        price < ma120 &&
        price < ma240
    ) {
        return {
            type: "danger",
            text: "中期偏空"
        };
    }

    // 股價與均線方向混合
    return {
        type: "warning",
        text: "趨勢整理"
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

    // 今天剛轉強
    if (price > ma5 && kdGoldenCross) {
        return {
            type: "positive",
            text: "動能轉強"
        };
    }

    // 今天剛轉弱
    if (price < ma5 && kdDeathCross) {
        return {
            type: "danger",
            text: "動能轉弱"
        };
    }

    // 維持短線強勢
    if (price > ma5 && todayKD.k > todayKD.d) {
        return {
            type: "positive",
            text: "短線偏強"
        };
    }

    // 維持短線弱勢
    if (price < ma5 && todayKD.k < todayKD.d) {
        return {
            type: "danger",
            text: "短線偏弱"
        };
    }

    // 股價與 KD 訊號不同方向
    return {
        type: "neutral",
        text: "短線中性"
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

// =========================
// 首頁欄位：RSI
// 判斷依據：14 日 RSI 數值區間
// =========================

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

// =========================
// 首頁欄位：MACD
// 判斷依據：今日 Histogram 與昨日 Histogram 的正負與變化
// =========================

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

// =========================
// 首頁欄位：籌碼
// 判斷依據：三大法人近期統計
// 目的：挑出最值得注意的法人事件
// =========================

function analyzeInstitutionalEvent(indicators) {
    if (!indicators) {
        return {
            type: "neutral",
            text: "資料不足"
        };
    }

    const { foreign, trust, dealer } = indicators.recent;

    // 外資：20 日賣超，但最近 5 日轉買
    if (foreign.day20 < 0 && foreign.day5 > 0) {
        return {
            type: "positive",
            text: "外資短線轉買"
        };
    }

    // 外資：20 日買超，但最近 5 日轉賣
    if (foreign.day20 > 0 && foreign.day5 < 0) {
        return {
            type: "danger",
            text: "外資短線轉賣"
        };
    }

    // 投信
    if (trust.day20 < 0 && trust.day5 > 0) {
        return {
            type: "positive",
            text: "投信短線轉買"
        };
    }

    if (trust.day20 > 0 && trust.day5 < 0) {
        return {
            type: "danger",
            text: "投信短線轉賣"
        };
    }

    // 自營商
    if (dealer.day20 < 0 && dealer.day5 > 0) {
        return {
            type: "positive",
            text: "自營商短線轉買"
        };
    }

    if (dealer.day20 > 0 && dealer.day5 < 0) {
        return {
            type: "danger",
            text: "自營商短線轉賣"
        };
    }

    return {
        type: "neutral",
        text: "籌碼動向中性"
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