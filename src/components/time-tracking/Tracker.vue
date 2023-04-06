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
import { updateTimeFromString } from "@/business/utility";

const store = useTracking();
const initialized = ref(false);
const timeSpanOffset = new Date(0).getTimezoneOffset() * 60 * 1000;

onMounted(async () => {
  await store.loadTrackingData();

  runningTracker.value = store.trackedSegments
    .filter((entry) => entry.running)
    .at(0);

  initialized.value = true;
});

const runningTracker: Ref<ITrackingEntry | undefined> = ref(undefined);

const trackedTimeFormatted = computed(() => {
  if (!initialized.value || !store.trackedSegments?.length) {
    return "00:00:00";
  }

  const emptyTracker = {
    startTime: new Date(0),
    running: false,
    accumulatedTime: new Date(timeSpanOffset),
  };

  const trackedToday = store.trackedSegments.reduce((prev, current) => {
    if (!current?.duration) {
      return prev;
    }

    const timeSpan = updateTimeFromString(new Date(0), current.duration);
    timeSpan.setHours(timeSpan.getHours() - timeSpanOffset / (60 * 60 * 1000));

    return {
      startTime: current.startTime,
      running: false,
      accumulatedTime: new Date(
        prev.accumulatedTime.valueOf() + timeSpan.valueOf()
      ),
    };
  }, { ...runningTracker.value, accumulatedTime: emptyTracker.accumulatedTime } || emptyTracker);

  return trackedToday.accumulatedTime.toLocaleTimeString();
});

const currentSegmentFormatted = computed(() => {
  if (!runningTracker.value?.duration) {
    return "00:00:00";
  }
  return runningTracker.value.duration;
});

const toggle = async () => {
  const now = new Date();
  now.setMilliseconds(0);

  if (runningTracker.value) {
    runningTracker.value.running = false;
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
    const now = new Date();
    now.setMilliseconds(0);
    runningTracker.value.endTime = now;

    runningTracker.value.duration = new Date(
      now.valueOf() - runningTracker.value.startTime.valueOf() + timeSpanOffset
    ).toLocaleTimeString();
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
