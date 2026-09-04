const FINMIND_URL = "https://api.finmindtrade.com/api/v4/data";
const ETF_NAV_DATA_URL = "./public/data/etf-nav.json";

// =========================
// ETF API
// =========================
let etfNavDataPromise = null;

export function fetchETFNavData() {
    if (!etfNavDataPromise) {
        etfNavDataPromise = fetch(ETF_NAV_DATA_URL)
            .then(response => {
                if (!response.ok) {
                    throw new Error(
                        `ETF NAV data error: ${response.status}`
                    );
                }

                return response.json();
            });
    }

    return etfNavDataPromise;
}

// =========================
// FinMind 共用 API
// =========================

async function fetchFinMindData(dataset, stockId, startDate = null) {
    const params = new URLSearchParams({
        dataset,
        data_id: stockId
    });

    if (startDate) {
        params.set("start_date", startDate);
    }

    const response = await fetch(`${FINMIND_URL}?${params}`);

    if (!response.ok) {
        throw new Error(`FinMind API error: ${response.status}`);
    }

    const result = await response.json();

    if (result.status !== 200) {
        throw new Error(result.msg || "FinMind API error");
    }

    return result.data || [];
}


// =========================
// 股價資料
// =========================

export async function fetchStockHistory(stockId, startDate) {
    const data = await fetchFinMindData(
        "TaiwanStockPrice",
        stockId,
        startDate
    );

    return data.map(item => ({
        date: item.date,
        open: item.open,
        high: item.max,
        low: item.min,
        close: item.close,
        volume: item.Trading_Volume
    }));
}


// =========================
// 股票基本資訊
// =========================

export async function fetchStockInfo(stockId) {
    const data = await fetchFinMindData(
        "TaiwanStockInfo",
        stockId
    );

    const stock = data[0];

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


// =========================
// 籌碼面資料
// =========================

// 三大法人
export async function fetchInstitutionalHistory(stockId, startDate) {
    return fetchFinMindData(
        "TaiwanStockInstitutionalInvestorsBuySell",
        stockId,
        startDate
    );
}


// 融資融券
export async function fetchMarginData(stockId, startDate) {
    return fetchFinMindData(
        "TaiwanStockMarginPurchaseShortSale",
        stockId,
        startDate
    );
}


// 借券賣出餘額
export async function fetchShortSaleBalanceData(stockId, startDate) {
    return fetchFinMindData(
        "TaiwanDailyShortSaleBalances",
        stockId,
        startDate
    );
}


// =========================
// 基本面資料
// =========================

// 本益比 / 股價淨值比 / 殖利率
export async function fetchPERData(stockId, startDate) {
    return fetchFinMindData(
        "TaiwanStockPER",
        stockId,
        startDate
    );
}


// 月營收
export async function fetchMonthlyRevenue(stockId, startDate) {
    return fetchFinMindData(
        "TaiwanStockMonthRevenue",
        stockId,
        startDate
    );
}


// 綜合損益表
export async function fetchFinancialStatements(stockId, startDate) {
    return fetchFinMindData(
        "TaiwanStockFinancialStatements",
        stockId,
        startDate
    );
}


// 資產負債表
export async function fetchBalanceSheet(stockId, startDate) {
    return fetchFinMindData(
        "TaiwanStockBalanceSheet",
        stockId,
        startDate
    );
}