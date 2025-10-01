import { computed } from 'vue';

// 計算平均值的輔助函式
function avg(arr) {
  if (!arr.length) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

/**
 * 根據單筆交易紀錄 (performanceList) 計算月度績效統計 (summaryList)
 * @param {Ref<Array<Object>>} performanceList - 單筆交易紀錄的 Ref
 * @returns {ComputedRef<Array<Object>>} - 月度統計摘要的 Computed Ref
 */
export function usePerformanceSummary(performanceList) {
  // 計算平均值、勝率、期望值等
  const summaryList = computed(() => {
    // 檢查 performanceList.value 是否存在且有資料
    if (!performanceList.value || performanceList.value.length === 0) {
      return [];
    }
      
    // 按月份分組
    const groups = {};
    performanceList.value.forEach(item => {
      if (item.month) {
        // 擷取 YYYY-MM
        const monthKey = item.month.slice(0, 7)  // 假設格式是 "2025-09-29" → "2025-09"
        
        if (!groups[monthKey]) groups[monthKey] = [];
        groups[monthKey].push(item);
      }
    });

    // 計算每個月份的統計
    return Object.entries(groups).map(([month, list]) => {
      const profits = list.map(i => i.profit);
      const wins = list.filter(i => i.profit > 0);
      const losses = list.filter(i => i.profit < 0);

      const totalTrades = list.length;
      const avgProfitVal = avg(wins.map(i => i.profit));
      const avgLossVal = avg(losses.map(i => i.profit));
      const winRateVal = (wins.length / totalTrades); // 使用小數而非百分比

      // 期望值 (Expected Value, EV) 計算
      const lossRateVal = 1 - winRateVal;
      const expectedValue = (winRateVal * avgProfitVal) + (lossRateVal * avgLossVal);

      return {
        month,
        avgProfit: avgProfitVal.toFixed(2),
        avgLoss: avgLossVal.toFixed(2),
        winRate: (winRateVal * 100).toFixed(2), // 顯示時轉回百分比
        totalTrades: totalTrades,
        maxProfit: Math.max(...profits),
        maxLoss: Math.min(...profits),
        avgHoldWin: avg(wins.map(i => i.holdingDays)).toFixed(2),
        avgHoldLoss: avg(losses.map(i => i.holdingDays)).toFixed(2),
        expectedValue: expectedValue.toFixed(2)
      };
    });
  });

  // 只導出我們需要的結果
  return {
    summaryList
  };
}