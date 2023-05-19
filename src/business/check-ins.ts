import { addDays } from "date-fns";
import { getDayOfWeek } from "./utility";
import { IChild, IChildCheckinData } from "@/database/documents";
import { ChartData } from "chart.js";

export const daysOfWeek = [
  "Montag",
  "Dienstag",
  "Mittwoch",
  "Donnerstag",
  "Freitag",
];

const colors = ["violet", "indigo", "blue", "green", "yellow", "orange", "red"];

export interface IChildWithWeeklyData {
  name: string;
  sum: number;
  weeklyData: IWeeklyData[];
}

interface IWeeklyData {
  from: Date;
  to: Date;
  chartData: ChartData<"pie" | "bar">;
}

export const getChartData = (
  weekDays: number[],
  weekStart: Date,
  dataItem: IChildCheckinData
): IWeeklyData => {
  return {
    from: weekStart,
    to: getDayOfWeek(dataItem.pickupTime as Date, 5),
    chartData: {
      labels: daysOfWeek.map((day, index) => {
        return `${day}, ${addDays(weekStart, index).toLocaleDateString()}`;
      }),
      datasets: [
        {
          data: weekDays,
          backgroundColor: colors,
        },
      ],
    },
  };
};

export const getWeekBasedData = (
  name: string,
  data: IChildCheckinData[]
): IChildWithWeeklyData => {
  const weeklyData: IWeeklyData[] = [];
  let sum: number = 0;
  let weekDays = [0, 0, 0, 0, 0];
  let startDate: Date | null = null;
  let lastDayIndex = 0;
  for (let i = 0; i < data.length; i++) {
    const dataItem = data[i];
    if (!(dataItem.arrivalTime && dataItem.pickupTime)) {
      continue;
    }
    if (!startDate) {
      startDate = dataItem.arrivalTime;
    }
    const weekStart = getDayOfWeek(startDate, 1);
    const dayIndex = dataItem.arrivalTime.getDay() - 1;

    if (dayIndex === 0 || dayIndex > 5) {
      continue;
    }

    if (dayIndex < lastDayIndex) {
      weeklyData.push(getChartData(weekDays, weekStart, dataItem));
      sum += weekDays.reduce((a, b) => a + b, 0);
      weekDays = [0, 0, 0, 0, 0];
      startDate = dataItem.arrivalTime;
    }
    lastDayIndex = dayIndex;
    weekDays[dayIndex] =
      (dataItem.pickupTime.valueOf() - dataItem.arrivalTime.valueOf()) /
      1000 /
      60 /
      60;

    if (dayIndex === 5 || i === data.length - 1) {
      weeklyData.push(getChartData(weekDays, weekStart, dataItem));
      sum += weekDays.reduce((a, b) => a + b, 0);
      weekDays = [0, 0, 0, 0, 0];
      startDate = null;
    }
  }
  return {
    name: name,
    sum: sum,
    weeklyData: weeklyData,
  };
};

export function filterData<T>(
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
