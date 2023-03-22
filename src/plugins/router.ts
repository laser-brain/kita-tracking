import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import useUsers from "@/stores/user-store";
import Tracker from "@/components/Tracker.vue";
import CheckIn from "@/components/CheckIn.vue";
import LoginView from "@/components/LoginView.vue";

const routes: RouteRecordRaw[] = [
  {
    name: "login",
    path: "/",
    component: LoginView,
    meta: {
      requiresAuth: false,
    },
  },
  {
    path: "/tracking",
    component: Tracker,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "/check-ins",
    component: CheckIn,
    meta: {
      requiresAuth: true,
    },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const store = useUsers();
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    if (!store.loggedIn) {
      next({ name: "login" });
    } else {
      next();
    }
  } else {
    next();
  }
});

export default router;
