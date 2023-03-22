<template>
  <div class="inputs">
    <v-text-field
      class="time"
      label="Von"
      v-model="startTimeString"
      hide-details
      @focus="$event.target.select()"
    />
    <span> &nbsp;-&nbsp; </span>
    <v-text-field
      class="time"
      label="Bis"
      v-model="endTimeString"
      hide-details
      @focus="$event.target.select()"
    />
  </div>
  <div class="buttons">
    <v-btn @click="save" prepend-icon="mdi-floppy" color="teal-darken-4"
      >Speichern</v-btn
    >
    <v-btn
      v-if="!deleted"
      @click="removeEntry"
      prepend-icon="mdi-delete-forever"
      color="error"
      >Löschen</v-btn
    >
    <v-btn
      v-else
      @click="reset"
      prepend-icon="mdi-undo-variant"
      color="teal-darken-4"
      >Rückgängig</v-btn
    >
  </div>
</template>
<script setup lang="ts">
import { ref } from "vue";
import { formatTimeSpan } from "@/business/time-formatting";
import useTracking from "@/stores/tracker-store";
const props = defineProps<{ startTime: Date; duration: Date; index: number }>();
const startTimeString = ref(formatTimeSpan(props.startTime));
const endTimeString = ref(formatTimeSpan(props.startTime, props.duration));

const store = useTracking();
const deleted = ref(false);

const save = async () => {
  const item = store.trackedSegments.at(props.index);
  if (item) {
    const updatedStart = updateDate(props.startTime, startTimeString.value);
    const updatedEnd = updateDate(
      new Date(props.startTime.valueOf() + props.duration.valueOf()),
      endTimeString.value
    );

    if (updatedStart > updatedEnd) {
      await reset(true);
      return;
    }

    item.startTime = updatedStart;
    item.duration = new Date(updatedEnd.valueOf() - updatedStart.valueOf());

    await store.saveTrackingData(item);

    startTimeString.value = formatTimeSpan(item.startTime);
    endTimeString.value = formatTimeSpan(item.startTime, item.duration);
  }
};

const updateDate = (date: Date, value: string) => {
  const timeParts = value.split(":");
  while (timeParts.length < 3) {
    timeParts.push("00");
  }
  const result = new Date(date);

  result.setHours(
    parseInt(timeParts[0]),
    parseInt(timeParts[1]) - date.getTimezoneOffset(),
    parseInt(timeParts[2]),
    0
  );

  console.log(result);

  return result;
};

const reset = async (soft: boolean = false) => {
  const item = store.trackedSegments.at(props.index);
  if (item) {
    deleted.value = false;
    item.deleted = false;
  }

  startTimeString.value = formatTimeSpan(props.startTime);
  endTimeString.value = formatTimeSpan(props.startTime, props.duration);

  if (!soft) {
    await save();
  }
};

const removeEntry = () => {
  const item = store.trackedSegments.at(props.index);
  if (item) {
    deleted.value = true;
    item.deleted = true;
  }
};
</script>
<style scoped lang="scss">
.buttons,
.inputs {
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding-bottom: 1em;
}

.time {
  padding: 1em;
}

span {
  height: 100%;
  vertical-align: middle;
}
</style>
