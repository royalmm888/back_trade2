module.exports = (sequelize, Sequelize) => {
    const deposit = sequelize.define("deposit", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      type: {
        type: Sequelize.TINYINT,
        defaultValue: 1,
      },
      amount: {
        type: Sequelize.FLOAT(11, 2),
        defaultValue: 0.0,
      },
      imageslip:{
          type: Sequelize.STRING,
          defaultValue: "",
      },
      sliptime:{
        type: Sequelize.DATE,
      },
      preamount: {
        type: Sequelize.FLOAT(11, 2),
        defaultValue: 0.0,
      },
      net:{
          type: Sequelize.FLOAT(11, 2),
          defaultValue: 0.0,
      },
      status: {
        type: Sequelize.TINYINT,
        defaultValue: 0,
      },
      note:{
        type: Sequelize.STRING,
        defaultValue: "",
      },
    });
    return deposit;
  };
  