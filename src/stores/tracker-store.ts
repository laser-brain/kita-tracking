import { removeTrackingData } from "./../database/mongodb.connect";
import { defineStore } from "pinia";
import { ref, Ref } from "vue";
import {
  authenticate,
  getEmployees,
  getTrackingData,
  addTrackingData,
  IUser,
} from "@/database/mongodb.connect";
import { IEmployee, ObjectId } from "@/database/documents";

export interface ITrackingEntry {
  _id?: ObjectId;
  startTime: Date;
  running: boolean;
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

const getMidnight = (date?: Date): Date => {
  const result = date ? new Date(date) : new Date();
  result.setMinutes(0);
  result.setHours(0);
  result.setSeconds(0);
  result.setMilliseconds(0);
  return result;
};

const trackingStore = defineStore("tracking", () => {
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

  const saveTrackingData = async (entry: ITrackingEntry) => {
    await wait(200, () => !loading.value);
    const id = await addTrackingData(dbUser.value, {
      employee: "Michael",
      ...entry,
    });
    if (id) {
      entry._id = id;
    }
  };

  const destroyDeletedItems = async () => {
    const promises: Promise<void>[] = [];
    trackedSegments.value.forEach((seg) => {
      if (seg.deleted) {
        promises.push(removeTrackingData(dbUser.value, seg._id));
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
  };
});

export default trackingStore;
