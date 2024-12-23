module.exports = (sequelize, Sequelize) => {
    const tradelist = sequelize.define("tradelists", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        symbol: {
            type: Sequelize.STRING
        },
        type_order: {
            type: Sequelize.TINYINT,
            defaultValue: 0,
        },
        amount: {
            type: Sequelize.FLOAT(11, 2),
            defaultValue: 0.0,
        },
        opening_time: {
            type: Sequelize.DATE,
        },
        opening_price: {
            type: Sequelize.DECIMAL(14, 8),
            defaultValue: 0.0,
        },
        closing_time: {
            type: Sequelize.DATE,
        },
        closing_price: {
            type: Sequelize.DECIMAL(14, 8),
            defaultValue: 0.0,
        },
        net: {
            type: Sequelize.FLOAT(11, 2),
            defaultValue: 0.0,
        },
        selectPercent: {
            type: Sequelize.FLOAT(11, 2),
            defaultValue: 0.0,
        },
        trade_result:{
            type: Sequelize.TINYINT,
            defaultValue: 0,
        },
        status: {
            type: Sequelize.TINYINT,
            defaultValue: 0,
        },
        adminstatus: {
            type: Sequelize.TINYINT,
            defaultValue: 0,
        },
    });
    return tradelist;
};
