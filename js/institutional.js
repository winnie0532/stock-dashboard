export function organizeInstitutionalData(data) {
    const grouped = {};

    data.forEach(item => {
        if (!grouped[item.date]) {
            grouped[item.date] = {
                date: item.date,
                foreign: 0,
                trust: 0,
                dealer: 0
            };
        }

        const netBuy = item.buy - item.sell;

        switch (item.name) {
            case "Foreign_Investor":
                grouped[item.date].foreign += netBuy;
                break;

            case "Investment_Trust":
                grouped[item.date].trust += netBuy;
                break;

            case "Dealer_self":
            case "Dealer_Hedging":
                grouped[item.date].dealer += netBuy;
                break;
        }
    });

    return Object.values(grouped)
        .sort((a, b) => a.date.localeCompare(b.date));
}

export function analyzeInstitutional(data) {
    if (!data || data.length === 0) {
        return null;
    }

    const latest = data[data.length - 1];
    const previous = data[data.length - 2];
    const recent = {
        foreign: {
            day5: sumRecent(data, "foreign", 5),
            day20: sumRecent(data, "foreign", 20),
            day60: sumRecent(data, "foreign", 60)
        },

        trust: {
            day5: sumRecent(data, "trust", 5),
            day20: sumRecent(data, "trust", 20),
            day60: sumRecent(data, "trust", 60)
        },

        dealer: {
            day5: sumRecent(data, "dealer", 5),
            day20: sumRecent(data, "dealer", 20),
            day60: sumRecent(data, "dealer", 60)
        }
    };
    return {
        today: {
            foreign: latest.foreign,
            trust: latest.trust,
            dealer: latest.dealer
        },

        status: {
            foreign: getInstitutionStatus(data, "foreign"),
            trust: getInstitutionStatus(data, "trust"),
            dealer: getInstitutionStatus(data, "dealer")
        },

        recent,

        summary: analyzeChipStatus(recent),

        previous: {
            foreign: previous?.foreign ?? 0,
            trust: previous?.trust ?? 0,
            dealer: previous?.dealer ?? 0
        }
    };
    }


function sumRecent(data, key, days) {
    return data
        .slice(-days)
        .reduce((sum, item) => sum + item[key], 0);
}


function getInstitutionStatus(data, key) {
    const latestValue = data[data.length - 1][key];

    if (latestValue === 0) {
        return {
            type: "neutral",
            text: "今日持平"
        };
    }

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

    const previousValue =
        data.length >= 2
            ? data[data.length - 2][key]
            : 0;

    // 昨天賣、今天買
    if (latestValue > 0 && previousValue < 0) {
        return {
            type: "positive",
            text: "今日轉買"
        };
    }

    // 昨天買、今天賣
    if (latestValue < 0 && previousValue > 0) {
        return {
            type: "danger",
            text: "今日轉賣"
        };
    }

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

export function analyzeChipStatus(data) {
    if (!data) {
        return {
            text: "資料不足",
            type: "neutral"
        };
    }

    const { foreign, trust, dealer } = data;

    const score5 =
        getDirectionScore(foreign.day5) +
        getDirectionScore(trust.day5) +
        getDirectionScore(dealer.day5);

    const score20 =
        getDirectionScore(foreign.day20) +
        getDirectionScore(trust.day20) +
        getDirectionScore(dealer.day20);

    const score60 =
        getDirectionScore(foreign.day60) +
        getDirectionScore(trust.day60) +
        getDirectionScore(dealer.day60);

    // 資料不足
    if (
        score5 === null ||
        score20 === null ||
        score60 === null
    ) {
        return {
            text: "資料不足",
            type: "neutral"
        };
    }

    // 短期偏多、中長期偏空
    if (score5 > 0 && score20 < 0 && score60 < 0) {
        return {
            text: "短多長空",
            type: "warning"
        };
    }

    // 短期偏空、中長期偏多
    if (score5 < 0 && score20 > 0 && score60 > 0) {
        return {
            text: "短空長多",
            type: "warning"
        };
    }

    // 三個時間尺度都偏多
    if (score5 > 0 && score20 > 0 && score60 > 0) {
        return {
            text: "籌碼偏多",
            type: "positive"
        };
    }

    // 三個時間尺度都偏空
    if (score5 < 0 && score20 < 0 && score60 < 0) {
        return {
            text: "籌碼偏空",
            type: "danger"
        };
    }

    // 完全沒有明顯方向
    if (score5 === 0 && score20 === 0 && score60 === 0) {
        return {
            text: "籌碼中性",
            type: "neutral"
        };
    }

    return {
        text: "多空分歧",
        type: "warning"
    };
}


function getDirectionScore(value) {
    if (value === null || value === undefined) {
        return null;
    }

    if (value > 0) {
        return 1;
    }

    if (value < 0) {
        return -1;
    }

    return 0;
}