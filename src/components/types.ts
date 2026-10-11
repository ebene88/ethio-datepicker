export interface DatePickerProps {
  name?: string;
  label?: string;
  value?: string | Date;
  onChange?: (date: Date | null) => void;
  readOnly?: boolean;
  showTime?: boolean;
}

export interface EthiopianDate {
  year: number;
  month: number;
}
