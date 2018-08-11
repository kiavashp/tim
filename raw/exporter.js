'use strict';

const assert = require('assert');
const fs = require('fs');
const util = require('util');
const path = require('path');
const mkdirp = require('mkdirp');
const defaultExportPath = require.resolve('./default-export');

class Exporter {
    constructor(options) {
        assert.strictEqual(typeof options, 'object', 'options must be an object');
        assert.ok(!Array.isArray(options), 'options must be an object');
        assert.strictEqual(typeof options.userExporter, 'string', 'options.userExporter must be a string');
        assert.strictEqual(typeof options.exportsDir, 'string', 'options.exportsDir must be a string');

        this.userExporter = options.userExporter;
        this.exportsDir = options.exportsDir;

        this.initialize();
    }

    initialize() {
        const {userExporter, exportsDir} = this;
        let exporter;
        let userExporterPath;

        mkdirp.sync(userExporter);
        mkdirp.sync(exportsDir);

        try {
            userExporterPath = require.resolve(userExporter);
        } catch (error) {}

        if (userExporterPath) {
            exporter = require(userExporter);
        } else {
            exporter = require(defaultExportPath);
        }

        this.exporter = exporter;
    }

    async create(dates, entries) {
        const {exporter, exportsDir} = this;
        const result = await exporter(dates, entries);
        const fsAccess = util.promisify(fs.access);
        const fileExists = filepath => fsAccess(filepath)
            .then(() => true)
            .catch(e => false);

        assert.strictEqual(typeof result, 'object', 'exporter: result must be an object');
        assert.ok(!Array.isArray(result), 'exporter: result must be an object');
        assert.strictEqual(typeof result.filename, 'string', 'exporter: result.filename must be a string');
        if (!Buffer.isBuffer(result.contents)) {
            assert.strictEqual(typeof result.contents, 'string', 'exporter: result.contents must be a string or buffer');
        }

        const {filename, contents, options={}} = result;
        let filepath = path.join(exportsDir, path.basename(filename));

        if (await fileExists(filepath)) {
            let extname = path.extname(filename);
            let basename = path.basename(filename, extname);
            let index = 1;
            do {
                filepath = path.join(exportsDir, `${basename} (${index})${extname}`);
                index += 1;
            } while (await fileExists(filepath));
        }

        return new Promise((resolve, reject) => {
            fs.writeFile(filepath, contents, options, error => {
                if (error) {
                    reject(error);
                } else {
                    resolve(filepath);
                }
            });
        });
    }
}

module.exports = Exporter;
