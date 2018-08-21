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
                const id = path.basename(filename, '.json');
                if (this.hasTimer(id)) {
                    ids.splice(ids.indexOf(id), 1);
                    return;
                }

                try {
                    const data = fs.readFileSync(`${directory}/${filename}`);
                    const timer = JSON.parse(data);

                    this.addTimer(timer);
                } catch (error) {
                    throw VError(error, `error loading file ${JSON.stringify(filename)}`);
                }
            });
        ids.forEach(id => this.removeTimer(id));
    }

    getRange(start, end) {
        const {timers} = this;
        let results = [];

        for (let id in timers) {
            let timer = timers[id];
            const date = moment(timer.date).toDate();

            if (date >= start && date <= end) {
                results.push(timer);
            }
        }

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
