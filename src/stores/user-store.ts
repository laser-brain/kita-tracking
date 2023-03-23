import router from "@/plugins/router";
import { defineStore } from "pinia";
import useDatabase from "@/stores/database-store";
import { checkPassword } from "@/database/mongodb.connect";
import { ref, Ref } from "vue";

const store = defineStore("users", () => {
  const dbStore = useDatabase();
  const localUser = localStorage.getItem("tracking-user");

  const loggedIn = ref(localUser !== null);
  const employee: Ref<string> = ref(localUser || "");

  const logIn = async (username: string, password: string) => {
    const result = await checkPassword(
      await dbStore.getDbUser(),
      username,
      password
    );
    if (result.success) {
      loggedIn.value = true;
      employee.value = username;

      localStorage.setItem("tracking-user", username);

      router.push("/tracking");
    }
  };

  const logOut = () => {
    loggedIn.value = false;
    employee.value = "";
    localStorage.removeItem("tracking-user");
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
