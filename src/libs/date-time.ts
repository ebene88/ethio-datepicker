const offset = 79372;

type TDate = {
  day: number;
  month: number;
  year: number;
};

//BELOW IS ETHIOPIAN TO GREGORIAN CALENDAR CONVERSION ALGORITHM
function getGregDays({ day, month, year }: TDate) {
  let curr_offset = 0,
    total_leap = 0;

  for (let i = 1753; i < year; i++) {
    if (i % 4 == 3) total_leap++;
  }
  curr_offset =
    (year - 1753) * 365 + total_leap + 253 + day - 1 + (month - 1) * 30;
  return curr_offset;
}

export function convertToGreg({ day, month, year }: TDate) {
  let timeMarker = 0,
    leapYear = 0,
    GMonth,
    GDate,
    GYear = 1760,
    days = getGregDays({ day, month, year });

  const generalCalendarDate = { year: 0, month: 0, day: 0 };

  while (timeMarker == 0) {
    if ((GYear % 4 == 0 && GYear % 100 != 0) || GYear % 400 == 0) {
      if (days >= 366) {
        days = days - 366;
        GYear++;
      } else timeMarker = 1;
    } else {
      if (days >= 365) {
        days = days - 365;
        GYear++;
      } else timeMarker = 1;
    }
  }
  if ((GYear % 4 == 0 && GYear % 100 != 0) || GYear % 400 == 0) leapYear = 1;
  if (days == 0) {
    GYear--;
    GMonth = 12;
    GDate = 31;
  } else {
    GMonth = calculateGCMonth({ days, leap: leapYear });
    GDate = days - totalMonthDay({ year: GYear, month: GMonth });
    if (GDate == 0) GDate++;
  }
  generalCalendarDate.year = GYear;
  generalCalendarDate.month = GMonth;
  generalCalendarDate.day = GDate;

  return generalCalendarDate;
}

const calculateGCMonth = ({ days, leap }: { days: number; leap: number }) => {
  let month = 1;
  const months = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (leap == 1) months[1] += 1;
  for (let i = 0; i < 12; i++) {
    if (days > months[i]) {
      days = days - months[i];
      month++;
    } else break;
  }
  return month;
};

const totalMonthDay = ({ year, month }: { year: number; month: number }) => {
  let month_days = 0;
  const months = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if ((year % 4 == 0 && year % 100 != 0) || year % 400 == 0) months[1] += 1;
  for (let i = 0; i < month - 1; i++) {
    month_days += months[i];
  }
  return month_days;
};

//BELOW IS GREGORIAN TO ETHIOPIAN CALENDAR CONVERSION ALGORITHM
const getEtDays = ({ day, month, year }: TDate) => {
  let curr_offset = 0,
    tot_leap = 0,
    i,
    leap;
  let month_days = 0;

  if (year >= 1970) {
    for (i = 1970; i < year; i++) {
      if ((i % 4 == 0 && i % 100 != 0) || i % 400 == 0) {
        tot_leap++;
      }
    }
    curr_offset = (year - 1970) * 365 + day - 1 + tot_leap;
    if ((year % 4 == 0 && year % 100 != 0) || year % 400 == 0) {
      leap = 1;
    } else leap = 0;
  } else {
    for (i = year; i < 1970; i++) {
      if ((i % 4 == 0 && i % 100 != 0) || i % 400 == 0) {
        tot_leap++;
      }
    }
    curr_offset = (1970 - year) * 365 - day + tot_leap;
    curr_offset = ~curr_offset;
    if ((year % 4 == 0 && year % 100 != 0) || year % 400 == 0) {
      leap = 1;
    } else leap = 0;
  }
  //CALCULATES TOTAL DAYS OF THE MONTHS (OBTAINED FROM INPUT!)
  if (month > 4 && month < 9) {
    if (month % 2 != 0) month_days = (month - 1) * 30 + (month - 5) / 2;
    else month_days = (month - 1) * 30 + (month - 4) / 2;
  } else if (month >= 9) {
    if (month % 2 != 0) month_days = (month - 1) * 30 + (month - 3) / 2;
    else month_days = (month - 1) * 30 + (month - 4) / 2;
  } else {
    if (month == 4) month_days = (month - 1) * 30;
    else if (month == 3) month_days = (month - 1) * 30 - 1;
    else if (month == 2) month_days = (month - 1) * 30 + 1;
    else month_days = 0;
  }
  if (leap == 1 && month > 2) {
    month_days += 1;
  }
  curr_offset += month_days;
  curr_offset += offset; // + temp;

  return curr_offset;
};

export const convertToEth = ({
  day,
  month,
  year,
}: {
  day: number;
  month: number;
  year: number;
}) => {
  let mark = 0;
  const ethdate = { year: 0, month: 0, day: 0 };
  let EMonth,
    EDate,
    EYear = 1745,
    days = getEtDays({ day, month, year });

  while (mark == 0) {
    if (EYear % 4 == 3) {
      if (days >= 366) {
        days = days - 366;
        EYear++;
      } else mark = 1;
    } else {
      if (days >= 365) {
        days = days - 365;
        EYear++;
      } else mark = 1;
    }
  }
  if (days == 0) {
    EYear -= 1;
    EMonth = 13;
    EDate = 5 + (EYear % 4 == 3 ? 1 : 0);
  } else {
    EMonth = Math.ceil(days / 30.0);
    if (days % 30 == 0) EDate = 30;
    else EDate = days % 30;
  }
  ethdate.year = EYear;
  ethdate.month = EMonth;
  ethdate.day = EDate;

  return ethdate;
};
