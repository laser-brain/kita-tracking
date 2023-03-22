import router from "@/plugins/router";
import { defineStore } from "pinia";
import { ref, Ref } from "vue";

const store = defineStore("users", () => {
  const loggedIn = ref(false);
  const employee: Ref<string> = ref("");

  const logIn = async (username: string, password: string) => {
    loggedIn.value = true;
    employee.value = "Markus";
    router.push("/tracking");
  };

  const logOut = () => {
    loggedIn.value = false;
    employee.value = "";
    router.push("/");
  };

  return {
    loggedIn,
    logIn,
    logOut,
    employee,
  };
});

export default store;
