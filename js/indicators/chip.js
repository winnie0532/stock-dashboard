import { sumRecent } from "../utils/calculations.js";

// =========================
// 三大法人
// =========================

// 整理 FinMind 法人原始資料
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


// 今日、前一日、5 / 20 / 60 日法人統計
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

// 融資／融券的「今日、5 日、20 日」餘額差
export function calculateMarginIndicators(data) {
    if (!data || data.length === 0) {
        return null;
    }

    const sorted = [...data].sort(
        (a, b) => new Date(a.date) - new Date(b.date)
    );

    const latest = sorted[sorted.length - 1];

    function getBalanceChange(field, days) {
        const currentBalance = latest[field];

        if (days === 1) {
            const yesterdayField =
                field === "MarginPurchaseTodayBalance"
                    ? "MarginPurchaseYesterdayBalance"
                    : "ShortSaleYesterdayBalance";

            return currentBalance - latest[yesterdayField];
        }

        if (sorted.length <= days) {
            return null;
        }

        const previous = sorted[sorted.length - 1 - days];

        return currentBalance - previous[field];
    }
    function getBalanceChangePercent(field, days) {
        if (sorted.length <= days) {
            return null;
        }

        const currentBalance = latest[field];
        const previous = sorted[sorted.length - 1 - days];
        const previousBalance = previous[field];

        if (!previousBalance) {
            return null;
        }

        return (
            (currentBalance - previousBalance) /
            previousBalance
        ) * 100;
    }

    return {
        margin: {
            today: getBalanceChange("MarginPurchaseTodayBalance", 1),

            day5: getBalanceChange("MarginPurchaseTodayBalance", 5),
            day5Percent: getBalanceChangePercent(
                "MarginPurchaseTodayBalance",
                5
            ),

            day20: getBalanceChange("MarginPurchaseTodayBalance", 20),
            day20Percent: getBalanceChangePercent(
                "MarginPurchaseTodayBalance",
                20
            )
        },

        short: {
            today: getBalanceChange("ShortSaleTodayBalance", 1),

            day5: getBalanceChange("ShortSaleTodayBalance", 5),
            day5Percent: getBalanceChangePercent(
                "ShortSaleTodayBalance",
                5
            ),

            day20: getBalanceChange("ShortSaleTodayBalance", 20),
            day20Percent: getBalanceChangePercent(
                "ShortSaleTodayBalance",
                20
            )
        },

        latestBalance: {
            margin: latest.MarginPurchaseTodayBalance,
            short: latest.ShortSaleTodayBalance
        }
    };
}

//借券賣出的今日／5 日／20 日餘額變化和變化率
export function calculateShortSaleIndicators(data) {
    if (!data || data.length === 0) {
        return null;
    }

    const sorted = [...data].sort(
        (a, b) => new Date(a.date) - new Date(b.date)
    );

    const latest = sorted[sorted.length - 1];

    function getBalanceChange(days) {
        const currentBalance =
            latest.SBLShortSalesCurrentDayBalance;

        if (days === 1) {
            return (
                currentBalance -
                latest.SBLShortSalesPreviousDayBalance
            );
        }

        if (sorted.length <= days) {
            return null;
        }

        const previous =
            sorted[sorted.length - 1 - days];

        return (
            currentBalance -
            previous.SBLShortSalesCurrentDayBalance
        );
    }

    function getBalanceChangePercent(days) {
        if (sorted.length <= days) {
            return null;
        }

        const currentBalance =
            latest.SBLShortSalesCurrentDayBalance;

        const previous =
            sorted[sorted.length - 1 - days];

        const previousBalance =
            previous.SBLShortSalesCurrentDayBalance;

        if (!previousBalance) {
            return null;
        }

        return (
            (currentBalance - previousBalance) /
            previousBalance
        ) * 100;
    }

    return {
        today: getBalanceChange(1),

        day5: getBalanceChange(5),
        day5Percent: getBalanceChangePercent(5),

        day20: getBalanceChange(20),
        day20Percent: getBalanceChangePercent(20),

        latestBalance:
            latest.SBLShortSalesCurrentDayBalance
    };
}