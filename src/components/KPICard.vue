<!-- KPICard.vue -->
<template>
  <div class="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 hover:border-slate-600/50 transition-all">
    <div class="flex items-start justify-between mb-4">
      <div class="p-2 bg-slate-700/50 rounded-lg">
        <span class="text-2xl">{{ icon }}</span>
      </div>
      <span 
        v-if="trend" 
        :class="[
          'text-sm font-medium',
          trend > 0 ? 'text-emerald-400' : 'text-rose-400'
        ]"
      >
        {{ trend > 0 ? '+' : '' }}{{ trend }}%
      </span>
    </div>
    <div class="text-slate-400 text-sm mb-1">{{ label }}</div>
    <div class="text-2xl font-bold text-white mb-1">{{ value }}</div>
    <div v-if="subValue" class="text-slate-500 text-xs">{{ subValue }}</div>
  </div>
</template>

<script setup>
defineProps({
  icon: { type: String, required: true },
  label: { type: String, required: true },
  value: { type: [String, Number], required: true },
  subValue: { type: String, default: '' },
  trend: { type: Number, default: null }
});
</script>