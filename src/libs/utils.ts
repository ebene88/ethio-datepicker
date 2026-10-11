import { convertToEth, convertToGreg } from "./date-time";

export type ClassValue = string | number | boolean | undefined | null;

export function cn(...inputs: (ClassValue | ClassValue[])[]): string {
  const classes: string[] = [];
  for (const input of inputs) {
    if (!input) continue;
    if (Array.isArray(input)) {
      const nested = cn(...input);
      if (nested) classes.push(nested);
    } else if (typeof input === "string" || typeof input === "number") {
      classes.push(String(input));
    }
  }
  return classes.join(" ");
}


export const formatDate = (
  date: Date | null,
  showTime?: boolean,
  localeData?: { am?: string; pm?: string }
) => {
  if (!date) return "";
  const eth = convertToEth({
    day: date.getDate(),
    month: date.getMonth() + 1,
    year: date.getFullYear(),
  });

  let result = `${eth.day.toString().padStart(2, "0")}/${eth.month
    .toString()
    .padStart(2, "0")}/${eth.year}`;

  if (showTime) {
    const hours24 = date.getHours();
    const isPM = hours24 >= 12;
    const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
    const periodLabel = isPM ? "PM" : "AM";
    const hh = hours12.toString().padStart(2, "0");
    const mm = date.getMinutes().toString().padStart(2, "0");
    const ss = date.getSeconds().toString().padStart(2, "0");

    result += ` ${hh}:${mm}:${ss} ${periodLabel}`;
  }

  return result;
};

export const getDaysInMonth = (month: number, year: number) =>
  month === 13 ? (year % 4 === 3 ? 6 : 5) : 30;

export const getStartDayOfMonth = (year: number, month: number) => {
  const greg = convertToGreg({ day: 1, month, year });
  return new Date(greg.year, greg.month - 1, greg.day).getDay();
};
