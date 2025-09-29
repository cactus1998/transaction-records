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
          <el-table :data="performanceList" border stripe style="width: 100%">
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
import { collection, onSnapshot, addDoc } from "firebase/firestore";
import { getAuth, signOut } from "firebase/auth";
import { useRouter } from "vue-router";

const router = useRouter();
const performanceList = ref([]);
let unsub;

onMounted(async () => {
  const savedUser = localStorage.getItem("user");
  if (!savedUser) {
    router.push("/login");
    return;
  }

  const user = JSON.parse(savedUser);

  // --- 測試用：新增假資料 ---
  // try {
  //   await addDoc(collection(db, "performance"), {
  //     month: "2025-09",
  //     avgProfit: 1000,
  //     avgLoss: -500,
  //     winRate: 60,
  //     totalTrades: 50,
  //     maxProfit: 4000,
  //     maxLoss: -2000,
  //     avgHoldWin: 5,
  //     avgHoldLoss: 3,
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

onUnmounted(() => unsub && unsub());

// 登出
const logout = async () => {
  try {
    const auth = getAuth();
    await signOut(auth);
    router.push("/login");
  } catch (err) {
    console.error("登出失敗", err);
  }
};
</script>
