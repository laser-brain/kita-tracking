<template>
  <div class="container">
    <h1>Zeitenübersicht</h1>
    <div class="filter">
      <v-text-field
        class="element"
        label="Von"
        :placeholder="`01.01.${new Date().getFullYear()}`"
        v-model="dateFrom"
        clearable
        append-inner-icon="mdi-calendar-search-outline"
        @keyup.enter="filter"
        @click:append-inner="filter"
      />
      <v-text-field
        class="element"
        label="Bis"
        :placeholder="`31.12.${new Date().getFullYear()}`"
        v-model="dateTo"
        clearable
        append-inner-icon="mdi-calendar-search-outline"
        @keyup.enter="filter"
        @click:append-inner="filter"
      />
    </div>
    <div class="centered">
      <v-btn class="element" @click="filterThisWeek">Diese Woche</v-btn>
      <v-btn class="element" @click="filterThisMonth">Diesen Monat</v-btn>
      <v-btn class="element" @click="filterWorkYear">Dieses Kita-Jahr</v-btn>
    </div>
    <ToggleMenu @finalize="init" />
    <v-list>
      <progress-overlay :show="showLoader" />
      <v-list-group
        v-for="(employee, index) in Object.keys(grouped)"
        :key="index"
        :value="index"
      >
        <template #activator="{ props }">
          <v-list-item
            v-bind="props"
            :title="`${employee} (${getTotal(getAll(employee))})`"
          />
        </template>
        <div
          v-for="date in orderedListByDate(grouped, employee)"
          :key="date"
          class="element"
        >
          <v-label class="element"> {{ date }} </v-label>
          <hr />
          <div class="right">
            <div v-for="tracker in grouped[employee][date]">
              <span class="element">{{ tracker.duration }}</span>
            </div>
          </div>
          <hr />
          <div class="summary element">
            <v-label>Gesamt:</v-label>&nbsp;
            <span> {{ getTotal(grouped[employee][date]) }}</span>
          </div>
        </div>
      </v-list-group>
    </v-list>
  </div>
</template>
<script setup lang="ts">
import ProgressOverlay from "@/components/ProgressOverlay.vue";
import { updateDateFromString, updateTimeFromString } from "@/business/utility";
import { ITrackingDataDocument } from "@/database/documents";
import useTracker from "@/stores/tracker-store";
import useUsers from "@/stores/user-store";
import { ref, Ref, onMounted, computed } from "vue";
import ToggleMenu from "./ToggleMenu.vue";

interface IGroupedByEmployee {
  [key: string]: IGroupedByDate;
}
interface IGroupedByDate {
  [key: string]: ITrackingDataDocumentExt[];
}

interface ITrackingDataDocumentExt extends ITrackingDataDocument {
  accumulated?: Date;
}

const user = useUsers();

const showLoader = ref(true);

const dateFrom = ref("");
const dateTo = ref("");
const filter = async () => {
  const filterDateFrom = updateDateFromString(new Date(), dateFrom.value);
  const filterDateTo = updateDateFromString(new Date(), dateTo.value);
  if (filterDateTo) {
    filterDateTo.setDate(filterDateTo.getDate() + 1);
  }

  showLoader.value = true;
  trackers.value = await store.loadTrackingOverview(
    filterDateFrom,
    filterDateTo,
    user.isAdmin ? "" : user.username
  );
  showLoader.value = false;
};

const filterThisWeek = async () => {
  const startOfWeek = new Date();
  startOfWeek.setDate(
    startOfWeek.getDate() -
      startOfWeek.getDay() +
      (startOfWeek.getDay() == 0 ? -6 : 1)
  );
  dateFrom.value = startOfWeek.toLocaleDateString();
  dateTo.value = new Date().toLocaleDateString();
  await filter();
};

const filterThisMonth = async () => {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  dateFrom.value = new Date(startOfMonth).toLocaleDateString();
  dateTo.value = new Date().toLocaleDateString();
  await filter();
};

