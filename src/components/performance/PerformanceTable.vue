<template>
  <div class="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
    <!-- 標題列 -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-3">
        <div class="p-2 bg-slate-700/50 rounded-lg">
          <span class="text-2xl">💼</span>
        </div>
        <div>
          <h2 class="text-lg font-semibold text-white">交易紀錄</h2>
          <p class="text-slate-400 text-sm">
            共 {{ filteredList.length }} 筆交易
            <span v-if="searchQuery || filterMonth" class="text-blue-400">（已篩選）</span>
          </p>
        </div>
      </div>
      <button 
        @click="addPerformance = true"
        class="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-all flex items-center gap-2 shadow-lg shadow-blue-600/20"
      >
        <span class="text-lg">+</span>
        新增交易
      </button>
    </div>

    <!-- 搜尋與篩選列 -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
      <!-- 搜尋框 -->
      <el-input
        v-model="searchQuery"
        placeholder="🔍 搜尋股票代號..."
        clearable
        class="custom-input"
      />

      <!-- 月份篩選 -->
      <el-date-picker
        v-model="filterMonth"
        type="month"
        placeholder="📅 選擇月份"
        format="YYYY-MM"
        value-format="YYYY-MM"
        clearable
        class="custom-input w-full"
      />
    </div>

    <!-- 統計卡片 -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
      <div class="bg-slate-700/30 rounded-lg p-3 border border-slate-600/30">
        <div class="text-slate-400 text-xs mb-1">總獲利交易</div>
        <div class="text-emerald-400 text-xl font-bold">{{ winCount }}</div>
      </div>
      <div class="bg-slate-700/30 rounded-lg p-3 border border-slate-600/30">
        <div class="text-slate-400 text-xs mb-1">總虧損交易</div>
        <div class="text-rose-400 text-xl font-bold">{{ lossCount }}</div>
      </div>
      <div class="bg-slate-700/30 rounded-lg p-3 border border-slate-600/30">
        <div class="text-slate-400 text-xs mb-1">勝率</div>
        <div class="text-blue-400 text-xl font-bold">{{ winRatePercent }}%</div>
      </div>
      <div class="bg-slate-700/30 rounded-lg p-3 border border-slate-600/30">
        <div class="text-slate-400 text-xs mb-1">平均獲利</div>
        <div class="text-white text-xl font-bold">{{ avgProfitPercent }}%</div>
      </div>
    </div>

    <!-- 桌面版表格 -->
    <div class="hidden md:block overflow-x-auto rounded-lg border border-slate-700/50">
      <table class="w-full">
        <thead class="bg-slate-700/30 sticky top-0">
          <tr>
            <th class="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
              賣出月份
            </th>
            <th class="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
              股票代號
            </th>
            <th class="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">
              數量
            </th>
            <th class="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">
              成交單價
            </th>
            <th class="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">
              持有天數
            </th>
            <th class="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">
              獲利 (%)
            </th>
            <th class="px-4 py-3 text-center text-xs font-medium text-slate-400 uppercase tracking-wider">
              操作
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-700/50">
          <tr 
            v-for="(trade, index) in paginatedList" 
            :key="trade.id" 
            class="hover:bg-slate-700/20 transition-colors group"
          >
            <td class="px-4 py-3 text-sm text-slate-300">
              <div class="flex items-center gap-2">
                <span class="text-slate-500">📅</span>
                {{ trade.month }}
              </div>
            </td>
            <td class="px-4 py-3 text-sm">
              <span class="font-medium text-white px-2 py-1 bg-slate-700/50 rounded">
                {{ trade.stockCode }}
              </span>
            </td>
            <td class="px-4 py-3 text-sm text-right text-slate-300">
              {{ formatNumber(trade.quantity) }}
            </td>
            <td class="px-4 py-3 text-sm text-right text-slate-300">
              ${{ formatNumber(trade.stockPrice) }}
            </td>
            <td class="px-4 py-3 text-sm text-right text-slate-400">
              {{ trade.holdingDays }} 天
            </td>
            <td class="px-4 py-3 text-sm text-right">
              <span 
                class="font-bold text-base px-2 py-1 rounded"
                :class="getProfitClass(trade.profit)"
              >
                {{ formatProfit(trade.profit) }}%
              </span>
            </td>
            <td class="px-4 py-3 text-center">
              <button 
                @click="deletePerformance(index)"
                class="text-slate-400 hover:text-rose-400 transition-all hover:scale-110 text-xl opacity-0 group-hover:opacity-100"
                title="刪除交易"
              >
                🗑️
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- 空狀態 -->
      <div v-if="filteredList.length === 0" class="text-center py-16 text-slate-500">
        <div class="text-5xl mb-3">📊</div>
        <p class="text-lg mb-1">尚無交易紀錄</p>
        <p class="text-sm">點擊上方「新增交易」按鈕開始記錄</p>
      </div>
    </div>

    <!-- 手機版卡片 -->
    <div class="md:hidden space-y-3">
      <div 
        v-for="(trade, index) in paginatedList" 
        :key="trade.id"
        class="bg-slate-700/30 rounded-lg p-4 border border-slate-600/30 relative group"
      >
        <!-- 刪除按鈕 -->
        <button 
          @click="deletePerformance(index)"
          class="absolute top-3 right-3 text-slate-400 hover:text-rose-400 transition-colors"
        >
          🗑️
        </button>

        <!-- 卡片內容 -->
        <div class="flex items-start justify-between mb-3">
          <div>
            <span class="font-bold text-white text-lg px-2 py-1 bg-slate-600/50 rounded">
              {{ trade.stockCode }}
            </span>
          </div>
          <span 
            class="font-bold text-lg px-2 py-1 rounded"
            :class="getProfitClass(trade.profit)"
          >
            {{ formatProfit(trade.profit) }}%
          </span>
        </div>
        
        <div class="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span class="text-slate-400">賣出月份</span>
            <div class="text-slate-200">{{ trade.month }}</div>
          </div>
          <div>
            <span class="text-slate-400">持有天數</span>
            <div class="text-slate-200">{{ trade.holdingDays }} 天</div>
          </div>
          <div>
            <span class="text-slate-400">數量</span>
            <div class="text-slate-200">{{ formatNumber(trade.quantity) }}</div>
          </div>
          <div>
            <span class="text-slate-400">成交單價</span>
            <div class="text-slate-200">${{ formatNumber(trade.stockPrice) }}</div>
          </div>
        </div>
      </div>

      <!-- 手機版空狀態 -->
      <div v-if="filteredList.length === 0" class="text-center py-12 text-slate-500">
        <div class="text-4xl mb-2">📊</div>
        <p>尚無交易紀錄</p>
      </div>
    </div>

    <!-- 新增紀錄 Dialog -->
    <AddPerformanceDialog 
      v-model="addPerformance" 
      :user-id="props.userId" 
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { db } from "@/firebase";
import { collection, onSnapshot, doc, deleteDoc } from "firebase/firestore";
import { useAlert } from "@/modules/alert.js";
import AddPerformanceDialog from "@/components/AddPerformanceDialog.vue";

