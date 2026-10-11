import { ClassValue } from "class-variance-authority/dist/types";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";
import { convertToEth, convertToGreg } from "./date-time";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// export const formatDate = (date: Date | null) => {
//   if (!date) return "";
//   const eth = convertToEth({
//     day: date.getDate(),
//     month: date.getMonth() + 1,
//     year: date.getFullYear(),
//   });

//   const day = String(eth.day).padStart(2, "0"); // Add leading zero
//   const month = String(eth.month).padStart(2, "0"); // Add leading zero
//   const year = String(eth.year); // Leave year as it is

//   return `${day}/${month}/${year}`;
// };
export const formatDate = (date: Date | null, showTime?: boolean) => {
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
    result += ` ${date.getHours().toString().padStart(2, "0")}:${date
      .getMinutes()
      .toString()
      .padStart(2, "0")}:${date.getSeconds().toString().padStart(2, "0")}`;
  }

  return result;
};

export const getDaysInMonth = (month: number, year: number) =>
  month === 13 ? (year % 4 === 3 ? 6 : 5) : 30;

export const getStartDayOfMonth = (year: number, month: number) => {
  const greg = convertToGreg({ day: 1, month, year });
  return new Date(greg.year, greg.month - 1, greg.day).getDay();
};
