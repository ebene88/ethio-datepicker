import React from "react";
import { MONTHS } from "./constants";

interface Props {
  ethiopianDate: { year: number; month: number };
  setEthiopianDate: React.Dispatch<
    React.SetStateAction<{ year: number; month: number }>
  >;
  showMonthSelector: boolean;
  setShowMonthSelector: (v: boolean) => void;
  showYearSelector: boolean;
  setShowYearSelector: (v: boolean) => void;
  months: readonly string[];
  canGoPrev?: boolean;
  canGoNext?: boolean;
}

export const CalendarHeader: React.FC<Props> = ({
  ethiopianDate,
  setEthiopianDate,
  showMonthSelector,
  setShowMonthSelector,
  showYearSelector,
  setShowYearSelector,
  months,
  canGoPrev = true,
  canGoNext = true,
}) => (
  <div className="calendar-header">
    <button
      type="button"
      className="calendar-nav-btn"
      aria-label="Previous month"
      disabled={!canGoPrev}
      onClick={() => {
        if (!canGoPrev) return;
        if (ethiopianDate.month === 1)
          setEthiopianDate({ year: ethiopianDate.year - 1, month: 13 });
        else setEthiopianDate((prev: { year: number; month: number }) => ({ ...prev, month: prev.month - 1 }));
      }}
    >
      ‹
    </button>

    <div className="calendar-header-labels">
      <button
        type="button"
        className={`calendar-picker-btn${showMonthSelector ? " active" : ""}`}
        onClick={() => {
          setShowMonthSelector(!showMonthSelector);
          setShowYearSelector(false);
        }}
      >
        {months[ethiopianDate.month - 1] || months[0]}
      </button>
      <button
        type="button"
        className={`calendar-picker-btn${showYearSelector ? " active" : ""}`}
        onClick={() => {
          setShowYearSelector(!showYearSelector);
          setShowMonthSelector(false);
        }}
      >
        {ethiopianDate.year}
      </button>
    </div>

    <button
      type="button"
      className="calendar-nav-btn"
      aria-label="Next month"
      disabled={!canGoNext}
      onClick={() => {
        if (!canGoNext) return;
        if (ethiopianDate.month === 13)
          setEthiopianDate({ year: ethiopianDate.year + 1, month: 1 });
        else setEthiopianDate((prev: { year: number; month: number }) => ({ ...prev, month: prev.month + 1 }));
      }}
    >
      ›
    </button>
  </div>
);
