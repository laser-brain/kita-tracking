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
        <v-toolbar-title>Erfasste Zeiten</v-toolbar-title>
        <v-btn icon dark @click="finalize">
          <v-icon color="white" icon="mdi-close"></v-icon>
        </v-btn>
      </v-toolbar>
      <v-divider></v-divider>
      <div v-if="user.isAdmin">
        <v-select
          label="Mitarbeiter auswählen"
          :items="employees"
          v-model="selectedEmployee"
          @update:model-value="loadEntries"
        />
      </div>
      <div class="selectDate">
        <input
          type="date"
          :value="selectedDate"
          @change="onSelectedDateChanged"
        />
      </div>
      <v-list lines="two" subheader v-if="store.trackedSegments.length">
        <v-list-group
          v-for="(item, index) in store.trackedSegments.filter(
            (i) => i.endTime
          )"
          :key="index"
          :value="index"
        >
          <template #activator="{ props }">
            <div :class="`${item.deleted ? 'deleted' : 'available'}`">
              <v-list-item
                v-if="!item.running"
                v-bind="props"
                :title="item.duration"
                :subtitle="`${item.startTime.toLocaleTimeString()} - ${(item.endTime as Date).toLocaleTimeString()}`"
              >
              </v-list-item>
            </div>
          </template>
          <div :class="`${item.deleted ? 'deleted' : 'available'}`">
            <edit-tracking-entry
              :employee="selectedEmployee"
              :index="index"
              :start-time="item.startTime"
              :endTime="(item.endTime as Date)"
            ></edit-tracking-entry>
          </div>
        </v-list-group>
      </v-list>
      <v-label v-else>Keine Daten erfasst</v-label>
      <v-btn class="add-entry" color="teal-darken-4" @click="addEntry"
        >Neuen Eintrag erstellen</v-btn
      >
    </v-card>
  </v-dialog>
</template>
<script setup lang="ts">
import EditTrackingEntry from "./EditTrackingEntry.vue";
import useTracking, { ITrackingEntry } from "@/stores/tracker-store";
import useUsers from "@/stores/user-store";
import { ref, Ref, onMounted, onUnmounted } from "vue";

const store = useTracking();
const user = useUsers();

const employees: Ref<string[]> = ref([]);
const selectedEmployee: Ref<string> = ref(user.username);

const formatDate = (date: Date) => {
  return `${date.getFullYear()}-${(date.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
};

const selectedDate = ref(formatDate(new Date()));

onMounted(async () => {
  await loadEntries();
  if(user.isAdmin) {
    employees.value = (await store.employees()).map(e => e.name);
  }
});

onUnmounted(() => {
  employees.value = [];
});

const onSelectedDateChanged = async (e: Event) => {
  selectedDate.value = (e.target as HTMLInputElement).value;
  await loadEntries();
};

const loadEntries = async () => {
  const from = new Date(selectedDate.value);
  const to = new Date(selectedDate.value);
  to.setDate(from.getDate() + 1);
  store.trackedSegments = await store.loadTrackingOverview(
    from,
    to,
    selectedEmployee.value
  );
};

type voidEvents = "finalize";
const emit = defineEmits<{
  (e: voidEvents): void;
}>();

const dialog = ref(false);

const finalize = async () => {
  await store.destroyDeletedItems();
  selectedDate.value = formatDate(new Date());
  await loadEntries();
  dialog.value = false;
  selectedEmployee.value = user.username;
  emit("finalize");
};

const addEntry = () => {
  const emptyData: ITrackingEntry = {
    startTime: new Date(selectedDate.value),
    endTime: new Date(selectedDate.value),
    running: false
  };
  store.trackedSegments.push(emptyData);
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

.selectDate {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;

  input {
    font-size: 1.5em;
  }
}

.add-entry {
  position: absolute;
  bottom: 32px;
  right: 32px;
}
</style>
