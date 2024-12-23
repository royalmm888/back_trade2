module.exports = (sequelize, Sequelize) => {
    const percentrate = sequelize.define("percentrates", {
      // id: {
      //   type: Sequelize.INTEGER,
      //   primaryKey: true,
      // },
      percent: {
        type: Sequelize.INTEGER,
      },

    },{timestamps: false});
    return percentrate;
  };