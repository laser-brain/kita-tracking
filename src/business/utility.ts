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
