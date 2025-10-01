<template>
  <div class="flex flex-col items-center min-h-screen bg-gray-200 p-6">

    <!-- 上方標題列 -->
    <div class="flex items-center w-full justify-between mb-10">
      <div class="w-[90px]"></div>
      <h1 class="text-3xl font-semibold text-gray-800 text-center flex-1">
        {{ user.username }} 的投資紀錄
      </h1>
      <el-button
        type="info"
        plain
        @click="logout"
        class="w-[90px]"
      >
        登出
      </el-button>
    </div>

    <!-- 主體區塊 -->
    <div class="w-full max-w-7xl flex-1 flex flex-col gap-6">

      <div class=" gap-6">
        <!-- <div class="col-span-4 flex flex-col gap-6">
          <div class="bg-red-300 rounded-lg p-6 h-40">
            資金總覽
          </div>
          <div class="bg-yellow-300 rounded-lg p-6 h-40">
            盈虧摘要
          </div>
        </div> -->

        <!-- 圖表區 -->
        <div class=" bg-blue-100 rounded-lg p-6 h-full">
          投資概況
          <Chart class="w-full" :chart-data="profitDistributionData" /> 
        </div>
      </div>

      <!-- 月份平均表格 -->
      <SummaryTable :summary-list="summaryList" />

      <!-- 單筆交易紀錄表格 -->
      <PerformanceTable :user-id="user.id" />
    </div>
  </div>

</template>

<script setup>
import { ref, onMounted, onUnmounted, computed  } from "vue";
import { db } from "@/firebase";
import { collection, onSnapshot, addDoc, doc, deleteDoc  } from "firebase/firestore";
import { getAuth, signOut } from "firebase/auth";
import { useRouter } from "vue-router";
import { usePerformanceSummary } from "@/composables/usePerformanceSummary";

import PerformanceTable from "@/components/performance/PerformanceTable.vue"
import SummaryTable from "@/components/performance/SummaryTable.vue"
import Chart from "@/components/chart/Chart.vue";

const router = useRouter();
const performanceList = ref([]);
let unsub;
const savedUser = localStorage.getItem("user");
const user = JSON.parse(savedUser);
onMounted(async () => {
  
  if (!savedUser) {
    router.push("/login");
    return;
  }

  // 監聽該使用者的 performance
  const perfQuery = collection(db, "performance");
  unsub = onSnapshot(
    perfQuery,
    snapshot => {
      performanceList.value = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(p => p.userId === user.id); // 只抓自己的資料
    },
    err => {
      console.error("讀取 Firestore 失敗", err);
    }
  );
});

// ============== 計算各種統計數據 ==============
// 傳入 performanceList，並取得計算結果 summaryList
const { summaryList } = usePerformanceSummary(performanceList);

// ============== 計算獲利分佈圖數據 ==============
const PROFIT_BINS = [
  -40, -35, -30, -25, -20, -15, -10, -5, 0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, Infinity
]; // 21 個邊界，對應 20 個區間

const profitDistributionData = computed(() => {
  // 初始化 20 個區間的計數器為 0
  const counts = new Array(PROFIT_BINS.length - 1).fill(0);
  
  if (performanceList.value.length === 0) {
    return counts;
  }

  performanceList.value.forEach(p => {
    // 確保 profit 是一個數字，假設它在 Firestore 中存儲為 Number
    const profit = p.profit || 0; 

    // 找到 profit 屬於哪個區間
    for (let i = 0; i < PROFIT_BINS.length - 1; i++) {
      const lowerBound = PROFIT_BINS[i];
      const upperBound = PROFIT_BINS[i + 1];

      // 檢查區間： [lowerBound, upperBound)
      // 特殊處理最後一個區間 [55, Infinity)
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

  // 如果您希望將虧損超過 -40% 的交易也計入第一個區間，可以單獨處理
  if (performanceList.value.some(p => (p.profit || 0) < -40)) {
     // 通常第一個區間已涵蓋，此處可忽略，或根據您的 binning 邏輯調整
  }

  return counts;
});

// 離開頁面時取消監聽
onUnmounted(() => {
  unsub && unsub();
  // localStorage.removeItem("user"); // 清除 localStorage 的 user
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
:deep .el-input {
  width: 100%;
}

#chart-container {
  position: relative;
  height: 100vh;
  overflow: hidden;
}

</style>
