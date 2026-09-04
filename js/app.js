import { renderDashboard } from "./ui/dashboard.js";
import { renderVolumeChart } from "./utils/charts.js";

import { analyzeSummaryStatus } from "./status/summaryStatus.js";

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
    fetchETFNavData,
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
    calculateValuationPercentiles,
    calculateRevenueYoYHistory,
    calculateROEHistory
} from "./indicators/fundamental.js";

import { fetchGlobalMarketRawData } from "./globalMarketApi.js";
import {
    calculateGlobalMarketIndicators
} from "./indicators/globalMarket.js";

import { renderGlobalMarket } from "./ui/globalMarket.js";

import {
    setupGlobalMarketDetail,
    updateGlobalMarketDetailData
} from "./ui/globalMarketDetail.js";

import {
    setupETFDetailOverlay,
    updateETFDetailData
} from "./ui/etfDetailOverlay.js";

async function initGlobalMarkets() {
    try {
        const rawData = await fetchGlobalMarketRawData();

        const indicators =
            calculateGlobalMarketIndicators(rawData);

        renderGlobalMarket(indicators.overview);

        updateGlobalMarketDetailData(
            indicators.usdTwd
        );
    } catch (error) {
        console.error("取得國際市場資料失敗：", error);

        renderGlobalMarket([]);
    }
}

async function init(stockId = "2330") {
    try {
        // =========================
        // 取得資料
        // =========================

        const [stockInfo, etfNavRawData] = await Promise.all([
            fetchStockInfo(stockId),
            fetchETFNavData().catch(() => null)
        ]);
        const data = await fetchStockHistory(stockId, "2023-05-01");
        const institutional = await fetchInstitutionalHistory(stockId, "2023-05-31");
        const marginData = await fetchMarginData(stockId, "2025-07-01");
        const shortSaleBalanceData = await fetchShortSaleBalanceData(stockId, "2025-07-01");

        // =========================
        // 基本面原始資料
        // =========================

        const perData = await fetchPERData(stockId, "2021-01-01");

        const revenueStartDate = new Date();
        revenueStartDate.setMonth(revenueStartDate.getMonth() - 30);
        const monthlyRevenueData = await fetchMonthlyRevenue(stockId, revenueStartDate.toISOString().slice(0, 10));

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
        const valuationPercentiles = calculateValuationPercentiles(perData);

        // EPS
        const quarterlyEPS = calculateQuarterlyEPSHistory(financialStatements);
        const ttmEPSHistory = calculateTTMEPSHistory(financialStatements);
        const epsYoYHistory = calculateEPSYoYHistory(financialStatements);
        const eps = ttmEPSHistory.at(-1)?.eps ?? null;
        
        // YoY
        const revenueYoYHistory = calculateRevenueYoYHistory(monthlyRevenueData);
        const revenueYoY = revenueYoYHistory.at(-1)?.yoy ?? null;
        
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
                dividendYield: valuationIndicators.dividendYield,

                pePercentile: valuationPercentiles.pePercentile,
                pbPercentile: valuationPercentiles.pbPercentile,
                dividendYieldPercentile: valuationPercentiles.dividendYieldPercentile,
                history: perData
            },

            growth: {
                revenueYoY,
                revenueYoYHistory
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

            profitability: fundamentalIndicators.profitability,
            valuation: fundamentalIndicators.valuation,
            growth: fundamentalIndicators.growth
        });

        const priceVolumeStatus = analyzePriceVolume(
            priceChanges.change1,
            volume.ratio
        );
        

        // =========================
        // 綜合狀態
        // =========================

        const summaryStatus = analyzeSummaryStatus({
            latestPrice: latest.close,

            ma5: movingAverages.ma5,
            ma20: movingAverages.ma20,
            ma60: movingAverages.ma60,
            ma120: movingAverages.ma120,
            ma240: movingAverages.ma240,

            priceChange5: priceChanges.change5,
            margin5: marginIndicators.margin.day5Percent,
            
            todayKD: kd.today,
            yesterdayKD: kd.yesterday,

            todayMACD: macd.today,
            yesterdayMACD: macd.yesterday,

            institutionalStatus: marketStatus.institutional,
            creditStatus: marketStatus.credit,
            shortPositionStatus: marketStatus.shortPosition,

            profitabilityStatus: marketStatus.profitability,
            valuationStatus: marketStatus.valuation,
            growthStatus: marketStatus.growth
        });

        console.log("綜合狀態:", summaryStatus);
        

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
            summaryStatus,

            growth: {
                revenueYoY,
                revenueYoYHistory
            }
        };

        renderDashboard(stockData);
        updateETFDetailData(
            etfNavRawData?.etfs?.[stockId]
                ? {
                    stockId: stockInfo.stockId,
                    stockName: stockInfo.stockName,
                    navData: etfNavRawData.etfs[stockId]
                }
                : null
        );
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
            },

            valuation: {
                ...fundamentalIndicators.valuation,
                status: marketStatus.valuation,
                score: marketStatus.valuation.score
            },

            growth: {
                ...fundamentalIndicators.growth,
                status: marketStatus.growth,
                latestYoY: marketStatus.growth.latestYoY,
                avg3M: marketStatus.growth.avg3M,
                avg6M: marketStatus.growth.avg6M,
                momentum: marketStatus.growth.momentum
            }
            
        });


        // =========================
        // Debug
        // =========================
        console.log(roeHistory)

        console.log("成長資料:", fundamentalIndicators.growth);
        console.log("成長狀態:", marketStatus.growth);


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
setupGlobalMarketDetail();
setupETFDetailOverlay();

initGlobalMarkets();
init();