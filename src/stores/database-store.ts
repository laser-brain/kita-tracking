import { wait } from "@/business/utility";
import { authenticate, IUser } from "@/database/mongodb.connect";
import { defineStore } from "pinia";
import { Ref, ref } from "vue";

const store = defineStore("database", () => {
  const loading = ref(true);
  const dbUser: Ref<IUser | null> = ref(null);
  const loadDbUser = async () => {
    dbUser.value = await authenticate();
  };

  loadDbUser().then(() => {
    loading.value = false;
  });

  const ensureDbConnection = async () => {
    await wait(100, () => !loading.value);
    return;
  };

  const getDbUser = async () => {
    await ensureDbConnection();
    return dbUser.value;
  };

  return {
    getDbUser,
  };
});

export default store;
