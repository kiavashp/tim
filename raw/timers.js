'use strict';

const fs = require('fs');
const path = require('path');
const VError = require('verror');
const mkdirp = require('mkdirp');
const moment = require('moment');

class Timers {
    constructor(directory) {
        this.directory = directory;
        this.timers = [];

        this.initialize();
    }

    initialize() {
        const {directory} = this;

        mkdirp.sync(directory);
    }

    addTimer(timer) {
        const {timers} = this;
        const ids = timers.map(t => t.id);

        Object.freeze(timer);

        if (!ids.includes(timer.id)) {
            timers.push(timer);
        }
    }

    load() {
        const {directory, timers} = this;
        const files = fs.readdirSync(directory);

        files.filter(filename => path.extname(filename) === '.json')
            .forEach(filename => {
                try {
                    const data = fs.readFileSync(`${directory}/${filename}`);
                    const timer = JSON.parse(data);

                    this.addTimer(timer);
                } catch (error) {
                    throw VError(error, `error loading file ${JSON.stringify(filename)}`);
                }
            });
    }

    getRange(start, end) {
        const {timers} = this;
        let results = [];

        timers.forEach(timer => {
            const date = moment(timer.date).toDate();

            if (date >= start && date <= end) {
                results.push(timer);
            }
        });

        return results;
    }

    save(timer) {
        const {directory} = this;
        const data = {};

        let start = moment(timer.start);
        let end = moment(timer.end);

        data.id = start.format('x');
        data.date = start.format('YYYY-MM-DD');
        data.startTime = start.format('HH:mm:ss');
        data.endTime = end.format('HH:mm:ss');
        data.notes = timer.notes;

        this.addTimer(data);

        fs.writeFileSync(`${directory}/${data.id}.json`, JSON.stringify(data));
    }
}

module.exports = Timers;
