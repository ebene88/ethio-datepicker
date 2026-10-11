export type BuiltInLocale = "en" | "am" | "or";
export type SupportedLocale = BuiltInLocale | (string & {});

export interface CalendarLocale {
  name?: string;
  months: readonly string[]; // 13 months: Meskerem ... Pagume
  weekdays: readonly string[]; // 7 weekdays: Sun ... Sat
  placeholder?: string;
  today?: string;
  clear?: string;
  apply?: string;
  am?: string;
  pm?: string;
  time?: string;
  timePlaceholders?: {
    hours?: string;
    minutes?: string;
    seconds?: string;
  };
}

export interface DatePickerProps {
  name?: string;
  label?: string;
  value?: string | Date;
  onChange?: (date: Date | null) => void;
  readOnly?: boolean;
  disabled?: boolean;
  required?: boolean;
  showTime?: boolean;
  locale?: SupportedLocale;
  customLocale?: Partial<CalendarLocale>;
  placeholder?: string;

  // Customization & form-fit props
  width?: string | number;
  className?: string;
  inputClassName?: string;
  popupClassName?: string;
  style?: React.CSSProperties;
  inputStyle?: React.CSSProperties;
  popupStyle?: React.CSSProperties;
  error?: string | boolean;
  helperText?: string;

  // Quick actions & clearable
  isClearable?: boolean;
  showTodayButton?: boolean;
  showClearButton?: boolean;

  // Year range & date boundary props
  allowFutureDate?: boolean;
  futureYears?: number;
  minYear?: number;
  maxYear?: number;
  minDate?: Date | string;
  maxDate?: Date | string;
}

export interface EthiopianDate {
  year: number;
  month: number;
}

