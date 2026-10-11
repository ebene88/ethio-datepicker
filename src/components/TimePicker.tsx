import React from "react";
import { CalendarLocale } from "./types";
import { cn } from "../libs/utils";

export interface TimePickerProps {
  hours: string;
  minutes: string;
  seconds: string;
  period: "AM" | "PM";
  hoursInputRef: React.RefObject<HTMLInputElement | null>;
  minutesInputRef: React.RefObject<HTMLInputElement | null>;
  secondsInputRef: React.RefObject<HTMLInputElement | null>;
  onHoursChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onHoursBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
  onHoursKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onMinutesChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onMinutesBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
  onMinutesKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onSecondsChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSecondsBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
  onSecondsKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onPeriodChange: (p: "AM" | "PM") => void;
  localeData: CalendarLocale;
}

export const TimePicker: React.FC<TimePickerProps> = ({
  hours,
  minutes,
  seconds,
  period,
  hoursInputRef,
  minutesInputRef,
  secondsInputRef,
  onHoursChange,
  onHoursBlur,
  onHoursKeyDown,
  onMinutesChange,
  onMinutesBlur,
  onMinutesKeyDown,
  onSecondsChange,
  onSecondsBlur,
  onSecondsKeyDown,
  onPeriodChange,
  localeData,
}) => {
  return (
    <div className="time-wrapper">
      <div className="time-title">{localeData.time || "Time"}</div>
      <div className="time-inputs-col">
        <div className="time-digits">
          <input
            ref={hoursInputRef}
            type="text"
            inputMode="numeric"
            aria-label="Hours"
            placeholder={localeData.timePlaceholders?.hours || "12"}
            value={hours}
            onFocus={(e) => e.target.select()}
            onChange={onHoursChange}
            onBlur={onHoursBlur}
            onKeyDown={onHoursKeyDown}
            className="time-input"
          />
          <span className="time-separator">:</span>
          <input
            ref={minutesInputRef}
            type="text"
            inputMode="numeric"
            aria-label="Minutes"
            placeholder={localeData.timePlaceholders?.minutes || "00"}
            value={minutes}
            onFocus={(e) => e.target.select()}
            onChange={onMinutesChange}
            onBlur={onMinutesBlur}
            onKeyDown={onMinutesKeyDown}
            className="time-input"
          />
          <span className="time-separator">:</span>
          <input
            ref={secondsInputRef}
            type="text"
            inputMode="numeric"
            aria-label="Seconds"
            placeholder={localeData.timePlaceholders?.seconds || "00"}
            value={seconds}
            onFocus={(e) => e.target.select()}
            onChange={onSecondsChange}
            onBlur={onSecondsBlur}
            onKeyDown={onSecondsKeyDown}
            className="time-input"
          />
        </div>
        <div
          className="time-period-selector"
          role="group"
          aria-label="AM or PM"
        >
          <button
            type="button"
            className={cn("time-period-btn", period === "AM" && "active")}
            onClick={() => onPeriodChange("AM")}
          >
            AM
          </button>
          <button
            type="button"
            className={cn("time-period-btn", period === "PM" && "active")}
            onClick={() => onPeriodChange("PM")}
          >
            PM
          </button>
        </div>
      </div>
    </div>
  );
};
