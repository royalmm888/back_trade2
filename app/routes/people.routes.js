

module.exports =(app)=>{
    
    const people = require("../controllers/people.controller");

    var router = require("express").Router();

    router.post('/newPeople',people.uploadimage,people.createPeople)
    router.get('/allPeople',people.getAllUser)
    router.put('/updatePeople/:id',people.uploadimage,people.updateUser)
    router.put('/updateUseUser',people.updateUseUser)

    router.put('/updateUserImage/:id',people.uploadimage,people.updateUserImage)
   
    router.get('/getOneUserAdmin/:id',people.getOneUserAdmin)
    router.delete('/deletePeople/:id',people.deleteUser)
    router.post('/deleteimagefrontcard',people.deleteImageFrontImage)
    router.post('/deleteimagebackcard',people.deleteImageBackImage)

    router.get('/allPeoplenew',people.getAllUsernew)


    router.get('/getlastuser',people.getlast10user)
    router.get('/getcountuser',people.getCountUser)



    //userLogin
    router.post('/onePeople',people.getOneUser)
    router.get('/oneUserdata/:id',people.getOneUserAfter)

    router.post('/sendverifyuser',people.uploadimage,people.sendVerifyUser)
    router.get('/allpeopleverify',people.getAllUserVerify)
    router.post('/sendverifyfailed',people.UserVerifyFailed)
    router.post('/sendverifysucces',people.UserVerifySuccessful)
    router.post('/userupdateinfo/:id',people.UserUpdateInfo)
    router.post('/userupdatepassword/:id',people.UserUpdatePassword)







    
    app.use("/api/people",router);
}