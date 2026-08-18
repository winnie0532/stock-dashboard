import { 
    renderVolumeChart,
    renderShortTermChart
 } from "./utils/charts.js";
import { analyzeMarketStatus } from "./marketStatus.js";
import { analyzeTechnicalStatus } from "./technicalStatus.js";
import {analyzeInstitutional} from "./institutionalStatus.js";
import {
    fetchStockHistory,
    fetchInstitutionalHistory,
    fetchStockInfo
} from "./api.js";
import {
    calculatePriceChange,
    calculateMA,
    calculateAverageVolume,
    calculateRSI,
    calculateKD,
    calculateMACD,
    organizeInstitutionalData,
    calculateInstitutionalIndicators,
    calculateMAHistory
} from "./indicators.js";


async function init(stockId = "2330") {
    try {
        const stockInfo = await fetchStockInfo(stockId);

        // =========================
        // 取得股票資料
        // =========================

        const data = await fetchStockHistory(stockId, "2025-05-01");

        // 取得法人資料
        
    
        const institutional = await fetchInstitutionalHistory(stockId, "2025-05-01");

        const institutionalDaily = organizeInstitutionalData(institutional);
        console.log("法人每日資料:", institutionalDaily);

        const institutionalIndicators = calculateInstitutionalIndicators(institutionalDaily);
        const institutionalAnalysis = analyzeInstitutional(
                institutionalDaily,
                institutionalIndicators
            );
        console.log("籌碼分析:", institutionalAnalysis);

        const latest = data[data.length - 1];

        // =========================
        // 近期漲跌幅
        // =========================

        const priceChange5 = calculatePriceChange(data, 5);
        const priceChange20 = calculatePriceChange(data, 20);
        const priceChange60 = calculatePriceChange(data, 60);

        // =========================
        // MA 均線
        // =========================

        const ma5 = calculateMA(data, 5);
        const ma20 = calculateMA(data, 20);
        const ma60 = calculateMA(data, 60);
        const ma120 = calculateMA(data, 120);
        const ma240 = calculateMA(data, 240);

        const ma5History = calculateMAHistory(data, 5);


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

        const marketStatus = analyzeMarketStatus({
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
            yesterdayMACD,
            institutionalIndicators
        });

        const technicalStatus = analyzeTechnicalStatus({
            latestPrice: latest.close,
            ma5,
            ma20,
            ma60,
            ma120,
            ma240,
            todayKD,
            yesterdayKD,
            todayMACD,
            yesterdayMACD
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

            institutional: institutionalAnalysis,

            marketStatus,
            technicalStatus,
        };

        // 顯示到網頁
        renderDashboard(stockData);

        // 成交量圖
        renderVolumeChart(data);

        // 短線詳細分析視窗圖
        setupDetailOverlay(data, ma5History);

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
    renderStatus("trendStatus", stockData.marketStatus.trend);
    renderStatus("shortTermStatus", stockData.marketStatus.shortTerm);
    renderStatus("volumeStatus", stockData.marketStatus.volume);
    renderStatus("rsiStatus", stockData.marketStatus.rsi);
    renderStatus("macdStatus", stockData.marketStatus.macd);
    renderStatus("institutionalStatus",stockData.marketStatus.institutional);
    // 近期表現
    function renderChange(elementId, value) {
        const element = document.getElementById(elementId);

        element.textContent = `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;

        if (value > 0) {
            element.className = "status-value positive";
        } else if (value < 0) {
            element.className = "status-value danger";
        } else {
            element.className = "status-value neutral";
        }
    }

    renderChange("change5", stockData.performance.change5);
    renderChange("change20", stockData.performance.change20);
    renderChange("change60", stockData.performance.change60);

    // 今日訊號
    const signalList = document.getElementById("signalList");
    signalList.innerHTML = "";

    const events = stockData.technicalStatus.events;

    if (events.length === 0) {
        const signalItem = document.createElement("p");

        signalItem.textContent = "今日無特殊技術訊號";
        signalItem.classList.add("signal-item");

        signalList.appendChild(signalItem);
    } else {
        events.forEach(event => {
            const signalItem = document.createElement("p");

            signalItem.textContent = event.text;
            signalItem.classList.add("signal-item", event.type);

            signalList.appendChild(signalItem);
        });
    }

    // 均線狀態
    function renderMAStatus(elementId, status) {
        const element = document.getElementById(elementId);

        element.textContent = status.text;
        element.className = `ma-light ${status.type}`;
    }

    renderMAStatus(
        "ma5Status",
        stockData.technicalStatus.movingAverages.ma5
    );

    renderMAStatus(
        "ma20Status",
        stockData.technicalStatus.movingAverages.ma20
    );

    renderMAStatus(
        "ma60Status",
        stockData.technicalStatus.movingAverages.ma60
    );

    renderMAStatus(
        "ma120Status",
        stockData.technicalStatus.movingAverages.ma120
    );

    renderMAStatus(
        "ma240Status",
        stockData.technicalStatus.movingAverages.ma240
    );

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

    // =========================
    // 籌碼面
    // =========================

    function renderInstitutionalValue(elementId, value) {
        const element = document.getElementById(elementId);

        const lots = value / 1000;

        element.textContent =
            `${lots >= 0 ? "+" : ""}${Math.round(lots).toLocaleString()} 張`;

        if (lots > 0) {
            element.className = "status-value positive";
        } else if (lots < 0) {
            element.className = "status-value danger";
        } else {
            element.className = "status-value neutral";
        }
    }


    function renderInstitutionalStatus(elementId, status) {
        const element = document.getElementById(elementId);

        element.textContent = status.text;
        element.className = `status-value ${status.type}`;
    }


    // 今日法人
    renderInstitutionalValue(
        "foreignToday",
        stockData.institutional.today.foreign
    );

    renderInstitutionalValue(
        "trustToday",
        stockData.institutional.today.trust
    );

    renderInstitutionalValue(
        "dealerToday",
        stockData.institutional.today.dealer
    );


    // 法人狀態
    renderInstitutionalStatus(
        "foreignStatus",
        stockData.institutional.status.foreign
    );

    renderInstitutionalStatus(
        "trustStatus",
        stockData.institutional.status.trust
    );

    renderInstitutionalStatus(
        "dealerStatus",
        stockData.institutional.status.dealer
    );


    // =========================
    // 近期法人動向
    // =========================

    // 外資
    renderInstitutionalValue(
        "foreign5",
        stockData.institutional.recent.foreign.day5
    );

    renderInstitutionalValue(
        "foreign20",
        stockData.institutional.recent.foreign.day20
    );

    renderInstitutionalValue(
        "foreign60",
        stockData.institutional.recent.foreign.day60
    );


    // 投信
    renderInstitutionalValue(
        "trust5",
        stockData.institutional.recent.trust.day5
    );

    renderInstitutionalValue(
        "trust20",
        stockData.institutional.recent.trust.day20
    );

    renderInstitutionalValue(
        "trust60",
        stockData.institutional.recent.trust.day60
    );


    // 自營商
    renderInstitutionalValue(
        "dealer5",
        stockData.institutional.recent.dealer.day5
    );

    renderInstitutionalValue(
        "dealer20",
        stockData.institutional.recent.dealer.day20
    );

    renderInstitutionalValue(
        "dealer60",
        stockData.institutional.recent.dealer.day60
    );
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

const volumeToggle = document.getElementById("volumeToggle");
const shortTermToggle = document.getElementById("shortTermToggle");

const detailOverlay = document.getElementById("detailOverlay");
const closeDetail = document.getElementById("closeDetail");

const volumeChartSection = document.getElementById("volumeChartSection");
const shortTermChartSection = document.getElementById("shortTermChartSection");

init();

// =========================
// 短線分析視窗圖
// =========================
function setupDetailOverlay(data, ma5History) {
    const volumeToggle = document.getElementById("volumeToggle");
    const shortTermToggle = document.getElementById("shortTermToggle");

    const detailOverlay = document.getElementById("detailOverlay");
    const closeDetail = document.getElementById("closeDetail");

    const detailTitle = document.getElementById("detailTitle");
    const detailSubtitle = document.getElementById("detailSubtitle");

    const volumeChartSection =
        document.getElementById("volumeChartSection");

    const shortTermChartSection =
        document.getElementById("shortTermChartSection");


    // 成交量
    volumeToggle.addEventListener("click", () => {
        detailTitle.textContent = "成交量分析";
        detailSubtitle.textContent = "近期成交量與 20 日平均量";

        volumeChartSection.style.display = "block";
        shortTermChartSection.style.display = "none";

        detailOverlay.classList.add("open");
    });


    // 短線
    shortTermToggle.addEventListener("click", () => {
        detailTitle.textContent = "短線趨勢";
        detailSubtitle.textContent = "近 100 個交易日｜股價與 MA5";

        volumeChartSection.style.display = "none";
        shortTermChartSection.style.display = "block";

        detailOverlay.classList.add("open");

        renderShortTermChart(data, ma5History);
    });


    // 關閉
    closeDetail.addEventListener("click", () => {
        detailOverlay.classList.remove("open");
    });
}