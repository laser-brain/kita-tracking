import router from "@/plugins/router";
import { defineStore } from "pinia";
import useDatabase from "@/stores/database-store";
import { checkPassword } from "@/database/mongodb.connect";
import { ref, Ref } from "vue";

interface ILocalUser {
  username: string;
  isAdmin: boolean;
  isEducator: boolean;
  isParent: boolean;
}

const store = defineStore("users", () => {
  const dbStore = useDatabase();
  const localUser = JSON.parse(
    localStorage.getItem("tracking-user") ||
      JSON.stringify({
        username: null,
        isAdmin: false,
        isEducator: false,
        isParent: false,
      })
  ) as ILocalUser;

  const loggedIn = ref(localUser.username !== null);
  const isAdmin = ref(localUser.isAdmin);
  const isEducator = ref(localUser.isEducator);
  const isParent = ref(localUser.isParent);
  const username: Ref<string> = ref(localUser.username || "");

  const logIn = async (loginName: string, password: string) => {
    const result = await checkPassword(
      await dbStore.getDbUser(),
      loginName,
      password
    );
    if (result.success) {
      loggedIn.value = true;
      username.value = result.username;
      isAdmin.value = result.isAdmin;
      isParent.value = result.isParent;
      isEducator.value = result.isEducator;

      localStorage.setItem(
        "tracking-user",
        JSON.stringify({ ...result, success: undefined })
      );

      router.push("/tracking");
    }
  };

  const logOut = () => {
    loggedIn.value = false;
    username.value = "";
    localStorage.removeItem("tracking-user");
    localStorage.removeItem("tracking-admin");
    router.push("/");
  };

  return {
    loggedIn,
    logIn,
    logOut,
    username,
    isAdmin,
    isEducator,
    isParent,
  };
});

export default store;
