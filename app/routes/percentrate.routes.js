module.exports =(app)=>{
    const percentrate = require("../controllers/percentrate.controller");

    var router = require("express").Router();

    router.get('/allpercentrate',percentrate.getAllPercentrate)
    router.put('/updatepercentrate',percentrate.updatePercentrate)


    
    app.use("/api/percentrate",router);
}