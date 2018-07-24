# truffle-bug-repro

## Dependencies

* node v10.3.0
* npm 6.1.0

Nix users can `nix-shell -p nodejs-10_x`

## Bug explanation
Adding an Array prototype function in a unit test breaks the test, even though the function is never called:

test/simplestorage.js
```
...
Array.prototype.zip = function (otherArray) {
    return this.map((e,i) => [this[i], i < otherArray.length ? otherArray[i] : null]);
};
...
```

## Repro Instructions

* clone repo
* `npm install`
* `npm run test`

See:

```
[nix-shell:~/dev/truffle-bug-repro]$ npm run test

> truffle-bug-repro@1.0.0 test /Users/lev/dev/truffle-bug-repro
> rm -rf build && node_modules/.bin/truffle test

Compiling ./contracts/Migrations.sol...
Compiling ./contracts/SimpleStorage.sol...


  Contract: SimpleStorage
    ✓ ...should store the value hey:hey (97ms)


  1 passing (113ms)


/Users/lev/dev/truffle-bug-repro/test/simplestorage.js:4
    return this.map((e,i) => [this[i], i < otherArray.length ? otherArray[i] : null]);
                ^
TypeError: this.map is not a function
    at Client.Array.zip (/Users/lev/dev/truffle-bug-repro/test/simplestorage.js:4:17)
    at Client.emit (/Users/lev/dev/truffle-bug-repro/node_modules/truffle/build/webpack:/~/event-pubsub/es5.js:74:1)
    at Socket.connectionClosed (/Users/lev/dev/truffle-bug-repro/node_modules/truffle/build/webpack:/~/node-ipc/dao/client.js:187:1)
    at Socket.emit (events.js:182:13)
    at Pipe._handle.close [as _onclose] (net.js:596:12)
npm ERR! code ELIFECYCLE
npm ERR! errno 1
npm ERR! truffle-bug-repro@1.0.0 test: `rm -rf build && node_modules/.bin/truffle test`
npm ERR! Exit status 1
npm ERR!
npm ERR! Failed at the truffle-bug-repro@1.0.0 test script.
npm ERR! This is probably not a problem with npm. There is likely additional logging output above.

npm ERR! A complete log of this run can be found in:
npm ERR!     /Users/lev/.npm/_logs/2018-07-24T20_52_33_519Z-debug.log
```

## Guesswork

Since the function is never called anyway, I have to assume that it has something to do with webpack trying to compile or transpile my code.

Another thing to note is that this only happens when run with the truffle inside node_modules folder. Local truffle works:

```
[nix-shell:~/dev/truffle-bug-repro]$ truffle version
Truffle v4.1.11 (core: 4.1.11)
Solidity v0.4.24 (solc-js)

[nix-shell:~/dev/truffle-bug-repro]$ truffle test
Compiling ./contracts/Migrations.sol...
Compiling ./contracts/SimpleStorage.sol...


  Contract: SimpleStorage
    ✓ ...should store the value hey:hey (102ms)


  1 passing (120ms)

[nix-shell:~/dev/truffle-bug-repro]$ node_modules/.bin/truffle version
Truffle v4.1.13 (core: 4.1.13)
Solidity v0.4.24 (solc-js)

[nix-shell:~/dev/truffle-bug-repro]$ node_modules/.bin/truffle test
Compiling ./contracts/Migrations.sol...
Compiling ./contracts/SimpleStorage.sol...


  Contract: SimpleStorage
    ✓ ...should store the value hey:hey (97ms)


  1 passing (112ms)


/Users/lev/dev/truffle-bug-repro/test/simplestorage.js:4
    return this.map((e,i) => [this[i], i < otherArray.length ? otherArray[i] : null]);
                ^
TypeError: this.map is not a function
    at Client.Array.zip (/Users/lev/dev/truffle-bug-repro/test/simplestorage.js:4:17)
    at Client.emit (/Users/lev/dev/truffle-bug-repro/node_modules/truffle/build/webpack:/~/event-pubsub/es5.js:74:1)
    at Socket.connectionClosed (/Users/lev/dev/truffle-bug-repro/node_modules/truffle/build/webpack:/~/node-ipc/dao/client.js:187:1)
    at Socket.emit (events.js:182:13)
    at Pipe._handle.close [as _onclose] (net.js:596:12)
```

