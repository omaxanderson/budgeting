import React from 'react';
import {
    Row,
    Column,
    TextInput,
} from "@omaxwellanderson/react-components";
import DayPicker from "react-day-picker/DayPickerInput";
import { formatDate } from "react-day-picker/moment";

export default class SalaryDates extends React.PureComponent {
    render() {
        const {
            onStartChange,
            onEndChange,
            onAmountChange,
            startDate,
            endDate,
            amount,
            id
        } = this.props;
        return (
            <>
                <Row>
                    <Column sm={12}>
                        <div>Start Date</div>
                        <DayPicker
                            onDayChange={(day) => onStartChange(id, day)}
                            format="YYYY-MM-DD"
                            placeholder="YYYY-MM-DD"
                            formatDate={formatDate}
                            value={startDate.format('YYYY-MM-DD')}
                        />
                    </Column>
                    <Column sm={12}>
                        <div>End Date</div>
                        <DayPicker
                            onDayChange={(day) => onEndChange(id, day)}
                            label="Hello World"
                            format="YYYY-MM-DD"
                            placeholder="YYYY-MM-DD"
                            formatDate={formatDate}
                            value={endDate.format('YYYY-MM-DD')}
                        />
                    </Column>
                </Row>
                <Row>
                    <Column sm={12}>
                        <TextInput
                            label="Salary"
                            value={amount || ''}
                            onChange={(_, v) => onAmountChange(id, v)}
                        />
                    </Column>
                </Row>
            </>
        );
    }
}
