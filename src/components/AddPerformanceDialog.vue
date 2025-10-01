<template>
  <el-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
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
          :min="0"
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
          @click="$emit('update:modelValue', false)"
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
import { reactive, ref } from "vue";
import { db } from "@/firebase";
import { collection, addDoc } from "firebase/firestore";
import { ElMessage } from "element-plus";

// 接收父組件傳來的 v-model
const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(["update:modelValue", "recordAdded"]);

// 交易紀錄表單
const formRef = ref(null);
const form = reactive({
  month: "",
  stockCode: "",
  quantity: null,
  stockPrice: null,
  holdingDays: null,
  profit: null,
});

// 表單規則
const rules = reactive({
  month: [{ required: true, message: "請選擇賣出月份", trigger: "change" }],
  stockCode: [{ required: true, message: "請輸入股票代號", trigger: "blur" }],
  quantity: [{ required: true, message: "請輸入數量" }],
  stockPrice: [{ required: true, message: "請輸入成交單價" }],
  holdingDays: [{ required: true, message: "請輸入持有天數" }],
  profit: [{ required: true, message: "請輸入獲利 (%)" }],
});

// 提交表單
const submitForm = async () => {
  if (!formRef.value) return;
  const valid = await formRef.value.validate();
  if (!valid) return;

  try {
    const docRef = await addDoc(collection(db, "performance"), {
      ...form,
      userId: props.userId,
      createdAt: new Date(),
    });

    ElMessage({
      message: `新增交易紀錄成功！文件 ID: ${docRef.id}`,
      type: "success",
    });

    // 關閉 dialog
    emit("update:modelValue", false);
    // 通知父組件紀錄已新增 (可選，但在父組件已監聽 Firestore 的情況下非必需，但保持良好習慣)
    emit("recordAdded");
    // 重置表單
    resetForm();
  } catch (e) {
    console.error("新增文件時發生錯誤: ", e);
    ElMessage.error("新增交易紀錄失敗。");
  }
};

// 重置表單
const resetForm = () => {
  formRef.value.resetFields();
  form.month = "";
  form.stockCode = "";
  form.quantity = 1;
  form.stockPrice = 0;
  form.holdingDays = 1;
  form.profit = 0;
};
</script>

<style scoped>
:deep .el-input {
  width: 100%;
}
</style>