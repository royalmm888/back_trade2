const db = require("../models");
const user = db.user;
const bank = db.bank;
const bankuser = db.bankuser;

exports.getAllBank = async (req, res) => {
    bank.findAll()
        .then(data => {
            res.send(data);
        }).catch(err => {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while retrieving Bank."
            });
        });
}

exports.createBankuser = async (req, res) => {
    if(req.body.peopleId!=null){
        peopleId = req.body.peopleId;
        bankuser.findOne({ where: { peopleId : peopleId } }).then(async (check) => {
            if (check) {
                bankuser.update(req.body, {
                    where: { peopleId: peopleId }
                }).then(data => {
                    res.status(200).send({ status: true });
                }).catch(err => {
                    res.status(500).send({
                        status: 500,
                        message:
                            err.message || "Some error occurred while creating the Bank."
                    });
                });
                return;
            }
            return await bankuser.create(req.body)
                .then(data => {
                    res.status(200).send({ status: true });
                })
                .catch(err => {
                    res.status(500).send({
                        status: 500,
                        message:
                            err.message || "Some error occurred while creating the Bank."
                    });
                });
        });
    }
    
};

