module.exports = (sequelize, Sequelize) => {
    const Weburl = sequelize.define("weburl", {
      id: {
        type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
      },
      name: {
        type: Sequelize.STRING
      },
      nameurl: {
        type: Sequelize.TEXT
      }
    },{timestamps: false});
    return Weburl;
  };