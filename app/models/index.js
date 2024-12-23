const config = require("../config/db.config.js");
const Sequelize = require("sequelize");
const sequelize = new Sequelize(
  config.DB,
  config.USER,
  config.PASSWORD,
  {
    host: config.HOST,
    dialect: config.dialect,
    operatorsAliases: false,
    pool: {
      max: config.pool.max,
      min: config.pool.min,
      acquire: config.pool.acquire,
      idle: config.pool.idle
    },
    
    dialectOptions: {
      useUTC: false, // for reading from database
    },
    timezone: '+07:00', // for writing to database
  }
);
const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;
db.user = require("../models/user.model.js")(sequelize, Sequelize);
db.role = require("../models/roles.model.js")(sequelize, Sequelize);

db.deposit = require("../models/deposit.model.js")(sequelize, Sequelize);
db.withdraw = require("../models/withdraw.model.js")(sequelize, Sequelize);

db.people = require("../models/people.model.js")(sequelize, Sequelize);
db.creditadmin = require("../models/creditadmin.model.js")(sequelize, Sequelize);
db.weburl = require("../models/weburl.model.js")(sequelize, Sequelize);
db.percentrate = require("../models/percentrate.model.js")(sequelize, Sequelize);
db.tradelist = require("../models/tradelist.model.js")(sequelize, Sequelize);

db.countdown = require("../models/countdown.model.js")(sequelize, Sequelize);

db.role.belongsToMany(db.user, {
  through: "user_roles",
  foreignKey: "roleId",
  otherKey: "userId"
});
db.user.belongsToMany(db.role, {
  through: "user_roles",
  foreignKey: "userId",
  otherKey: "roleId"
});







db.ROLES = ["user", "admin", "mod"];

 

db.people.hasMany(db.deposit,{foreignKey:{name:'peopleId',allowNull:false},onDelete:'CASCADE'});
db.deposit.belongsTo(db.people,{foreignKey:{name:'peopleId',allowNull:false},onDelete:'CASCADE'});

db.user.hasMany(db.deposit,{foreignKey:{name:'userId',allowNull:true},onDelete:'CASCADE'});
db.deposit.belongsTo(db.user,{foreignKey:{name:'userId',allowNull:true},onDelete:'CASCADE'});

db.people.hasMany(db.withdraw,{foreignKey:{name:'peopleId',allowNull:false},onDelete:'CASCADE'});
db.withdraw.belongsTo(db.people,{foreignKey:{name:'peopleId',allowNull:false},onDelete:'CASCADE'});

db.user.hasMany(db.withdraw,{foreignKey:{name:'userId',allowNull:true},onDelete:'CASCADE'});
db.withdraw.belongsTo(db.user,{foreignKey:{name:'userId',allowNull:true},onDelete:'CASCADE'});

db.people.hasMany(db.tradelist,{foreignKey:{name:'peopleId',allowNull:true},onDelete:'CASCADE'});
db.tradelist.belongsTo(db.people,{foreignKey:{name:'peopleId',allowNull:true},onDelete:'CASCADE'});

db.people.hasMany(db.creditadmin,{foreignKey:{name:'peopleId',allowNull:false},onDelete:'CASCADE'});
db.creditadmin.belongsTo(db.people,{foreignKey:{name:'peopleId',allowNull:false},onDelete:'CASCADE'});

db.user.hasMany(db.creditadmin,{foreignKey:{name:'userId',allowNull:false},onDelete:'CASCADE'});
db.creditadmin.belongsTo(db.user,{foreignKey:{name:'userId',allowNull:false},onDelete:'CASCADE'});

// db.people.hasMany(db.creditadmin,{foreignKey:{name:'peopleId',allowNull:false},onDelete:'CASCADE'});
// db.creditadmin.belongsTo(db.people,{foreignKey:{name:'peopleId',allowNull:false},onDelete:'CASCADE'});

db.people.belongsToMany(db.user,{
  through:{
  model:db.creditadmin,
  as: "user",
  unique: false,
  // onDelete:'restrict'
  },foreignKey:"peopleId",
})
db.user.belongsToMany(db.people,{
  through:{
  model:db.creditadmin,
  as: "people",
  unique: false,
  // onDelete:'restrict'
  },foreignKey:"userId",
})



module.exports = db;