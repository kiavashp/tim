'use strict';

const {remote} = require('electron');
const {app} = remote;
const path = require('path');
const React = require('react');
const Titlebar = require('./titlebar');
const Timer = require('./timer');
const Timers = require('./timers');
const Exporter = require('./exporter');
const appDataPath = `${app.getPath('appData')}/${app.getName()}/`;
const exportsPath = app.getPath('downloads');

class Tim extends React.Component {
    constructor(props) {
        super(props);

        this.timers = new Timers(`${appDataPath}/time-data`);
        this.exporter = new Exporter({
            userExporter: `${appDataPath}/user-exporter`,
            exportsDir: exportsPath
        });
    }

    saveTimer(timer) {
        const {timers} = this;
        timers.save(timer);
    }

    getInvoiceDates() {
        let now = new Date();
        let year = now.getFullYear();
        let month = now.getMonth();
        let date = now.getDate();
        let start;
        let end;

        if (date < 15) {
            start = new Date(year, month - 1, 16);
            end = new Date(year, month, 0);
        } else {
            start = new Date(year, month, 1);
            end = new Date(year, month, 15);
        }

        return {start, end};
    }

    createExport() {
        const {timers, exporter} = this;

        timers.load();

        const dates = this.getInvoiceDates();
        const entries = timers.getRange(dates.start, dates.end);

        exporter.create(dates, entries).then(filepath => {
            app.dock.downloadFinished(filepath);
        }).catch(error => {
            console.error(error);
            alert(error.message);
        });
    }

    render() {
        return (
            <div id="tim-wrapper">
                <Titlebar key="titlebar"
                    createExport={() => this.createExport()}/>
                <Timer key="timer"
                    saveTimer={timer => this.saveTimer(timer)}/>
            </div>
        );
    }
}

module.exports = Tim;
