module.exports =(app)=>{
    const tradelist = require("../controllers/tradelist.controller");

    var router = require("express").Router();

    router.post('/createusertrade',tradelist.createUserTrade);
    router.post('/getTradePrice',tradelist.getTradePrice);
    router.post('/createUserTradeConfirm',tradelist.createUserTradeConfirm);

    router.get('/getoneusertrading/:id',tradelist.getOneUserTrading)
    router.get('/getoneuseralltrade/:id',tradelist.getOneUserAllTrade)
    router.get('/getoneuseralltradeadmin/:id',tradelist.getOneUserAllTradeAdmin)

    router.get('/getuseralltradeadmin',tradelist.getUserAllTradeAdmin)
    router.get('/getuseralltradehistoryadmin',tradelist.getUserAllTradeHistoryAdmin)
    router.put('/adminsettrade',tradelist.AdminSetTrade)

    router.post('/getOneUserTradingTimeout',tradelist.getOneUserTradingTimeout)

    router.get('/callcoinapi',tradelist.callcoinapi)



    app.use("/api/tradelist",router);
    
}