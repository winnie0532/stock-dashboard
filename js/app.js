import { renderDashboard } from "./ui/dashboard.js";
import { renderVolumeChart } from "./utils/charts.js";
import { analyzeMarketStatus } from "./marketStatus.js";
import { analyzeTechnicalStatus } from "./technicalStatus.js";
import {
    analyzeInstitutional,
    analyzeMargin,
    renderMarginStatus
} from "./chipStatus.js";
import {
    setupDetailOverlay,
    updateDetailOverlayData
} from "./ui/detailOverlay.js";
import {
    fetchStockHistory,
    fetchInstitutionalHistory,
    fetchStockInfo,
    fetchMarginData,
    fetchShortSaleBalanceData
} from "./api.js";
import {
    calculatePriceChange,
    calculateTechnicalIndicators,
    organizeInstitutionalData,
    calculateInstitutionalIndicators,
    calculateMarginIndicators,
    calculateShortSaleIndicators
} from "./indicators.js";


async function init(stockId = "2330") {
    try {
        const stockInfo = await fetchStockInfo(stockId);

        // =========================
        // 取得股票資料
        // =========================

        const data = await fetchStockHistory(stockId, "2023-05-01");

        // 取得法人資料
        const institutional = await fetchInstitutionalHistory(stockId, "2023-05-31");

        const institutionalDaily = organizeInstitutionalData(institutional);
        console.log("法人每日資料:", institutionalDaily);

        const institutionalIndicators = calculateInstitutionalIndicators(institutionalDaily);
        const institutionalAnalysis = analyzeInstitutional(
                institutionalDaily,
                institutionalIndicators
            );
        console.log("籌碼分析:", institutionalAnalysis);

        // 取得融資融券資料
        const marginData = await fetchMarginData(stockId, "2025-07-01");
        const marginIndicators = calculateMarginIndicators(marginData);
        console.log("融資融券指標:", marginIndicators);
        console.log("融資融券筆數:", marginData.length);
        console.log("融資融券完整資料:", marginData);

        const marginStatus = analyzeMargin(marginIndicators);
        renderMarginStatus(marginStatus);

        // 借券餘額資料
        const shortSaleBalanceData = await fetchShortSaleBalanceData(stockId, "2025-07-01");
        const shortSaleIndicators = calculateShortSaleIndicators(shortSaleBalanceData);

        console.log("借券賣出指標:", shortSaleIndicators);
        console.log("借券賣出資料筆數:", shortSaleBalanceData.length);
        console.log(
            "借券賣出最後一筆:",
            shortSaleBalanceData[shortSaleBalanceData.length - 1]
        );


        // =========================
        // 近期漲跌幅
        // =========================

        const priceChange5 = calculatePriceChange(data, 5);
        const priceChange20 = calculatePriceChange(data, 20);
        const priceChange60 = calculatePriceChange(data, 60);

        const technicalIndicators = calculateTechnicalIndicators(data);
        const {
            latest,
            movingAverages,
            movingAverageHistory,
            volume,
            rsi14,
            kd,
            macd
        } = technicalIndicators;


        // =========================
        // 綜合技術分析
        // =========================

        const marketStatus = analyzeMarketStatus({
            latestPrice: latest.close,

            ma5: movingAverages.ma5,
            ma20: movingAverages.ma20,
            ma60: movingAverages.ma60,
            ma120: movingAverages.ma120,
            ma240: movingAverages.ma240,

            volumeRatio: volume.ratio,
            rsi: rsi14,

            todayKD: kd.today,
            yesterdayKD: kd.yesterday,

            todayMACD: macd.today,
            yesterdayMACD: macd.yesterday,

            institutionalIndicators,

            priceChange5,
            priceChange20,
            marginIndicators,
            shortSaleIndicators
        });

        const technicalStatus = analyzeTechnicalStatus({
            latestPrice: latest.close,

            ma5: movingAverages.ma5,
            ma20: movingAverages.ma20,
            ma60: movingAverages.ma60,
            ma120: movingAverages.ma120,
            ma240: movingAverages.ma240,

            todayKD: kd.today,
            yesterdayKD: kd.yesterday,

            todayMACD: macd.today,
            yesterdayMACD: macd.yesterday
        });

        // 整理 Dashboard 需要的所有資料
        const stockData = {
            stockId: stockInfo.stockId,
            stockName: stockInfo.stockName,
            date: latest.date,
            price: latest.close,

            performance: {
                change5: priceChange5,
                change20: priceChange20,
                change60: priceChange60
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

                rsi14,

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

            marketStatus,
            technicalStatus,
        };

        // 顯示到網頁
        renderDashboard(stockData);

        // 成交量圖
        renderVolumeChart(data);

        // 詳細分析視窗圖
        updateDetailOverlayData({
            data,

            ma5History: movingAverageHistory.ma5,
            ma20History: movingAverageHistory.ma20,
            ma60History: movingAverageHistory.ma60,
            ma120History: movingAverageHistory.ma120,
            ma240History: movingAverageHistory.ma240,

            credit: {
                status: marketStatus.credit,
                priceChange5,
                priceChange20,
                margin5Percent: marginIndicators.margin.day5Percent,
                margin20Percent: marginIndicators.margin.day20Percent
            },

            marginData,

            shortPosition: {
                status: marketStatus.shortPosition,
                marginShort5Percent:marginIndicators.short.day5Percent,
                marginShort20Percent:marginIndicators.short.day20Percent,
                sbl5Percent:shortSaleIndicators.day5Percent,
                sbl20Percent:shortSaleIndicators.day20Percent
            },

        shortSaleBalanceData
            });
        // =========================
        // Debug
        // =========================

        console.log("5日漲跌幅:", priceChange5);
        console.log("20日漲跌幅:", priceChange20);
        console.log("60日漲跌幅:", priceChange60);

        console.log("最新股價:", latest.close);
        console.log("市場狀態:", marketStatus);

        console.log("完整股票資料:", stockData);

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
