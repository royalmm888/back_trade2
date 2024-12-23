module.exports = (sequelize, Sequelize) => {
    const withdraw = sequelize.define("withdraw", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
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
        defaultValue: 1,
      },
    });
    return withdraw;
  };
  