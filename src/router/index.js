import { createRouter, createWebHistory } from "vue-router";

// 路由設定
const routes = [
  { path: "/login", component: () => import("../views/Login.vue") },
  { path: "/dashboard", component: () => import("../views/Dashboard.vue"), meta: { requiresAuth: true } },
  { path: "/:pathMatch(.*)*", redirect: "/login" },
];

const base = import.meta.env.MODE === "development" ? "/" : "/transaction-records/";

const router = createRouter({
  history: createWebHistory(base),
  routes,
});

// 路由守衛：檢查 localStorage 中的使用者資料
router.beforeEach((to, from, next) => {
  const requiresAuth = to.meta.requiresAuth;
  const user = localStorage.getItem("user");

  // 如果目標頁面需要認證
  if (requiresAuth) {
    if (!user) {
      // 未登入，導向登入頁
      return next("/login");
    }
    
    // 已登入，放行
    return next();
  }

  // 如果已登入且要去登入頁，導向 dashboard
  if (to.path === "/login" && user) {
    return next("/dashboard");
  }

  // 其他情況正常導航
  next();
});

export default router;