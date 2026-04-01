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

const { test, describe, before, after } = require('node:test')
const assert = require('node:assert/strict')
const SimDB = require('../index')

// Use a unique name per test run to avoid cross-test shared-memory collision
const DB_NAME  = `test_${Date.now()}`
const BLOCK_SZ = 4096
const BLOCKS   = 128

describe('SimDB factory', () => {
    test('throws on missing name', () => {
        assert.throws(() => SimDB({ name: '', blockSize: 4096, blockCount: 128 }),
            { name: 'TypeError' })
    })

    test('throws on blockSize < 64', () => {
        assert.throws(() => SimDB({ name: 'x', blockSize: 32, blockCount: 128 }),
            { name: 'RangeError' })
    })

    test('throws on blockCount < 1', () => {
        assert.throws(() => SimDB({ name: 'x', blockSize: 4096, blockCount: 0 }),
            { name: 'RangeError' })
    })

    test('returns an object with the correct properties', () => {
        const db = SimDB({ name: 'prop_test', blockSize: 4096, blockCount: 64 })
        assert.equal(db.name, 'prop_test')
        assert.equal(db.blockSize, 4096)
        assert.equal(db.blockCount, 64)
    })
})

describe('SimDB database operations', () => {
    let db

    before(() => {
        db = SimDB({ name: DB_NAME, blockSize: BLOCK_SZ, blockCount: BLOCKS })
        db.open()
    })

    after(() => {
        try { db.close() } catch (_) {}
    })

    // ── put / get ───────────────────────────────────────────────────────────────
    test('put returns true for a valid key-value pair', () => {
        const ok = db.put('hello', 'world')
        assert.equal(ok, true)
    })

    test('get returns the correct value for a stored key', () => {
        db.put('foo', 'bar')
        const val = db.get('foo')
        assert.equal(val, 'bar')
    })

    test('get returns null for a non-existent key', () => {
        const val = db.get('__does_not_exist__')
        assert.equal(val, null)
    })

    test('put/get roundtrip with unicode value', () => {
        db.put('emoji', '🚀 SimDB 🔥')
        assert.equal(db.get('emoji'), '🚀 SimDB 🔥')
    })

    test('put overwrites an existing key', () => {
        db.put('rewrite', 'v1')
        db.put('rewrite', 'v2')
        assert.equal(db.get('rewrite'), 'v2')
    })

    // ── has ─────────────────────────────────────────────────────────────────────
    test('has returns true for a stored key', () => {
        db.put('exists_key', 'yes')
        assert.equal(db.has('exists_key'), true)
    })

    test('has returns false for a missing key', () => {
        assert.equal(db.has('__missing__'), false)
    })

    // ── del ─────────────────────────────────────────────────────────────────────
    test('del removes a key', () => {
        db.put('to_delete', 'bye')
        assert.equal(db.has('to_delete'), true)
        db.del('to_delete')
        assert.equal(db.has('to_delete'), false)
        assert.equal(db.get('to_delete'), null)
    })

    test('del returns true when key existed', () => {
        db.put('del_target', 'x')
        const ok = db.del('del_target')
        assert.equal(ok, true)
    })

    // ── keys ────────────────────────────────────────────────────────────────────
    test('keys returns an array', () => {
        const ks = db.keys()
        assert.ok(Array.isArray(ks))
    })

    test('keys contains previously inserted keys', () => {
        db.put('key_one', '1')
        db.put('key_two', '2')
        const ks = db.keys()
        assert.ok(ks.includes('key_one'), 'should include key_one')
        assert.ok(ks.includes('key_two'), 'should include key_two')
    })

    // ── size ────────────────────────────────────────────────────────────────────
    test('size returns a positive number', () => {
        const sz = db.size()
        assert.ok(typeof sz === 'number' && sz > 0, `expected positive number, got ${sz}`)
    })

    // ── error handling ──────────────────────────────────────────────────────────
    test('put throws TypeError if key is not a string', () => {
        assert.throws(() => db.put(42, 'val'), { name: 'TypeError' })
    })

    test('put throws TypeError if value is not a string', () => {
        assert.throws(() => db.put('key', 99), { name: 'TypeError' })
    })

    test('get throws TypeError if key is not a string', () => {
        assert.throws(() => db.get(99), { name: 'TypeError' })
    })

    test('del throws TypeError if key is not a string', () => {
        assert.throws(() => db.del(null), { name: 'TypeError' })
    })

    // ── lifecycle ───────────────────────────────────────────────────────────────
    test('open() on the native layer throws TypeError with wrong arg types', () => {
        const path = require('path')
        const { Database } = require('node-gyp-build')(path.join(__dirname, '..'))
        const raw = new Database()
        assert.throws(() => raw.open(42, 4096, 128), { name: 'TypeError' })
    })
})
