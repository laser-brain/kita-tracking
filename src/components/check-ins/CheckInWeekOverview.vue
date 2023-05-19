<template>
  <div class="container">
    <h3>Wochenübersicht {{ currentWeek }}</h3>
    <div class="scroll">
      <bar-chart
        class="stretch"
        :chart-data="currentWeekData"
        :options="barOptions"
      ></bar-chart>
    </div>
  </div>
</template>
<script setup lang="ts">
import { IChild, IChildCheckinData } from "@/database/documents";
import useChildren from "@/stores/children-store";
import { BarChart } from "vue-chart-3";
import {
  Chart,
  BarController,
  BarElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
  ChartOptions,
  ChartData,
} from "chart.js";
import { filterData } from "@/business/check-ins";
import { Ref, ref, onMounted, computed } from "vue";
import { getMonday, getDayOfWeek } from "@/business/utility";

Chart.register(
  BarController,
  BarElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend
);

const barOptions: ChartOptions<"bar"> = {
  responsive: true,
  indexAxis: "y",
  maintainAspectRatio: false,
  scales: {
    x: {
      max: 35,
    },
  },
};

const store = useChildren();
const children: Ref<IChild[]> = ref([]);

const now = new Date();
const mondayCurrentWeek = getMonday(now);
const fridayCurrentWeek = getDayOfWeek(now, 5);
const currentWeek = `${mondayCurrentWeek.toLocaleDateString()} - ${fridayCurrentWeek.toLocaleDateString()}`;

onMounted(async () => {
  children.value = await store.loadChildren();
});

const currentWeekData = computed(() => {
  const fn = (name: string, data: IChildCheckinData[]) => {
    const nameParts = name.split(" ");
    const chartData: ChartData<"bar"> = {
      labels: [`${nameParts[0]} ${nameParts[1].substring(0, 1)}.`],
      datasets: [
        {
          data: [
            35 -
              data
                .map(
                  (d) =>
                    ((d.pickupTime as Date).valueOf() -
                      (d.arrivalTime as Date).valueOf()) /
                    1000 /
                    60 /
                    60
                )
                .reduce((a, b) => a + b, 0),
          ],
        },
      ],
    };
    return chartData;
  };

  const datasets = children.value.map((child) =>
    filterData(child, mondayCurrentWeek, fridayCurrentWeek, fn)
  );

  return datasets.reduce(
    (prev, current): ChartData<"bar", number[]> => {
      const data = prev.datasets[0].data.concat(
        current.datasets[0].data
      ) as number[];
      return {
        labels: (prev.labels || []).concat(current.labels),
        datasets: [
          {
            data: data,
            label: "Reststunden",
            backgroundColor: data.map(mapColor),
          },
          {
            data: data.map(() => 35),
            label: "Gesamt verfügbar",
            backgroundColor: "black",
          },
        ],
      };
    },
    { datasets: [{ data: [] }] }
  );
});

const mapColor = (count: number) => {
  if (count > 20) {
    return "green";
  } else if (count > 10) {
    return "yellow";
  }
  return "red";
};
</script>
<style scoped lang="scss">
.stretch {
  width: 100%;
  min-height: 1024px;
}
</style>
