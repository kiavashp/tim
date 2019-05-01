'use strict';

const {remote} = require('electron');
const {app, shell} = remote;
const assert = require('assert');
const path = require('path');
const React = require('react');
const GlobalEventComponent = require('./global-event-component');
const Titlebar = require('./titlebar');
const Timer = require('./timer');
const Reports = require('./reports');
const Timers = require('./timers');
const Exporter = require('./exporter');
const appDataPath = `${app.getPath('appData')}/${app.getName()}/`;
const exportsPath = app.getPath('downloads');
const timeDataPath = `${appDataPath}/time-data`;
const userExporterPath = `${appDataPath}/user-exporter`;

class Tim extends GlobalEventComponent {
    constructor(props) {
        super(props);

        this.timers = new Timers(timeDataPath);
        this.exporter = new Exporter({
            userExporter: userExporterPath,
            exportsDir: exportsPath
        });
        this.state = {
            reportsOpen: false
        };
    }

    onGlobalKeyDown(event) {
        const {reportsOpen} = this.state;
        const {key, shiftKey} = event;
        let newState = {};

        if (reportsOpen && key === '}' && shiftKey) {
            this.setState({
                reportsOpen: false
            });
        } else if (!reportsOpen && key === '{' && shiftKey) {
            this.setState({
                reportsOpen: true
            });
        }
    }

    saveTimer(timer) {
        const {timers} = this;
        timers.save(timer);
    }

    openDataDirectory() {
        shell.openItem(timeDataPath);
    }

    openUserExporterDirectory() {
        shell.openItem(userExporterPath);
    }

    createExport(dates) {
        const {timers, exporter} = this;

        assert.strictEqual(typeof dates, 'object', 'dates must be an object');
        assert.strictEqual(typeof dates.start, 'object', 'dates.start must be a Date object');
        assert.ok(dates.start instanceof Date, 'dates.start must be a Date object');
        assert.strictEqual(typeof dates.end, 'object', 'dates.end must be a Date object');
        assert.ok(dates.end instanceof Date, 'dates.end must be a Date object');

        timers.load();

        const entries = timers.getRange(dates.start, dates.end);

        exporter.create(dates, entries).then(filepath => {
            if (Array.isArray(filepath)) {
                filepath.forEach(filepath => app.dock.downloadFinished(filepath));
            } else {
                app.dock.downloadFinished(filepath);
            }
        }).catch(error => {
            console.error(error);
            alert(error.message);
        });
    }

    toggleReports(open=!this.state.reportsOpen) {
        this.setState({
            reportsOpen: open
        });
    }

    render() {
        const {state, timers} = this;
        const {reportsOpen} = state;

        return (
            <div id="tim-wrapper">
                <Titlebar key="titlebar"
                    reportsOpen={reportsOpen}
                    toggleReports={() => this.toggleReports()}/>
                <div className="tim-body">
                    <Timer key="timer"
                        saveTimer={timer => this.saveTimer(timer)}/>
                    <div key="separator" className="separator"></div>
                    <Reports key="reports"
                        timers={timers}
                        open={reportsOpen}
                        createExport={(dates) => this.createExport(dates)}
                        openDataDirectory={() => this.openDataDirectory()}
                        openUserExporterDirectory={() => this.openUserExporterDirectory()}/>
                </div>
            </div>
        );
    }
}

module.exports = Tim;
