import React, { useEffect, useRef } from "react";

interface Props {
  years: number[];
  setYear: (y: number) => void;
  selectedYear?: number;
}

export const YearSelector: React.FC<Props> = ({
  years,
  setYear,
  selectedYear,
}) => {
  const activeYearRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (activeYearRef.current) {
      activeYearRef.current.scrollIntoView({
        block: "center",
        behavior: "auto",
      });
    }
  }, []);

  return (
    <div className="year-selector">
      {years.map((year) => {
        const isSelected = selectedYear === year;
        return (
          <button
            ref={isSelected ? activeYearRef : null}
            type="button"
            key={year}
            className={`selector-cell${isSelected ? " selected" : ""}`}
            onClick={() => setYear(year)}
          >
            {year}
          </button>
        );
      })}
    </div>
  );
};

