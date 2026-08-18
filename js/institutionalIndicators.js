// =========================
// 法人領域統計
// =========================

import { sumRecent } from "./utils/calculations.js";

//把 FinMind 原始法人資料整理成每天一筆
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


// 3*3表格 : 近期法人動向
export function calculateInstitutionalIndicators(data) {
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