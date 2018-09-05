<div align="center">
<img src="https://github.com/NickNaso/node-simdb/raw/master/node-simdb.png"/>
</div>

# node-simdb

**node-simdb** is a binding of **SimDB** that consist of a key value store that 
uses arbitrary byte data (of arbitrary length) as both the key and the value. It 
additionally uses shared memory, which allows processes to communicate with each 
other quickly. It is lock free and scales well with multiple threads writing, 
reading, and deleting concurrently.

This package is a wrapper around the simdb C library.

## This module is under development yet :-) 
### It will be a long process end this project and every help will be welcome
### Give me other time i work with :heart: for all of you

* [Introduction](#introduction)
* [Supported platforms](#supported_platforms)
* [Prerequisites](#prerequisites)
* [Installation](#install)
* [Usage](#usage)
* [API](#api)
* [Code of conduct](CODE_OF_CONDUCT.md)
* [Team](#team)
* [Acknowledgements](#acknowledgements)
* [License](#license)

<a name="introduction"></a>

## Introduction

### What is SimDB

**SimDB** is a key value store that uses arbitrary byte data (of arbitrary length)
as both the key and the value. It additionally uses shared memory, which allows 
processes to communicate with each other quickly. It is lock free and scales well 
with multiple threads writing, reading, and deleting concurrently.

**SimDB** contains the user facing interface. It contains the `ConcurrentHash`, 
`ConcurentStore`, and `SharedMem` classes as members. These data structures are 
made to be an interface over the contiguous memory given to them using a single 
address. They do not allocate any heap memory themselves, but do have a few class 
members that will be on the stack. At the time of this writing it is 176 bytes on
the stack.

* `SharedMem`: Interface to OS specific shared memory functions.  Also handles 
an initial alignment.
* `ConcurrentHash`: Hash map that uses atomic operations on an array of VerIdx 
structs. It uses 64 bit atomic operations to compare-exchange one VerIdx at a 
time (VerIdx is two unsigned 32 bit integers, a version and an index). This makes
sure that reading, writing and deleting is lock free. Writing is lock free since 
a VerIdx is already fully created and written to before putting it in the VerIdx 
array (m_vis) and the put operation here is a single 64 bit compare and swap. 
Deletion is lock free since the index in VerIdx is only freed from the CncrLst 
after setting the VerIdx here to DELETED. Actually deletion means 1. setting the 
VerIdx to DELETED 2. decrementing the readers of the blocklist that idx points 
to 3. If the readers variable of that blocklist is decremented below its initial 
value then the thread that took it below its initial value is the one to free it. 
Get is lock free since it can read an index from a VerIdx, increment readers, 
compare its key to the key in the list of blocks, read the value in the blocks to
the output buffer and finally decrement the readers variable. Just like deletion,
if a thread decrements readers below its initial value, it needs to free the block 
list.  This means the last one out cleans up.
* `ConcurrentStore`: Keeps track of block lists. This primarily uses an array of 
BlkLst structs (which are 24 bytes each). The BlkLst lava_vec is used to make 
linked lists of block indices. The idea of a block list ends up being a starting 
index (from the VerIdx struct in the concurrent hash). The BlkLst struct at the 
starting index contains an index of the next BlkLst struct and so on until 
reaching a BlkLst that has an index of LIST_END. This means that one array 
contains multiple linked lists (using indices and not pointers of course). This 
exposes an alloc() function and a free() function. alloc() gets the index of the 
next block from CncrLst (concurrent list). The BlkLst struct keeps the total 
length and the key length / value offset since it does not have to be atomic and 
is only initialized and used when one thread allocates and only destroyed when 
one thread frees, just like the actual data blocks.
* `ConcurrentList`: 
The concurrent list is an array integers. The number of elements (like all the arrays)
is the number of blocks.There is one integer per block with the integer at a 
given index representing the next slot in the list. The end of the list will have
value LIST_END. On initialization the array's values would be |1|2|3|4| ... LIST_END, 
which makes a list from the start to the end. This means s_lv[0] would return 1.

...

<a name="supported_platforms">

## Supported platforms

...

<a name="prerequisites"></a>

## Prerequisites

...

<a name="install"></a>

## Installation

...

<a name="usage"></a>

## Usage

...

<a name="api"></a>

## API

<a name="team"></a>

## The Team

### Nicola Del Gobbo

<https://github.com/NickNaso/>

<https://www.npmjs.com/~nicknaso>

<https://twitter.com/NickNaso>

### Mauro Doganieri

<https://github.com/mauro-d>

<https://www.npmjs.com/~mauro-d>

<https://twitter.com/maurodoganieri>

### Pierluigi Iannarelli

<https://github.com/Govee91>

<https://twitter.com/pierluigiiannar>

<a name="acknowledgements"></a>

## Acknowledgements

Thank you to all people that encourage me every day.

<a name="license"></a>

## License

Licensed under [Apache license V2](./LICENSE)
