export const formatTimeSpan = (date: Date, duration?: Date) => {
  const resultDate = new Date(date);
  if (duration) {
    resultDate.setTime(date.getTime() + duration.getTime());
  }

  return `${formatNumber(resultDate.getHours())}:${formatNumber(
    resultDate.getMinutes()
  )}:${formatNumber(resultDate.getSeconds())}`;
};

const formatNumber = (input: number) => {
  return input.toLocaleString("de-DE", { minimumIntegerDigits: 2 });
};
