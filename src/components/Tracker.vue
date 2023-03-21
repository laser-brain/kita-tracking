<template>
  <div class="container">
    <h3>Zeiterfassung</h3>
    <div class="timer">
      <span>{{ trackedTimeFormatted || "00:00:00" }}</span>
    </div>
    <ToggleMenu
      :data="store.trackedSegments"
      @init="store.createBackup"
      @finalize="store.destroyBackup"
      @delete="store.removeItem"
      @restore="store.restoreItem"
    />
    <PlayButton :running="running" @click="toggle" />
  </div>
</template>

<script setup lang="ts">
import { computed, Ref, ref } from "vue";
import PlayButton from "./PlayButton.vue";
import ToggleMenu from "./ToggleMenu.vue";
import useTracking, { ITrackingData } from "@/stores/tracker-store";

const store = useTracking();
const trackedTime: Ref<Date | null> = ref(null);
const startTime: Ref<Date | null> = ref(store.props.startTime);

const running = ref(store.props.running);
const trackedTimeFormatted = computed(() => {
  let trackedToday = store.trackedSegments.reduce((prev, current) => {
    if (!current) {
      return prev;
    }
    return new Date(current.valueOf() + prev.valueOf());
  }, new Date(0));

  if (trackedTime.value) {
    trackedToday = new Date(
      trackedToday.valueOf() + trackedTime.value.valueOf()
    );
  }
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
  running.value = !running.value;
  if (running.value) {
    startTime.value = new Date();
  } else if (trackedTime.value) {
    store.trackedSegments.push(trackedTime.value);
    trackedTime.value = null;
  }
};

window.setInterval(() => {
  if (running.value && startTime.value) {
    trackedTime.value = new Date(
      new Date().valueOf() - new Date(startTime.value).valueOf()
    );
  }

  const props: ITrackingData = {
    running: running.value,
    startTime: startTime.value,
    trackedSegments: store.trackedSegments,
  };
  localStorage.setItem("tracker-data", JSON.stringify(props));
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
