<template>
  <div class="bg-gray-300 rounded-lg p-6 flex-1">
    <!-- 新增交易紀錄按鈕 -->
    <div class="flex justify-end mb-4">
      <el-button type="primary" @click="addPerformance = true">新增交易紀錄</el-button>
    </div>

    <!-- 單筆交易表格 -->
    <el-table :data="performanceList" border stripe style="width: 100%" max-height="500">
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
            @click.prevent="deletePerformance(scope.$index)"
          >
            刪除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 新增紀錄 Dialog -->
    <AddPerformanceDialog 
      v-model="addPerformance" 
      :user-id="props.userId" 
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from "vue"
import { db } from "@/firebase"
import { collection, onSnapshot, addDoc, doc, deleteDoc } from "firebase/firestore"
import { useAlert } from "@/modules/alert.js"
import AddPerformanceDialog from "@/components/AddPerformanceDialog.vue"

const props = defineProps({
  userId: { type: String, required: true }
})

const performanceList = ref([])
let unsub

// Firestore 監聽
onMounted(() => {
  const perfQuery = collection(db, "performance")
  unsub = onSnapshot(perfQuery, snapshot => {
    performanceList.value = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(p => p.userId === props.userId)
  })
})

onUnmounted(() => unsub && unsub())

// ============== 新增交易紀錄 ==============
const addPerformance = ref(false)
const formRef = ref()
const form = reactive({
  month: "",
  stockCode: "",
  quantity: null,
  stockPrice: null,
  holdingDays: null,
  profit: null,
})

const rules = reactive({
  month: [{ type: "date", required: true, message: "請選擇交易日期", trigger: "change" }],
  stockCode: [{ required: true, message: "請輸入股票代號", trigger: "blur" }],
  quantity: [{ type: "number", required: true, message: "請輸入交易數量", trigger: "blur" }],
  stockPrice: [{ type: "number", required: true, message: "請輸入成交單價", trigger: "blur" }],
  holdingDays: [{ type: "number", required: true, message: "請輸入持有天數", trigger: "blur" }],
  profit: [{ type: "number", required: true, message: "請輸入獲利 (%)", trigger: "blur" }],
})

const submitForm = async () => {
  const valid = await formRef.value.validate((isValid) => isValid)
  if (!valid) return

  try {
    await addDoc(collection(db, "performance"), { ...form, userId: props.userId })
    useAlert.success("新增成功", "交易紀錄已新增")
    formRef.value.resetFields()
    addPerformance.value = false
  } catch (err) {
    console.error("新增失敗", err)
    useAlert.error("寫入失敗", err.message)
  }
}

// ============== 刪除交易紀錄 ==============
const deletePerformance = async (index) => {
  const perfToDelete = performanceList.value[index]
  if (!perfToDelete) return

  const confirmed = await useAlert.confirmDelete(perfToDelete.stockCode)
  if (!confirmed) return

  try {
    useAlert.loading("刪除中", "正在連線資料庫...")
    const docRef = doc(db, "performance", perfToDelete.id)
    await deleteDoc(docRef)
    useAlert.close()
    useAlert.success("刪除成功", "交易紀錄已刪除")
  } catch (err) {
    console.error("刪除失敗", err)
    useAlert.close()
    useAlert.error("刪除失敗", err.message || "未知錯誤")
  }
}
</script>
