<template>
  <v-dialog
    v-model="dialog"
    fullscreen
    :scrim="false"
    transition="dialog-bottom-transition"
  >
    <template v-slot:activator="{ props }">
      <v-btn color="teal-darken-4" dark v-bind="props">
        Zeiten bearbeiten / löschen
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
        <v-list-group
          v-for="(item, index) in store.trackedSegments.filter(
            (i) => i.duration
          )"
          :key="index"
          :value="index"
        >
          <template #activator="{ props }">
            <div :class="`${item.deleted ? 'deleted' : 'available'}`">
              <v-list-item
                v-if="!item.running"
                v-bind="props"
                :title="formatTimeSpan(item.duration as Date)"
                :subtitle="`${formatTimeSpan(
                  item.startTime
                )} - ${formatTimeSpan(item.startTime, item.duration)}`"
              >
              </v-list-item>
            </div>
          </template>
          <div :class="`${item.deleted ? 'deleted' : 'available'}`">
            <edit-tracking-entry
              :index="index"
              :start-time="item.startTime"
              :duration="(item.duration as Date)"
            ></edit-tracking-entry>
          </div>
        </v-list-group>
        <div class="close">
          <v-btn
            color="teal-darken-4"
            prepend-icon="mdi-close"
            @click="finalize"
            >Schliessen</v-btn
          >
        </div>
      </v-list>
    </v-card>
  </v-dialog>
</template>
<script setup lang="ts">
import EditTrackingEntry from "./EditTrackingEntry.vue";
import useTracking from "@/stores/tracker-store";
import { formatTimeSpan } from "@/business/time-formatting";
import { ref } from "vue";

const store = useTracking();

type voidEvents = "finalize";
const emit = defineEmits<{
  (e: voidEvents): void;
}>();

const dialog = ref(false);

const finalize = () => {
  dialog.value = false;
  emit("finalize");
};
</script>
<style lang="scss">
.deleted {
  background-color: rgb(var(--v-theme-error));
}

.close {
  position: fixed;
  display: flex;
  width: 100vw;
  justify-content: center;
  bottom: 4em;

  button {
    min-height: 4em;
    padding: 1em 2em;
  }
}
</style>
