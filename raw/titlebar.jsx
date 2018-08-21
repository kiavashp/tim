'use strict';

const React = require('react');
const {remote} = require('electron');
const title = remote.getCurrentWindow().webContents.getTitle();

class Titlebar extends React.Component {
    render() {
        const {toggleReports} = this.props;

        return (
            <div className="titlebar">
                {title}
                <div className="reports-button"
                    title="reports"
                    onClick={event => toggleReports()}></div>
            </div>
        );
    }
}

module.exports = Titlebar;
