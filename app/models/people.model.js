module.exports = (sequelize, Sequelize) => {
  const People = sequelize.define("peoples", {
    firstname: {
      type: Sequelize.STRING,
      defaultValue: "-",
    },
    lastname: {
      type: Sequelize.STRING,
      defaultValue: "-",
    },

    uid: {
      type: Sequelize.STRING,

    },
    password: {
      type: Sequelize.STRING,
    },
    credit: {
      type: Sequelize.FLOAT(11, 2),
      defaultValue: 0.0,
    },

    phone: {
      type: Sequelize.STRING(10),
      defaultValue: "",
      unique: true
    },
    email: {
      type: Sequelize.STRING(50),
      defaultValue: "",
    },

    imagefrontcard: {
      type: Sequelize.STRING,
      defaultValue: null,
    },
    imagebackcard: {
      type: Sequelize.STRING,
      defaultValue: null,
    },
    verify_status:{
      type: Sequelize.TINYINT,
      defaultValue: 0,
    },
    cardtype:{
      type: Sequelize.TINYINT,
      defaultValue: 0,
    },
    idbank: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    codebank: {
      type: Sequelize.STRING(20),
      defaultValue: "",
    },

    addressnow: {
      type: Sequelize.STRING,
      defaultValue: "",
    },


    refcode: {
      type: Sequelize.STRING,
      defaultValue: "",
    },
  });
  return People;
};
