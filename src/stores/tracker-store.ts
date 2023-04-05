import useDatabase from "@/stores/database-store";
import useUsers from "@/stores/user-store";
import { removeTrackingData } from "./../database/mongodb.connect";
import { defineStore } from "pinia";
import { ref, Ref } from "vue";
import { IEmployee, ObjectId } from "@/database/documents";
import { getMidnight } from "@/business/utility";
import {
  getEmployees,
  getTrackingData,
  addTrackingData,
} from "@/database/mongodb.connect";

export interface ITrackingEntry {
  _id?: ObjectId;
  startTime: Date;
  endTime?: Date;
  running: boolean;
  duration?: string;
  deleted?: boolean;
}

const trackingStore = defineStore("tracking", () => {
  const userStore = useUsers();
  const dbStore = useDatabase();
  const employees = async (): Promise<IEmployee[]> => {
    const data = await getEmployees(await dbStore.getDbUser());
    return data;
  };

  const loadTrackingOverview = async (dateFrom?: Date, dateTo?: Date) => {
    const data = await getTrackingData(
      await dbStore.getDbUser(),
      "",
      dateFrom,
      dateTo
    );
    return data;
  };

  const loadTrackingData = async () => {
    const data = await getTrackingData(
      await dbStore.getDbUser(),
      userStore.username,
      getMidnight()
    );
    trackedSegments.value = data;
  };

  const saveTrackingData = async (entry: ITrackingEntry) => {
    const id = await addTrackingData(await dbStore.getDbUser(), {
      employee: userStore.username,
      ...entry,
    });
    if (id) {
      entry._id = id;
    }
  };

  const destroyDeletedItems = async () => {
    const promises: Promise<void>[] = [];
    const dbUser = await dbStore.getDbUser();
    trackedSegments.value.forEach((seg) => {
      if (seg.deleted) {
        promises.push(removeTrackingData(dbUser, seg._id));
      }
    });
    await Promise.all(promises);
    trackedSegments.value = trackedSegments.value.filter((seg) => !seg.deleted);
  };

  const trackedSegments: Ref<ITrackingEntry[]> = ref([]);

  return {
    employees,
    loadTrackingData,
    saveTrackingData,
    trackedSegments,
    destroyDeletedItems,
    loadTrackingOverview,
  };
});

export default trackingStore;