const props = defineProps({
  userId: { type: String, required: true }
});

const performanceList = ref([]);
const searchQuery = ref('');
const filterMonth = ref('');
const addPerformance = ref(false);
let unsub;

// Firestore 監聽
onMounted(() => {
  const perfQuery = collection(db, "performance");
  unsub = onSnapshot(perfQuery, snapshot => {
    performanceList.value = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(p => p.userId === props.userId)
      .sort((a, b) => {
        return (b.month || '').localeCompare(a.month || '');
      });
  });
});

onUnmounted(() => unsub && unsub());

// 篩選後的列表
const filteredList = computed(() => {
  let list = performanceList.value;

  // 搜尋過濾
  if (searchQuery.value) {
    list = list.filter(p => 
      p.stockCode?.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
  }

  // 月份過濾
  if (filterMonth.value) {
    list = list.filter(p => p.month === filterMonth.value);
  }

  return list;
});

// 直接使用篩選後的列表（不分頁）
const paginatedList = computed(() => {
  return filteredList.value;
});

// 取得所有唯一月份
const uniqueMonths = computed(() => {
  const months = [...new Set(performanceList.value.map(p => p.month))];
  return months.sort().reverse();
});

// 統計數據
const winCount = computed(() => 
  performanceList.value.filter(p => (p.profit || 0) > 0).length
);

const lossCount = computed(() => 
  performanceList.value.filter(p => (p.profit || 0) < 0).length
);

const winRatePercent = computed(() => {
  if (performanceList.value.length === 0) return 0;
  return ((winCount.value / performanceList.value.length) * 100).toFixed(1);
});

const avgProfitPercent = computed(() => {
  if (performanceList.value.length === 0) return 0;
  const sum = performanceList.value.reduce((acc, p) => acc + (p.profit || 0), 0);
  return (sum / performanceList.value.length).toFixed(1);
});

// 格式化數字
const formatNumber = (num) => {
  if (num == null) return '-';
  return Number(num).toLocaleString();
};

// 格式化獲利
const formatProfit = (profit) => {
  if (profit == null) return '-';
  const num = Number(profit).toFixed(1);
  return profit > 0 ? `+${num}` : num;
};

// 取得獲利樣式
const getProfitClass = (profit) => {
  if (profit > 0) return 'text-emerald-400 bg-emerald-500/10';
  if (profit < 0) return 'text-rose-400 bg-rose-500/10';
  return 'text-slate-400 bg-slate-500/10';
};

// 刪除交易紀錄
const deletePerformance = async (index) => {
  const perfToDelete = filteredList.value[index];
  if (!perfToDelete) return;

  const confirmed = await useAlert.confirmDelete(`${perfToDelete.stockCode} 的交易紀錄`);
  if (!confirmed) return;

  try {
    useAlert.loading("刪除中", "正在連線資料庫...");
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
</script>

<style scoped>
/* Element Plus 深色主題自定義 */
:deep(.custom-input .el-input__wrapper) {
  background-color: rgba(51, 65, 85, 0.5);
  border: 1px solid rgba(100, 116, 139, 0.5);
  box-shadow: none;
  transition: all 0.3s;
}

:deep(.custom-input .el-input__wrapper:hover) {
  border-color: rgba(100, 116, 139, 0.8);
}

:deep(.custom-input .el-input__wrapper.is-focus) {
  border-color: rgba(59, 130, 246, 0.5);
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

:deep(.custom-input .el-input__inner) {
  color: rgb(203, 213, 225);
  font-size: 0.875rem;
}

:deep(.custom-input .el-input__inner::placeholder) {
  color: rgb(148, 163, 184);
}

:deep(.custom-input .el-input__suffix) {
  color: rgb(148, 163, 184);
}

:deep(.custom-input .el-input__clear) {
  color: rgb(148, 163, 184);
}

:deep(.custom-input .el-input__clear:hover) {
  color: rgb(248, 113, 113);
}

/* Select 下拉選單深色主題 */
:deep(.el-select-dropdown) {
  background-color: rgb(30, 41, 59);
  border: 1px solid rgba(100, 116, 139, 0.5);
}

:deep(.el-select-dropdown__item) {
  color: rgb(203, 213, 225);
}

:deep(.el-select-dropdown__item:hover) {
  background-color: rgba(100, 116, 139, 0.3);
}

:deep(.el-select-dropdown__item.selected) {
  color: rgb(96, 165, 250);
  background-color: rgba(59, 130, 246, 0.1);
}

/* DatePicker 深色主題 */
:deep(.el-picker-panel) {
  background-color: rgb(30, 41, 59);
  border: 1px solid rgba(100, 116, 139, 0.5);
}

:deep(.el-date-picker__header-label),
:deep(.el-picker-panel__icon-btn) {
  color: rgb(203, 213, 225);
}

:deep(.el-month-table td) {
  color: rgb(148, 163, 184);
}

:deep(.el-month-table td .cell) {
  color: rgb(203, 213, 225);
}

:deep(.el-month-table td .cell:hover) {
  background-color: rgba(100, 116, 139, 0.3);
  color: rgb(255, 255, 255);
}

:deep(.el-month-table td.current .cell) {
  color: rgb(96, 165, 250);
}

:deep(.el-month-table td.today .cell) {
  color: rgb(52, 211, 153);
  font-weight: bold;
}
</style>