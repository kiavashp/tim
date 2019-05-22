'use strict';

const {ipcRenderer} = require('electron');
const React = require('react');
const ReactDOM = require('react-dom');
const Tim = require(`${__dirname}/tim`);

document.addEventListener('DOMContentLoaded', function () {
    ReactDOM.render(
      <Tim ipc={ipcRenderer}/>,
      document.getElementById('tim-root')
    );
});
