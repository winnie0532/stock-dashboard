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

        recent: {
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
        },

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