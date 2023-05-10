<template>
  <div class="scroll">
    <h1>{{ referenceDate?.toLocaleDateString() }}</h1>
    <bar-chart :chartData="barChartData" />
  </div>
</template>
<script setup lang="ts">
import useChildren from "@/stores/children-store";
import { IChild, ITimeRequirement, IWeeklyTime } from "@/database/documents";
import { onMounted, ref, Ref } from "vue";
import { useTheme } from "vuetify";
import { BarChart } from "vue-chart-3";
import { endOfWeek, addDays, addMinutes } from "date-fns";
import {
  Chart,
  BarController,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  ChartData,
  Legend,
} from "chart.js";
import { updateTimeFromString } from "@/business/utility";

Chart.register(
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);
const store = useChildren();
const children: Ref<IChild[]> = ref([]);

const referenceDate: Ref<Date | undefined> = ref();
const barChartData: Ref<ChartData<"bar">> = ref({ labels: [], datasets: [] });

onMounted(async () => {
  children.value = await store.loadChildren();
  console.log(children.value.filter((x) => x.name === "Linus Zink"));

  const dates: Date[] = [];
  referenceDate.value = addDays(endOfWeek(new Date(), { weekStartsOn: 1 }), 1);
  let date: Date = referenceDate.value;
  date.setHours(7);
  date.setMinutes(0);
  date.setSeconds(0);
  date.setMilliseconds(0);

  while (dates.length < 10 * 4 - 1) {
    dates.push(date);
    date = addMinutes(date, 15);

    if (dates.length === 18) {
      console.log(date, getChildrenForHour(date));
    }
  }

  const data = dates.map((date) => getChildrenForHour(date));
  barChartData.value = {
    labels: dates.map((date) => date.toLocaleTimeString().substring(0, 5)),
    datasets: [
      {
        label: "1 - 15",
        data: data,
        backgroundColor: data.map(mapColor),
        borderColor: "black",
        borderWidth: 2,
      },
    ],
  };
});

const mapColor = (count: number) => {
  if (count > 30) {
    return "red";
  } else if (count > 15) {
    return "yellow";
  }
  return "green";
};

const getChildrenForHour = (hour: Date): number => {
  const result = children.value
    .map((child) => {
      return child.weeklyTimeRequired.flatMap((req) => req.requirements);
    })
    .filter((req) => {
      return filterConfig(hour, req);
    }).length;

  return result;
};

const filterConfig = (
  hour: Date,
  requirements: ITimeRequirement[]
): boolean => {
  for (let req of requirements) {
    if (
      req.startTime !== undefined &&
      req.startTime !== null &&
      req.endTime !== undefined &&
      req.endTime !== null &&
      updateTimeFromString(req.day as Date, req.startTime) <= hour &&
      updateTimeFromString(req.day as Date, req.endTime) >= hour
    ) {
      return true;
    }
  }
  return false;
};
</script>
<style scoped lang="scss"></style>
