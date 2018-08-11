'use strict';

const React = require('react');
const ReactDOM = require('react-dom');
const Tim = require(`${__dirname}/tim`);

document.addEventListener('DOMContentLoaded', function () {
    ReactDOM.render(
      <Tim/>,
      document.getElementById('tim-root')
    );
});
