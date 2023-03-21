import { defineStore } from "pinia";
import { ref, Ref } from "vue";

export interface ITrackingData {
  running: boolean;
  startTime: Date | null;
  trackedSegments: Date[];
}

const trackingStore = defineStore("tracking", () => {
  const segmentsBackup: Date[] = [];

  const getMidnight = (date?: Date): Date => {
    const result = date ? new Date(date) : new Date();
    result.setMinutes(0);
    result.setHours(0);
    result.setSeconds(0);
    result.setMilliseconds(0);
    return result;
  };

  const loadFromLocal = (): ITrackingData => {
    let props = JSON.parse(
      localStorage.getItem("tracker-data") ??
        '{"running":false,"startTime":null,"trackedSegments":[]}'
    ) as ITrackingData;

    if (!props.startTime) {
      return props;
    }

    const today = getMidnight();
    const checkDate = getMidnight(props.startTime);

    if (checkDate < today) {
      return {
        running: false,
        startTime: null,
        trackedSegments: [],
      };
    }
    return props;
  };

  const props = loadFromLocal();
  const createBackup = () => {
    segmentsBackup.push(...trackedSegments.value);
  };

  const destroyBackup = () => {
    segmentsBackup.splice(0, segmentsBackup.length);
  };

  const removeItem = (index: number) => {
    trackedSegments.value.splice(index, 1);
  };

  const restoreItem = (index: number) => {
    const item = segmentsBackup[index];
    trackedSegments.value.splice(index, 0, item);
  };

  const trackedSegments: Ref<Date[]> = ref(
    props.trackedSegments.map((seg) => new Date(seg)) || []
  );

  return {
    props,
    trackedSegments,
    createBackup,
    destroyBackup,
    removeItem,
    restoreItem,
  };
});

export default trackingStore;
