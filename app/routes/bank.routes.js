module.exports =(app)=>{
    const bank = require("../controllers/bank.controller");

    var router = require("express").Router();

    router.get('/allbank',bank.getAllBank)
    router.post('/newbankuser',bank.createBankuser)
    // router.put('/updateBankuser/:id',bank.updateBankuser)
    // router.get('/allStatus',setstatus.getAllStatus)
   
    // router.get('/oneStatus',setstatus.getOneStatus)
    // router.delete('/deleteStatus/:id',setstatus.deleteStatus)

    
    // router.get('/gettest',setstatus.updateStatus1)
    
    app.use("/api/bank",router);
}