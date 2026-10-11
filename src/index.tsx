import { useEffect, useMemo, useRef, useState } from "react";
import { useFormContext } from "react-hook-form";
import { CalendarHeader } from "./components/CalendarHeader";
import { TimePicker } from "./components/TimePicker";
import {
  BUILT_IN_LOCALES,
  getCalendarLocale,
  registerCalendarLocale,
} from "./components/constants";
import { MonthSelector } from "./components/MonthSelector";
import {
  CalendarLocale,
  DatePickerProps,
  SupportedLocale,
} from "./components/types";
import { YearSelector } from "./components/YearSelector";
import { convertToEth, convertToGreg } from "./libs/date-time";
import {
  cn,
  formatDate,
  getDaysInMonth,
  getStartDayOfMonth,
} from "./libs/utils";
import "./style.css";

export const EthioDatePicker: React.FC<DatePickerProps> = ({
  name,
  label,
  value,
  onChange,
  readOnly,
  disabled,
  required,
  showTime,
  locale = "am",
  customLocale,
  placeholder,
  width,
  className,
  inputClassName,
  popupClassName,
  style,
  inputStyle,
  popupStyle,
  error,
  helperText,
  allowFutureDate = false,
  futureYears = 10,
  minYear = 1926,
  maxYear,
  minDate,
  maxDate,
  isClearable = true,
  showTodayButton = true,
  showClearButton = true,
}) => {
  const form = useFormContext();
  const pickerRef = useRef<HTMLDivElement>(null);
  const isTypingRef = useRef(false);
  const isEditingTimeRef = useRef(false);
  const hoursInputRef = useRef<HTMLInputElement>(null);
  const minutesInputRef = useRef<HTMLInputElement>(null);
  const secondsInputRef = useRef<HTMLInputElement>(null);

  // Today in Ethiopian calendar
  const todayEth = useMemo(() => {
    const now = new Date();
    return convertToEth({
      day: now.getDate(),
      month: now.getMonth() + 1,
      year: now.getFullYear(),
    });
  }, []);

  // Allowed Ethiopian Year Range: 1926 to current year (or + futureYears if allowFutureDate is enabled)
  const allowedMinYear = minYear ?? 1926;
  const allowedMaxYear = useMemo(() => {
    if (maxYear !== undefined) return maxYear;
    return allowFutureDate
      ? todayEth.year + (futureYears ?? 10)
      : todayEth.year;
  }, [maxYear, allowFutureDate, futureYears, todayEth.year]);

  const years = useMemo(() => {
    const list: number[] = [];
    for (let y = allowedMinYear; y <= allowedMaxYear; y++) {
      list.push(y);
    }
    return list;
  }, [allowedMinYear, allowedMaxYear]);

  // Boundaries in timestamp for quick day cell checks
  const minGregTime = useMemo(() => {
    if (!minDate) return null;
    const d = minDate instanceof Date ? minDate : new Date(minDate);
    return isNaN(d.getTime())
      ? null
      : new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  }, [minDate]);

  const maxGregTime = useMemo(() => {
    if (!maxDate) return null;
    const d = maxDate instanceof Date ? maxDate : new Date(maxDate);
    return isNaN(d.getTime())
      ? null
      : new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  }, [maxDate]);

  const wrapperStyle = useMemo<React.CSSProperties>(() => {
    const base: React.CSSProperties = { ...style };
    if (width !== undefined) {
      base.width = typeof width === "number" ? `${width}px` : width;
    }
    return base;
  }, [width, style]);

  const localeData = useMemo(
    () => getCalendarLocale(locale, customLocale),
    [locale, customLocale]
  );

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
    selectedDate ? formatDate(selectedDate, showTime, localeData) : ""
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

  // 12-Hour Time State (hh:mm:ss AM/PM)
  const get12HourTime = (d: Date | null) => {
    const date = d || new Date();
    const h24 = date.getHours();
    const isPM = h24 >= 12;
    const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
    return {
      hours: String(h12).padStart(2, "0"),
      minutes: String(date.getMinutes()).padStart(2, "0"),
      seconds: String(date.getSeconds()).padStart(2, "0"),
      period: (isPM ? "PM" : "AM") as "AM" | "PM",
    };
  };

  const initialTime = useMemo(
    () => get12HourTime(initialDate),
    [initialDate]
  );

  const [hours, setHours] = useState<string>(initialTime.hours);
  const [minutes, setMinutes] = useState<string>(initialTime.minutes);
  const [seconds, setSeconds] = useState<string>(initialTime.seconds);
  const [period, setPeriod] = useState<"AM" | "PM">(initialTime.period);

  /** Helper to commit date and time updates immediately */
  const commitDateTime = (
    baseDate: Date | null,
    hStr: string,
    mStr: string,
    sStr: string,
    p: "AM" | "PM",
    closeCalendar = false
  ) => {
    const date = baseDate ? new Date(baseDate.getTime()) : new Date();

    const h12 = parseInt(hStr, 10);
    const validH12 = isNaN(h12) ? 12 : Math.min(Math.max(h12, 1), 12);
    const m = parseInt(mStr, 10);
    const validM = isNaN(m) ? 0 : Math.min(Math.max(m, 0), 59);
    const s = parseInt(sStr, 10);
    const validS = isNaN(s) ? 0 : Math.min(Math.max(s, 0), 59);

    let h24 = validH12 % 12;
    if (p === "PM") {
      h24 += 12;
    }

    date.setHours(h24, validM, validS, 0);

    setSelectedDate(date);
    setInputValue(formatDate(date, showTime, localeData));
    onChange?.(date);
    if (name) {
      form?.setValue(name, date.toISOString());
    }

    if (closeCalendar) {
      setShowCalendar(false);
      setShowMonthSelector(false);
      setShowYearSelector(false);
    }

    return date;
  };

  const handleDateClick = (
    dateOrDay: number | Date,
    forceClose = !showTime
  ) => {
    let date: Date;

    if (dateOrDay instanceof Date) {
      date = dateOrDay; // from input or today
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

    if (showTime) {
      const h12 = parseInt(hours, 10) || 12;
      const validH12 = Math.min(Math.max(h12, 1), 12);
      const m = parseInt(minutes, 10) || 0;
      const validM = Math.min(Math.max(m, 0), 59);
      const s = parseInt(seconds, 10) || 0;
      const validS = Math.min(Math.max(s, 0), 59);
      let h24 = validH12 % 12;
      if (period === "PM") h24 += 12;
      date.setHours(h24, validM, validS, 0);
    }

    setSelectedDate(date);
    setInputValue(formatDate(date, showTime, localeData));

    onChange?.(date);
    if (name) {
      form?.setValue(name, date.toISOString());
    }

    if (forceClose) {
      setShowCalendar(false);
      setShowMonthSelector(false);
      setShowYearSelector(false);
    }
  };

  const handleClear = () => {
    setSelectedDate(null);
    setInputValue("");
    onChange?.(null);
    if (name) {
      form?.setValue(name, "");
    }
    setShowCalendar(false);
    setShowMonthSelector(false);
    setShowYearSelector(false);
  };

  const handleTodayClick = () => {
    const today = new Date();
    handleDateClick(today, !showTime);
  };

  const handleApply = () => {
    commitDateTime(selectedDate, hours, minutes, seconds, period, true);
  };

  const handleHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    isEditingTimeRef.current = true;
    let raw = e.target.value.replace(/[^\d]/g, "");

    if (raw === "") {
      setHours("");
      return;
    }

    if (raw.length > 2) {
      raw = raw.slice(-2);
    }

    const num = parseInt(raw, 10);

    if (raw.length === 2) {
      if (num >= 1 && num <= 12) {
        const formatted = String(num).padStart(2, "0");
        setHours(formatted);
        commitDateTime(selectedDate, formatted, minutes, seconds, period, false);
        setTimeout(() => {
          minutesInputRef.current?.focus();
          minutesInputRef.current?.select();
        }, 10);
      } else if (num > 12) {
        // e.g. typed 15 -> clamp to 12
        setHours("12");
        commitDateTime(selectedDate, "12", minutes, seconds, period, false);
        setTimeout(() => {
          minutesInputRef.current?.focus();
          minutesInputRef.current?.select();
        }, 10);
      } else {
        // "00"
        setHours("12");
      }
    } else {
      // Single digit entered
      if (num >= 2 && num <= 9) {
        // 2..9 can never start a 2-digit number in 1..12, so user typed a single digit hour!
        const formatted = String(num).padStart(2, "0");
        setHours(formatted);
        commitDateTime(selectedDate, formatted, minutes, seconds, period, false);
        setTimeout(() => {
          minutesInputRef.current?.focus();
          minutesInputRef.current?.select();
        }, 10);
      } else {
        // num is 0 or 1: wait for the second digit (e.g. 01..09 or 10..12)
        setHours(raw);
      }
    }
  };

  const handleHoursBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    isEditingTimeRef.current = false;
    const rawVal = e.target.value.replace(/[^\d]/g, "");
    const num = parseInt(rawVal, 10);
    const normalized =
      isNaN(num) || num < 1
        ? "12"
        : num > 12
        ? "12"
        : String(num).padStart(2, "0");
    setHours(normalized);
    commitDateTime(selectedDate, normalized, minutes, seconds, period, false);
  };

  const handleHoursKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      isEditingTimeRef.current = false;
      const rawVal = (e.target as HTMLInputElement).value.replace(/[^\d]/g, "");
      const num = parseInt(rawVal, 10);
      const normalized =
        isNaN(num) || num < 1
          ? "12"
          : num > 12
          ? "12"
          : String(num).padStart(2, "0");
      setHours(normalized);
      commitDateTime(selectedDate, normalized, minutes, seconds, period, true);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const cur = parseInt(hours, 10) || 12;
      const next = (cur % 12) + 1;
      const normalized = String(next).padStart(2, "0");
      setHours(normalized);
      commitDateTime(selectedDate, normalized, minutes, seconds, period, false);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const cur = parseInt(hours, 10) || 12;
      const next = cur - 1 <= 0 ? 12 : cur - 1;
      const normalized = String(next).padStart(2, "0");
      setHours(normalized);
      commitDateTime(selectedDate, normalized, minutes, seconds, period, false);
    } else if (e.key === "ArrowRight" || e.key === ":") {
      e.preventDefault();
      minutesInputRef.current?.focus();
      minutesInputRef.current?.select();
    } else if (e.key === "a" || e.key === "A") {
      e.preventDefault();
      handlePeriodChange("AM");
    } else if (e.key === "p" || e.key === "P") {
      e.preventDefault();
      handlePeriodChange("PM");
    }
  };

  const handleMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    isEditingTimeRef.current = true;
    let raw = e.target.value.replace(/[^\d]/g, "");

    if (raw === "") {
      setMinutes("");
      return;
    }

    if (raw.length > 2) {
      raw = raw.slice(-2);
    }

    const num = parseInt(raw, 10);

    if (raw.length === 2) {
      if (num >= 0 && num <= 59) {
        const formatted = String(num).padStart(2, "0");
        setMinutes(formatted);
        commitDateTime(selectedDate, hours, formatted, seconds, period, false);
        setTimeout(() => {
          secondsInputRef.current?.focus();
          secondsInputRef.current?.select();
        }, 10);
      } else {
        setMinutes("59");
        commitDateTime(selectedDate, hours, "59", seconds, period, false);
        setTimeout(() => {
          secondsInputRef.current?.focus();
          secondsInputRef.current?.select();
        }, 10);
      }
    } else {
      // Single digit entered
      if (num >= 6 && num <= 9) {
        // 6..9 cannot start a minute (00..59), so user entered 06..09
        const formatted = String(num).padStart(2, "0");
        setMinutes(formatted);
        commitDateTime(selectedDate, hours, formatted, seconds, period, false);
        setTimeout(() => {
          secondsInputRef.current?.focus();
          secondsInputRef.current?.select();
        }, 10);
      } else {
        // 0..5: wait for second digit (e.g. 05, 30, 59)
        setMinutes(raw);
      }
    }
  };

  const handleMinutesBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    isEditingTimeRef.current = false;
    const rawVal = e.target.value.replace(/[^\d]/g, "");
    const num = parseInt(rawVal, 10);
    const normalized =
      isNaN(num) || num < 0
        ? "00"
        : num > 59
        ? "59"
        : String(num).padStart(2, "0");
    setMinutes(normalized);
    commitDateTime(selectedDate, hours, normalized, seconds, period, false);
  };

  const handleMinutesKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      isEditingTimeRef.current = false;
      const rawVal = (e.target as HTMLInputElement).value.replace(/[^\d]/g, "");
      const num = parseInt(rawVal, 10);
      const normalized =
        isNaN(num) || num < 0
          ? "00"
          : num > 59
          ? "59"
          : String(num).padStart(2, "0");
      setMinutes(normalized);
      commitDateTime(selectedDate, hours, normalized, seconds, period, true);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const cur = parseInt(minutes, 10) || 0;
      const next = (cur + 1) % 60;
      const normalized = String(next).padStart(2, "0");
      setMinutes(normalized);
      commitDateTime(selectedDate, hours, normalized, seconds, period, false);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const cur = parseInt(minutes, 10) || 0;
      const next = cur - 1 < 0 ? 59 : cur - 1;
      const normalized = String(next).padStart(2, "0");
      setMinutes(normalized);
      commitDateTime(selectedDate, hours, normalized, seconds, period, false);
    } else if (e.key === "ArrowRight" || e.key === ":") {
      e.preventDefault();
      secondsInputRef.current?.focus();
      secondsInputRef.current?.select();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      hoursInputRef.current?.focus();
      hoursInputRef.current?.select();
    } else if (e.key === "Backspace" && (minutes === "" || minutes === "00")) {
      hoursInputRef.current?.focus();
      hoursInputRef.current?.select();
    } else if (e.key === "a" || e.key === "A") {
      e.preventDefault();
      handlePeriodChange("AM");
    } else if (e.key === "p" || e.key === "P") {
      e.preventDefault();
      handlePeriodChange("PM");
    }
  };

  const handleSecondsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    isEditingTimeRef.current = true;
    let raw = e.target.value.replace(/[^\d]/g, "");

    if (raw === "") {
      setSeconds("");
      return;
    }

    if (raw.length > 2) {
      raw = raw.slice(-2);
    }

    const num = parseInt(raw, 10);

    if (raw.length === 2) {
      if (num >= 0 && num <= 59) {
        const formatted = String(num).padStart(2, "0");
        setSeconds(formatted);
        commitDateTime(selectedDate, hours, minutes, formatted, period, false);
      } else {
        setSeconds("59");
        commitDateTime(selectedDate, hours, minutes, "59", period, false);
      }
    } else {
      if (num >= 6 && num <= 9) {
        const formatted = String(num).padStart(2, "0");
        setSeconds(formatted);
        commitDateTime(selectedDate, hours, minutes, formatted, period, false);
      } else {
        setSeconds(raw);
      }
    }
  };

  const handleSecondsBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    isEditingTimeRef.current = false;
    const rawVal = e.target.value.replace(/[^\d]/g, "");
    const num = parseInt(rawVal, 10);
    const normalized =
      isNaN(num) || num < 0
        ? "00"
        : num > 59
        ? "59"
        : String(num).padStart(2, "0");
    setSeconds(normalized);
    commitDateTime(selectedDate, hours, minutes, normalized, period, false);
  };

  const handleSecondsKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      isEditingTimeRef.current = false;
      const rawVal = (e.target as HTMLInputElement).value.replace(/[^\d]/g, "");
      const num = parseInt(rawVal, 10);
      const normalized =
        isNaN(num) || num < 0
          ? "00"
          : num > 59
          ? "59"
          : String(num).padStart(2, "0");
      setSeconds(normalized);
      commitDateTime(selectedDate, hours, minutes, normalized, period, true);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const cur = parseInt(seconds, 10) || 0;
      const next = (cur + 1) % 60;
      const normalized = String(next).padStart(2, "0");
      setSeconds(normalized);
      commitDateTime(selectedDate, hours, minutes, normalized, period, false);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const cur = parseInt(seconds, 10) || 0;
      const next = cur - 1 < 0 ? 59 : cur - 1;
      const normalized = String(next).padStart(2, "0");
      setSeconds(normalized);
      commitDateTime(selectedDate, hours, minutes, normalized, period, false);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      minutesInputRef.current?.focus();
      minutesInputRef.current?.select();
    } else if (e.key === "Backspace" && (seconds === "" || seconds === "00")) {
      minutesInputRef.current?.focus();
      minutesInputRef.current?.select();
    } else if (e.key === "a" || e.key === "A") {
      e.preventDefault();
      handlePeriodChange("AM");
    } else if (e.key === "p" || e.key === "P") {
      e.preventDefault();
      handlePeriodChange("PM");
    }
  };

  const handlePeriodChange = (p: "AM" | "PM") => {
    setPeriod(p);
    commitDateTime(selectedDate, hours, minutes, seconds, p, false);
  };

  useEffect(() => {
    if (selectedDate && !isEditingTimeRef.current) {
      const h24 = selectedDate.getHours();
      const isPM = h24 >= 12;
      const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
      setHours(String(h12).padStart(2, "0"));
      setMinutes(String(selectedDate.getMinutes()).padStart(2, "0"));
      setSeconds(String(selectedDate.getSeconds()).padStart(2, "0"));
      setPeriod(isPM ? "PM" : "AM");
    }
  }, [selectedDate]);

  /** Click outside or press Escape to close */
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowCalendar(false);
        setShowMonthSelector(false);
        setShowYearSelector(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowCalendar(false);
        setShowMonthSelector(false);
        setShowYearSelector(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
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
      setInputValue(formatDate(selectedDate, showTime, localeData));
    }
    isTypingRef.current = false;
  }, [selectedDate, showTime, localeData]);

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

      const isFuture =
        !allowFutureDate && ethiopianDate.year > todayEth.year;

      // Min/Max Date check
      const dayGreg = convertToGreg({
        day,
        month: ethiopianDate.month,
        year: ethiopianDate.year,
      });
      const dayTimestamp = new Date(
        dayGreg.year,
        dayGreg.month - 1,
        dayGreg.day
      ).getTime();

      const isBeforeMin = minGregTime !== null && dayTimestamp < minGregTime;
      const isAfterMax = maxGregTime !== null && dayTimestamp > maxGregTime;
      const isDisabled = isFuture || isBeforeMin || isAfterMax;

      return (
        <div
          key={day}
          className={`day-cell${isToday ? " today" : ""}${
            isSelected ? " selected" : ""
          }${isDisabled ? " disabled" : ""}`}
          onClick={() => !isDisabled && handleDateClick(day)}
        >
          {day}
        </div>
      );
    });

    return [...emptyDays, ...dayCells];
  }, [
    ethiopianDate,
    selectedDate,
    todayEth,
    allowFutureDate,
    minGregTime,
    maxGregTime,
  ]);

  const canGoPrev =
    ethiopianDate.year > allowedMinYear || ethiopianDate.month > 1;

  const canGoNext =
    ethiopianDate.year < allowedMaxYear || ethiopianDate.month < 13;

  const hasError = Boolean(error);
  const errorMessage = typeof error === "string" ? error : null;
  const displayHelper = errorMessage || helperText;
  const resolvedPlaceholder =
    placeholder || localeData.placeholder || "dd/mm/yyyy";

  return (
    <div
      className={cn("datepicker-wrapper", className)}
      ref={pickerRef}
      style={wrapperStyle}
    >
      {label && (
        <label className="datepicker-label">
          {label} {required && <span className="required">*</span>}
        </label>
      )}

      <div className="datepicker-input-container">
        <input
          type="text"
          placeholder={resolvedPlaceholder}
          readOnly={readOnly}
          disabled={disabled}
          className={cn(
            "datepicker-input",
            hasError && "has-error",
            inputClassName
          )}
          style={inputStyle}
          value={inputValue}
          aria-haspopup="dialog"
          aria-expanded={showCalendar}
          onClick={() =>
            !readOnly && !disabled && setShowCalendar(!showCalendar)
          }
          onChange={(e) => {
            if (readOnly || disabled) return;

            let value = e.target.value;

            if (!showTime) {
              // 1️⃣ Remove everything except numbers
              value = value.replace(/[^\d]/g, "");

              // 2️⃣ Auto-insert "/" after dd and mm
              if (value.length >= 3)
                value = value.replace(/(\d{2})(\d)/, "$1/$2");
              if (value.length >= 6)
                value = value.replace(/(\d{2})\/(\d{2})(\d)/, "$1/$2/$3");

              // 3️⃣ Limit year to 4 digits only
              if (value.length > 10) value = value.slice(0, 10);
            }

            setInputValue(value);
            isTypingRef.current = true;
          }}
          onBlur={() => {
            if (readOnly || disabled || !inputValue) return;

            const match = inputValue.trim().match(
              /^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?(?:\s*(AM|PM|[^\s\d]+))?)?$/i
            );

            if (match) {
              const [, dStr, mStr, yStr, hStr, minStr, sStr, pStr] = match;
              const dd = Number(dStr);
              const mm = Number(mStr);
              const yyyy = Number(yStr);

              if (dd && mm && yyyy) {
                const greg = convertToGreg({ day: dd, month: mm, year: yyyy });
                const parsed = new Date(greg.year, greg.month - 1, greg.day);

                if (showTime) {
                  const parsedH = hStr
                    ? Number(hStr)
                    : parseInt(hours, 10) || 12;
                  const parsedMin = minStr
                    ? Number(minStr)
                    : parseInt(minutes, 10) || 0;
                  const parsedS = sStr
                    ? Number(sStr)
                    : parseInt(seconds, 10) || 0;

                  let p: "AM" | "PM" = period;
                  if (pStr) {
                    const upper = pStr.toUpperCase();
                    if (
                      upper.includes("P") ||
                      upper.includes(localeData.pm || "PM")
                    ) {
                      p = "PM";
                    } else if (
                      upper.includes("A") ||
                      upper.includes(localeData.am || "AM")
                    ) {
                      p = "AM";
                    }
                  }

                  let h24 = (parsedH % 12);
                  if (p === "PM") h24 += 12;

                  parsed.setHours(h24, parsedMin, parsedS, 0);

                  if (!isNaN(parsed.getTime())) {
                    setHours(String(parsedH).padStart(2, "0"));
                    setMinutes(String(parsedMin).padStart(2, "0"));
                    setSeconds(String(parsedS).padStart(2, "0"));
                    setPeriod(p);
                    handleDateClick(parsed, false);
                  }
                } else if (!isNaN(parsed.getTime())) {
                  handleDateClick(parsed, false);
                }
              }
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !disabled) {
              e.preventDefault();

              const match = inputValue.trim().match(
                /^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?(?:\s*(AM|PM|[^\s\d]+))?)?$/i
              );

              if (match) {
                const [, dStr, mStr, yStr, hStr, minStr, sStr, pStr] = match;
                const dd = Number(dStr);
                const mm = Number(mStr);
                const yyyy = Number(yStr);

                if (dd && mm && yyyy) {
                  const greg = convertToGreg({ day: dd, month: mm, year: yyyy });
                  const parsed = new Date(greg.year, greg.month - 1, greg.day);

                  if (showTime) {
                    const parsedH = hStr
                      ? Number(hStr)
                      : parseInt(hours, 10) || 12;
                    const parsedMin = minStr
                      ? Number(minStr)
                      : parseInt(minutes, 10) || 0;
                    const parsedS = sStr
                      ? Number(sStr)
                      : parseInt(seconds, 10) || 0;

                    let p: "AM" | "PM" = period;
                    if (pStr) {
                      const upper = pStr.toUpperCase();
                      if (
                        upper.includes("P") ||
                        upper.includes(localeData.pm || "PM")
                      ) {
                        p = "PM";
                      } else if (
                        upper.includes("A") ||
                        upper.includes(localeData.am || "AM")
                      ) {
                        p = "AM";
                      }
                    }

                    let h24 = parsedH % 12;
                    if (p === "PM") h24 += 12;

                    parsed.setHours(h24, parsedMin, parsedS, 0);

                    if (!isNaN(parsed.getTime())) {
                      setHours(String(parsedH).padStart(2, "0"));
                      setMinutes(String(parsedMin).padStart(2, "0"));
                      setSeconds(String(parsedS).padStart(2, "0"));
                      setPeriod(p);
                      handleDateClick(parsed, true);
                    }
                  } else if (!isNaN(parsed.getTime())) {
                    handleDateClick(parsed, true);
                  }
                }
              } else if (selectedDate) {
                setShowCalendar(false);
              }
            }
          }}
        />

        {/* Clear (✕) button */}
        {isClearable && inputValue && !disabled && !readOnly && (
          <button
            type="button"
            className="datepicker-clear-btn"
            aria-label="Clear date"
            title="Clear"
            onClick={(e) => {
              e.stopPropagation();
              handleClear();
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}

        {/* Calendar Toggle Icon */}
        <button
          type="button"
          disabled={disabled}
          aria-label="Toggle calendar"
          className="datepicker-icon-btn"
          onClick={() =>
            !readOnly && !disabled && setShowCalendar(!showCalendar)
          }
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        </button>
      </div>

      {displayHelper && (
        <span className={`datepicker-helper-text${hasError ? " error" : ""}`}>
          {displayHelper}
        </span>
      )}

      {showCalendar && !readOnly && !disabled && (
        <div
          className={cn("calendar-container", popupClassName)}
          style={popupStyle}
        >
          <CalendarHeader
            ethiopianDate={ethiopianDate}
            setEthiopianDate={setEthiopianDate}
            showMonthSelector={showMonthSelector}
            setShowMonthSelector={setShowMonthSelector}
            showYearSelector={showYearSelector}
            setShowYearSelector={setShowYearSelector}
            months={localeData.months}
            canGoPrev={canGoPrev}
            canGoNext={canGoNext}
          />

          {showMonthSelector && (
            <MonthSelector
              months={localeData.months}
              selectedMonth={ethiopianDate.month}
              setMonth={(month) => {
                setEthiopianDate((prev) => ({ ...prev, month }));
                setShowMonthSelector(false);
              }}
            />
          )}

          {showYearSelector && (
            <YearSelector
              years={years}
              selectedYear={ethiopianDate.year}
              setYear={(year) => {
                setEthiopianDate((prev) => ({ ...prev, year }));
                setShowYearSelector(false);
              }}
            />
          )}

          {!showMonthSelector && !showYearSelector && (
            <>
              <div className="calendar-with-time">
                <div className="day-grid-wrapper">
                  <div className="day-grid">
                    {localeData.weekdays.map((day, idx) => (
                      <div key={`${day}-${idx}`} className="day-header">
                        {day}
                      </div>
                    ))}
                    {calendarDays}
                  </div>
                </div>

                {showTime && (
                  <TimePicker
                    hours={hours}
                    minutes={minutes}
                    seconds={seconds}
                    period={period}
                    hoursInputRef={hoursInputRef}
                    minutesInputRef={minutesInputRef}
                    secondsInputRef={secondsInputRef}
                    onHoursChange={handleHoursChange}
                    onHoursBlur={handleHoursBlur}
                    onHoursKeyDown={handleHoursKeyDown}
                    onMinutesChange={handleMinutesChange}
                    onMinutesBlur={handleMinutesBlur}
                    onMinutesKeyDown={handleMinutesKeyDown}
                    onSecondsChange={handleSecondsChange}
                    onSecondsBlur={handleSecondsBlur}
                    onSecondsKeyDown={handleSecondsKeyDown}
                    onPeriodChange={handlePeriodChange}
                    localeData={localeData}
                  />
                )}
              </div>

              {/* Calendar Footer: Today, Clear Quick Actions & Apply */}
              {(showTodayButton || showClearButton || showTime) && (
                <div className="calendar-footer">
                  <div className="calendar-footer-actions">
                    {showTodayButton && (
                      <button
                        type="button"
                        className="calendar-footer-btn"
                        onClick={handleTodayClick}
                      >
                        {localeData.today || "Today"}
                      </button>
                    )}
                    {showClearButton && (
                      <button
                        type="button"
                        className="calendar-footer-btn clear"
                        onClick={handleClear}
                      >
                        {localeData.clear || "Clear"}
                      </button>
                    )}
                  </div>

                  {showTime && (
                    <button
                      type="button"
                      className="calendar-footer-btn apply"
                      onClick={handleApply}
                    >
                      {localeData.apply || "Apply"}
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export {
  BUILT_IN_LOCALES,
  getCalendarLocale,
  registerCalendarLocale,
  convertToEth,
  convertToGreg,
  formatDate,
  getDaysInMonth,
  getStartDayOfMonth,
  cn,
};
export type {
  CalendarLocale,
  DatePickerProps,
  SupportedLocale,
};


