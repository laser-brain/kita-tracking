import router from "@/plugins/router";
import { defineStore } from "pinia";
import { authenticate, checkPassword, IUser } from "@/database/mongodb.connect";
import { ref, Ref } from "vue";

const wait = (
  checkInterval: number,
  condition: () => boolean
): Promise<void> => {
  const awaiter = new Promise<void>((resolve) => {
    const loadInterval = window.setInterval(() => {
      if (condition()) {
        window.clearInterval(loadInterval);
        resolve();
      }
    }, checkInterval);
  });
  return awaiter;
};

const store = defineStore("users", () => {
  const loading = ref(true);
  const ensureDbConnection = async () => {
    await wait(100, () => !loading.value);
    return;
  };

  const localUser = localStorage.getItem("tracking-user");

  const loggedIn = ref(localUser !== null);
  const employee: Ref<string> = ref(localUser || "");

  const dbUser: Ref<IUser | null> = ref(null);
  const loadDbUser = async () => {
    dbUser.value = await authenticate();
  };

  loadDbUser().then(() => {
    loading.value = false;
  });

  const logIn = async (username: string, password: string) => {
    await ensureDbConnection();
    const result = await checkPassword(dbUser.value, username, password);
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
