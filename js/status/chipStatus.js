// =========================
// 近期法人動向總管
//
// data:
// 每日法人資料
//
// 回傳：
// today  → 今日法人買賣超
// recent → 5 / 20 / 60 日法人買賣超
// status → 今日轉買 / 轉賣 / 連買 / 連賣
// =========================

export function analyzeInstitutional(data, indicators) {
    if (!data || data.length === 0 || !indicators) {
        return null;
    }

    return {
        today: indicators.today,
        recent: indicators.recent,
        previous: indicators.previous,

        status: {
            foreign: getInstitutionStatus(data, "foreign"),
            trust: getInstitutionStatus(data, "trust"),
            dealer: getInstitutionStatus(data, "dealer")
        }
    };
}


// =========================
// 判斷單一法人的近期狀態
//
// key:
// foreign → 外資
// trust   → 投信
// dealer  → 自營商
//
// 判斷結果：
// 今日持平
// 今日轉買
// 今日轉賣
// 連 N 日買超
// 連 N 日賣超
// =========================

function getInstitutionStatus(data, key) {
    const latestValue = data[data.length - 1][key];

    // 今日沒有淨買賣超
    if (latestValue === 0) {
        return {
            type: "neutral",
            text: "今日持平"
        };
    }

    const previousValue =
        data.length >= 2
            ? data[data.length - 2][key]
            : 0;


    // =========================
    // 今日方向反轉
    // =========================

    // 昨日賣超 → 今日買超
    if (latestValue > 0 && previousValue < 0) {
        return {
            type: "positive",
            text: "今日轉買"
        };
    }

    // 昨日買超 → 今日賣超
    if (latestValue < 0 && previousValue > 0) {
        return {
            type: "danger",
            text: "今日轉賣"
        };
    }


    // =========================
    // 計算連續買賣超天數
    // =========================

    const direction = latestValue > 0 ? 1 : -1;

    let streak = 0;

    for (let i = data.length - 1; i >= 0; i--) {
        const value = data[i][key];

        if (
            (direction > 0 && value > 0) ||
            (direction < 0 && value < 0)
        ) {
            streak++;
        } else {
            break;
        }
    }


    // =========================
    // 回傳連續狀態
    // =========================

    if (latestValue > 0) {
        return {
            type: "positive",
            text: `連 ${streak} 日買超`
        };
    }

    return {
        type: "danger",
        text: `連 ${streak} 日賣超`
    };
}

// =========================
// 信用籌碼
//
// indicators:
// calculateMarginIndicators() 的結果
//
// 回傳：
// 融資 / 融券
// 今日 / 5 日 / 20 日變化
// =========================

export function analyzeMargin(indicators) {
    if (!indicators) {
        return null;
    }

    return {
        margin: {
            today: indicators.margin.today,
            day5: indicators.margin.day5,
            day20: indicators.margin.day20
        },

        short: {
            today: indicators.short.today,
            day5: indicators.short.day5,
            day20: indicators.short.day20
        },

        latestBalance: indicators.latestBalance
    };
}

export function renderMarginStatus(status) {
    if (!status) {
        return;
    }

    setMarginValue("marginToday", status.margin.today);
    setMarginValue("margin5", status.margin.day5);
    setMarginValue("margin20", status.margin.day20);

    setMarginValue("shortToday", status.short.today);
    setMarginValue("short5", status.short.day5);
    setMarginValue("short20", status.short.day20);
}


function setMarginValue(elementId, value) {
    const element = document.getElementById(elementId);

    if (!element) {
        return;
    }

    element.classList.remove(
        "value-up",
        "value-down",
        "value-neutral"
    );

    if (value === null || value === undefined) {
        element.textContent = "--";
        element.classList.add("value-neutral");
        return;
    }

    const formattedValue = Math.abs(value).toLocaleString();

    if (value > 0) {
        element.textContent = `+${formattedValue} 張`;
        element.classList.add("value-up");
    } else if (value < 0) {
        element.textContent = `-${formattedValue} 張`;
        element.classList.add("value-down");
    } else {
        element.textContent = "0 張";
        element.classList.add("value-neutral");
    }
}