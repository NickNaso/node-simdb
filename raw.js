'use strict'

const Database = require('./lib/simdb')

const opts = {
    name: 'test',
    blocks: 1024,
    blockSize: 4096
}

const db = Database(opts)

console.log(db.name)
console.log(db.blocks)
console.log(db.blockSize)
try {
    db.open()
} catch (err) {
    console.log(err)
}