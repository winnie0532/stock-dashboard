// =========================
// 基本面指標
// =========================


// EPS
// 最近 8 季單季 EPS
export function calculateQuarterlyEPSHistory(financialStatements) {
    return financialStatements
        .filter(item => item.type === "EPS")
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(-8)
        .map(item => ({
            date: item.date,
            eps: item.value
        }));
}


// 各季 TTM EPS
export function calculateTTMEPSHistory(financialStatements) {
    const quarterlyEPS = financialStatements
        .filter(item => item.type === "EPS")
        .sort((a, b) => new Date(a.date) - new Date(b.date));

    if (quarterlyEPS.length < 4) {
        return [];
    }

    return quarterlyEPS.slice(3).map((item, index) => ({
        date: item.date,
        eps: quarterlyEPS
            .slice(index, index + 4)
            .reduce((sum, quarter) => sum + quarter.value, 0)
    }));
}


// 單季 EPS YoY
export function calculateEPSYoYHistory(financialStatements) {
    const quarterlyEPS = financialStatements
        .filter(item => item.type === "EPS")
        .sort((a, b) => new Date(a.date) - new Date(b.date));

    if (quarterlyEPS.length < 5) {
        return [];
    }

    return quarterlyEPS.slice(4).map((item, index) => {
        const previousYear = quarterlyEPS[index];

        return {
            date: item.date,
            eps: item.value,
            previousEPS: previousYear.value,
            yoy: previousYear.value !== 0
                ? ((item.value - previousYear.value) / Math.abs(previousYear.value)) * 100
                : null
        };
    });
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

export function calculateROEHistory(financialStatements, balanceSheet) {
    const netIncomeData = financialStatements
        .filter(item => item.type === "EquityAttributableToOwnersOfParent")
        .sort((a, b) => new Date(a.date) - new Date(b.date));

    const equityData = balanceSheet
        .filter(item => item.type === "EquityAttributableToOwnersOfParent")
        .sort((a, b) => new Date(a.date) - new Date(b.date));

    if (netIncomeData.length < 4 || equityData.length < 5) {
        return [];
    }

    const result = [];

    for (let i = 3; i < netIncomeData.length; i++) {
        const latestDate = netIncomeData[i].date;

        const latestEquityIndex = equityData.findIndex(
            item => item.date === latestDate
        );

        if (latestEquityIndex < 4) {
            continue;
        }

        const ttmNetIncome = netIncomeData
            .slice(i - 3, i + 1)
            .reduce((sum, item) => sum + item.value, 0);

        const beginningEquity =
            equityData[latestEquityIndex - 4].value;

        const endingEquity =
            equityData[latestEquityIndex].value;

        if (!beginningEquity || !endingEquity) {
            continue;
        }

        const averageEquity =
            (beginningEquity + endingEquity) / 2;

        result.push({
            date: latestDate,
            roe: (ttmNetIncome / averageEquity) * 100
        });
    }

    return result.slice(-8);
}