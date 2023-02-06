<template>
  <div class="container">
    <h3>Zeiterfassung</h3>
    <div class="timer">
      <span>{{ trackedTimeFormatted || "00:00:00" }}</span>
    </div>
    <PlayButton :running="running" @click="toggle" />
  </div>
</template>

<script setup lang="ts">
import { computed, Ref, ref } from "vue";
import PlayButton from "./PlayButton.vue";
import ToggleMenu from "./ToggleMenu.vue";

interface ITrackingData {
  running: boolean;
  startTime: Date | null;
  trackedSegments: Date[];
}

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

  console.log(props);

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

const running = ref(props.running);
const startTime: Ref<Date | null> = ref(props.startTime);
const trackedSegments: Date[] =
  props.trackedSegments.map((seg) => new Date(seg)) || [];
const trackedTime: Ref<Date | null> = ref(null);
const trackedTimeFormatted = computed(() => {
  let trackedToday = trackedSegments.reduce((prev, current) => {
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
    trackedSegments.push(trackedTime.value);
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
    trackedSegments,
  };
  localStorage.setItem("tracker-data", JSON.stringify(props));
}, 1000);
</script>

<style scoped lang="scss">
.container {
  justify-content: center;
}
.timer {
  display: flex;
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
