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
          v-for="date in Object.keys(grouped[employee])"
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
            <v-label>Gesamt:</v-label>
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
import { ref, Ref, onMounted, computed } from "vue";

interface IGroupedByEmployee {
  [key: string]: IGroupedByDate;
}
interface IGroupedByDate {
  [key: string]: ITrackingDataDocumentExt[];
}

interface ITrackingDataDocumentExt extends ITrackingDataDocument {
  accumulated?: Date;
}

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
    filterDateTo
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
  if (month < 8) {
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
      durationDateObject.setHours(durationDateObject.getHours() - offset);
      if (!prev.accumulated) {
        prev.accumulated = new Date(0, offset, 0);
      }

      return {
        accumulated: new Date(
          prev.accumulated.valueOf() + durationDateObject.valueOf()
        ),
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
  trackers.value = await store.loadTrackingOverview(new Date(0));
  showLoader.value = false;
});
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
