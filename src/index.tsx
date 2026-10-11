import { useEffect, useMemo, useRef, useState } from "react";
import { useFormContext } from "react-hook-form";
import { CalendarHeader } from "./components/CalendarHeader";
import { ETHIOPIAN_WEEKDAYS, MONTHS } from "./components/constants";
import { MonthSelector } from "./components/MonthSelector";
import { DatePickerProps } from "./components/types";
import { YearSelector } from "./components/YearSelector";
import { convertToEth, convertToGreg } from "./libs/date-time";
import { formatDate, getDaysInMonth, getStartDayOfMonth } from "./libs/utils";
import "./style.css";

const YEARS = Array.from(
  { length: 100 },
  (_, i) => new Date().getFullYear() - 50 + i
);

export const EthioDatePicker: React.FC<DatePickerProps> = ({
  name,
  label,
  value,
  onChange,
  readOnly,
  showTime,
}) => {
  const form = useFormContext();
  const pickerRef = useRef<HTMLDivElement>(null);
  const isTypingRef = useRef(false);

  // Determine initial selected date
  const initialDate = useMemo(() => {
    if (value instanceof Date) return value;
    if (typeof value === "string") return new Date(value);
    if (name && form?.getValues) {
      const formValue = form.getValues(name);
      return formValue ? new Date(formValue) : null;
    }
    return null;
  }, [value, name, form]);

  const [selectedDate, setSelectedDate] = useState<Date | null>(initialDate);
  const [inputValue, setInputValue] = useState(
    selectedDate ? formatDate(selectedDate) : ""
  );
  const [showCalendar, setShowCalendar] = useState(false);
  const [showMonthSelector, setShowMonthSelector] = useState(false);
  const [showYearSelector, setShowYearSelector] = useState(false);

  const [ethiopianDate, setEthiopianDate] = useState(() => {
    const now = selectedDate || new Date();
    const eth = convertToEth({
      day: now.getDate(),
      month: now.getMonth() + 1,
      year: now.getFullYear(),
    });
    return { year: eth.year, month: eth.month };
  });

  // Time
  const [hours, setHours] = useState<string>(
    selectedDate ? String(selectedDate.getHours()).padStart(2, "0") : ""
  );
  const [minutes, setMinutes] = useState<string>(
    selectedDate ? String(selectedDate.getMinutes()).padStart(2, "0") : ""
  );
  const [seconds, setSeconds] = useState<string>(
    selectedDate ? String(selectedDate.getSeconds()).padStart(2, "0") : ""
  );

  const handleDateClick = (dateOrDay: number | Date) => {
    let date: Date;

    if (dateOrDay instanceof Date) {
      date = dateOrDay; // from input
    } else {
      // from calendar click (only day given)
      const ethDate = {
        day: dateOrDay,
        month: ethiopianDate.month,
        year: ethiopianDate.year,
      };
      const gregDate = convertToGreg(ethDate);
      date = new Date(gregDate.year, gregDate.month - 1, gregDate.day);
    }

    setSelectedDate(date);
    setInputValue(formatDate(date));

    onChange?.(date);
    if (name) {
      form?.setValue(name, date.toISOString());
    }

    if (form && name) {
      const utcString = date.toISOString();
      form.setValue(name, utcString);
    } else {
      // uncontrolled (standalone mode)
      onChange?.(date); // give user YYYY-MM-DD
    }

    setShowCalendar(false);
    setShowMonthSelector(false);
    setShowYearSelector(false);
  };

  useEffect(() => {
    if (selectedDate) {
      setHours(selectedDate.getHours());
      setMinutes(selectedDate.getMinutes());
      setSeconds(selectedDate.getSeconds());
    }
  }, [selectedDate]);

  /** Click outside to close */
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowCalendar(false);
        setShowMonthSelector(false);
        setShowYearSelector(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /** When user enter data show the calendar */
  useEffect(() => {
    if (selectedDate) {
      const eth = convertToEth({
        day: selectedDate.getDate(),
        month: selectedDate.getMonth() + 1,
        year: selectedDate.getFullYear(),
      });
      setEthiopianDate({ year: eth.year, month: eth.month });
    }
  }, [selectedDate]);

  /** Update input when selectedDate changes */
  useEffect(() => {
    if (selectedDate && !isTypingRef.current) {
      setInputValue(formatDate(selectedDate));
    }
    isTypingRef.current = false;
  }, [selectedDate]);

  /** Calendar Days Memo */
  const calendarDays = useMemo(() => {
    const startDay = getStartDayOfMonth(
      ethiopianDate.year,
      ethiopianDate.month
    );
    const daysInMonth = getDaysInMonth(ethiopianDate.month, ethiopianDate.year);

    const emptyDays = Array.from({ length: startDay }, (_, i) => (
      <div key={`empty-${i}`} />
    ));
    const dayCells = Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      const selectedEth = selectedDate
        ? convertToEth({
            day: selectedDate.getDate(),
            month: selectedDate.getMonth() + 1,
            year: selectedDate.getFullYear(),
          })
        : null;

      const isSelected =
        selectedEth &&
        selectedEth.day === day &&
        selectedEth.month === ethiopianDate.month &&
        selectedEth.year === ethiopianDate.year;

      const today = new Date();
      const todayEth = convertToEth({
        day: today.getDate(),
        month: today.getMonth() + 1,
        year: today.getFullYear(),
      });
      const isToday =
        todayEth.day === day &&
        todayEth.month === ethiopianDate.month &&
        todayEth.year === ethiopianDate.year;

      return (
        <div
          key={day}
          className={`day-cell${isToday ? " today" : ""}${
            isSelected ? " selected" : ""
          }`}
          onClick={() => handleDateClick(day)}
        >
          {day}
        </div>
      );
    });

    return [...emptyDays, ...dayCells];
  }, [ethiopianDate, selectedDate]);

  return (
    <div className="datepicker-wrapper" ref={pickerRef}>
      {label && (
        <label className="datepicker-label">
          {label} <span className="required">*</span>
        </label>
      )}

      <input
        type="text"
        placeholder="dd/mm/yyyy"
        readOnly={readOnly}
        className="datepicker-input"
        value={inputValue}
        onClick={() => !readOnly && setShowCalendar(!showCalendar)}
        onChange={(e) => {
          if (readOnly) return;

          let value = e.target.value;

          // 1️⃣ Remove everything except numbers
          value = value.replace(/[^\d]/g, "");

          // 2️⃣ Auto-insert "/" after dd and mm
          if (value.length >= 3) value = value.replace(/(\d{2})(\d)/, "$1/$2");
          if (value.length >= 6)
            value = value.replace(/(\d{2})\/(\d{2})(\d)/, "$1/$2/$3");

          // 3️⃣ Limit year to 4 digits only
          if (value.length > 10) value = value.slice(0, 10);

          setInputValue(value);
          isTypingRef.current = true;
        }}
        onKeyDown={(e) => {
          // if (readOnly) return;
          // if (e.key === "Enter") {
          //   e.preventDefault();
          //   const [dd, mm, yyyy] = inputValue.split("/").map(Number);
          //   if (dd && mm && yyyy) {
          //     const greg = convertToGreg({ day: dd, month: mm, year: yyyy });
          //     const parsed = new Date(greg.year, greg.month - 1, greg.day);
          //     if (!isNaN(parsed.getTime())) {
          //       handleDateClick(parsed);
          //     } else {
          //       console.warn("Invalid Date");
          //     }
          //   }
          // }
          if (e.key === "Enter") {
            e.preventDefault();
            const [dd, mm, yyyy] = inputValue.split("/").map(Number);
            if (dd && mm && yyyy) {
              const greg = convertToGreg({ day: dd, month: mm, year: yyyy });
              const parsed = new Date(greg.year, greg.month - 1, greg.day);
              if (showTime) {
                parsed.setHours(hours, minutes, seconds, 0);
              }
              if (!isNaN(parsed.getTime())) {
                handleDateClick(parsed);
              }
            }
          }
        }}
      />

      {showCalendar && !readOnly && (
        <div className="calendar-container">
          <CalendarHeader
            ethiopianDate={ethiopianDate}
            setEthiopianDate={setEthiopianDate}
            showMonthSelector={showMonthSelector}
            setShowMonthSelector={setShowMonthSelector}
            showYearSelector={showYearSelector}
            setShowYearSelector={setShowYearSelector}
          />

          {showMonthSelector && (
            <MonthSelector
              months={MONTHS}
              setMonth={(month) => {
                setEthiopianDate((prev) => ({ ...prev, month }));
                setShowMonthSelector(false);
              }}
            />
          )}

          {showYearSelector && (
            <YearSelector
              years={YEARS}
              setYear={(year) => {
                setEthiopianDate((prev) => ({ ...prev, year }));
                setShowYearSelector(false);
              }}
            />
          )}

          {!showMonthSelector && !showYearSelector && (
            <div className="calendar-with-time">
              <div className="day-grid-wrapper">
                <div className="day-grid">
                  {ETHIOPIAN_WEEKDAYS.map((day) => (
                    <div key={day} className="day-header">
                      {day}
                    </div>
                  ))}
                  {calendarDays}
                </div>
              </div>

              {showTime && (
                <div className="time-wrapper">
                  <div className="time-inputs">
                    <input
                      type="text"
                      maxLength={2}
                      placeholder="hh"
                      value={hours}
                      onChange={(e) =>
                        setHours(e.target.value.replace(/[^\d]/g, ""))
                      }
                      className="time-input"
                    />
                    :
                    <input
                      type="text"
                      maxLength={2}
                      placeholder="mm"
                      value={minutes}
                      onChange={(e) =>
                        setMinutes(e.target.value.replace(/[^\d]/g, ""))
                      }
                      className="time-input"
                    />
                    :
                    <input
                      type="text"
                      maxLength={2}
                      placeholder="ss"
                      value={seconds}
                      onChange={(e) =>
                        setSeconds(e.target.value.replace(/[^\d]/g, ""))
                      }
                      className="time-input"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
