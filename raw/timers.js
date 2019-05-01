'use strict';

const fs = require('fs');
const path = require('path');
const {EventEmitter} = require('events');
const VError = require('verror');
const mkdirp = require('mkdirp');
const moment = require('moment');

class Timers extends EventEmitter {
    constructor(directory) {
        super();

        this.directory = directory;
        this.timers = {};

        this.initialize();
    }

    initialize() {
        const {directory} = this;

        setInterval(() => this.load(), 5e3);

        mkdirp.sync(directory);
    }

    hasTimer(id) {
        const {timers} = this;
        return timers.hasOwnProperty(id);
    }

    getTimer(id) {
        const {timers} = this;
        const {[id]: timer} = timers;
        return timer;
    }

    addTimer(timer) {
        const {timers} = this;
        const {id} = timer;

        Object.freeze(timer);

        if (!this.hasTimer(id)) {
            timers[id] = timer;
            this.emit('update');
        }
    }

    removeTimer(id) {
        const {timers} = this;

        if (this.hasTimer(id)) {
            delete timers[id];
            this.emit('update');
        }
    }

    load() {
        const {directory, timers} = this;
        const files = fs.readdirSync(directory);
        const ids = Object.getOwnPropertyNames(timers);

        files.filter(filename => path.extname(filename) === '.json')
            .forEach(filename => {
                const filepath = `${directory}/${filename}`;
                const id = path.basename(filename, '.json');
                if (this.hasTimer(id)) {
                    const {dateLoaded} = this.getTimer(id);
                    const {mtime} = fs.statSync(filepath);

                    ids.splice(ids.indexOf(id), 1);
                    if (mtime < dateLoaded) {
                        return;
                    } else {
                        this.removeTimer(id);
                    }
                }

                try {
                    const data = fs.readFileSync(filepath);
                    const timer = JSON.parse(data);

                    timer.dateLoaded = new Date();

                    this.addTimer(timer);
                } catch (error) {
                    throw VError(error, `error loading file ${JSON.stringify(filename)}`);
                }
            });
        ids.forEach(id => this.removeTimer(id));
    }

    getFirstDate() {
        const {timers} = this;
        let firstDate = new Date();

        for (let id in timers) {
            let {start} = timers[id];
            const startDateString = moment(start).format('YYYY-MM-DD');
            const startDate = new Date(startDateString);
            if (startDate < firstDate) {
                firstDate = startDate;
            }
        }

        return firstDate;
    }

    getRange(start, end) {
        const {timers} = this;
        let results = [];

        for (let id in timers) {
            let timer = timers[id];
            const mdate = moment(timer.start);
            const year = mdate.year();
            const month = mdate.month();
            const day = mdate.date();
            const date = new Date(year, month, day);

            if (date >= start && date <= end) {
                results.push(timer);
            }
        }

        return results;
    }

    save(timer) {
        const {directory} = this;
        const data = {};

        data.id = moment(timer.start).format('x');
        data.start = timer.start;
        data.end = timer.end;
        data.notes = timer.notes;

        this.addTimer(data);

        fs.writeFileSync(`${directory}/${data.id}.json`, JSON.stringify(data));
    }
}

module.exports = Timers;
