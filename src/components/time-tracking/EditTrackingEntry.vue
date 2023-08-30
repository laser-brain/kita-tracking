<template>
  <div class="info" v-if="user.isAdmin && user.username !== employee">
    <v-icon color="error" icon="mdi-alert-outline"></v-icon>
    <span>Eintrag bearbeiten für Mitarbeiter:in <br />{{ employee }}</span>
    <v-icon color="error" icon="mdi-alert-outline"></v-icon>
  </div>
  <div class="inputs">
    <v-text-field
      class="time"
      label="Von"
      v-model="startTimeString"
      hide-details
      @focus="$event.target.select()"
    />
    <span>&nbsp;-&nbsp;</span>
    <v-text-field
      class="time"
      label="Bis"
      v-model="endTimeString"
      hide-details
      @focus="$event.target.select()"
    />
  </div>
  <div class="buttons">
    <v-btn
      v-show="!deleted"
      @click="save"
      prepend-icon="mdi-floppy"
      color="teal-darken-4"
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
import useTracking from "@/stores/tracker-store";
import useUsers from "@/stores/user-store";
import { updateTimeFromString } from "@/business/utility";
const props = defineProps<{ employee: string; startTime: Date; endTime: Date; index: number }>();
const startTimeString = ref(props.startTime.toLocaleTimeString());
const endTimeString = ref(props.endTime.toLocaleTimeString());

const store = useTracking();
const user = useUsers();
const deleted = ref(false);

const save = async () => {
  const item = store.trackedSegments.at(props.index);
  if (!item) {
    return;
  }

  const updatedStart = updateTimeFromString(
    new Date(props.startTime),
    startTimeString.value
  );
  const updatedEnd = updateTimeFromString(
    new Date(props.endTime),
    endTimeString.value
  );

  if (updatedStart > updatedEnd) {
    await reset(true);
    return;
  }

  item.startTime = updatedStart;
  item.endTime = updatedEnd;
  item.duration = new Date(
    updatedEnd.valueOf() -
      updatedStart.valueOf() +
      new Date(0).getTimezoneOffset() * 60 * 1000
  ).toLocaleTimeString();

  await store.saveTrackingData(item, props.employee);

  startTimeString.value = item.startTime.toLocaleTimeString();
  endTimeString.value = item.endTime.toLocaleTimeString();
};

const reset = async (soft: boolean = false) => {
  const item = store.trackedSegments.at(props.index);
  if (item) {
    deleted.value = false;
    item.deleted = false;
  }

  startTimeString.value = props.startTime.toLocaleTimeString();
  endTimeString.value = props.endTime?.toLocaleTimeString();

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
.info,
.buttons,
.inputs {
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding-bottom: 1em;
}

.info {
  border: 2px dotted red;
  padding-bottom: 0;
  span {
    margin: 0 1em;
  }
}

.time {
  padding: 1em;
}

span {
  height: 100%;
  vertical-align: middle;
}
</style>
