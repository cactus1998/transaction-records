<template>
  <div class="flex flex-col items-center min-h-screen bg-gray-200 p-6">

    <!-- 上方標題列 -->
    <div class="flex items-center w-full justify-between mb-10">
      <div class="w-[90px]"></div>
      <h1 class="text-3xl font-semibold text-gray-800 text-center flex-1">
        投資筆記
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
    <div class="w-full max-w-7xl grid grid-cols-12 gap-6 flex-1">

      <!-- 左側：分類 / 功能區 -->
      <div class="col-span-3 bg-red-300 rounded-lg p-4">
        左側功能區 (例如：分類、標籤)
      </div>

      <!-- 中間：主要內容 -->
      <div class="col-span-9 flex flex-col gap-6">

        <!-- 投資概況 -->
        <div class="bg-blue-300 rounded-lg p-6 h-48">
          投資概況 (折線圖/圓餅圖)
        </div>

        <!-- 筆記列表 -->
        <div class="bg-green-300 rounded-lg p-6 flex-1">
          <el-table :data="tableData" border stripe style="width: 100%">
            <el-table-column prop="month" label="月份" width="100" />

            <el-table-column prop="avgProfit" label="平均獲利" />
            <el-table-column prop="avgLoss" label="平均虧損" />
            <el-table-column prop="winRate" label="勝率 (%)" />
            <el-table-column prop="totalTrades" label="交易總比數" />
            <el-table-column prop="maxProfit" label="最大獲利" />
            <el-table-column prop="maxLoss" label="最大虧損" />
            <el-table-column prop="avgHoldWin" label="成功部位平均持有天數" />
            <el-table-column prop="avgHoldLoss" label="失敗部位平均持有天數" />
          </el-table>
        </div>

      </div>

    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { db } from "@/firebase";
import { getAuth, signOut } from 'firebase/auth'
import { collection, onSnapshot } from "firebase/firestore";
import { useRouter } from "vue-router";

// 假資料（半年）
const tableData = ref([
  {
    month: "2025-03",
    avgProfit: 1200,
    avgLoss: -800,
    winRate: 62,
    totalTrades: 48,
    maxProfit: 5000,
    maxLoss: -3000,
    avgHoldWin: 5,
    avgHoldLoss: 3,
  },
  {
    month: "2025-04",
    avgProfit: 1500,
    avgLoss: -1000,
    winRate: 58,
    totalTrades: 52,
    maxProfit: 6200,
    maxLoss: -3500,
    avgHoldWin: 6,
    avgHoldLoss: 4,
  },
  {
    month: "2025-05",
    avgProfit: 980,
    avgLoss: -750,
    winRate: 65,
    totalTrades: 40,
    maxProfit: 4200,
    maxLoss: -2800,
    avgHoldWin: 4,
    avgHoldLoss: 2,
  },
  {
    month: "2025-06",
    avgProfit: 1100,
    avgLoss: -950,
    winRate: 60,
    totalTrades: 55,
    maxProfit: 5800,
    maxLoss: -4000,
    avgHoldWin: 7,
    avgHoldLoss: 3,
  },
  {
    month: "2025-07",
    avgProfit: 1350,
    avgLoss: -870,
    winRate: 63,
    totalTrades: 47,
    maxProfit: 6100,
    maxLoss: -3200,
    avgHoldWin: 5,
    avgHoldLoss: 3,
  },
  {
    month: "2025-08",
    avgProfit: 1420,
    avgLoss: -920,
    winRate: 59,
    totalTrades: 50,
    maxProfit: 6400,
    maxLoss: -3700,
    avgHoldWin: 6,
    avgHoldLoss: 4,
  },
]);

// Firestore 資料
const orders = ref([]);
const loading = ref(true);
let unsub;

onMounted(() => {
  unsub = onSnapshot(
    collection(db, "orders"),
    snapshot => {
      orders.value = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      loading.value = false;
    }
  );
});

onUnmounted(() => unsub && unsub());

// 登出
const router = useRouter();
const logout = async () => {
  try {
    const auth = getAuth()
    await signOut(auth)
    router.push('/login')
  } catch (err) {
    console.error('登出失敗', err)
  }
}
</script>
