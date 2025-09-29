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

      <!-- 上方 3 區塊 -->
      <div class="grid grid-cols-12 gap-6">
        <!-- 左側：上下兩塊 -->
        <div class="col-span-4 flex flex-col gap-6">
          <div class="bg-red-300 rounded-lg p-6 h-40">
            資金總覽
          </div>
          <div class="bg-yellow-300 rounded-lg p-6 h-40">
            盈虧摘要
          </div>
        </div>

        <!-- 右側：大圖表區 -->
        <div class="col-span-8 bg-blue-300 rounded-lg p-6 h-[340px]">
          投資概況 (折線圖 / 圓餅圖)
        </div>
      </div>

      <!-- 月份平均表格 -->
      <div class="bg-green-300 rounded-lg p-6 flex-1">
        <el-table :data="summaryList" border stripe style="width: 100%">
          <el-table-column prop="month" label="月份" width="100" />

          <el-table-column prop="avgProfit" label="平均獲利 (%)" />
          <el-table-column prop="avgLoss" label="平均虧損 (%)" />
          <el-table-column prop="winRate" label="勝率 (%)" />
          <el-table-column prop="expectedValue" label="期望值 EV (%)" /> 
          <el-table-column prop="totalTrades" label="交易總比數" />
          <el-table-column prop="maxProfit" label="最大獲利 (%)" />
          <el-table-column prop="maxLoss" label="最大虧損 (%)" />
          <el-table-column prop="avgHoldWin" label="成功部位平均持有天數" />
          <el-table-column prop="avgHoldLoss" label="失敗部位平均持有天數" />
        </el-table>
      </div>

      <!-- 單筆交易紀錄表格 -->
      <div class="bg-green-300 rounded-lg p-6 flex-1">
        <el-table :data="performanceList" border stripe style="width: 100%">
          <el-table-column prop="month" label="月份" width="100" />
          <el-table-column prop="stockCode" label="代號" width="200" />
          <el-table-column prop="quantity" label="數量" width="200" />
          <el-table-column prop="stockPrice" label="成交單價" width="200" />
          <el-table-column prop="holdingDays" label="持有天數" width="200" />
          <el-table-column prop="profit" label="獲利 (%)" />
        </el-table>
      </div>

    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from "vue";
import { db } from "@/firebase";
import { collection, onSnapshot, addDoc } from "firebase/firestore";
import { getAuth, signOut } from "firebase/auth";
import { useRouter } from "vue-router";
import { usePerformanceSummary } from "@/composables/usePerformanceSummary";

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

  // --- 測試用：新增假資料 ---
  // try {
  //   await addDoc(collection(db, "performance"), {
  //     month: "2025-09",
  //     stockCode: "AMD",
  //     quantity: 50,
  //     stockPrice: 200,
  //     holdingDays: 20,
  //     profit: 10,
  //     userId: user.id
  //   });
  //   console.log("假資料已寫入 Firebase");
  // } catch (err) {
  //   console.error("寫入假資料失敗:", err);
  // }

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



// 離開頁面時取消監聽
onUnmounted(() => {
  unsub && unsub();
  localStorage.removeItem("user"); // 清除 localStorage 的 user
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
