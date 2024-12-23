module.exports = (sequelize, Sequelize) => {
    const countdown = sequelize.define("countdown", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      timestamp: {
        type: Sequelize.INTEGER,
        defaultValue: 30,
      },

    },{timestamps: false});
    return countdown;
  };