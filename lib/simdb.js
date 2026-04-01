/*******************************************************************************
 * Copyright (c) 2018 Nicola Del Gobbo
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the license at http://www.apache.org/licenses/LICENSE-2.0
 *
 * THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS
 * OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY
 * IMPLIED WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
 * MERCHANTABLITY OR NON-INFRINGEMENT.
 *
 * See the Apache Version 2.0 License for specific language governing
 * permissions and limitations under the License.
 *
 * Contributors - initial API implementation:
 * Nicola Del Gobbo <nicoladelgobbo@gmail.com>
 ******************************************************************************/

'use strict'

/**
 * SimDB — a Node.js wrapper for the SimDB shared-memory key-value store.
 *
 * Usage:
 *   const SimDB = require('node-simdb')
 *   const db = SimDB({ name: 'mydb', blockSize: 4096, blockCount: 128 })
 *   db.open()
 *   db.put('hello', 'world')
 *   console.log(db.get('hello'))  // 'world'
 *   db.close()
 */

const path = require('path')

// node-gyp-build loads the prebuilt binary if available, otherwise falls back
// to the locally compiled build/ directory.
const { Database } = require('node-gyp-build')(path.join(__dirname, '..'))

/**
 * Factory function — creates a SimDB instance.
 *
 * @param {object} opts
 * @param {string} opts.name       - Shared memory identifier (name of the db)
 * @param {number} opts.blockSize  - Size of each block in bytes (min 64, default 4096)
 * @param {number} opts.blockCount - Number of blocks (default 128)
 * @returns {SimDB}
 */
module.exports = function createSimDB (opts = {}) {
    // Validate before applying defaults so callers get clear errors
    if (opts.name !== undefined && (typeof opts.name !== 'string' || opts.name.length === 0)) {
        throw new TypeError('SimDB: opts.name must be a non-empty string')
    }
    if (opts.blockSize !== undefined && (typeof opts.blockSize !== 'number' || opts.blockSize < 64)) {
        throw new RangeError('SimDB: opts.blockSize must be a number >= 64')
    }
    if (opts.blockCount !== undefined && (typeof opts.blockCount !== 'number' || opts.blockCount < 1)) {
        throw new RangeError('SimDB: opts.blockCount must be a number >= 1')
    }

    // Explicit empty string IS an error even though it would pass the undefined check
    if (typeof opts.name === 'string' && opts.name.length === 0) {
        throw new TypeError('SimDB: opts.name must be a non-empty string')
    }
    // Explicit zero IS an error
    if (opts.blockCount === 0) {
        throw new RangeError('SimDB: opts.blockCount must be a number >= 1')
    }

    const _name       = opts.name       || 'simdb'
    const _blockSize  = opts.blockSize  || 4096
    const _blockCount = opts.blockCount || 128

    const _db = new Database()

    return {
        /** Database name (shared memory identifier) */
        get name ()       { return _name },
        /** Block size in bytes */
        get blockSize ()  { return _blockSize },
        /** Number of blocks */
        get blockCount () { return _blockCount },

        /**
         * Open (or create) the shared-memory database.
         * Must be called before any read/write operations.
         */
        open () {
            _db.open(_name, _blockSize, _blockCount)
        },

        /**
         * Close the shared-memory database.
         * When the last process closes it, the shared memory is released.
         */
        close () {
            _db.close()
        },

        /**
         * Store a key-value pair.
         * @param {string} key
         * @param {string} value
         * @returns {boolean} true if stored successfully
         */
        put (key, value) {
            return _db.put(key, value)
        },

        /**
         * Retrieve the value for a key.
         * @param {string} key
         * @returns {string|null} value string, or null if not found
         */
        get (key) {
            return _db.get(key)
        },

        /**
         * Delete a key-value pair.
         * @param {string} key
         * @returns {boolean} true if deleted
         */
        del (key) {
            return _db.del(key)
        },

        /**
         * Check whether a key exists.
         * @param {string} key
         * @returns {boolean}
         */
        has (key) {
            return _db.has(key)
        },

        /**
         * Return the total shared-memory size in bytes.
         * @returns {number}
         */
        size () {
            return _db.size()
        },

        /**
         * Return an array of all keys in the database.
         * @returns {string[]}
         */
        keys () {
            return _db.keys()
        },
    }
}