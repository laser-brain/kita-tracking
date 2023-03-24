import router from "@/plugins/router";
import { defineStore } from "pinia";
import useDatabase from "@/stores/database-store";
import { checkPassword } from "@/database/mongodb.connect";
import { ref, Ref } from "vue";

interface ILocalUser {
  username: string;
  isAdmin: boolean;
}

const store = defineStore("users", () => {
  const dbStore = useDatabase();
  const localUser = JSON.parse(
    localStorage.getItem("tracking-user") ||
      JSON.stringify({ username: null, isAdmin: false })
  ) as ILocalUser;

  const loggedIn = ref(localUser.username !== null);
  const isAdmin = ref(localUser.isAdmin);
  const employee: Ref<string> = ref(localUser.username || "");

  const logIn = async (username: string, password: string) => {
    const result = await checkPassword(
      await dbStore.getDbUser(),
      username,
      password
    );
    if (result.success) {
      loggedIn.value = true;
      employee.value = result.username;
      isAdmin.value = result.isAdmin;

      localStorage.setItem(
        "tracking-user",
        JSON.stringify({ username: result.username, isAdmin: result.isAdmin })
      );

      router.push("/tracking");
    }
  };

  const logOut = () => {
    loggedIn.value = false;
    employee.value = "";
    localStorage.removeItem("tracking-user");
    localStorage.removeItem("tracking-admin");
    router.push("/");
  };

  return {
    loggedIn,
    logIn,
    logOut,
    employee,
    isAdmin,
  };
});

export default store;
