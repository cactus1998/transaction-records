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
      <div class="bg-gray-300 rounded-lg p-6 flex-1">
        <div class="flex justify-end mb-4">
          <el-button type="primary" @click="addPerformance = true">新增交易紀錄</el-button>
        </div>
        <el-table :data="performanceList" border stripe style="width: 100%"  max-height="500">
          <el-table-column prop="month" label="賣出月份" width="150" />
          <el-table-column prop="stockCode" label="代號" width="150" />
          <el-table-column prop="quantity" label="數量" width="200" />
          <el-table-column prop="stockPrice" label="成交單價" width="200" />
          <el-table-column prop="holdingDays" label="持有天數" width="200" />
          <el-table-column prop="profit" label="獲利 (%)" />
          <el-table-column fixed="right" label="操作" width="120" header-align="center" align="center">
            <template #default="scope">
              <el-button
                type="danger"
                round
                @click.prevent="deletePerformanceList(scope.$index)"
              >
                刪除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
  <el-dialog
    v-model="addPerformance"
    title="新增交易紀錄"
    width="500px"
    align-center
    destroy-on-close
    class="rounded-xl"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="100px"
      class="p-4 space-y-4"
    >
      <el-form-item label="賣出月份" prop="month">
        <el-date-picker
          v-model="form.month"
          type="date"
          placeholder="請選擇日期"
          style="width: 100%"
          value-format="YYYY-MM-DD"
        />
      </el-form-item>

      <el-form-item label="代號" prop="stockCode">
        <el-input
          v-model="form.stockCode"
          placeholder="例如: 2330.TW"
          class="rounded-md"
        />
      </el-form-item>

      <el-form-item label="數量" prop="quantity">
        <el-input-number
          v-model="form.quantity"
          :min="1"
          controls-position="right"
          style="width: 100%"
          class="rounded-md"
        />
      </el-form-item>

      <el-form-item label="成交單價" prop="stockPrice">
        <el-input-number
          v-model="form.stockPrice"
          :precision="2"
          :min="0"
          controls-position="right"
          style="width: 100%"
          class="rounded-md"
        />
      </el-form-item>

      <el-form-item label="持有天數" prop="holdingDays">
        <el-input-number
          v-model="form.holdingDays"
          :min="1"
          :max="3650"
          controls-position="right"
          style="width: 100%"
          class="rounded-md"
        />
      </el-form-item>

      <el-form-item label="獲利 (%)" prop="profit">
        <el-input-number
          v-model="form.profit"
          :precision="2"
          controls-position="right"
          style="width: 100%"
          class="rounded-md"
        />
      </el-form-item>

    </el-form>

    <template #footer>
      <div class="dialog-footer flex justify-end gap-3 px-4 py-2">
        <el-button
          @click="addPerformance = false"
          class="rounded-lg border-gray-300 text-gray-600 hover:bg-gray-100"
        >
          取消
        </el-button>
        <el-button
          type="primary"
          @click="submitForm"
          class="rounded-lg bg-blue-400 hover:bg-blue-500 border-0"
        >
          確認新增
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, onMounted, onUnmounted, reactive } from "vue";
import { db } from "@/firebase";
import { collection, onSnapshot, addDoc, doc, deleteDoc  } from "firebase/firestore";
import { getAuth, signOut } from "firebase/auth";
import { useRouter } from "vue-router";
import { usePerformanceSummary } from "@/composables/usePerformanceSummary";
import { useAlert } from "@/modules/alert.js"  // 引入封裝的 alert

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

// ============== 交易紀錄新增 ==============
const addPerformance = ref(false);
const formRef = ref()
const form = reactive({
  month: '', // 月份 (String)
  stockCode: '', // 代號 (String)
  quantity: null, // 數量 (Number)
  stockPrice: null, // 成交單價 (Number)
  holdingDays: null, // 持有天數 (Number)
  profit: null, // 獲利 (%) (Number)
})

const rules = reactive({
  month: [
    { type: 'date', required: true, message: '請選擇交易日期', trigger: 'change' },
  ],
  stockCode: [
    { required: true, message: '請輸入股票代號', trigger: 'blur' },
  ],
  quantity: [
    // type: 'number' 確保輸入值被視為數字進行驗證
    { type: 'number', required: true, message: '請輸入交易數量', trigger: 'blur' },
    { type: 'number', min: 1, message: '數量必須大於 0', trigger: 'blur' },
  ],
  stockPrice: [
    { type: 'number', required: true, message: '請輸入成交單價', trigger: 'blur' },
    { type: 'number', min: 0.01, message: '單價必須大於 0', trigger: 'blur' },
  ],
  holdingDays: [
    { type: 'number', required: true, message: '請輸入持有天數', trigger: 'blur' },
    { type: 'number', min: 1, message: '天數必須大於 0', trigger: 'blur' },
  ],
  profit: [
    { type: 'number', required: true, message: '請輸入獲利 (%)', trigger: 'blur' },
  ],
})

const submitForm = async () => {
  if (!formRef.value) return

  // 表單驗證
  const valid = await formRef.value.validate((isValid) => isValid)

  if (valid) {
    try {
      // 寫入 Firebase Firestore
      await addDoc(collection(db, "performance"), {
        // 使用表單的實際值
        month: form.month,
        stockCode: form.stockCode,
        quantity: form.quantity,
        stockPrice: form.stockPrice,
        holdingDays: form.holdingDays,
        profit: form.profit,
        userId: user.id // 寫入用戶ID
      });

      // 3. 寫入成功提示
      useAlert.success("新增成功", "交易紀錄已新增")

      // 4. 重置與關閉
      formRef.value.resetFields() 
      addPerformance.value = false 

      // 💡 提示: 實際專案中，您通常會使用 Firebase 監聽器來自動刷新 performanceList 列表

    } catch (err) {
      // 5. 寫入失敗處理
      console.error("寫入 Firebase 失敗:", err);
      useAlert.error("寫入失敗", err.message)
    }

  }
}

const deletePerformanceList = async (index) => {
  const perfToDelete = performanceList.value[index];
  
  if (!perfToDelete) return;
  // 詢問用戶是否確定刪除
  const confirmed = await useAlert.confirmDelete(perfToDelete.stockCode);

  // 取消
  if (!confirmed) {
    return;
  }
  
  // 確定刪除後，開始執行資料庫操作
  
  try {
    useAlert.loading("刪除中", "正在連線資料庫..."); 

    // 刪除 Firestore 紀錄
    const docRef = doc(db, "performance", perfToDelete.id);
    await deleteDoc(docRef);

    useAlert.close();
    useAlert.success("刪除成功", "交易紀錄已刪除");

  } catch (err) {
    console.error("刪除失敗", err);
    
    useAlert.close();
    useAlert.error("刪除失敗", err.message || "未知錯誤");
  }
};

// ============== 表單編輯 ==============


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
</style>
