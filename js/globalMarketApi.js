// 第一階段：先固定資料格式與畫面。
// 下一階段再把這份示範資料替換成實際資料來源。

const PREVIEW_MARKETS = [
    { category: "美股", name: "S&P 500", value: 6460.23, change: 0.42, decimals: 2 },
    { category: "美股", name: "NASDAQ", value: 21470.11, change: 0.68, decimals: 2 },
    { category: "美股", name: "費城半導體", value: 5284.76, change: -0.31, decimals: 2 },
    { category: "利率", name: "美國 10Y 殖利率", value: 4.26, change: 0.04, decimals: 2, suffix: "%" },
    { category: "匯率", name: "美元／台幣", value: 30.58, change: 0.12, decimals: 2 },
    { category: "匯率", name: "美元／日圓", value: 148.42, change: -0.18, decimals: 2 },
    { category: "商品", name: "黃金", value: 3387.5, change: 0.57, decimals: 1, prefix: "$" },
    { category: "商品", name: "WTI 原油", value: 64.12, change: -0.73, decimals: 2, prefix: "$" }
];

export async function fetchGlobalMarketOverview() {
    return {
        source: "示範資料",
        updatedAt: "待串接資料來源",
        markets: PREVIEW_MARKETS
    };
}