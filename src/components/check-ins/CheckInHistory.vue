<template>
  <div class="container">
    <h3>Historische Daten</h3>
    <div class="flex row date-selection">
      <v-text-field type="date" label="von" v-model="dateFrom" hide-details />
      &nbsp;-&nbsp;
      <v-text-field type="date" label="bis" v-model="dateTo" hide-details />
    </div>
    <div class="scroll">
      <v-list>
        <v-list-group v-for="child in data" :key="child.name">
          <template #activator="{ props }">
            <v-list-item
              v-bind="props"
              :title="`${child.name} (${child.sum.toFixed(2)} Stunden)`"
            />
          </template>
          <div class="flex row">
            <div class="cake-tin" v-for="set in child.weeklyData">
              <label
                >Tagesaufteilung {{ set.from.toLocaleDateString() }} -
                {{ set.to.toLocaleDateString() }}</label
              >
              <pie-chart
                :chart-data="(set.chartData as ChartData<'pie'>)"
                :options="chartOptions"
              />
            </div>
          </div>
        </v-list-group>
      </v-list>
    </div>
  </div>
</template>
<script setup lang="ts">
import { IChild, IChildCheckinData } from "@/database/documents";
import { IChildWithWeeklyData, getWeekBasedData } from "@/business/check-ins";
import useChildren from "@/stores/children-store";
import { Ref, onMounted, ref, computed } from "vue";
import { getDayOfWeek, getMonday } from "@/business/utility";
import { format } from "date-fns";
import { PieChart } from "vue-chart-3";

import {
  Chart,
  PieController,
  Tooltip,
  ChartOptions,
  ArcElement,
  ChartData,
} from "chart.js";

Chart.register(PieController, ArcElement, Tooltip);
const chartOptions: ChartOptions = {
  responsive: true,
};

const store = useChildren();
const children: Ref<IChild[]> = ref([]);

const now = new Date();
const mondayCurrentWeek = getMonday(now);
const fridayCurrentWeek = getDayOfWeek(now, 5);
const dateFrom: Ref<string> = ref(format(mondayCurrentWeek, "yyyy-MM-dd"));
const dateTo: Ref<string> = ref(format(fridayCurrentWeek, "yyyy-MM-dd"));

function filterData<T>(
  child: IChild,
  from: Date,
  to: Date,
  fn: (name: string, data: IChildCheckinData[]) => T
) {
  const data = child.checkinHistory.filter(
    (history) =>
      history.arrivalTime &&
      history.arrivalTime > from &&
      history.pickupTime &&
      history.pickupTime < to
  );

  return fn(child.name, data);
}

const data: Ref<IChildWithWeeklyData[]> = computed(() => {
  return children.value.map((child) => {
    const dateFromValue = new Date(dateFrom.value);
    const dateToValue = new Date(dateTo.value);
    dateToValue.setHours(23);
    dateToValue.setMinutes(59);
    dateToValue.setSeconds(59);

    return filterData(child, dateFromValue, dateToValue, getWeekBasedData);
  });
});

onMounted(async () => {
  children.value = await store.loadChildren();
});
</script>
<style scoped lang="scss">
.flex {
  align-items: center;
  flex-wrap: wrap;
  justify-content: space-between;
}

.scroll {
  margin-top: 0;
}
.date-selection {
  @media screen and (orientation: landscape) {
    max-width: 50vw;
  }
}

.cake-tin {
  margin: 1em;
  @media screen and (orientation: landscape) {
    width: 42vw;
    * {
      max-height: 32vh;
    }
  }
}
</style>
