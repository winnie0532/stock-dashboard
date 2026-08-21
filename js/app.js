import { renderDashboard } from "./ui/dashboard.js";
import { renderVolumeChart } from "./utils/charts.js";

import { analyzeTodayStatus } from "./status/todayStatus.js";

import {
    analyzeMarketStatus,
    analyzePriceVolume
} from "./status/marketStatus.js";

import {
    analyzeInstitutional,
    analyzeMargin,
    renderMarginStatus
} from "./status/chipStatus.js";

import {
    setupDetailOverlay,
    updateDetailOverlayData
} from "./ui/detailOverlay.js";

import {
    fetchStockHistory,
    fetchInstitutionalHistory,
    fetchStockInfo,
    fetchMarginData,
    fetchShortSaleBalanceData,

    fetchPERData,
    fetchMonthlyRevenue,
    fetchFinancialStatements,
    fetchBalanceSheet
} from "./api.js";

import {
    calculatePriceChange,
    calculateTechnicalIndicators,
    calculateMADeviations
} from "./indicators/technical.js";

import {
    organizeInstitutionalData,
    calculateInstitutionalIndicators,
    calculateMarginIndicators,
    calculateShortSaleIndicators
} from "./indicators/chip.js";

import {
    calculateQuarterlyEPSHistory,
    calculateTTMEPSHistory,
    calculateEPSYoYHistory,
    calculateValuationIndicators,
    calculateRevenueYoY,
    calculateROE,
    calculateROEHistory
} from "./indicators/fundamental.js";

