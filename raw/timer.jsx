'use strict';

const React = require('react');
const moment = require('moment');
const momentDurationFormat = require('moment-duration-format');

momentDurationFormat(moment);

class Timer extends React.Component {
    constructor(props) {
        super(props);

        let timer = {
            start: null,
            end: null,
            notes: []
        };

        this.saveTimer = props.saveTimer;

        this.state = {
            running: null,
            setDuration: {
                hours: 0,
                minutes: 0,
                seconds: 0
            },
            start: timer.start,
            end: timer.end,
            notes: timer.notes,
            newNote: null,

            editing: false,
            editIndex: null,
            editValue: null
        };
    }

    componentWillUnmount() {
        if (this.state.running) {
            this.stop();
        }
    }

    start() {
        const {setDuration} = this.state;
        const {hours, minutes, seconds} = setDuration;
        let start = new Date(Date.now() - (seconds * 1e3) - (minutes * 6e4) - (hours * 36e5));
        let interval = setInterval(() => {
            this.setState({
                end: new Date()
            });
        }, 1e3);

        this.setState({
            running: interval,
            start: start,
            end: new Date(),
            setDuration: {
                hours: 0,
                minutes: 0,
                seconds: 0
            }
        });
    }

    stop(cancel) {
        const {running, start, end, notes, newNote} = this.state;

        clearInterval(running);

        if (!cancel) {
            let addNote = newNote && newNote.trim();

            this.saveTimer({
                start,
                end,
                notes: addNote ? notes.concat(addNote) : notes
            });
        }

        this.setState({
            running: null,
            start: null,
            end: null,
            notes: cancel ? notes : []
        });
    }

    toggleTimer(event) {
        if (this.state.running) {
            this.stop();
        } else {
            this.start();
        }
    }

    onNotesAddChange(event) {
        const value = event.target.value;

        this.setState({
            newNote: value
        });
    }

    onNotesAddKeyPress(event) {
        const {notes} = this.state;
        const key = event.key;
        const value = event.target.value.trim();

        if (key === 'Enter' && value) {
            this.setState({
                newNote: null,
                notes: notes.concat(value)
            });
        }
    }

    onNotesAddKeyDown(event) {
        const {notes} = this.state;
        const {target, key, repeat} = event;
        const {value} = target;

        if (key === 'Backspace' && !repeat && !value && notes.length) {
            this.editNote(-1);
            event.preventDefault();
        }
    }

    onNotesEditChange(event) {
        const value = event.target.value;

        this.setState({
            editValue: value
        });
    }

    onNotesEditKeyPress(event) {
        const {notes, editIndex} = this.state;
        const key = event.key;
        const value = event.target.value.trim();

        if (key === 'Enter') {
            const newNotes = notes.slice();
            if (value) {
                newNotes[editIndex] = value;
            } else {
                newNotes.splice(editIndex, 1);
            }

            this.setState({
                editing: false,
                editIndex: null,
                editValue: null,
                notes: newNotes
            });
        }
    }

    onNotesEditKeyDown(event) {
        const {editIndex} = this.state;
        const {target, key} = event;
        const {value} = target;

        if (key === 'Escape') {
            this.setState({
                editing: false,
                editIndex: null,
                editValue: null
            });
        } else if (key === 'Backspace' && !value) {
            this.removeNote(editIndex);
        }
    }

    onNotesItemKeyDown(event, index) {
        const {key} = event;

        if (key === 'Backspace') {
            this.removeNote(index);
            this.setState({
                editing: false
            });
            event.preventDefault();
        }
    }

    onNotesItemKeyPress(event, index) {
        const {key} = event;

        if (key === 'Enter') {
            this.editNote(index);
            event.preventDefault();
        }
    }

    editNote(index) {
        const {notes, newNote} = this.state;
        const note = notes.slice(index)[0];

        this.setState({
            editing: true,
            editIndex: index < 0 ? notes.length + index : index,
            editValue: note
        });
    }