const filterWorkYear = async () => {
  const startOfWorkYear = new Date();
  const month = startOfWorkYear.getMonth();
  if (month < 7) {
    startOfWorkYear.setFullYear(startOfWorkYear.getFullYear() - 1);
  }
  startOfWorkYear.setMonth(7);
  startOfWorkYear.setDate(1);
  dateFrom.value = new Date(startOfWorkYear).toLocaleDateString();
  dateTo.value = new Date().toLocaleDateString();
  await filter();
};

const getTotal = (data: ITrackingDataDocumentExt[]) => {
  let result = data.reduce(
    (prev, current) => {
      if (!current.duration) {
        return prev;
      }

      const durationDateObject = updateTimeFromString(
        new Date(0),
        current.duration
      );

      const offset = new Date(0).getTimezoneOffset() / 60;
      if (!prev.accumulated) {
        prev.accumulated = new Date(0);
        prev.accumulated.setHours(prev.accumulated.getHours() + offset)
      }

      const newValue = prev.accumulated;
      newValue.setHours(prev.accumulated.getHours() + durationDateObject.getHours())
      newValue.setMinutes(prev.accumulated.getMinutes() + durationDateObject.getMinutes())
      newValue.setSeconds(prev.accumulated.getSeconds() + durationDateObject.getSeconds())

      return {
        accumulated: newValue,
        startTime: new Date(0),
        employee: "",
        running: false,
      };
    },
    {
      startTime: new Date(0),
      running: false,
      employee: "",
    }
  );

  if(result.accumulated && result.accumulated > new Date(1970, 0, 2)) {
    const diffTime = Math.abs(result.accumulated.valueOf() - new Date(1970, 0, 2).valueOf());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays * 24 + result.accumulated.getHours()}:${result.accumulated.getMinutes().toString().padStart(2, "0")}:${result.accumulated.getSeconds().toString().padStart(2, "0")}`;
  }
  return result.accumulated?.toLocaleTimeString();
};

const getAll = (employee: string) => {
  const data = grouped.value[employee];

  let result: ITrackingDataDocument[] = [];
  for (const key in data) {
    const element = data[key];
    result = result.concat(element);
  }

  return result;
};

const orderedListByDate = (grouped: IGroupedByEmployee, employee: string) => {
  return Object.keys(grouped[employee])
    .map(dateString => { return { dateString, date: new Date(dateString)};})
    .sort((a, b) => a.date < b.date ? -1 : 1)
    .map(o => o.dateString);
}

const store = useTracker();
const trackers: Ref<ITrackingDataDocument[] | undefined> = ref();
const grouped: Ref<IGroupedByEmployee> = computed(() => {
  if (!trackers.value) {
    return {};
  }
  const result: IGroupedByEmployee = {};
  trackers.value.forEach((tracker) => {
    const trackerDate = tracker.startTime.toLocaleDateString();
    const employeeTrackers: IGroupedByDate = result[tracker.employee];
    if (employeeTrackers) {
      const dateElement: ITrackingDataDocument[] =
        employeeTrackers[trackerDate];
      if (dateElement) {
        dateElement.push(tracker);
      } else {
        employeeTrackers[trackerDate] = [tracker];
      }
    } else {
      const data: IGroupedByDate = {};
      data[trackerDate] = [tracker];
      result[tracker.employee] = data;
    }
  });

  return result;
});

onMounted(async () => {
  await init();
  showLoader.value = false;
});

const init = async () => {
  trackers.value = await store.loadTrackingOverview(new Date(0), undefined, user.isAdmin ? "" : user.username);
}
</script>
<style scoped lang="scss">
.container {
  height: calc(100vh - (8vh + 1.28em + 32px + 2px + 32px + 30px));
}
.element {
  margin: 0.5em;
}

.loader {
  height: 100%;
}

.centered {
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
  flex-wrap: wrap;
}
.summary,
.filter {
  display: flex;
  flex-direction: row;
}

.summary {
  justify-content: flex-end;
}

.filter {
  justify-content: space-between;
}

.right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.v-btn {
  min-width: 32%;
  padding: 0.5em 1em;
}

.v-list,
.filter {
  width: 100%;
}

.v-list {
  min-height: 32vh;
}
</style>
