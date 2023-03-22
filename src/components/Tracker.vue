<template>
  <div class="container">
    <h3>Zeiterfassung Mitarbeiter:innen</h3>
    <div class="timer">
      <span>{{ trackedTimeFormatted }}</span>
      <span class="currentSegment">{{ currentSegmentFormatted }}</span>
    </div>
    <div class="controls">
      <ToggleMenu
        :data="store.trackedSegments"
        @finalize="store.destroyDeletedItems"
      />
      <PlayButton :running="runningTracker ? true : false" @click="toggle" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, Ref, ref, onMounted } from "vue";
import PlayButton from "./PlayButton.vue";
import ToggleMenu from "./ToggleMenu.vue";
import useTracking, { ITrackingEntry } from "@/stores/tracker-store";

const store = useTracking();
const employee = "Michael";
const initialized = ref(false);

onMounted(async () => {
  await store.loadTrackingData(employee);

  runningTracker.value = store.trackedSegments
    .filter((entry) => entry.running)
    .at(0);

  initialized.value = true;
});

const runningTracker: Ref<ITrackingEntry | undefined> = ref(undefined);

const trackedTimeFormatted = computed(() => {
  if (!initialized.value || !store.trackedSegments) {
    return "00:00:00";
  }

  let trackedToday = store.trackedSegments
    .map((entry) => entry.duration)
    .reduce((prev, current) => {
      if (!current) {
        return prev;
      }
      return new Date(current.valueOf() + (prev as Date).valueOf());
    }, new Date(0)) as Date;

  return formatDate(trackedToday);
});

const currentSegmentFormatted = computed(() => {
  if (!runningTracker.value?.duration) {
    return "00:00:00";
  }
  return formatDate(runningTracker.value.duration);
});

const formatDate = (date: Date) => {
  return `${formatNumber(
    date.getHours() + date.getTimezoneOffset() / 60
  )}:${formatNumber(date.getMinutes())}:${formatNumber(date.getSeconds())}`;
};

const formatNumber = (input: number) => {
  return input.toLocaleString("de-DE", { minimumIntegerDigits: 2 });
};

const toggle = async () => {
  const now = new Date();
  now.setMilliseconds(0);
  if (runningTracker.value) {
    runningTracker.value.running = false;
    runningTracker.value.duration = new Date(
      now.valueOf() - runningTracker.value.startTime.valueOf()
    );

    await store.saveTrackingData(runningTracker.value);
    runningTracker.value = undefined;
  } else {
    runningTracker.value = {
      running: true,
      startTime: now,
    };
    await store.saveTrackingData(runningTracker.value);
    store.trackedSegments.push(runningTracker.value);
  }
};

window.setInterval(() => {
  if (runningTracker.value?.running) {
    runningTracker.value.duration = new Date(
      new Date().valueOf() - new Date(runningTracker.value.startTime).valueOf()
    );
  }
}, 1000);
</script>

<style scoped lang="scss">
.container {
  justify-content: flex-start;
}

.controls {
  display: flex;
  flex-direction: column;
  align-items: center;

  div {
    margin-top: 4em;
  }
}

.timer {
  display: flex;
  flex-direction: column;
  align-items: center;

  span {
    margin: 1em 0 0 0;
    font-size: 4em;

    &.currentSegment {
      margin: 0 0 0.5em 0;
      font-size: 2em;
    }
  }
}
</style>
