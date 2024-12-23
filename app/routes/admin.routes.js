module.exports = (app) => {
    const admin = require("../controllers/admin.controller");

    var router = require("express").Router();

    router.get('/allAdmin', admin.getAllAdmin)
    router.get('/oneAdmin/:id', admin.getOneAdmin)
    router.put('/updateAdmin/:id', admin.updateAdmin)
    router.delete('/deleteAdmin/:id', admin.deleteAdmin)

    router.post('/generate-hmac', admin.genHMAC)
    // router.post('/',Exam.createExam)
    // router.post('/retest',Exam.createExam_retest)
    // router.get('/:id/all',Exam.findAllExam)
    // router.get('/:id',Exam.findOneExam)

    // router.delete('/:id',Exam.deleteExam)

    app.use("/api/admin", router);
}