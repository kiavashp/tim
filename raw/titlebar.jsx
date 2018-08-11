'use strict';

const React = require('react');
const {remote} = require('electron');
const title = remote.getCurrentWindow().webContents.getTitle();

class Titlebar extends React.Component {
    render() {
        const {createExport} = this.props;

        return (
            <div className="titlebar">
                {title}
                <div className="export-button"
                    title="export"
                    onClick={event => createExport(event)}></div>
            </div>
        );
    }
}

module.exports = Titlebar;
