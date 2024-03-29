import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import useUsers from "@/stores/user-store";
import Tracker from "@/components/time-tracking/Tracker.vue";
import CheckIn from "@/components/check-ins/CheckIn.vue";
import LoginView from "@/components/LoginView.vue";
import TrackerOverview from "@/components/time-tracking/TrackerOverview.vue";
import TimesConfiguration from "@/components/check-ins/TimesConfiguration.vue";
import UpdatePassword from "@/components/UpdatePassword.vue";
import Overvue from "@/components/check-ins/TimesOverview.vue";
import CheckInHistory from "@/components/check-ins/CheckInHistory.vue";
import CheckInWeekOverview from "@/components/check-ins/CheckInWeekOverview.vue";
import Settings from "@/components/Settings.vue";

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
  {
    path: "/check-ins/configuration",
    component: TimesConfiguration,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "/check-ins/overview",
    component: Overvue,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "/check-ins/history",
    component: CheckInHistory,
    meta: {
      requiresAuth: true,
      requiresAdmin: true,
    },
  },
  {
    path: "/check-ins/burn-down",
    component: CheckInWeekOverview,
    meta: {
      requiresAuth: true,
      requiresAdmin: true,
    },
  },
  {
    path: "/tracking/overview",
    component: TrackerOverview,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "/set-password",
    component: UpdatePassword,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "/settings",
    component: Settings,
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
      if (
        to.matched.some((record) => record.meta.requiresAdmin) &&
        !store.isAdmin
      ) {
        next(from);
      }
      next();
    }
  } else {
    next();
  }
});

export default router;
