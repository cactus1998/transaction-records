<!-- Dashboard.vue -->
<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
    <div class="max-w-7xl mx-auto">
      
      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-3xl font-bold text-white mb-1">{{ user.username }} 的投資筆記</h1>
          <p class="text-slate-400 text-sm">當前時間：{{ currentTime }}</p>
        </div>
        <el-button
          @click="logout"
          class="!bg-slate-700/50 hover:!bg-slate-700 !text-slate-200 !border-slate-600/50"
        >
          登出
        </el-button>
      </div>

      <!-- KPI 卡片區 -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPICard 
          icon="📊"
          label="交易次數"
          :value="kpiData.totalTrades"
          :sub-value="`本月 ${kpiData.monthTrades} 筆`"
        />
        <KPICard 
          icon="🎯"
          label="勝率"
          :value="`${kpiData.winRate}%`"
          :trend="kpiData.winRateTrend"
        />
        <KPICard 
          icon="📈"
          label="累計報酬"
          :value="`${kpiData.totalReturn}%`"
          :trend="kpiData.returnTrend"
        />
        <KPICard 
          icon="🏆"
          label="最佳交易"
          :value="`+${kpiData.bestTrade}%`"
          :sub-value="kpiData.bestTradeStock"
        />
      </div>

      <!-- 主要內容區 -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        
        <!-- 圖表區 -->
        <div class="lg:col-span-2 bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-lg font-semibold text-white">獲利分佈</h2>
            <select class="bg-slate-700/50 text-slate-300 text-sm rounded-lg px-3 py-1.5 border border-slate-600/50 outline-none">
              <option>近 3 個月</option>
              <option>近 6 個月</option>
              <option>全部</option>
            </select>
          </div>
          <Chart :chart-data="profitDistributionData" class="w-full" /> 
        </div>

        <!-- 統計卡片 -->
        <div class="space-y-4">
          <div class="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
            <div class="flex items-center gap-3">
              <div class="p-2 bg-emerald-500/10 rounded-lg">
                <span class="text-2xl">📈</span>
              </div>
              <div>
                <div class="text-slate-400 text-sm">平均獲利</div>
                <div class="text-xl font-bold text-emerald-400">+{{ statsData.avgProfit }}%</div>
              </div>
            </div>
          </div>

          <div class="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
            <div class="flex items-center gap-3">
              <div class="p-2 bg-rose-500/10 rounded-lg">
                <span class="text-2xl">📉</span>
              </div>
              <div>
                <div class="text-slate-400 text-sm">平均虧損</div>
                <div class="text-xl font-bold text-rose-400">{{ statsData.avgLoss }}%</div>
              </div>
            </div>
          </div>

          <div class="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
            <div class="flex items-center gap-3">
              <div class="p-2 bg-blue-500/10 rounded-lg">
                <span class="text-2xl">💹</span>
              </div>
              <div>
                <div class="text-slate-400 text-sm">期望值 (EV)</div>
                <div class="text-xl font-bold text-blue-400">+{{ statsData.expectedValue }}%</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="flex flex-col gap-6">
        <!-- 月度統計（可折疊） -->
        <SummaryTable :summary-list="summaryList" />

        <!-- 交易紀錄 -->
        <PerformanceTable :user-id="user.id" />
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from "vue";
import { db } from "@/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { getAuth, signOut } from "firebase/auth";
import { useRouter } from "vue-router";
import { usePerformanceSummary } from "@/composables/usePerformanceSummary";

import PerformanceTable from "@/components/performance/PerformanceTable.vue";
import SummaryTable from "@/components/performance/SummaryTable.vue";
import Chart from "@/components/chart/Chart.vue";
import KPICard from "@/components/KPICard.vue";

const router = useRouter();
const performanceList = ref([]);
let unsub;
const savedUser = localStorage.getItem("user");
const user = JSON.parse(savedUser);

// 當前時間
const currentTime = ref('')
function updateTime() {
  const now = new Date()
  currentTime.value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
}

