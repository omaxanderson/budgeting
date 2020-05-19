import * as moment from 'moment';
type Moment = moment.Moment;

interface SalaryBlock {
   startDate: Moment;
   endDate: Moment;
   amount: number;
}

export interface PaycheckOptions {
   // salary: number;
   salaryTimeline: SalaryBlock[];
   taxRate: number;
   paychecksPerYear: number;
   deductions?: number;
   contrib401k?: number;
}

export interface SpendingOptions {
   monthlySpend: number;
   monthlyMortgagePayment: number;
   yearlyUnexpectedCosts?: number;
}

const TAX_RATE = 0.244389;

export function calculatePaycheck(salary, options: PaycheckOptions): number {
   const {
     taxRate,
     paychecksPerYear,
     deductions = 0,
     contrib401k = 0,
   } = options;
   const baseAmount = salary / paychecksPerYear;
   const taxDeductions = baseAmount * taxRate;
   const fourOhOneKayDeductions = baseAmount * contrib401k;
   return Number((baseAmount - taxDeductions - fourOhOneKayDeductions - deductions).toFixed(2));
}

export function getSalary(date: Moment, salaries: SalaryBlock[]): number {
   const salary = salaries.find(s => date.isAfter(s.startDate) && date.isSameOrBefore(s.endDate))?.amount;
   if (salary) {
      return salary;
   }
   return salaries.reduce((acc, cur) => {
      if (cur.endDate.isAfter(acc.endDate)) {
         acc.amount = cur.amount;
         acc.endDate = cur.endDate;
      }
      return acc;
   }, { endDate: moment(), amount: 0 })?.amount;
}

export function isPayDay(date: Moment): boolean {
   return [1, 16].includes(date.date());
}

function amountOrZero(amount) {
  return isNaN(amount) ? 0 : amount;
}

export function runScenario(
  name: string,
  options: PaycheckOptions,
  spendingOptions: SpendingOptions,
  startingSavings: number,
  startDate: Moment,
  endDate: Moment,
) {
  const currentDay = moment(startDate);
  const savings = [{
     x: currentDay.format('YYYY-MM-DD'),
     y: Number(startingSavings),
   }];
   // console.log(currentDay.isAfter(endDate));
   while (!currentDay.isAfter(endDate)) {
      if (isPayDay(currentDay)) {
         // options.salary = getSalary(currentDay, options.salaryTimeline);
         const salary = getSalary(currentDay, options.salaryTimeline);
         // console.log('salary', salary);
         const nextPaycheck = calculatePaycheck(salary, options);
         const previousSavings = savings[savings.length - 1].y;
         savings.push({
           x: currentDay.format('YYYY-MM-DD'),
           y: Number((previousSavings
             + nextPaycheck
             - amountOrZero(options.deductions / 2)
             - amountOrZero(spendingOptions.monthlySpend / 2)
             - amountOrZero(spendingOptions.yearlyUnexpectedCosts / 12)
             - amountOrZero(spendingOptions.monthlyMortgagePayment / 2)
           ).toFixed(2)),
         });
         /*
         savings += nextPaycheck;
         savings -= options.deductions / 2;
         spending += spendingOptions.monthlySpend / 2;
         if (spendingOptions.yearlyUnexpectedCosts) {
           spending += spendingOptions.yearlyUnexpectedCosts / options.paychecksPerYear;
         }
          */
         // mortgageSpending += spendingOptions.monthlyMortgagePayment / 2;
      }
      currentDay.add(1, 'day');
   }
   return savings;

   // console.log(name);
  /*
   const results = [
     ['Range', `${startDate.format('YYYY-MM-DD')} - ${currentDay.format('YYYY-MM-DD')}`],
     ['Starting Savings', startingSavings],
     ['Ending Savings', savings - spending - mortgageSpending],
     ['Gross Income', savings - startingSavings],
     ['Spending Total', spending],
     ['Mortgage Payment Total', mortgageSpending],
     ['Savings without Mortgage', savings - spending],
   ];
   return results;
   */
}