    removeNote(index) {
        const {notes} = this.state;
        const newNotes = notes.slice();

        if (index >= 0 && index < notes.length) {
            newNotes.splice(index, 1);
            this.setState({
                notes: newNotes,
                editing: false
            });
        }
    }

    onTimerDisplayKeyDown(event, unit) {
        const {key} = event;
        const setDuration = Object.assign({}, this.state.setDuration);
        let change;

        if (event.key === 'ArrowDown') {
            change = -1;
        } else if (event.key === 'ArrowUp') {
            change = 1;
        }

        if (change) {
            let value = setDuration[unit] + change;

            switch(unit) {
                case 'seconds':
                case 'minutes':
                    if (value > 59) {
                        value = 0;
                    } else if (value < 0) {
                        value = 59;
                    }
                    break;
                case 'hours':
                    if (value > 23) {
                        value = 0;
                    } else if (value < 0) {
                        value = 23;
                    }
                    break;
            }

            setDuration[unit] = value;

            this.setState({
                setDuration
            });
        }
    }

    render() {
        const {
            running, start, end, notes, newNote, setDuration,
            editing, editIndex, editValue
        } = this.state;
        const setDurationTimes = moment.duration({
            hours: setDuration.hours,
            minutes: setDuration.minutes,
            seconds: setDuration.seconds
        }).format('hh:mm:ss', {trim: false}).split(':');

        return (
            <div className="timer">
                {running
                    ? <div className="timer-display">
                        {moment.duration(end - start).format('hh:mm:ss', {trim: false})}
                      </div>
                    : <div className="timer-display">
                        <span
                            className="timer-display-hour"
                            tabIndex="0"
                            onKeyDown={event => this.onTimerDisplayKeyDown(event, 'hours')}
                        >{setDurationTimes[0]}</span>:<span
                            className="timer-display-minute"
                            tabIndex="0"
                            onKeyDown={event => this.onTimerDisplayKeyDown(event, 'minutes')}
                        >{setDurationTimes[1]}</span>:<span
                            className="timer-display-second"
                            tabIndex="0"
                            onKeyDown={event => this.onTimerDisplayKeyDown(event, 'seconds')}
                        >{setDurationTimes[2]}</span>
                      </div>
                }
                <div className="timer-notes">
                    {notes.map((note, i) => {
                        if (editing && editIndex === i) {
                            return (
                                <input key={`${i}-edit`}
                                    name="timer-notes-input"
                                    className="timer-notes-input"
                                    placeholder="edit note"
                                    autoFocus="true"
                                    value={editValue}
                                    onKeyPress={event => this.onNotesEditKeyPress(event)}
                                    onKeyDown={event => this.onNotesEditKeyDown(event)}
                                    onChange={event => this.onNotesEditChange(event)}/>
                            );
                        } else {
                            return (
                                <div key={i} className="timer-notes-item"
                                    tabIndex="0"
                                    onKeyPress={event => this.onNotesItemKeyPress(event, i)}
                                    onKeyDown={event => this.onNotesItemKeyDown(event, i)}>
                                    <div className="timer-notes-item-value">{note}</div>
                                    <div className="timer-notes-item-remove"
                                        onClick={event => this.removeNote(i)}
                                        >&times;</div>
                                </div>);
                        }
                    })}
                    {editing
                        ? ''
                        : <input name="timer-notes-input"
                                className="timer-notes-input"
                                placeholder="add note"
                                value={newNote || ''}
                                onKeyPress={event => this.onNotesAddKeyPress(event)}
                                onKeyDown={event => this.onNotesAddKeyDown(event)}
                                onChange={event => this.onNotesAddChange(event)}/>
                    }
                </div>
                <div className="timer-controls">
                    <button className={`timer-toggle ${running ? 'running' : ''}`}
                        onClick={event => this.toggleTimer(event)}>
                        {running ? 'stop' : 'start'}
                    </button>
                    {running
                        ? <button className='timer-cancel'
                            onClick={event => this.stop(true)}
                            >cancel</button>
                        : ''}
                </div>
            </div>
        );
    }
}

module.exports = Timer;
