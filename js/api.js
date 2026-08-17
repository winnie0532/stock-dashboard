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