interface Props {
  months: readonly string[];
  setMonth: (month: number) => void;
}

export const MonthSelector: React.FC<Props> = ({ months, setMonth }) => (
  <div className="month-selector">
    {months.map((month, idx) => (
      <div key={month} onClick={() => setMonth(idx + 1)}>
        {month}
      </div>
    ))}
  </div>
);
