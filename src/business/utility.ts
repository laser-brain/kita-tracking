import { ITimeRequirement } from "@/database/documents";

export const wait = (
  checkInterval: number,
  condition: () => boolean
): Promise<void> => {
  const awaiter = new Promise<void>((resolve) => {
    const loadInterval = window.setInterval(() => {
      if (condition()) {
        window.clearInterval(loadInterval);
        resolve();
      }
    }, checkInterval);
  });
  return awaiter;
};

export const getMidnight = (date?: Date): Date => {
  const result = date ? new Date(date) : new Date();
  result.setMinutes(0);
  result.setHours(0);
  result.setSeconds(0);
  result.setMilliseconds(0);
  return result;
};

export const updateTimeFromString = (referenceDate: Date, value: string) => {
  const timeParts = value.split(":");
  while (timeParts.length < 3) {
    timeParts.push("00");
  }

  referenceDate.setHours(
    parseInt(timeParts[0]),
    parseInt(timeParts[1]),
    parseInt(timeParts[2]),
    0
  );
  return referenceDate;
};

export const updateDateFromString = (referenceDate: Date, value: string) => {
  if (!value) {
    return undefined;
  }
  const timeParts = value.split(".");
  if (timeParts.length !== 3) {
    throw new Error("Invalid date format");
  }

  referenceDate.setDate(parseInt(timeParts[0]));
  referenceDate.setMonth(parseInt(timeParts[1]) - 1);
  const year = timeParts[2];

  referenceDate.setFullYear(parseInt(year.length === 2 ? `20${year}` : year));

  return updateTimeFromString(referenceDate, "00:00:00");
};

export const sumHours = (requirements: ITimeRequirement[]) => {
  return requirements
    .map((date) => date.timeRequired)
    .reduce((prev, current) => prev + current, 0);
};
