import { defineStore } from "pinia";
import { ref, Ref } from "vue";
import {
  authenticate,
  getEmployees,
  getTrackingData,
  IUser,
} from "@/database/mongodb.connect";
import { IEmployee } from "@/database/documents";

export interface ITrackingEntry {
  startTime: Date;
  duration?: Date;
  deleted?: boolean;
}

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

const trackingStore = defineStore("tracking", () => {
  const getMidnight = (date?: Date): Date => {
    const result = date ? new Date(date) : new Date();
    result.setMinutes(0);
    result.setHours(0);
    result.setSeconds(0);
    result.setMilliseconds(0);
    return result;
  };

  const dbUser: Ref<IUser | null> = ref(null);
  const loadDbUser = async () => {
    dbUser.value = await authenticate();
  };

  const loading = ref(true);
  loadDbUser().then(() => {
    loading.value = false;
  });

  const employees = async (): Promise<IEmployee[]> => {
    await wait(200, () => !loading.value);
    const data = await getEmployees(dbUser.value);
    return data;
  };

  const loadTrackingData = async (employee: string) => {
    await wait(200, () => !loading.value);
    const data = await getTrackingData(dbUser.value, employee, getMidnight());
    trackedSegments.value = data;
  };

  const destroyDeletedItems = () => {
    trackedSegments.value = trackedSegments.value.filter((seg) => !seg.deleted);
  };

  const trackedSegments: Ref<ITrackingEntry[]> = ref([]);

  return {
    employees,
    loadTrackingData,
    trackedSegments,
    destroyDeletedItems,
  };
});

export default trackingStore;
