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

const { Database } = require('bindings')('simdb')

module.exports = (opts = {}) => {

    const _name = opts.name
    const _blocks = opts.blocks
    const _blockSize = opts.blockSize
    const _db = new Database()

    class SimDB {
        
        constructor() {
            // TODO
        }

        get name() {
            return _name
        }

        get blocks() {
            return _blocks
        }

        get blockSize() {
            return _blockSize
        }

        open() {
            _db.open(_name, _blockSize, _blocks)
        }

        close() {
            _db.close()
        }

        size() {
            return _db.size()
        }

        keys() {
            return _db.keys()

        }

        get(key) {
            return _db.get(key)

        }

        del(key) {
            return _db.del(key)
            
        }

        put(key, value) {
            return _db.put(key, value)
        }
        
    }

    return new SimDB()

}