<template>
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
</template>

<script setup>
defineProps({
  summaryList: {
    type: Array,
    default: () => []
  }
})
</script>
