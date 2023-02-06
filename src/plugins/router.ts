import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";

import Tracker from "@/components/Tracker.vue";
import CheckIn from "@/components/CheckIn.vue";

const routes: RouteRecordRaw[] = [
  { path: "/", component: Tracker },
  { path: "/check-ins", component: CheckIn },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
