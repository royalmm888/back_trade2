module.exports = (sequelize, Sequelize) => {
    const creditadmin = sequelize.define("creditadmin", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      credittype: {
        type: Sequelize.TINYINT,
        defaultValue: 0,
      },
      amount:{
        type: Sequelize.FLOAT(11, 2),
        defaultValue: 0.0,
      },
      preamount:{
        type: Sequelize.FLOAT(11, 2),
        defaultValue: 0.0,
      },
      note:{
        type: Sequelize.STRING,
        defaultValue: "",
      }
    });
    return creditadmin;
  };