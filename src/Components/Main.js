import React from 'react';
import ReactDOM from 'react-dom';
import moment from 'moment';
import {
    TextInput,
    Row,
    Column,
    Button,
} from '@omaxwellanderson/react-components';
import { v4 } from 'uuid';
// import

require('@omaxwellanderson/react-components/dist/main.css');
import DayPicker from 'react-day-picker/DayPickerInput'
import 'react-day-picker/lib/style.css';
import {
    formatDate,
} from 'react-day-picker/moment';

import SalaryDates from './SalaryDates';
import LineGraph from './LineGraph';
import testData, { data } from './test-data';
import { runScenario } from '../../budgeting_tool';

const formatString = 'YYYY-MM-DD';

function ConfigInput(props) {
    return (
        <Row>
            <Column sm={12}>
                <TextInput
                    label={props.label}
                    onChange={props.onChange}
                    value={props.value}
                />
            </Column>
        </Row>
    );
}

class App extends React.Component {
    constructor(props) {
        super(props);
        const startDate = moment();
        const endDate = moment().add(2, 'years');
        if (typeof Storage !== 'undefined' && localStorage.getItem('state')) {
            const state = JSON.parse(localStorage.getItem('state'));
            state.startDate = moment(state.startDate);
            state.endDate = moment(state.endDate);
            state.income = state.income.map(i => ({
                startDate: moment(i.startDate),
                endDate: moment(i.endDate),
                amount: i.amount,
            }));
            this.state = state;
        } else {
            this.state = {
                income: [],
                monthlySpend: 0,
                monthlyHousing: 0,
                contrib401k: 0,
                paycheckDeductions: 0,
                paychecksPerYear: 24,
                yearlyUnexpectedCosts: 0,
                startDate,
                endDate,
                currentSavings: 0,
                monthlyDebtPayments: 0,
            }
        }
    }

    onInputChange = (name, value) => {
        if (!isNaN(value)) {
            this.setState({ [name]: value });
        } else if (value === '.') {
            this.setState({ [name]: '0.' });
        }
    };

    onDateChange = (day, isEndDate = true) => {
        this.setState({ [isEndDate ? 'endDate' : 'startDate']: moment(day) });
    };

    addIncome = () => {
        const income = this.state.income.slice();
        const previous = income.length > 0 ? income[income.length - 1] : false;
        const startDate = previous ? previous.endDate : moment();
        const endDate = moment(startDate).add(1, 'year');
        income.push({
            id: v4(),
            startDate,
            endDate,
            amount: previous ? previous.amount : 0,
        });
        this.setState({ income });
    };

    onIncomeChange = (incomeId, value, name) => {
        const idx = this.state.income.findIndex(({ id }) => id === incomeId);
        console.log('idx', idx);
        const incomeCopy = this.state.income.slice();
        incomeCopy[idx][name] = ['startDate', 'endDate'].includes(name) ? moment(value) : value;
        this.setState({ income: incomeCopy });
    };

    getData = () => {
        const {
            income,
            monthlySpend,
            monthlyHousing,
            contrib401k,
            paycheckDeductions,
            yearlyUnexpectedCosts,
            startDate,
            endDate,
            currentSavings,
            monthlyDebtPayments,
        } = this.state;
        // validate income before running
        if (income.some(i => !(i.amount && i.startDate && i.endDate))
            || income.some(i => i.amount < 10000)
        ) {
            return [
                {
                    id: 'Savings',
                    color: 'hsl(11, 70%, 50%)',
                    data: [],
                }
            ]
        }
        // run those scenarios
        const scenarioOne = runScenario(
            'Main',
            {
                salaryTimeline: income,
                taxRate: 0.244398,
                paychecksPerYear: 24,
                deductions: Number(paycheckDeductions),
                contrib401k: Number(contrib401k),
            },
            {
                monthlySpend: Number(monthlySpend) + Number(monthlyDebtPayments),
                yearlyUnexpectedCosts: Number(yearlyUnexpectedCosts),
                monthlyMortgagePayment: Number(monthlyHousing),
            },
            Number(currentSavings),
            startDate,
            endDate,
        );
        // save state to localstorage
        if (typeof Storage !== 'undefined') {
            localStorage.setItem('state', JSON.stringify(this.state));
        }
        return [
            {
                id: 'Savings',
                color: 'hsl(11, 70%, 50%)',
                data: scenarioOne
            }
        ];
    };

    render() {
        const data = this.getData();
        console.log(data);
        return (
            <Row>
                <Column sm={12} md={2}>
                    <h2>Budgeting</h2>
                    <div>Start Date</div>
                    <DayPicker
                        onDayChange={(day) => this.setState({ startDate: moment(day) })}
                        format="YYYY-MM-DD"
                        placeholder="YYYY-MM-DD"
                        formatDate={formatDate}
                        value={this.state.startDate.format(formatString)}
                    />
                    <div>End Date</div>
                    <DayPicker
                        onDayChange={(day) => this.setState({ endDate: moment(day) })}
                        format="YYYY-MM-DD"
                        placeholder="YYYY-MM-DD"
                        formatDate={formatDate}
                        value={this.state.endDate.format(formatString)}
                    />
                    <ConfigInput
                        label="Current Savings"
                        onChange={(_, v) => this.onInputChange('currentSavings', v)}
                        value={this.state.currentSavings || ''}
                    />
                    <ConfigInput
                        label="401k Percentage"
                        onChange={(_, v) => this.onInputChange('contrib401k', v)}
                        value={this.state.contrib401k || ''}
                    />
                    <ConfigInput
                        label="Monthly Spend Average"
                        onChange={(_, v) => this.onInputChange('monthlySpend', v)}
                        value={this.state.monthlySpend || ''}
                    />
                    <ConfigInput
                        label="Monthly Paycheck Deductions"
                        onChange={(_, v) => this.onInputChange('paycheckDeductions', v)}
                        value={this.state.paycheckDeductions || ''}
                    />
                    <ConfigInput
                        label="Yearly Unexpected Costs"
                        onChange={(_, v) => this.onInputChange('yearlyUnexpectedCosts', v)}
                        value={this.state.yearlyUnexpectedCosts || ''}
                    />
                    <ConfigInput
                        label="Monthly Housing Costs (rent, mortgage)"
                        onChange={(_, v) => this.onInputChange('monthlyHousing', v)}
                        value={this.state.monthlyHousing || ''}
                    />
                    {
                        this.state.income.map(s => (
                            <SalaryDates
                                id={s.id}
                                onStartChange={(...params) => this.onIncomeChange(...params, 'startDate')}
                                startDate={s.startDate}
                                onEndChange={(...params) => this.onIncomeChange(...params, 'endDate')}
                                endDate={s.endDate}
                                onAmountChange={(...params) => this.onIncomeChange(...params, 'amount')}
                                amount={s.amount}
                            />
                        ))
                    }
                    <Button
                        onClick={this.addIncome}

                    >
                        + Add Income Date Range
                    </Button>
                    <div>
                        Your salary is ${this.state.salary}
                    </div>
                </Column>
                <Column sm={12} md={10}>
                    <div style={{ height: `${window.innerHeight}px` }}>
                        <LineGraph
                            data={data}
                            xAxisLabel="Date"
                            yAxisLabel="Money"
                        />
                    </div>
                </Column>
            </Row>
        );
    }
}

if (document.getElementById('root')) {
    ReactDOM.render(<App />, document.getElementById('root'));
}
