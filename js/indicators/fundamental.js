// =========================
// 基本面指標
// =========================


// EPS（TTM）
export function calculateTTMEPS(latestPrice, per) {
    if (!latestPrice || !per || per <= 0) {
        return null;
    }

    return latestPrice / per;
}


// 最新估值資料 P/E、P/B、殖利率
export function calculateValuationIndicators(perData) {
    if (!perData || perData.length === 0) {
        return {
            pe: null,
            pb: null,
            dividendYield: null
        };
    }

    const latest = perData[perData.length - 1];

    return {
        pe: latest.PER ?? null,
        pb: latest.PBR ?? null,
        dividendYield: latest.dividend_yield ?? null
    };
}


// 最新月營收 YoY
export function calculateRevenueYoY(monthlyRevenueData) {
    if (!monthlyRevenueData || monthlyRevenueData.length === 0) {
        return null;
    }

    const latest = monthlyRevenueData[monthlyRevenueData.length - 1];

    const previousYear = monthlyRevenueData.find(item =>
        item.revenue_year === latest.revenue_year - 1 &&
        item.revenue_month === latest.revenue_month
    );

    if (!previousYear || !previousYear.revenue) {
        return null;
    }

    return (
        (latest.revenue - previousYear.revenue) /
        previousYear.revenue
    ) * 100;
}

// ROE
export function calculateROE(financialStatements, balanceSheet) {
    const netIncomeData = financialStatements
        .filter(item => item.type === "EquityAttributableToOwnersOfParent")
        .sort((a, b) => new Date(a.date) - new Date(b.date));

    const equityData = balanceSheet
        .filter(item => item.type === "EquityAttributableToOwnersOfParent")
        .sort((a, b) => new Date(a.date) - new Date(b.date));

    if (netIncomeData.length < 4 || equityData.length < 5) {
        return null;
    }

    const latestFourQuarters = netIncomeData.slice(-4);

    const ttmNetIncome = latestFourQuarters.reduce(
        (sum, item) => sum + item.value,
        0
    );

    const latestEquity = equityData[equityData.length - 1];
    const beginningEquity = equityData[equityData.length - 5];

    if (!latestEquity.value || !beginningEquity.value) {
        return null;
    }

    const averageEquity =
        (beginningEquity.value + latestEquity.value) / 2;

    return (ttmNetIncome / averageEquity) * 100;
}