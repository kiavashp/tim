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
        this.openUserExporterDirectory = props.openUserExporterDirectory;

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
        const {timers} = this;

        timers.removeListener('update', this.buildReports);
    }

    transferVisualState(oldReports, newReports) {
        const oldIndex = {};

        newReports.forEach((report, index) => {
            oldIndex[report.id] = index;
        });

        for (let report of oldReports) {
            if (oldIndex.hasOwnProperty(report.id)) {
                let index = oldIndex[report.id];
                newReports[index].showTimers = report.showTimers;
            }
        }
    }

    buildReports() {
        const {reports: oldReports} = this.state;
        const newReports = this.createReports();

        if (oldReports.length) {
            this.transferVisualState(oldReports, newReports);
        }

        this.setState({
            reports: newReports
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
            if (date < 15) {
                month -= 1;
                date = 16;
            } else {
                date = 1;
            }
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
        if (end < now) {
            return 100;
        } else if (start > now) {
            return 0;
        }
        let range = end.getDate() - start.getDate();
        let diff = (now.getDate() - start.getDate()) / range;
        let percent = diff * 100;
        return percent.toFixed(0);
    }

    calcHours(start, end) {
        return (end - start) / 36e5;
    }

    calcDateChange(start, end) {
        return end.getDate() - start.getDate();
    }

    createReports() {
        const {timers} = this;
        const reports = [];
        let timeshift = 0;
        let firstDate = timers.getFirstDate();
        let dates;
        let times;

        do {
            dates = this.getDates(timeshift);
            times = timers.getRange(dates.start, dates.end);

            let report = {
                id: moment(dates.start).format('YYYY-MM-DD'),
                start: dates.start,
                end: dates.end,
                hours: 0,
                future: timeshift >= 0,
                progress: this.calcDatePercentage(dates, new Date()),
                timers: [],
                showTimers: false,
                empty: true
            };
            let currentDate;

            times.reverse().forEach(timer => {
                const date = moment(timer.start).format('YYYY-MM-DD');
                const start = new Date(timer.start);
                const end = new Date(timer.end);
                const hours = this.calcHours(start, end);
                const dateChange = this.calcDateChange(start, end);
                const time = {start, end, dateChange};

                if (!currentDate || currentDate.date !== date) {
                    currentDate = {
                        id: timer.id,
                        date: date,
                        hours: hours,
                        times: [time]
                    };
                    report.timers.push(currentDate);
                } else if (currentDate.date === date) {
                    currentDate.times.push(time);
                    currentDate.hours += hours;
                }

                report.empty = false;
                report.hours += hours;
            });

            reports.push(report);

            timeshift -= 1;
        } while (
            dates.start >= firstDate
        )

        return reports;
    }

    onReportClick(event, index) {
        const {reports} = this.state;
        const newReports = reports.slice();
        const showTimers = newReports[index].showTimers;

        newReports[index] = Object.assign({}, newReports[index], {
            showTimers: !showTimers
        });

        this.setState({
            reports: newReports
        });
    }

    onReportExport(event, dates) {
        event.stopPropagation();
        this.createExport(dates);
    }

    render() {
        const {open, reports} = this.state;

        return (
            <div className={`reports ${open ? 'open' : ''}`}>
                {reports.map((report, index) => {
                    const {id, start, end, hours, future, progress, timers, showTimers, empty} = report;
                    return (<div key={id}
                        className={`reports-item ${future ? 'future' : ''} ${showTimers ? 'showTimers' : ''} ${empty ? 'empty' : ''}`}>
                        <div className="reports-item-main"
                            title={future ? `${progress}% through invoice period` : null}
                            onClick={event => this.onReportClick(event, index)}>
                            <div className="reports-item-left">
                                <div className="reports-item-date">{moment(end).format('MMMM D YYYY')}</div>
                                <div className="reports-item-hours">
                                {moment.duration(hours, 'hours').format('h [hrs] m [mins]', {trim: false})}
                                </div>
                            </div>
                            <div className="reports-item-export"
                                title="export"
                                onClick={event => this.onReportExport(event, {start, end})}></div>
                            <div className="reports-item-progress"
                                style={{width: `${progress}%`}}></div>
                        </div>
                        {showTimers ? (<div className="reports-item-timers">
                            {timers.map(timer => (<div key={timer.id} className="reports-item-timers-item">
                                <div className="reports-item-timers-item-left">
                                    <div className="reports-item-timers-item-date">{moment(timer.date).format('dddd Do')} <div className="reports-item-timers-item-total-hours">{timer.hours.toFixed(1)} hrs</div></div>
                                    <div className="reports-item-timers-item-times">
                                        {timer.times.map(time => (<div key={time.start.toJSON()}>{
                                            moment(time.start).format('h:mm A')} - {moment(time.end).format('h:mm A')
                                        }{time.dateChange ? ` +${time.dateChange}` : ''}</div>))}
                                    </div>
                                </div>
                            </div>))}
                        </div>) : ''}
                    </div>);
                })}
                <div className="reports-open-data-directory"
                    onClick={() => this.openDataDirectory()}>open time-data/</div>
                <div className="reports-open-exporter-directory"
                    onClick={() => this.openUserExporterDirectory()}>open user-exporter/</div>
            </div>
        );
    }
}

module.exports = Reports;
