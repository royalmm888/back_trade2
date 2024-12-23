module.exports = (sequelize, Sequelize) => {
  const User = sequelize.define("users", {
    username: {
      type: Sequelize.STRING,
      unique: true
    },
    name: {
      type: Sequelize.STRING
    },
    password: {
      type: Sequelize.STRING
    },

    version: {
      type: Sequelize.INTEGER,
      defaultValue: 1
    }

  });
  return User;
};