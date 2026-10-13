# 🇪🇹 ethiopian-calendar-picker

A form-ready, responsive, and customizable **Ethiopian Calendar Date Picker** for React.

- 🌐 **Localized by Default**: Built-in support for **Amharic (`am`)**, **Afaan Oromoo (`or`)**, and **English (`en`)**.
- 🔌 **Extensible**: Register any language (e.g. Tigrinya, Somali, Sidama) or pass custom inline dictionaries.
- 🔄 **Bidirectional Gregorian Conversion**: Renders the Ethiopian calendar to users, but passes standard **Gregorian ISO timestamps** (`2024-09-11T...`) to your database/backend form state.
- 📐 **Form-Fit & Customizable**: Standard form height (`40px`), responsive popup dropdown, custom widths (`100%`, `320px`, etc.), validation error states, and CSS custom properties (variables).
- 🌓 **Dark Mode Ready**: Automatic system theme detection and manual `.dark` class support.
- ♿ **Keyboard & Quick Actions**: Escape to close, 1-click **Today (ዛሬ)** and **Clear (አጽዳ)** footer buttons, and inline clear `✕` button.

---

## Installation

```bash
npm install ethiopian-calendar-picker
# or
pnpm add ethiopian-calendar-picker
# or
yarn add ethiopian-calendar-picker
```

Import the styles in your main entry file (e.g. `main.tsx` or `_app.tsx`):

```tsx
import "ethiopian-calendar-picker/style.css";
```

---

## Quick Start

### 1. Controlled / Standalone Usage

```tsx
import React, { useState } from "react";
import { EthioDatePicker } from "ethiopian-calendar-picker";
import "ethiopian-calendar-picker/style.css";

export function MyComponent() {
  const [date, setDate] = useState<Date | null>(new Date());

  return (
    <EthioDatePicker
      label="የመነሻ ቀን (Start Date)"
      locale="am" // 'am' | 'or' | 'en'
      value={date}
      onChange={(gregorianDate) => setDate(gregorianDate)}
    />
  );
}
```

### 2. Integration with `react-hook-form`

```tsx
import { useForm, FormProvider } from "react-hook-form";
import { EthioDatePicker } from "ethiopian-calendar-picker";

export function FormExample() {
  const methods = useForm({
    defaultValues: {
      birthDate: "2024-09-11T00:00:00.000Z", // Stored in DB as Gregorian ISO
    },
  });

  const onSubmit = (data) => {
    console.log("Submitting to backend:", data.birthDate);
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        <EthioDatePicker
          name="birthDate"
          label="Birth Date"
          locale="am"
          required
        />
        <button type="submit">Submit</button>
      </form>
    </FormProvider>
  );
}
```

---

## Props Reference

| Prop | Type | Default | Description |
|:---|:---|:---|:---|
| `name` | `string` | — | Field name for `react-hook-form` integration. |
| `label` | `string` | — | Label displayed above the input. |
| `value` | `Date \| string` | — | Gregorian date object or ISO string. |
| `onChange` | `(date: Date \| null) => void` | — | Callback fired with the selected Gregorian `Date`. |
| `locale` | `'am' \| 'or' \| 'en' \| string` | `'am'` | Language code for calendar months, days, and labels. |
| `customLocale` | `Partial<CalendarLocale>` | — | Custom inline month names, weekdays, and labels. |
| `allowFutureDate` | `boolean` | `false` | When `false`, allows all months and days of the current year (and prior years down to 1926). When `true`, unlocks future years. |
| `futureYears` | `number` | `10` | Number of future years allowed when `allowFutureDate={true}`. |
| `minYear` | `number` | `1926` | Minimum selectable Ethiopian year. |
| `maxYear` | `number` | — | Explicit maximum Ethiopian year override. |
| `minDate` | `Date \| string` | — | Disables days before this Gregorian date. |
| `maxDate` | `Date \| string` | — | Disables days after this Gregorian date. |
| `showTime` | `boolean` | `false` | Enables time selector (hours, minutes, seconds). |
| `width` | `string \| number` | `'100%'` | Component width (e.g. `'100%'`, `320`, `'340px'`). |
| `isClearable` | `boolean` | `true` | Shows inline `✕` clear button when input has a value. |
| `showTodayButton`| `boolean` | `true` | Displays **Today (ዛሬ)** quick action button in footer. |
| `showClearButton`| `boolean` | `true` | Displays **Clear (አጽዳ)** quick action button in footer. |
| `error` | `string \| boolean` | — | Highlights input in red and displays error message. |
| `helperText` | `string` | — | Descriptive helper text beneath the input. |
| `disabled` | `boolean` | `false` | Disables input and calendar dropdown. |
| `readOnly` | `boolean` | `false` | Prevents editing. |
| `required` | `boolean` | `false` | Renders required red asterisk `*`. |
| `className` | `string` | — | Custom CSS class on wrapper. |
| `inputClassName` | `string` | — | Custom CSS class on `<input>`. |
| `popupClassName` | `string` | — | Custom CSS class on dropdown card. |

---

## Adding Custom Languages

You can register any language globally using `registerCalendarLocale`:

```tsx
import { registerCalendarLocale, EthioDatePicker } from "ethiopian-calendar-picker";

registerCalendarLocale("ti", {
  name: "Tigrinya",
  months: [
    "መስከረም", "ጥቅምቲ", "ሕዳር", "ታሕሳስ", "ጥሪ", "የካቲት",
    "መጋቢት", "ሚያዝያ", "ግንቦት", "ሰነ", "ሓምለ", "ነሓሰ", "ጳጉሜ"
  ],
  weekdays: ["ሰን", "ሰኑ", "ሰሉ", "ረቡ", "ሓሙ", "ዓር", "ቀዳ"],
  placeholder: "መዓ/ወር/ዓመ",
  today: "ሎሚ",
  clear: "ኣጽርይ",
  timePlaceholders: {
    hours: "ሰዓ",
    minutes: "ደቒ",
    seconds: "ካሊ",
  },
});

// Now use anywhere:
<EthioDatePicker locale="ti" />
```

---

## Standalone Conversion Utilities

Import conversion functions directly without rendering the UI:

```tsx
import {
  convertToEth,
  convertToGreg,
  formatDate,
  getDaysInMonth,
} from "ethiopian-calendar-picker";

// Gregorian to Ethiopian
const eth = convertToEth({ day: 11, month: 9, year: 2024 });
// => { year: 2017, month: 1, day: 1 }

// Ethiopian to Gregorian
const greg = convertToGreg({ day: 1, month: 1, year: 2017 });
// => { year: 2024, month: 9, day: 11 }
```

---

## Theming & Dark Mode

Override CSS custom properties in your stylesheet:

```css
:root {
  --ethio-primary: #2563eb;       /* Primary blue accent */
  --ethio-bg: #ffffff;            /* Background */
  --ethio-text: #0f172a;          /* Text */
  --ethio-border: #cbd5e1;        /* Border */
  --ethio-radius: 8px;           /* Rounded corners */
}

/* Dark mode */
.dark {
  --ethio-primary: #3b82f6;
  --ethio-bg: #0f172a;
  --ethio-bg-card: #1e293b;
  --ethio-text: #f8fafc;
  --ethio-border: #334155;
}
```

---

## Acknowledgements

- Special thanks to [@yaredtaye](https://github.com/yaredtaye) for [react-native-ethiopian-calendar](https://github.com/yaredtaye/react-native-ethiopian-calendar). The Ethiopian ↔ Gregorian calendar conversion algorithms in this library are adapted from their implementation.

---

## License

MIT © 2026
