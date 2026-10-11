interface Props {
  months: readonly string[];
  setMonth: (month: number) => void;
  selectedMonth?: number;
}

export const MonthSelector: React.FC<Props> = ({
  months,
  setMonth,
  selectedMonth,
}) => (
  <div className="month-selector">
    {months.map((month, idx) => {
      const monthNum = idx + 1;
      const isSelected = selectedMonth === monthNum;
      return (
        <button
          type="button"
          key={month}
          className={`selector-cell${isSelected ? " selected" : ""}`}
          onClick={() => setMonth(monthNum)}
        >
          {month}
        </button>
      );
    })}
  </div>
);

