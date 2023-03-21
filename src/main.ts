import { createApp } from "vue";
import App from "./App.vue";
import router from "@/plugins/router";
import vuetify from "@/plugins/vuetify";
import pinia from "@/plugins/pinia";

createApp(App).use(pinia).use(vuetify).use(router).mount("#app");
