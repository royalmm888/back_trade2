module.exports =(app)=>{
    const weburl = require("../controllers/weburl.controller");

    var router = require("express").Router();

    router.get('/getallweburl',weburl.getAllWeburl);
    router.get('/getlogoandname',weburl.getLogoAndName);
    router.get('/getaboutus',weburl.getAboutus);
    router.get('/getnotice',weburl.getNotice);

    router.put('/updateweburl',weburl.uploadimage,weburl.updateWeburl);
    router.post('/addweburl',weburl.createweburl);
    router.delete('/delweburl/:id',weburl.deleteweburl);

    router.post('/deleteimgbank',weburl.deleteImgBank);
    router.post('/deleteimglogoweb',weburl.deleteImgLogoweb);

    app.use("/api/weburl",router);
    
}