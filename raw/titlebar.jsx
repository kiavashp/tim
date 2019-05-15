'use strict';

const React = require('react');
const {remote} = require('electron');
const title = remote.getCurrentWindow().webContents.getTitle();

class Titlebar extends React.Component {
    render() {
        const {toggleReports, reportsOpen, toggleWindowMode, miniPlayerMode, close} = this.props;

        return (
            <div className="titlebar">
                <div className="left">
                    <div className="titlebar-button close-button"
                        title="close"
                        onClick={event => close()}></div>
                    <div className={`titlebar-button window-mode-button`}
                        title={miniPlayerMode ? 'expand window' : 'mini player window'}
                        onClick={event => toggleWindowMode()}></div>
                </div>
                <span className="title">{title}</span>
                <div className="right">
                    <div className={`titlebar-button reports-button ${reportsOpen ? 'open' : ''}`}
                        title="reports"
                        onClick={event => toggleReports()}></div>
                </div>
            </div>
        );
    }
}

module.exports = Titlebar;
