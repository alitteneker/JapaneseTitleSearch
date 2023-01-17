'use strict';

const searchForTitle = require("./searchForTitle");

console.log(await searchForTitle(process.argv.slice(2).join(" ")));