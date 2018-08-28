'use strict';

const path = require('path');
const moment = require('moment');
const csv = require('csv');

module.exports = async (dates, entries) => {
    // context = {start: new Date(2018, 6, 16), end: new Date(2018, 6, 31)}
    // entries[] = {date: '2018-07-23', startTime: '13:38:00', endTime: '14:19:00', notes: ['one', 'two']}

    let records = [];
    let totalHours = moment.duration(0);

    for (let entry of entries) {
        let date = moment(entry.end).format('YYYY-MM-DD');
        let end = new Date(entry.end);
        let start = new Date(entry.start);
        let hours = moment.duration(end - start, 'milliseconds');

        totalHours.add(hours);

        records.push([
            entry.date,
            moment(entry.start).format('h:mm A'),
            moment(entry.end).format('h:mm A'),
            hours.format('h:mm', {trim: false}),
            entry.notes.join(', ')
        ]);
    }

    records.push(['', '', 'Total:', totalHours.format('h:mm', {trim: false}), '']);

    return {
        filename: `invoice-${moment(dates.end).format('YYYY-MM-DD')}.csv`,
        contents: await new Promise((resolve, reject) => {
            csv.stringify(records, {
                columns: ['date', 'start', 'end', 'hours', 'notes'],
                header: true
            }, (error, data) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(data);
                }
            })
        })
    };
};
