interface Props {
  years: number[];
  setYear: (y: number) => void;
}

export const YearSelector: React.FC<Props> = ({ years, setYear }) => (
  <div className="year-selector">
    {years.map((year) => (
      <div key={year} onClick={() => setYear(year)}>
        {year}
      </div>
    ))}
  </div>
);
