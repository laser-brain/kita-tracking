<template>
  <v-dialog
    v-model="dialog"
    fullscreen
    :scrim="false"
    transition="dialog-bottom-transition"
  >
    <template v-slot:activator="{ props }">
      <v-btn color="teal-darken-4" dark v-bind="props">
        Alle Zeiten heute
      </v-btn>
    </template>
    <v-card>
      <v-toolbar dark color="teal-darken-4">
        <v-toolbar-title>Heute Erfasste Zeiten</v-toolbar-title>
        <v-btn icon dark @click="finalize">
          <v-icon color="white" icon="mdi-close"></v-icon>
        </v-btn>
      </v-toolbar>
      <v-divider></v-divider>
      <v-list lines="two" subheader>
        <v-list-item
          v-for="(item, index) in store.trackedSegments.filter(
            (i) => i.duration
          )"
          :key="index"
          :title="formatTimeSpan(item.duration as Date)"
          :subtitle="`${formatTimeSpan(item.startTime)} - ${formatTimeSpan(
            item.startTime,
            item.duration
          )}`"
        >
          <template v-slot:append>
            <v-btn
              v-if="!item.deleted && !item.running"
              icon
              color="error"
              @click="() => removeEntry(index)"
            >
              <v-icon>mdi-delete-forever</v-icon>
            </v-btn>
            <v-btn
              v-else-if="!item.running"
              icon
              color="teal-darken-4"
              @click="() => restoreEntry(index)"
            >
              <v-icon>mdi-undo-variant</v-icon>
            </v-btn>
          </template>
        </v-list-item>
      </v-list>
    </v-card>
  </v-dialog>
</template>
<script setup lang="ts">
import useTracking from "@/stores/tracker-store";
import { ref } from "vue";

const store = useTracking();

type voidEvents = "finalize";
const emit = defineEmits<{
  (e: voidEvents): void;
}>();

const dialog = ref(false);

const restoreEntry = (index: number) => {
  const item = store.trackedSegments.at(index);
  if (item) {
    item.deleted = false;
  }
};

const removeEntry = (index: number) => {
  const item = store.trackedSegments.at(index);
  if (item) {
    item.deleted = true;
  }
};

const formatTimeSpan = (date: Date, duration?: Date) => {
  const resultDate = new Date(date);
  if (duration) {
    resultDate.setTime(date.getTime() + duration.getTime());
  }

  return `${formatNumber(
    resultDate.getHours() + resultDate.getTimezoneOffset() / 60
  )}:${formatNumber(resultDate.getMinutes())}:${formatNumber(
    resultDate.getSeconds()
  )}`;
};

const formatNumber = (input: number) => {
  return input.toLocaleString("de-DE", { minimumIntegerDigits: 2 });
};

const finalize = () => {
  dialog.value = false;
  emit("finalize");
};
</script>
