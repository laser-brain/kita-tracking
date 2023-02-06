import { createApp } from "vue";
import App from "./App.vue";
import router from "@/plugins/router";
import vuetify from "@/plugins/vuetify";

createApp(App).use(vuetify).use(router).mount("#app");
