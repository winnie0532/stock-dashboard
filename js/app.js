import { fetchStockHistory } from "./api.js";
import {
    calculateMA,
    calculateAverageVolume,
    calculateRSI,
    calculateKD,
    calculateMACD
} from "./indicators.js";

async function init() {
    try {
        const data = await fetchStockHistory(
            "2330",
            "2025-07-01"
        );

        const latest = data[data.length - 1];

        // MA 計算
        const ma5 = calculateMA(data, 5);
        const ma20 = calculateMA(data, 20);
        const ma60 = calculateMA(data, 60);
        const ma120 = calculateMA(data, 120);
        const ma240 = calculateMA(data, 240);

        function getMAStatus(price, ma, label) {
            if (ma === null) {
                return `${label}: 資料不足`;
            }

            const status = price >= ma ? "站上" : "跌破";

            return `${label}: ${ma.toFixed(2)} → ${status}`;
        }

        console.log("最新股價:", latest.close);

        console.log(getMAStatus(latest.close, ma5, "5MA"));
        console.log(getMAStatus(latest.close, ma20, "20MA 月線"));
        console.log(getMAStatus(latest.close, ma60, "60MA 季線"));
        console.log(getMAStatus(latest.close, ma120, "120MA 半年線"));
        console.log(getMAStatus(latest.close, ma240, "240MA 年線"));

        // 成交量計算
        const avgVolume20 = calculateAverageVolume(data, 20);
        const volumeRatio = latest.volume / avgVolume20;
        
        console.log("今日成交量:", latest.volume);
        console.log("20日平均量:", avgVolume20);
        console.log("量比:", volumeRatio.toFixed(2));

        function getVolumeStatus(ratio) {
            if (ratio >= 2) return "爆量";
            if (ratio >= 1.5) return "明顯放量";
            if (ratio >= 1.2) return "小幅放量";
            if (ratio < 0.8) return "量縮";

            return "正常";
        }
        console.log("成交量狀態:",
            `${volumeRatio.toFixed(2)}x → ${getVolumeStatus(volumeRatio)}`
        );

        // RSI 計算
        const rsi14 = calculateRSI(data, 14);
        function getRSIStatus(rsi) {
            if (rsi >= 70) return "過熱";
            if (rsi >= 60) return "偏強";
            if (rsi >= 40) return "中性";
            if (rsi >= 30) return "偏弱";
            return "超賣";
        }
        console.log(
            "RSI(14):",
            `${rsi14.toFixed(2)} → ${getRSIStatus(rsi14)}`
        );

        // KD 計算
        const kdHistory = calculateKD(data);

        const todayKD = kdHistory[kdHistory.length - 1];
        const yesterdayKD = kdHistory[kdHistory.length - 2];
        
        console.log("今日 KD:", `K ${todayKD.k.toFixed(2)} / D ${todayKD.d.toFixed(2)}`);
        console.log("昨日 KD:", `K ${yesterdayKD.k.toFixed(2)} / D ${yesterdayKD.d.toFixed(2)}`);
        
        function getKDStatus(k, d) {
                    if (k >= 80 && d >= 80) {
                        return "高檔區";
                    }

                    if (k <= 20 && d <= 20) {
                        return "低檔區";
                    }

                    if (k > d) {
                        return "K > D，短線偏強";
                    }

                    if (k < d) {
                        return "K < D，短線偏弱";
                    }

                    return "中性";
                }
                function getKDCross(today, yesterday) {
            if (
                yesterday.k <= yesterday.d &&
                today.k > today.d
            ) {
                return "🟢 今日 KD 黃金交叉";
            }

            if (
                yesterday.k >= yesterday.d &&
                today.k < today.d
            ) {
                return "🔴 今日 KD 死亡交叉";
            }

            return "今日無 KD 交叉";
        }
        console.log(getKDCross(todayKD, yesterdayKD));

        // MACD 計算
        const macdHistory = calculateMACD(data);

        const todayMACD = macdHistory[macdHistory.length - 1];
        const yesterdayMACD = macdHistory[macdHistory.length - 2];

        console.log("今日 MACD:", `DIF ${todayMACD.dif.toFixed(2)} / Signal ${todayMACD.signal.toFixed(2)} / Histogram ${todayMACD.histogram.toFixed(2)}`);

        function getMACDCross(today, yesterday) {
            if (yesterday.dif <= yesterday.signal && today.dif > today.signal) {
                return "🟢 今日 MACD 黃金交叉";
            }

            if (yesterday.dif >= yesterday.signal && today.dif < today.signal) {
                return "🔴 今日 MACD 死亡交叉";
            }

            return "今日無 MACD 交叉";
        }
        console.log(getMACDCross(todayMACD, yesterdayMACD));

        function getMACDMomentum(today, yesterday) {
            if (today.histogram > 0 && today.histogram > yesterday.histogram) return "🟢 多方動能增強";
            if (today.histogram > 0 && today.histogram < yesterday.histogram) return "🟠 多方動能減弱";
            if (today.histogram < 0 && today.histogram < yesterday.histogram) return "🔴 空方動能增強";
            if (today.histogram < 0 && today.histogram > yesterday.histogram) return "🟡 空方動能減弱";
            return "動能持平";
        }
        console.log("MACD 動能:", getMACDMomentum(todayMACD, yesterdayMACD));
        
        
    } catch (error) {
        console.error("取得股票資料失敗：", error);
    }
}

init();