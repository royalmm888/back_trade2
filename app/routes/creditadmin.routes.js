module.exports =(app)=>{
    
    const creditadmin = require("../controllers/creditadmin.controller");

    var router = require("express").Router();

    router.post('/addCreditadmin',creditadmin.createCreditadmin)

    router.get('/AllCreditadmin',creditadmin.getAllCreditAdmin)
    router.get('/AllCreditadminToday',creditadmin.getAllCreditAdminToday)
    router.get('/getAllDepositUserHistory/:id',creditadmin.getAllDepositUserHistory)
    // router.get('/AllCusProductPending',creditadmin.getAllUserpending)
    // router.get('/AllCusProductEnd',creditadmin.getAllUserend)




    
    app.use("/api/creditadmin",router);
}