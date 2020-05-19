import {
  calculatePaycheck,
  getSalary,
  isPayDay,
  PaycheckOptions,
} from './budgeting_tool';
import * as moment from 'moment';

const salaryTimeline = [
  {
    start: moment('2020-05-17'),
    end: moment('2020-07-01'),
    amount: 58000,
  },
  {
    start: moment('2020-07-01'),
    end: moment('2020-07-31'),
    amount: 65000,
  },
  {
    start: moment('2020-07-31'),
    end: moment('2023-01-01'),
    amount: 80000,
  },
];

describe('Budgeting tool', () => {
  it('Should get the correct salary', () => {
    expect(getSalary(moment('2020-05-18'), salaryTimeline)).toEqual(58000);
    expect(getSalary(moment('2020-07-01'), salaryTimeline)).toEqual(58000);
    expect(getSalary(moment('2020-07-02'), salaryTimeline)).toEqual(65000);
    expect(getSalary(moment('2020-08-03'), salaryTimeline)).toEqual(80000);
    expect(getSalary(moment('2025-08-03'), salaryTimeline)).toEqual(80000);
  });

  it('Should get the correct take-home pay', () => {
    const options: PaycheckOptions = {
      // salary: 50000,
      salaryTimeline,
      taxRate: 0.3,
      contrib401k: .2,
      paychecksPerYear: 24,
      deductions: 12,
    };
    // 2,083 per paycheck - $625 tax - 416.67 - 12 = 1,029.66
    expect(calculatePaycheck(options)).toEqual(1029.67)
  });

  it('Should get the correct take-home pay', () => {
    const options: PaycheckOptions = {
      salary: 58500.24,
      taxRate: 0.244389,
      contrib401k: 0.19959,
      paychecksPerYear: 24,
      deductions: 11.92,
    };
    // allow for some error
    expect(Math.abs(calculatePaycheck(options) - 1341.18)).toBeLessThan(15)
  });

  it('Should tell you correct pay days', () => {
    expect(isPayDay(moment('2020-05-15'))).toBe(true);
    expect(isPayDay(moment('2027-12-15'))).toBe(true);
    expect(isPayDay(moment('2020-06-30'))).toBe(true);
    expect(isPayDay(moment('2020-12-31'))).toBe(true);
    expect(isPayDay(moment('2020-05-16'))).toBe(false);
    expect(isPayDay(moment('2027-01-14'))).toBe(false);
    expect(isPayDay(moment('2020-06-29'))).toBe(false);
    expect(isPayDay(moment('2020-01-01'))).toBe(false);
  })
});
