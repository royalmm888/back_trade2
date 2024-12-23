module.exports =(app)=>{
    
    const deposit = require("../controllers/deposit.controller");

    var router = require("express").Router();

    router.post('/addDeposit',deposit.uploadimage,deposit.createDeposit)
    router.post('/addWithdraw',deposit.createWithdraw)

    router.put('/updateDeposit',deposit.updateDeposit)
    router.put('/updateWithdraw',deposit.updateWithdraw)

    router.get('/allDepositPending',deposit.getAllDepositPending)
    router.get('/allDeposit',deposit.getAllDeposit)


    router.post('/checkDeposit',deposit.checkDeposit)

    router.get('/allWithdrawPending',deposit.getAllWithDrawPending)
    router.get('/allWithdraw',deposit.getAllWithDraw)

    //count
    router.get('/allcountToday',deposit.getAllCountToday)
    router.get('/allcountMonth',deposit.getAllCountMonth)

    router.get('/allhistory',deposit.getAllHistory)

    //getoneuser
    router.get('/getOneUserDeposit/:id',deposit.getOneUserDeposit)
    router.get('/getOneUserWithDraw/:id',deposit.getOneUserWithDraw)

    // router.get('/AllCusProductPickup',cusproduct.getAllUserpickup)
    // router.get('/AllCusProductPending',cusproduct.getAllUserpending)
    // router.get('/AllCusProductEnd',cusproduct.getAllUserend)

    
    app.use("/api/deposit",router);
}