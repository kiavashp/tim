'use strict';

const assert = require('assert');
const React = require('react');
const moment = require('moment');
const momentDurationFormat = require('moment-duration-format');

momentDurationFormat(moment);

class Reports extends React.Component {
    constructor(props) {
        super(props);

        this.buildReports = this.buildReports.bind(this);
        this.timers = props.timers;
        this.createExport = props.createExport;
        this.openDataDirectory = props.openDataDirectory;

        this.state = {
            open: false,
            reports: []
        };
    }

    static getDerivedStateFromProps(props, state) {
        return {
            open: props.open
        };
    }

    componentDidMount() {
        const {timers} = this;

        timers.load();

        timers.on('update', this.buildReports);

        this.buildReports();
    }

    componentWillUnmount() {
        timers.removeListener('update', this.buildReports);
    }

    buildReports() {
        const reports = this.createReports();

        this.setState({
            reports: reports
        });
    }

    getDates(timeshift) {
        assert.strictEqual(typeof timeshift, 'number', 'timeshift must be a number');

        const yearShift = (timeshift / 24) | 0;
        const monthShift = ((timeshift % 24) / 2) | 0;
        const biMonthShift = (timeshift % 24) % 2;
        let now = new Date();
        let year = now.getFullYear() + yearShift;
        let month = now.getMonth() + monthShift;
        let date = now.getDate();
        let start;
        let end;

        if (biMonthShift) {
            date = date < 15 ? 16 : 1;
        }

        if (date < 15) {
            start = new Date(year, month, 1);
            end = new Date(year, month, 15);
        } else {
            start = new Date(year, month, 16);
            end = new Date(year, month + 1, 0);
        }

        return {start, end};
    }

    calcDatePercentage({start, end}, now) {
        let range = end.getDate() - start.getDate();
        let diff = (now.getDate() - start.getDate()) / range;
        let percent = diff * 100;
        return percent.toFixed(0);
    }

    createReports() {
        const {timers} = this;
        const reports = [];
        let timeshift = 0;
        let dates;
        let times;

        while (
            (dates = this.getDates(timeshift)) &&
            (times = timers.getRange(dates.start, dates.end)).length
        ) {
            let report = {
                start: dates.start,
                end: dates.end,
                hours: 0,
                future: timeshift >= 0,
                progress: this.calcDatePercentage(dates, new Date())
            };

            times.forEach(timer => {
                const {date, startTime, endTime} = timer;
                const start = moment(`${date}T${startTime}`).toDate();
                const end = moment(`${date}T${endTime}`).toDate();
                let hours = (end - start) / 36e5;

                report.id = report.id || timer.id;
                report.hours += hours;
            });

            reports.push(report);

            timeshift -= 1;
        }

        return reports;
    }

    render() {
        const {createExport} = this;
        const {open, reports} = this.state;

        return (
            <div className={`reports ${open ? 'open' : ''}`}>
                {reports.map(report => {
                    const {id, start, end, hours, future, progress} = report;
                    return (<div key={id} className="reports-item" title={future ? `${progress}% through invoice period` : null}>
                        {future
                            ? <div className="report-item-progress"
                                style={{width: `${progress}%`}}></div>
                            : ''}
                        <div className="reports-item-left">
                            <div className="reports-item-date">{moment(end).format('MMMM D YYYY')}</div>
                            <div className="reports-item-hours">{moment.duration(hours, 'hours').format('h [hrs] m [mins]', {trim: false})}</div>
                        </div>
                        <div className="reports-item-export"
                            title="export"
                            onClick={() => createExport({start, end})}></div>
                    </div>);
                })}
                <div className="reports-open-data-directory"
                    onClick={() => this.openDataDirectory()}>open time-data</div>
            </div>
        );
    }
}

module.exports = Reports;
