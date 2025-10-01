<template>
  <div ref="chartRef" style="width: 100%; height: 400px;"></div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue' // <-- 引入 watch
import * as echarts from 'echarts'

// 接收父組件傳來的實際數據
const props = defineProps({
  chartData: {
    type: Array,
    default: () => [] // 預設為空陣列
  }
})

// 綁定 DOM
const chartRef = ref(null)
let myChart = null

// ECharts option 函數，接受數據
const getOption = (data) => ({
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'cross',
      crossStyle: { color: '#999' }
    }
  },
  toolbox: {
    feature: {
      dataView: { show: true, readOnly: false },
      magicType: { show: true, type: ['line', 'bar'] },
      restore: { show: true },
      saveAsImage: { show: true }
    }
  },
  legend: {
    data: ['交易次數']
  },
  xAxis: [
    {
      type: 'category',
      data: ['-40~-35','-35~-30','-30~-25','-25~-20','-20~-15','-15~-10', '-10~-5', '-5~0', '0~5', '5~10', '10~15', '15~20', '20~25' , '25~30', '30~35', '35~40', '40~45', '45~50', '50~55', '55up'],
      axisPointer: { type: 'shadow' }
    }
  ],
  yAxis: [
    {
      type: 'value',
      name: '交易次數',
      min: 0,
      minInterval: 1, 
      // max: 50, // 建議讓 ECharts 自動計算 max
      // interval: 10,
      axisLabel: { formatter: '{value} 次' }
    }
  ],
  series: [
    {
      name: '交易次數',
      type: 'bar',
      tooltip: { valueFormatter: v => v + ' 次' },
      data: data // <-- 使用傳入的實際數據
    }
  ]
});

onMounted(() => {
  if (chartRef.value) {
    myChart = echarts.init(chartRef.value)
    // 初始載入時使用 prop 數據
    myChart.setOption(getOption(props.chartData)) 

    // 監聽視窗縮放
    window.addEventListener('resize', resizeChart)
  }
})

// 監聽數據變化，並更新圖表
watch(() => props.chartData, (newData) => {
  if (myChart && newData) {
    myChart.setOption(getOption(newData), {
      notMerge: false // 允許合併，但因這裡每次都傳入完整的 option，也可以不用特別設置
    });
  }
}, { deep: true });


onBeforeUnmount(() => {
  if (myChart) {
    myChart.dispose()
  }
  window.removeEventListener('resize', resizeChart)
})

function resizeChart() {
  if (myChart) {
    myChart.resize()
  }
}
</script>