import { defineStore } from "pinia";
import { ref, Ref } from "vue";

export interface ITrackingData {
  running: boolean;
  startTime: Date | null;
  trackedSegments: ITrackingEntry[];
}

export interface ITrackingEntry {
  startTime: Date;
  duration: Date;
  deleted: boolean;
}

const trackingStore = defineStore("tracking", () => {
  const segmentsBackup: ITrackingEntry[] = [];

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

    props.trackedSegments.forEach((item) => {
      item.duration = new Date(item.duration);
      item.startTime = new Date(item.startTime);
    });

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

  const destroyDeletedItems = () => {
    trackedSegments.value = trackedSegments.value.filter((seg) => !seg.deleted);
  };

  const trackedSegments: Ref<ITrackingEntry[]> = ref(
    props.trackedSegments.map((seg) => {
      return {
        startTime: new Date(seg.startTime),
        duration: new Date(seg.duration),
        deleted: false,
      };
    }) || []
  );

  return {
    props,
    trackedSegments,
    destroyDeletedItems,
  };
});

export default trackingStore;
