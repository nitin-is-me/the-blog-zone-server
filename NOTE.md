# Important note while hosting postgres database online:
---
In the database.js (or db.js) file, where we create our sequelize instance like this:
```
const { Sequelize } = require("sequelize");
const sequelize = new Sequelize({
  // host
  // username
  // password
  // port
  // database
  // dialect
  // logging
});

module.exports = sequelize;
```

When hosting the database online, it may throw unexpected errors, so we've to add a few lines, so that the database.js looks this this:
```
const { Sequelize } = require("sequelize");
const pg = require("pg"); // we have to manually import pg module, or it throws error : "Manually install pg"

const sequelize = new Sequelize({
  // host
  // username
  // password
  // port
  // database
  // dialect
  // logging
  dialectOptions:{  // some platforms like aws, render require ssl connection, so it can be solved with this
    ssl:{
        require: true,
        rejectUnauthorized: false
    }
  }
});

module.exports = sequelize;
```