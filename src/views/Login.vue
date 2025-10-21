<!-- Login.vue -->
<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-50">
    <div class="bg-white rounded-3xl shadow-lg w-96 p-8 flex flex-col items-center">
      <h1 class="text-2xl font-semibold text-gray-800 mb-6">
        {{ activeTab === 'login' ? '登入' : '註冊' }}
      </h1>

      <!-- Tabs -->
      <div class="flex justify-between w-full mb-6 text-sm font-medium text-gray-600">
        <button
          class="flex-1 py-2 border-b-2"
          :class="activeTab === 'login' ? 'border-blue-500 text-blue-500' : 'border-transparent'"
          @click="activeTab = 'login'"
        >
          登入
        </button>
        <button
          class="flex-1 py-2 border-b-2"
          :class="activeTab === 'register' ? 'border-blue-500 text-blue-500' : 'border-transparent'"
          @click="activeTab = 'register'"
        >
          註冊
        </button>
      </div>

      <!-- 登入表單 -->
      <form v-if="activeTab === 'login'" @submit.prevent="login" class="w-full flex flex-col gap-4 mb-4">
        <input v-model="loginAccount" type="text" placeholder="輸入帳號"
          class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 focus:outline-none"
          required />
        <input v-model="loginPassword" type="password" placeholder="輸入密碼"
          class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 focus:outline-none"
          required />
        <button type="submit"
          class="w-full py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors duration-200">
          登入
        </button>
      </form>

      <!-- 註冊表單 -->
      <form v-if="activeTab === 'register'" @submit.prevent="register" class="w-full flex flex-col gap-4 mb-4">
        <input v-model="registerAccount" type="text" placeholder="設定帳號"
          class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-400 focus:outline-none"
          required />
        <input v-model="registerUsername" type="text" placeholder="使用者名稱 (最多20字)"
          maxlength="20"
          class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-400 focus:outline-none"
          required />
        <input v-model="registerPassword" type="password" placeholder="設定密碼"
          class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-400 focus:outline-none"
          required />
        <button type="submit"
          class="w-full py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors duration-200">
          註冊
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue"
import { collection, query, where, getDocs, addDoc } from "firebase/firestore"
import { db } from "@/firebase.js"
import bcrypt from "bcryptjs"
import { useRouter } from "vue-router"
import { useAlert } from "@/modules/alert.js"  // 引入封裝的 alert

const router = useRouter()

// 狀態：tab 切換
const activeTab = ref("login")

// 註冊欄位
const registerAccount = ref("")
const registerUsername = ref("")
const registerPassword = ref("")

// 登入欄位
const loginAccount = ref("")
const loginPassword = ref("")

// 註冊
const register = async () => {
  if (!registerAccount.value || !registerUsername.value || !registerPassword.value) {
    useAlert.warning("請填寫完整資料")
    return
  }
  if (registerPassword.value.length < 6) {
    useAlert.warning("密碼至少需要 6 碼")
    return
  }

  try {
    useAlert.loading("處理中...", "正在註冊帳號")

    const q = query(collection(db, "users"), where("account", "==", registerAccount.value))
    const querySnapshot = await getDocs(q)
    if (!querySnapshot.empty) {
      useAlert.warning("帳號已存在", "請使用其他帳號註冊")
      return
    }

    const hashedPassword = await bcrypt.hash(registerPassword.value, 10)

    await addDoc(collection(db, "users"), {
      account: registerAccount.value,
      username: registerUsername.value,
      passwordHash: hashedPassword,
      createdAt: new Date().toISOString()
    })

    useAlert.success("註冊成功", "請登入以繼續")
    activeTab.value = "login"
  } catch (err) {
    useAlert.error("註冊失敗", err.message)
  }
}

// 登入
const login = async () => {
  if (!loginAccount.value || !loginPassword.value) {
    useAlert.warning("請輸入帳號與密碼")
    return
  }

  try {
    const q = query(collection(db, "users"), where("account", "==", loginAccount.value))
    const querySnapshot = await getDocs(q)
    if (querySnapshot.empty) {
      useAlert.warning("帳號不存在", "請先註冊帳號")
      return
    }

    const userDoc = querySnapshot.docs[0]
    const userData = userDoc.data()

    const isMatch = await bcrypt.compare(loginPassword.value, userData.passwordHash)
    if (!isMatch) {
      useAlert.error("密碼錯誤", "請重新輸入")
      return
    }

    // 登入成功 → 存 localStorage
    const user = {
      id: userDoc.id,
      account: userData.account,
      username: userData.username
    }
    localStorage.setItem("user", JSON.stringify(user))
    router.push("/dashboard")
  } catch (err) {
    useAlert.error("登入失敗", err.message)
  }
}
</script>
