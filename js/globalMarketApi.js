const FINMIND_API_URL = "https://api.finmindtrade.com/api/v4/data";

// 若你的 api.js 已經改用自己的 Proxy，這裡也要使用相同的網址／方式。
// 先保留 FinMind 原始網址測試即可。
async function fetchFinMindData(params) {
    const url = new URL(FINMIND_API_URL);

    Object.entries(params).forEach(([key, value]) => {
        url.searchParams.set(key, value);
    });

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`FinMind 請求失敗：${response.status}`);
    }

    const result = await response.json();

    if (result.status !== 200 || !Array.isArray(result.data)) {
        throw new Error(result.msg || "FinMind 回傳資料格式錯誤");
    }

    return result.data;
}

function getDateBefore(days) {
    const date = new Date();
    date.setDate(date.getDate() - days);

    return date.toISOString().slice(0, 10);
}

function getLatestTwoRows(rows) {
    return [...rows]
        .filter(row => row.date)
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(-2);
}

function getNumber(row, keys) {
    for (const key of keys) {
        if (row[key] !== undefined && row[key] !== null) {
            return Number(row[key]);
        }
    }

    return NaN;
}

function buildPriceMarket({
    category,
    name,
    rows,
    valueKeys,
    decimals = 2,
    prefix = "",
    suffix = ""
}) {
    const [previous, latest] = getLatestTwoRows(rows);

    if (!previous || !latest) {
        throw new Error(`${name} 資料不足`);
    }

    const previousValue = getNumber(previous, valueKeys);
    const latestValue = getNumber(latest, valueKeys);

    if (!Number.isFinite(previousValue) || !Number.isFinite(latestValue)) {
        throw new Error(`${name} 數值格式錯誤`);
    }

    return {
        category,
        name,
        value: latestValue,
        change: ((latestValue - previousValue) / previousValue) * 100,
        changeType: "percent",
        decimals,
        prefix,
        suffix,
        date: latest.date
    };
}

function buildYieldMarket({ name, rows }) {
    const [previous, latest] = getLatestTwoRows(rows);

    if (!previous || !latest) {
        throw new Error(`${name} 資料不足`);
    }

    const previousValue = getNumber(previous, ["value"]);
    const latestValue = getNumber(latest, ["value"]);

    if (!Number.isFinite(previousValue) || !Number.isFinite(latestValue)) {
        throw new Error(`${name} 數值格式錯誤`);
    }

    return {
        category: "利率",
        name,
        value: latestValue,
        // 殖利率變動以 bp 顯示：0.01% = 1 bp
        change: (latestValue - previousValue) * 100,
        changeType: "basisPoint",
        decimals: 2,
        suffix: "%",
        date: latest.date
    };
}

async function fetchUSIndex(stockId) {
    return fetchFinMindData({
        dataset: "USStockPrice",
        data_id: stockId,
        start_date: getDateBefore(14)
    });
}

export async function fetchGlobalMarketOverview() {
    const [
        sp500Result,
        nasdaqResult,
        soxResult,
        usdTwdResult,
        us2YResult,
        us10YResult,
        goldResult,
        wtiResult
    ] = await Promise.allSettled([
        fetchUSIndex("^GSPC"),
        fetchUSIndex("^IXIC"),
        fetchUSIndex("^SOX"),

        fetchFinMindData({
            dataset: "TaiwanExchangeRate",
            data_id: "USD",
            start_date: getDateBefore(14)
        }),

        fetchFinMindData({
            dataset: "GovernmentBondsYield",
            data_id: "United States 2-Year",
            start_date: getDateBefore(14)
        }),

        fetchFinMindData({
            dataset: "GovernmentBondsYield",
            data_id: "United States 10-Year",
            start_date: getDateBefore(14)
        }),

        fetchFinMindData({
            dataset: "GoldPrice",
            start_date: getDateBefore(30)
        }),

        fetchFinMindData({
            dataset: "CrudeOilPrices",
            data_id: "WTI",
            start_date: getDateBefore(30)
        })
    ]);

    const markets = [];
    const errors = [];

    const addMarket = (result, buildMarket) => {
        if (result.status !== "fulfilled") {
            errors.push(result.reason.message);
            return;
        }

        try {
            markets.push(buildMarket(result.value));
        } catch (error) {
            errors.push(error.message);
        }
    };

    addMarket(sp500Result, rows =>
        buildPriceMarket({
            category: "美股",
            name: "S&P 500",
            rows,
            valueKeys: ["close", "Close", "Adj_Close"],
            decimals: 2
        })
    );

    addMarket(nasdaqResult, rows =>
        buildPriceMarket({
            category: "美股",
            name: "NASDAQ",
            rows,
            valueKeys: ["close", "Close", "Adj_Close"],
            decimals: 2
        })
    );

    addMarket(soxResult, rows =>
        buildPriceMarket({
            category: "美股",
            name: "費城半導體",
            rows,
            valueKeys: ["close", "Close", "Adj_Close"],
            decimals: 2
        })
    );

    addMarket(usdTwdResult, rows =>
        buildPriceMarket({
            category: "匯率",
            name: "美元／台幣",
            rows,
            valueKeys: ["spot_sell"],
            decimals: 3
        })
    );

    addMarket(us2YResult, rows =>
        buildYieldMarket({
            name: "美國 2Y 殖利率",
            rows
        })
    );

    addMarket(us10YResult, rows =>
        buildYieldMarket({
            name: "美國 10Y 殖利率",
            rows
        })
    );

    addMarket(goldResult, rows =>
        buildPriceMarket({
            category: "商品",
            name: "黃金",
            rows,
            valueKeys: ["Price", "price"],
            decimals: 1,
            prefix: "$"
        })
    );

    addMarket(wtiResult, rows =>
        buildPriceMarket({
            category: "商品",
            name: "WTI 原油",
            rows,
            valueKeys: ["price", "Price"],
            decimals: 2,
            prefix: "$"
        })
    );

    return {
        source: "FinMind daily",
        updatedAt: "各卡依最新資料日期",
        markets,
        errors
    };
}