async function init(stockId = "2330") {
    try {
        // =========================
        // 取得資料
        // =========================

        const stockInfo = await fetchStockInfo(stockId);
        const data = await fetchStockHistory(stockId, "2023-05-01");
        const institutional = await fetchInstitutionalHistory(stockId, "2023-05-31");
        const marginData = await fetchMarginData(stockId, "2025-07-01");
        const shortSaleBalanceData = await fetchShortSaleBalanceData(stockId, "2025-07-01");

        // =========================
        // 基本面原始資料
        // =========================

        const perData = await fetchPERData(stockId, "2025-01-01");
        const monthlyRevenueData = await fetchMonthlyRevenue(stockId, "2025-01-01");
        const financialStatements = await fetchFinancialStatements(stockId, "2022-01-01");
        const balanceSheet = await fetchBalanceSheet(stockId, "2022-01-01");


        // =========================
        // 技術指標
        // =========================

        const priceChanges = {
            change1: calculatePriceChange(data, 1),
            change5: calculatePriceChange(data, 5),
            change20: calculatePriceChange(data, 20),
            change60: calculatePriceChange(data, 60)
        };

        const technicalIndicators = calculateTechnicalIndicators(data);

        const {
            latest,
            movingAverages,
            movingAverageHistory,
            volume,
            rsi,
            kd,
            macd
        } = technicalIndicators;

        const maDeviations = calculateMADeviations(
            latest.close,
            movingAverages
        );


        // =========================
        // 籌碼指標
        // =========================

        const institutionalDaily = organizeInstitutionalData(institutional);

        const institutionalIndicators = calculateInstitutionalIndicators(institutionalDaily);

        const institutionalAnalysis = analyzeInstitutional(
            institutionalDaily,
            institutionalIndicators
        );

        const marginIndicators =calculateMarginIndicators(marginData);
        const marginStatus =analyzeMargin(marginIndicators);
        const shortSaleIndicators = calculateShortSaleIndicators(shortSaleBalanceData);

        // =========================
        // 基本面指標
        // =========================
        const valuationIndicators = calculateValuationIndicators(perData);

        // EPS
        const quarterlyEPS = calculateQuarterlyEPSHistory(financialStatements);
        const ttmEPSHistory = calculateTTMEPSHistory(financialStatements);
        const epsYoYHistory = calculateEPSYoYHistory(financialStatements);
        const eps = ttmEPSHistory.at(-1)?.eps ?? null;
        
        // YoY
        const revenueYoY = calculateRevenueYoY(monthlyRevenueData);
        
        //ROE
        const roeHistory = calculateROEHistory(financialStatements, balanceSheet);
        const roe = roeHistory.at(-1)?.roe ?? null;

        const fundamentalIndicators = {
            profitability: {
                eps,
                roe,
                quarterlyEPS,
                ttmEPSHistory,
                epsYoYHistory,
                roeHistory
            },

            valuation: {
                pe: valuationIndicators.pe,
                pb: valuationIndicators.pb,
                dividendYield: valuationIndicators.dividendYield
            },

            growth: {
                revenueYoY
            }
        };


        // =========================
        // 市場狀態
        // =========================

        const marketStatus = analyzeMarketStatus({
            latestPrice: latest.close,

            ma5: movingAverages.ma5,
            ma20: movingAverages.ma20,
            ma60: movingAverages.ma60,
            ma120: movingAverages.ma120,
            ma240: movingAverages.ma240,

            volumeRatio: volume.ratio,

            rsi: rsi.value,
            rsiFiveDaysAgo: rsi.fiveDaysAgo?.value ?? null,

            todayKD: kd.today,
            yesterdayKD: kd.yesterday,

            todayMACD: macd.today,
            yesterdayMACD: macd.yesterday,

            institutionalIndicators,

            priceChange1: priceChanges.change1,
            priceChange5: priceChanges.change5,
            priceChange20: priceChanges.change20,

            marginIndicators,
            shortSaleIndicators,

            profitability: fundamentalIndicators.profitability
        });

        const priceVolumeStatus = analyzePriceVolume(
            priceChanges.change1,
            volume.ratio
        );
        

        // =========================
        // 今日狀態
        // =========================

        const todayStatus = analyzeTodayStatus({
            latestPrice: latest.close,

            ma5: movingAverages.ma5,
            ma20: movingAverages.ma20,
            ma60: movingAverages.ma60,
            ma120: movingAverages.ma120,
            ma240: movingAverages.ma240,

            todayKD: kd.today,
            yesterdayKD: kd.yesterday,

            todayMACD: macd.today,
            yesterdayMACD: macd.yesterday,

            institutionalStatus: marketStatus.institutional,
            creditStatus: marketStatus.credit,
            shortPositionStatus: marketStatus.shortPosition
        });

        console.log("今日狀態:", todayStatus);



        // =========================
        // Dashboard
        // =========================

        const stockData = {
            stockId: stockInfo.stockId,
            stockName: stockInfo.stockName,
            date: latest.date,
            price: latest.close,

            performance: {
                change5: priceChanges.change5,
                change20: priceChanges.change20,
                change60: priceChanges.change60
            },

            technical: {
                ma5: movingAverages.ma5,
                ma20: movingAverages.ma20,
                ma60: movingAverages.ma60,
                ma120: movingAverages.ma120,
                ma240: movingAverages.ma240,

                volume: volume.current,
                avgVolume20: volume.average20,
                volumeRatio: volume.ratio,

                rsi14: rsi.value,

                kd: {
                    k: kd.today.k,
                    d: kd.today.d
                },

                macd: {
                    dif: macd.today.dif,
                    signal: macd.today.signal,
                    histogram: macd.today.histogram
                }
            },

            institutional: institutionalAnalysis,
            fundamentals: fundamentalIndicators,

            marketStatus,
            todayStatus,
        };

        renderDashboard(stockData);
        renderMarginStatus(marginStatus);
        renderVolumeChart(data);


        // =========================
        // 詳細分析
        // =========================

        updateDetailOverlayData({
            data,

            ma5History: movingAverageHistory.ma5,
            ma20History: movingAverageHistory.ma20,
            ma60History: movingAverageHistory.ma60,
            ma120History: movingAverageHistory.ma120,
            ma240History: movingAverageHistory.ma240,

            trend: {
                status: marketStatus.trend,
                deviations: maDeviations
            },

            shortTerm: {
                status: marketStatus.shortTerm,
                ma5Deviation: maDeviations.ma5,
                k: kd.today.k,
                d: kd.today.d
            },

            volumeDetail: {
                status: priceVolumeStatus,
                priceChange: priceChanges.change1,
                volume: volume.current,
                avgVolume20: volume.average20,
                volumeRatio: volume.ratio
            },  

            rsi: {
                status: marketStatus.rsi,
                yesterday: rsi.yesterday?.value ?? null,
                history: rsi.history
            },

            macd: {
                status: marketStatus.macd,
                history: macd.history
            },

            institutional: {
                status: marketStatus.institutional,
                history: institutionalDaily
            },

            credit: {
                status: marketStatus.credit,
                priceChange5: priceChanges.change5,
                priceChange20: priceChanges.change20,
                margin5Percent: marginIndicators.margin.day5Percent,
                margin20Percent: marginIndicators.margin.day20Percent
            },

            marginData,

            shortPosition: {
                status: marketStatus.shortPosition,
                marginShort5Percent: marginIndicators.short.day5Percent,
                marginShort20Percent: marginIndicators.short.day20Percent,
                sbl5Percent: shortSaleIndicators.day5Percent,
                sbl20Percent: shortSaleIndicators.day20Percent
            },

            shortSaleBalanceData,

            profitability: {
                ...fundamentalIndicators.profitability,
                status: marketStatus.profitability,
                epsGrowth: marketStatus.profitability.epsGrowth,
                roeChange: marketStatus.profitability.roeChange
            }
            
        });


        // =========================
        // Debug
        // =========================
        console.log(roeHistory)

    } catch (error) {
        console.error("取得股票資料失敗：", error);
    }
}


const stockInput = document.getElementById("stockInput");
const stockSearchButton = document.getElementById("stockSearchButton");

stockSearchButton.addEventListener("click", () => {
    const stockId = stockInput.value.trim();

    if (!stockId) {
        return;
    }

    init(stockId);
});

stockInput.addEventListener("keydown", event => {
    if (event.key === "Enter") {
        stockSearchButton.click();
    }
});


setupDetailOverlay();
init();