<template>
  <div class="container">
    <h1>Bedarfsmeldung der nächsten vier Wochen</h1>
    <div class="scroll overflow">
      <div v-for="(item, index) in overviewData" :key="index">
        <h2 v-if="index % 5 === 0">KW {{ getWeek(item.referenceDate) }}</h2>
        <h3>{{ item.referenceDate.toLocaleDateString() }}</h3>
        <bar-chart :chartData="item.barChartData" :options="barChartOptions" />
        <hr v-if="(index + 1) % 5 === 0 && index !== overviewData.length - 1" />
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import useChildren from "@/stores/children-store";
import { IChild, ITimeRequirement } from "@/database/documents";
import { onMounted, ref, Ref } from "vue";
import { BarChart } from "vue-chart-3";
import { addDays, addMinutes, getWeek } from "date-fns";
import { updateTimeFromString } from "@/business/utility";
import {
  Chart,
  BarController,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  ChartData,
  Legend,
  ChartOptions,
} from "chart.js";

interface IDailyOverview {
  referenceDate: Date;
  barChartData: ChartData<"bar">;
}

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
const overviewData: Ref<IDailyOverview[]> = ref([]);
const barChartOptions: ChartOptions = {
  responsive: true,
};

onMounted(async () => {
  children.value = await store.loadChildren();
  const requirementDays = children.value.flatMap((child) => {
    return child.weeklyTimeRequired.flatMap((week) =>
      week.requirements.map((req) => (req.day as Date).valueOf())
    );
  });
  const min = new Date(Math.min(...requirementDays));
  const max = addDays(new Date(Math.max(...requirementDays)), 1);

  let referenceDate: Date = min;

  while (referenceDate <= max) {
    const day = referenceDate.getDay();
    if (day > 0 && day <= 5) {
      initDay(referenceDate);
    }
    referenceDate = addDays(referenceDate, 1);
  }
});

const initDay = (referenceDate: Date) => {
  const quarterHours: Date[] = [];

  let timestamp: Date = referenceDate;
  timestamp.setHours(7);
  timestamp.setMinutes(30);
  timestamp.setSeconds(0);
  timestamp.setMilliseconds(0);

  while (quarterHours.length < 8.5 * 4 + 1) {
    quarterHours.push(timestamp);
    timestamp = addMinutes(timestamp, 15);
  }

  const data = quarterHours.map((timestamp) => getChildrenForHour(timestamp));
  overviewData.value.push({
    referenceDate: referenceDate,
    barChartData: {
      labels: quarterHours.map((timestamp) =>
        timestamp.toLocaleTimeString().substring(0, 5)
      ),
      datasets: [
        {
          label: "Anzahl Kinder",
          data: data,
          backgroundColor: data.map(mapColor),
          borderColor: "black",
          borderWidth: 2,
        },
      ],
    },
  });
};

const mapColor = (count: number) => {
  if (count > 30) {
    return "red";
  } else if (count > 15) {
    return "yellow";
  }
  return "green";
};

const getChildrenForHour = (timestamp: Date): number => {
  const result = children.value
    .map((child) => {
      return child.weeklyTimeRequired.flatMap((req) => req.requirements);
    })
    .filter((req) => {
      return filterConfig(timestamp, req);
    }).length;

  return result;
};

const filterConfig = (
  timestamp: Date,
  requirements: ITimeRequirement[]
): boolean => {
  for (let req of requirements) {
    if (
      req.startTime !== undefined &&
      req.startTime !== null &&
      req.endTime !== undefined &&
      req.endTime !== null &&
      updateTimeFromString(req.day as Date, req.startTime) <= timestamp &&
      updateTimeFromString(req.day as Date, req.endTime) >= timestamp
    ) {
      return true;
    }
  }
  return false;
};
</script>
<style scoped lang="scss">
h1 {
  width: 100%;
  text-align: center;
}

h2,
h3,
hr {
  margin-top: 2em;
}

hr {
  background-color: black;
  height: 0.5em;
}
</style>
