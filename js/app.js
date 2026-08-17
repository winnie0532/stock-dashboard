import { fetchStockHistory } from "./api.js";
import { analyzeTechnical } from "./analysis.js";

import {
    calculateMA,
    calculateAverageVolume,
    calculateRSI,
    calculateKD,
    calculateMACD
} from "./indicators.js";


async function init() {
    try {
        // =========================
        // 取得股票資料
        // =========================

        const data = await fetchStockHistory("2330", "2025-07-01");

        if (!data || data.length === 0) {
            throw new Error("沒有取得股票資料");
        }

        const latest = data[data.length - 1];


        // =========================
        // MA 均線
        // =========================

        const ma5 = calculateMA(data, 5);
        const ma20 = calculateMA(data, 20);
        const ma60 = calculateMA(data, 60);
        const ma120 = calculateMA(data, 120);
        const ma240 = calculateMA(data, 240);


        // =========================
        // 成交量
        // =========================

        const avgVolume20 = calculateAverageVolume(data, 20);
        const volumeRatio = latest.volume / avgVolume20;


        // =========================
        // RSI
        // =========================

        const rsi14 = calculateRSI(data, 14);


        // =========================
        // KD
        // =========================

        const kdHistory = calculateKD(data);

        const todayKD = kdHistory[kdHistory.length - 1];
        const yesterdayKD = kdHistory[kdHistory.length - 2];


        // =========================
        // MACD
        // =========================

        const macdHistory = calculateMACD(data);

        const todayMACD = macdHistory[macdHistory.length - 1];
        const yesterdayMACD = macdHistory[macdHistory.length - 2];


        // =========================
        // 綜合技術分析
        // =========================

        const analysis = analyzeTechnical({
            latestPrice: latest.close,
            ma5,
            ma20,
            ma60,
            ma120,
            ma240,
            volumeRatio,
            rsi: rsi14,
            todayKD,
            yesterdayKD,
            todayMACD,
            yesterdayMACD
        });

        // 整理 Dashboard 需要的所有資料
        const stockData = {
            stockId: "2330",
            stockName: "台積電",
            date: latest.date,
            price: latest.close,

            technical: {
                ma5,
                ma20,
                ma60,
                ma120,
                ma240,
                volume: latest.volume,
                avgVolume20,
                volumeRatio,
                rsi14,

                kd: {
                    k: todayKD.k,
                    d: todayKD.d
                },

                macd: {
                    dif: todayMACD.dif,
                    signal: todayMACD.signal,
                    histogram: todayMACD.histogram
                }
            },

            analysis
        };

        // 顯示到網頁
        renderDashboard(stockData);

        // =========================
        // Debug
        // =========================

        console.log("最新股價:", latest.close);
        console.log("技術分析:", analysis);

    } catch (error) {
        console.error("取得股票資料失敗：", error);
    }
}
function renderDashboard(stockData) {
    // 股票基本資訊
    document.getElementById("stockId").textContent = stockData.stockId;
    document.getElementById("stockName").textContent = stockData.stockName;
    document.getElementById("latestDate").textContent = stockData.date;
    document.getElementById("latestPrice").textContent = stockData.price.toFixed(2);

    // 市場狀態
    function renderStatus(elementId, status) {
        const element = document.getElementById(elementId);

        element.textContent = status.text;
        element.className = `status-value ${status.type}`;
    }
    renderStatus("trendStatus", stockData.analysis.trend);
    renderStatus("shortTermStatus", stockData.analysis.shortTerm);
    renderStatus("volumeStatus", stockData.analysis.volume);
    renderStatus("rsiStatus", stockData.analysis.rsi);
    renderStatus("macdStatus", stockData.analysis.macd);

    // 今日訊號
    const signalList = document.getElementById("signalList");
    signalList.innerHTML = "";

    stockData.analysis.signals.forEach(signal => {
        const signalItem = document.createElement("p");

        signalItem.textContent = signal.text;
        signalItem.classList.add("signal-item", signal.type);

        signalList.appendChild(signalItem);
    });

    // MA
    document.getElementById("ma5").textContent = stockData.technical.ma5.toFixed(2);
    document.getElementById("ma20").textContent = stockData.technical.ma20.toFixed(2);
    document.getElementById("ma60").textContent = stockData.technical.ma60.toFixed(2);
    document.getElementById("ma120").textContent = stockData.technical.ma120.toFixed(2);
    document.getElementById("ma240").textContent = stockData.technical.ma240.toFixed(2);

    // 成交量
    document.getElementById("volume").textContent = stockData.technical.volume.toLocaleString();
    document.getElementById("avgVolume20").textContent = Math.round(stockData.technical.avgVolume20).toLocaleString();
    document.getElementById("volumeRatio").textContent = `${stockData.technical.volumeRatio.toFixed(2)}x`;

    // RSI
    document.getElementById("rsi14").textContent = stockData.technical.rsi14.toFixed(2);

    // KD
    document.getElementById("kdK").textContent = stockData.technical.kd.k.toFixed(2);
    document.getElementById("kdD").textContent = stockData.technical.kd.d.toFixed(2);

    // MACD
    document.getElementById("macdDif").textContent = stockData.technical.macd.dif.toFixed(2);
    document.getElementById("macdSignal").textContent = stockData.technical.macd.signal.toFixed(2);
    document.getElementById("macdHistogram").textContent = stockData.technical.macd.histogram.toFixed(2);
}

init();