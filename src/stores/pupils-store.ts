import { IPupil } from "@/database/documents";
import { getPupils } from "@/database/mongodb.connect";
import useDatabase from "@/stores/database-store";
import { defineStore } from "pinia";

const store = defineStore("pupils", () => {
  const dbStore = useDatabase();

  const loadPupils = async (username: string): Promise<IPupil[]> => {
    return getPupils(await dbStore.getDbUser(), username);
  };

  return {
    loadPupils,
  };
});

export default store;
