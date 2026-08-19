const FINMIND_URL = "https://api.finmindtrade.com/api/v4/data";

export async function fetchStockHistory(stockId, startDate) {
    const params = new URLSearchParams({
        dataset: "TaiwanStockPrice",
        data_id: stockId,
        start_date: startDate
    });

    const response = await fetch(`${FINMIND_URL}?${params}`);

    if (!response.ok) {
        throw new Error(`FinMind API error: ${response.status}`);
    }

    const result = await response.json();

    if (result.status !== 200) {
        throw new Error(result.msg || "FinMind API error");
    }

    return result.data.map(item => ({
        date: item.date,
        open: item.open,
        high: item.max,
        low: item.min,
        close: item.close,
        volume: item.Trading_Volume
    }));
}

export async function fetchInstitutionalHistory(stockId, startDate) {
    const params = new URLSearchParams({
        dataset: "TaiwanStockInstitutionalInvestorsBuySell",
        data_id: stockId,
        start_date: startDate
    });

    const response = await fetch(`${FINMIND_URL}?${params}`);

    if (!response.ok) {
        throw new Error(`FinMind API error: ${response.status}`);
    }

    const result = await response.json();

    if (result.status !== 200) {
        throw new Error(result.msg || "FinMind API error");
    }

    return result.data;
}
export async function fetchStockInfo(stockId) {
    const params = new URLSearchParams({
        dataset: "TaiwanStockInfo"
    });

    const response = await fetch(`${FINMIND_URL}?${params}`);

    if (!response.ok) {
        throw new Error(`FinMind API error: ${response.status}`);
    }

    const result = await response.json();

    if (result.status !== 200) {
        throw new Error(result.msg || "FinMind API error");
    }

    const stock = result.data.find(
        item => item.stock_id === stockId
    );

    if (!stock) {
        throw new Error(`找不到股票代號：${stockId}`);
    }

    return {
        stockId: stock.stock_id,
        stockName: stock.stock_name,
        industry: stock.industry_category,
        market: stock.type
    };
}

//融資融券資料
export async function fetchMarginData(stockId, startDate) {
    const url =
        `https://api.finmindtrade.com/api/v4/data` +
        `?dataset=TaiwanStockMarginPurchaseShortSale` +
        `&data_id=${stockId}` +
        `&start_date=${startDate}`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`取得融資融券資料失敗：${response.status}`);
    }

    const result = await response.json();

    if (!result.data) {
        throw new Error("融資融券資料格式錯誤");
    }

    return result.data;
}

// 借券賣出餘額資料
export async function fetchShortSaleBalanceData(stockId, startDate) {
    const url =
        `https://api.finmindtrade.com/api/v4/data` +
        `?dataset=TaiwanDailyShortSaleBalances` +
        `&data_id=${stockId}` +
        `&start_date=${startDate}`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`取得借券賣出資料失敗：${response.status}`);
    }

    const result = await response.json();

    if (!result.data) {
        throw new Error("借券賣出資料格式錯誤");
    }

    return result.data;
}