onMounted(async () => {
  updateTime() // 初始化時間
  const timer = setInterval(updateTime, 1000) // 每秒更新
  onUnmounted(() => clearInterval(timer)) // 離開時清除計時器
  if (!savedUser) {
    router.push("/login");
    return;
  }

  const perfQuery = collection(db, "performance");
  unsub = onSnapshot(
    perfQuery,
    snapshot => {
      performanceList.value = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(p => p.userId === user.id);
    },
    err => {
      console.error("讀取 Firestore 失敗", err);
    }
  );
});

// ============== 計算各種統計數據 ==============
const { summaryList } = usePerformanceSummary(performanceList);

// ============== KPI 數據 ==============
const kpiData = computed(() => {
  const list = performanceList.value;
  if (list.length === 0) {
    return {
      totalTrades: 0,
      monthTrades: 0,
      winRate: 0,
      winRateTrend: 0,
      totalReturn: 0,
      returnTrend: 0,
      bestTrade: 0,
      bestTradeStock: '-'
    };
  }

  const currentMonth = new Date().toISOString().slice(0, 7);
  const monthTrades = list.filter(p => p.month?.startsWith(currentMonth)).length;
  
  const winTrades = list.filter(p => p.profit > 0).length;
  const winRate = ((winTrades / list.length) * 100).toFixed(1);
  
  const totalReturn = list.reduce((sum, p) => sum + (p.profit || 0), 0).toFixed(1);
  
  const bestTradeItem = list.reduce((max, p) => (p.profit || 0) > (max.profit || 0) ? p : max, list[0]);
  
  return {
    totalTrades: list.length,
    monthTrades,
    winRate,
    winRateTrend: 2.3, // 可根據實際計算
    totalReturn,
    returnTrend: 5.7,
    bestTrade: (bestTradeItem.profit || 0).toFixed(1),
    bestTradeStock: bestTradeItem.stockCode || '-'
  };
});

// ============== 統計數據 ==============
const statsData = computed(() => {
  const list = performanceList.value;
  if (list.length === 0) {
    return { avgProfit: 0, avgLoss: 0, expectedValue: 0 };
  }

  const winTrades = list.filter(p => p.profit > 0);
  const lossTrades = list.filter(p => p.profit < 0);
  
  const avgProfit = winTrades.length > 0
    ? (winTrades.reduce((sum, p) => sum + p.profit, 0) / winTrades.length).toFixed(1)
    : 0;
  
  const avgLoss = lossTrades.length > 0
    ? (lossTrades.reduce((sum, p) => sum + p.profit, 0) / lossTrades.length).toFixed(1)
    : 0;
  
  const winRate = winTrades.length / list.length;
  const expectedValue = (winRate * avgProfit + (1 - winRate) * avgLoss).toFixed(1);

  return { avgProfit, avgLoss, expectedValue };
});

// ============== 計算獲利分佈圖數據 ==============
const PROFIT_BINS = [
  -40, -35, -30, -25, -20, -15, -10, -5, 0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, Infinity
];

const profitDistributionData = computed(() => {
  const counts = new Array(PROFIT_BINS.length - 1).fill(0);
  
  if (performanceList.value.length === 0) {
    return counts;
  }

  performanceList.value.forEach(p => {
    const profit = p.profit || 0;

    for (let i = 0; i < PROFIT_BINS.length - 1; i++) {
      const lowerBound = PROFIT_BINS[i];
      const upperBound = PROFIT_BINS[i + 1];

      if (i === PROFIT_BINS.length - 2) {
        if (profit >= lowerBound) {
          counts[i]++;
          break;
        }
      } else if (profit >= lowerBound && profit < upperBound) {
        counts[i]++;
        break;
      }
    }
  });

  return counts;
});

onUnmounted(() => {
  unsub && unsub();
});

// 登出
const logout = async () => {
  try {
    const auth = getAuth();
    await signOut(auth);
    localStorage.removeItem("user");
    router.push("/login");
  } catch (err) {
    console.error("登出失敗", err);
  }
};
</script>

<style scoped>
/* Element Plus 深色主題覆蓋 */
:deep(.el-button) {
  transition: all 0.3s;
}
</style>