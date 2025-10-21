<!-- SummaryTable.vue -->
<template>
  <div class="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 overflow-hidden">
    <!-- 標題列 - 可折疊 -->
    <button 
      @click="isExpanded = !isExpanded"
      class="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-700/30 transition-all group"
    >
      <div class="flex items-center gap-3">
        <div class="p-2 bg-slate-700/50 rounded-lg group-hover:bg-slate-600/50 transition-all">
          <span class="text-xl">📊</span>
        </div>
        <div class="text-left">
          <h2 class="text-lg font-semibold text-white">月度績效統計</h2>
          <p class="text-slate-400 text-sm">{{ summaryList.length }} 個月份的詳細數據</p>
        </div>
      </div>
      <div class="flex items-center gap-4">
        <span class="text-slate-400 text-xl transition-transform" :class="{ 'rotate-180': isExpanded }">▼</span>
      </div>
    </button>
    
    <!-- 表格內容 -->
    <transition
      enter-active-class="transition-all duration-300 ease-out"
      leave-active-class="transition-all duration-200 ease-in"
      enter-from-class="opacity-0 max-h-0"
      enter-to-class="opacity-100 max-h-[2000px]"
      leave-from-class="opacity-100 max-h-[2000px]"
      leave-to-class="opacity-0 max-h-0"
    >
      <div v-show="isExpanded" class="overflow-hidden">
        <!-- 篩選與排序 -->
        <div class="px-6 py-3 bg-slate-700/20 border-y border-slate-700/50 flex items-center gap-3">
          <span class="text-slate-400 text-sm">排序：</span>
          <select 
            v-model="sortBy"
            class="bg-slate-700/50 text-slate-300 text-sm rounded-lg px-3 py-1.5 border border-slate-600/50 outline-none focus:border-blue-500/50"
          >
            <option value="month">月份</option>
            <option value="winRate">勝率</option>
            <option value="expectedValue">期望值</option>
            <option value="totalTrades">交易數</option>
          </select>
          <button
            @click="sortOrder = sortOrder === 'desc' ? 'asc' : 'desc'"
            class="text-slate-400 hover:text-slate-300 transition-colors"
          >
            {{ sortOrder === 'desc' ? '↓' : '↑' }}
          </button>
        </div>

        <!-- 桌面版表格 -->
        <div class="hidden lg:block overflow-x-auto">
          <table class="w-full">
            <thead class="bg-slate-700/30 sticky top-0">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">月份</th>
                <th class="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">
                  <div class="flex items-center justify-end gap-1">
                    <span>平均獲利</span>
                    <span class="text-emerald-400">↑</span>
                  </div>
                </th>
                <th class="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">
                  <div class="flex items-center justify-end gap-1">
                    <span>平均虧損</span>
                    <span class="text-rose-400">↓</span>
                  </div>
                </th>
                <th class="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">勝率</th>
                <th class="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">期望值 EV</th>
                <th class="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">交易數</th>
                <th class="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">最大獲利</th>
                <th class="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">最大虧損</th>
                <th class="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">成功持有</th>
                <th class="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">失敗持有</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-700/50">
              <tr 
                v-for="(row, i) in sortedList" 
                :key="i" 
                class="hover:bg-slate-700/20 transition-colors group"
              >
                <td class="px-4 py-3 text-sm font-medium text-white">
                  <div class="flex items-center gap-2">
                    <span class="text-slate-500 text-xs">📅</span>
                    {{ row.month }}
                  </div>
                </td>
                <td class="px-4 py-3 text-sm text-right">
                  <span class="font-semibold text-emerald-400">
                    {{ formatNumber(row.avgProfit, true) }}%
                  </span>
                </td>
                <td class="px-4 py-3 text-sm text-right">
                  <span class="font-semibold text-rose-400">
                    {{ formatNumber(row.avgLoss, false) }}%
                  </span>
                </td>
                <td class="px-4 py-3 text-sm text-right">
                  <div class="flex items-center justify-end gap-2">
                    <div class="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        class="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all"
                        :style="{ width: `${row.winRate}%` }"
                      ></div>
                    </div>
                    <span class="font-medium text-slate-300 w-10">{{ row.winRate }}%</span>
                  </div>
                </td>
                <td class="px-4 py-3 text-sm text-right">
                  <span 
                    class="font-semibold"
                    :class="row.expectedValue >= 0 ? 'text-blue-400' : 'text-rose-400'"
                  >
                    {{ formatNumber(row.expectedValue, true) }}%
                  </span>
                </td>
                <td class="px-4 py-3 text-sm text-right text-slate-300">
                  <span class="px-2 py-1 bg-slate-700/50 rounded text-xs font-medium">
                    {{ row.totalTrades }}
                  </span>
                </td>
                <td class="px-4 py-3 text-sm text-right">
                  <span class="text-emerald-400 font-medium">
                    +{{ row.maxProfit }}%
                  </span>
                </td>
                <td class="px-4 py-3 text-sm text-right">
                  <span class="text-rose-400 font-medium">
                    {{ row.maxLoss }}%
                  </span>
                </td>
                <td class="px-4 py-3 text-sm text-right text-slate-400">
                  {{ row.avgHoldWin }} 天
                </td>
                <td class="px-4 py-3 text-sm text-right text-slate-400">
                  {{ row.avgHoldLoss }} 天
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 手機版卡片 -->
        <div class="lg:hidden p-4 space-y-3">
          <div 
            v-for="(row, i) in sortedList" 
            :key="i"
            class="bg-slate-700/30 rounded-lg p-4 border border-slate-600/30"
          >
            <div class="flex items-center justify-between mb-3">
              <span class="text-white font-semibold">{{ row.month }}</span>
              <span class="px-2 py-1 bg-slate-600/50 rounded text-xs text-slate-300">
                {{ row.totalTrades }} 筆
              </span>
            </div>
            
            <div class="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span class="text-slate-400">勝率</span>
                <div class="text-slate-200 font-medium">{{ row.winRate }}%</div>
              </div>
              <div>
                <span class="text-slate-400">期望值</span>
                <div class="font-medium" :class="row.expectedValue >= 0 ? 'text-blue-400' : 'text-rose-400'">
                  {{ formatNumber(row.expectedValue, true) }}%
                </div>
              </div>
              <div>
                <span class="text-slate-400">平均獲利</span>
                <div class="text-emerald-400 font-medium">{{ formatNumber(row.avgProfit, true) }}%</div>
              </div>
              <div>
                <span class="text-slate-400">平均虧損</span>
                <div class="text-rose-400 font-medium">{{ formatNumber(row.avgLoss, false) }}%</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  summaryList: {
    type: Array,
    default: () => []
  }
});

const isExpanded = ref(false);
const sortBy = ref('month');
const sortOrder = ref('desc');

// 排序後的列表
const sortedList = computed(() => {
  const list = [...props.summaryList];
  
  list.sort((a, b) => {
    let aVal = a[sortBy.value];
    let bVal = b[sortBy.value];
    
    // 處理字串比較（如月份）
    if (typeof aVal === 'string') {
      return sortOrder.value === 'desc' 
        ? bVal.localeCompare(aVal) 
        : aVal.localeCompare(bVal);
    }
    
    // 處理數字比較
    return sortOrder.value === 'desc' ? bVal - aVal : aVal - bVal;
  });
  
  return list;
});

// 格式化數字
const formatNumber = (num, showPlus = false) => {
  if (num == null) return '-';
  const formatted = Number(num).toFixed(1);
  if (showPlus && num > 0) return `+${formatted}`;
  return formatted;
};
</script>

<style scoped>
/* 確保過渡動畫流暢 */
.max-h-0 {
  max-height: 0;
}

.max-h-\[2000px\] {
  max-height: 2000px;
}
</style>