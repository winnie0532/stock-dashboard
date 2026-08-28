const FINMIND_API_URL =
    "https://api.finmindtrade.com/api/v4/data";

function getDateBefore(days) {
    const date = new Date();

    date.setDate(date.getDate() - days);

    return date.toISOString().slice(0, 10);
}

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

async function fetchSafely(params) {
    try {
        return await fetchFinMindData(params);
    } catch (error) {
        console.error("取得國際市場資料失敗：", params.dataset, error);
        return [];
    }
}

export async function fetchGlobalMarketRawData() {
    const startDate = getDateBefore(400);

    const [
        sp500,
        nasdaq,
        sox,
        usdTwd,
        us2Y,
        us10Y,
        gold,
        wti
    ] = await Promise.all([
        fetchSafely({
            dataset: "USStockPrice",
            data_id: "^GSPC",
            start_date: startDate
        }),

        fetchSafely({
            dataset: "USStockPrice",
            data_id: "^IXIC",
            start_date: startDate
        }),

        fetchSafely({
            dataset: "USStockPrice",
            data_id: "^SOX",
            start_date: startDate
        }),

        fetchSafely({
            dataset: "TaiwanExchangeRate",
            data_id: "USD",
            start_date: startDate
        }),

        fetchSafely({
            dataset: "GovernmentBondsYield",
            data_id: "United States 2-Year",
            start_date: startDate
        }),

        fetchSafely({
            dataset: "GovernmentBondsYield",
            data_id: "United States 10-Year",
            start_date: startDate
        }),

        fetchSafely({
            dataset: "GoldPrice",
            start_date: startDate
        }),

        fetchSafely({
            dataset: "CrudeOilPrices",
            data_id: "WTI",
            start_date: startDate
        })
    ]);

    return {
        sp500,
        nasdaq,
        sox,
        usdTwd,
        us2Y,
        us10Y,
        gold,
        wti
    };
}