function numberWithCommas(x: number): string {
   return x.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function printResult(name: string, value: number | string): void {
   const formattedValue = typeof value === 'number' ? `$${numberWithCommas(value)}` : value;
   console.log(name, formattedValue);
}

function printResults(arr: [String, number | string][]): void {
   const maxNameLength = arr.reduce((acc, [name]) => {
      if (name.length > acc) {
         return name.length;
      }
      return acc;
   }, 0) + 2;
   arr.map(([name, value]) => {
      printResult(`${name}:`.padEnd(maxNameLength, ' '), value);
   });
   console.log('-------------------------');
}

/*
const startingSavings = 32000;
let salaryTimeline: SalaryBlock[] = [
  {
    start: moment().subtract(1, 'day'),
    end: moment('2020-07-01'),
    amount: 58500.14,
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
/*
runScenario(
  'Full responsibility for mortgage',
  {
  //   salary: 58500.24,
    salaryTimeline: salaryTimeline,
    taxRate: TAX_RATE,
    contrib401k: .2,
    paychecksPerYear: 24,
    deductions: 11.92,
  }, {
    monthlySpend: 1200,
    monthlyMortgagePayment: 2000,
  },
  startingSavings,
  moment(),
  moment('2021-12-31'),
);

runScenario(
  '10% 401k contribution',
  {
  //    salary: 58500.24,
    salaryTimeline: salaryTimeline,
     taxRate: TAX_RATE,
     contrib401k: .1,
     paychecksPerYear: 24,
     deductions: 11.92,
  }, {
     monthlySpend: 1200,
     monthlyMortgagePayment: 2000,
  },
  startingSavings,
  moment(),
  moment('2021-12-31'),
);

runScenario(
  'Mortgage shared with renters, 10% 401k',
  {
  //    salary: 58500.24,
    salaryTimeline: salaryTimeline,
     taxRate: TAX_RATE,
     contrib401k: .1,
     paychecksPerYear: 24,
     deductions: 11.92,
  }, {
     monthlySpend: 1200,
     monthlyMortgagePayment: 800,
  },
  startingSavings,
  moment(),
  moment('2021-12-31'),
);

runScenario(
  'Mortgage shared with renters, 10% 401k, $5k unexpected costs included',
  {
  //   salary: 58500.24,
    salaryTimeline: salaryTimeline,
    taxRate: TAX_RATE,
    contrib401k: .1,
    paychecksPerYear: 24,
    deductions: 11.92,
  }, {
    monthlySpend: 1200,
    monthlyMortgagePayment: 800,
    yearlyUnexpectedCosts: 5000,
  },
  startingSavings,
  moment(),
  moment('2021-12-31'),
);

runScenario(
  'Mortgage shared with renters, 10% 401k, $5k unexpected costs included, very tight budgeting',
  {
    // salary: 58500.24,
    salaryTimeline: salaryTimeline,
    taxRate: TAX_RATE,
    contrib401k: .1,
    paychecksPerYear: 24,
    deductions: 11.92,
  }, {
    monthlySpend: 700,
    monthlyMortgagePayment: 800,
    yearlyUnexpectedCosts: 5000,
  },
  startingSavings,
  moment(),
  moment('2021-12-31'),
);

runScenario(
  'Mortgage shared with renters, 10% 401k, $5k unexpected costs included, very tight budgeting',
  {
    // salary: 58500.24,
    salaryTimeline: salaryTimeline,
    taxRate: TAX_RATE,
    contrib401k: .1,
    paychecksPerYear: 24,
    deductions: 11.92,
  }, {
    monthlySpend: 700,
    monthlyMortgagePayment: 800,
    yearlyUnexpectedCosts: 5000,
  },
  startingSavings,
  moment(),
  moment('2021-12-31'),
);
 */
