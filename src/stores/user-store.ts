import router from "@/plugins/router";
import { defineStore } from "pinia";
import useDatabase from "@/stores/database-store";
import {
  checkPassword,
  updatePassword as pwUpdate,
} from "@/database/mongodb.connect";
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
  const username = ref(localUser.username || "");

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

      navigateStartPage(result.requirePasswordSetup);
    }
  };

  const updatePassword = async (password: string) => {
    return pwUpdate(await dbStore.getDbUser(), username.value, password);
  };

  const navigateStartPage = (forcePasswordReset: boolean = false) => {
    if (forcePasswordReset) {
      router.push("/set-password");
    } else if (isEducator.value) {
      router.push("/tracking");
    } else if (isAdmin.value) {
      router.push("/tracking/overview");
    } else if (isParent.value) {
      router.push("/check-ins/configuration");
    } else {
      alert(
        "Nutzer ist falsch konfiguiert. Bitte melden Sie sich bei einem Administrator (admin@kita-matschzwerge.de)"
      );
    }
  };

  const logOut = () => {
    loggedIn.value = false;
    isAdmin.value = false;
    isEducator.value = false;
    isParent.value = false;
    username.value = "";
    localStorage.removeItem("tracking-user");
    router.push("/");
  };

  return {
    loggedIn,
    logIn,
    logOut,
    updatePassword,
    navigateStartPage,
    username,
    isAdmin,
    isEducator,
    isParent,
  };
});

export default store;
