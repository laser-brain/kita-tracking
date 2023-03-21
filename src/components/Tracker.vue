<template>
  <div class="container">
    <h3>Zeiterfassung Mitarbeiter:innen</h3>
    <div class="timer">
      <span>{{ trackedTimeFormatted }}</span>
    </div>
    <ToggleMenu
      :data="store.trackedSegments"
      @finalize="store.destroyDeletedItems"
    />
    <PlayButton :running="runningTracker ? true : false" @click="toggle" />
  </div>
</template>

<script setup lang="ts">
import { computed, Ref, ref, onMounted } from "vue";
import PlayButton from "./PlayButton.vue";
import ToggleMenu from "./ToggleMenu.vue";
import useTracking, { ITrackingEntry } from "@/stores/tracker-store";

const store = useTracking();
const employee = "Michael";

onMounted(async () => {
  await store.loadTrackingData(employee);

  runningTracker.value = store.trackedSegments
    .filter((entry) => !entry.duration)
    .at(0);
});

const runningTracker: Ref<ITrackingEntry | undefined> = ref(undefined);

const trackedTimeFormatted = computed(() => {
  if (!store.trackedSegments) {
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

  return `${formatNumber(
    trackedToday.getHours() + trackedToday.getTimezoneOffset() / 60
  )}:${formatNumber(trackedToday.getMinutes())}:${formatNumber(
    trackedToday.getSeconds()
  )}`;
});

const formatNumber = (input: number) => {
  return input.toLocaleString("de-DE", { minimumIntegerDigits: 2 });
};

const toggle = () => {
  if (runningTracker.value) {
    const arrayReference = store.trackedSegments
      .filter((seg) => !seg.duration)
      .at(0);
    if (!arrayReference) {
      return;
    }
    arrayReference.duration = new Date(
      new Date().valueOf() - runningTracker.value.startTime.valueOf()
    );

    runningTracker.value = undefined;
  } else {
    runningTracker.value = {
      startTime: new Date(),
    };
    store.trackedSegments.push(runningTracker.value);
  }
};

window.setInterval(() => {
  if (runningTracker.value) {
    runningTracker.value.duration = new Date(
      new Date().valueOf() - new Date(runningTracker.value.startTime).valueOf()
    );
  }
}, 1000);
</script>

<style scoped lang="scss">
.container {
  justify-content: space-around;
}
.timer {
  display: flex;
  margin-bottom: -128px;
  flex-direction: column;
  align-items: center;

  span {
    margin: 32px 0;
    font-size: 4em;
  }
}

.btn {
  position: relative;
  width: 80px;
  height: 80px;
  border: black 8px solid;
  border-radius: 8px;
  cursor: pointer;
  transition: border 0.1s ease-in-out;

  &:hover {
    border: green 8px solid;
    .bar {
      background-color: green;
    }
  }

  .bar {
    display: inline-block;
    position: absolute;
    top: 10px;
    left: 0;
    width: 8px;
    height: 50px;
    border-radius: 3px;
    background-color: black;
    transform-origin: center;
    transition: transform 0.4s ease-in-out, background 0.1s ease-in-out;
  }

  &.pause {
    border-color: red;
    .bar {
      background-color: red;
    }
    .bar-1 {
      transform: translateX(16px) translateY(0px) rotate(0deg);
    }
    .bar-2 {
      transform: translateX(40px) translateY(0px) rotate(0deg);
    }
  }

  &.play {
    .bar-1 {
      transform: translateX(30px) translateY(-14px) rotate(-55deg);
    }
    .bar-2 {
      transform: translateX(30px) translateY(11px) rotate(-125deg);
    }
  }
}
</style>
