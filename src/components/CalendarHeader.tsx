import React from "react";
import { MONTHS } from "./constants";

interface Props {
  ethiopianDate: { year: number; month: number };
  setEthiopianDate: React.Dispatch<React.SetStateAction<any>>;
  showMonthSelector: boolean;
  setShowMonthSelector: (v: boolean) => void;
  showYearSelector: boolean;
  setShowYearSelector: (v: boolean) => void;
}

export const CalendarHeader: React.FC<Props> = ({
  ethiopianDate,
  setEthiopianDate,
  showMonthSelector,
  setShowMonthSelector,
  showYearSelector,
  setShowYearSelector,
}) => (
  <div className="calendar-header">
    <button
      onClick={() => {
        if (ethiopianDate.month === 1)
          setEthiopianDate({ year: ethiopianDate.year - 1, month: 13 });
        else setEthiopianDate((prev) => ({ ...prev, month: prev.month - 1 }));
      }}
    >
      ‹
    </button>

    <div className="calendar-header-labels">
      <span
        onClick={() => {
          setShowMonthSelector(!showMonthSelector);
          setShowYearSelector(false);
        }}
      >
        {MONTHS[ethiopianDate.month - 1]}
      </span>
      <span
        onClick={() => {
          setShowYearSelector(!showYearSelector);
          setShowMonthSelector(false);
        }}
      >
        {ethiopianDate.year}
      </span>
    </div>

    <button
      onClick={() => {
        if (ethiopianDate.month === 13)
          setEthiopianDate({ year: ethiopianDate.year + 1, month: 1 });
        else setEthiopianDate((prev) => ({ ...prev, month: prev.month + 1 }));
      }}
    >
      ›
    </button>
  </div>
);
