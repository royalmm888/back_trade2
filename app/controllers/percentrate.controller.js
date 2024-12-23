const sequelize = require("sequelize");
const db = require("../models");
const percentrate = db.percentrate;

exports.getAllPercentrate = async (req, res) => {
    percentrate.findAll()
        .then(data => {
            res.send(data);
        }).catch(err => {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while retrieving percentrate."
            });
        });
}

exports.updatePercentrate = async (req, res) => {
    try {

        
        req.body.map(data =>
            percentrate.update(
                { percent: data.percent }, // Fields to update
                { where: { id: data.id } } // Condition to find the user
            )
        );
        
        res.send({
            message: "percentrate was updated successfully.",
        });
    } catch (error) {
        res.status(500).send({
            message: "Error updating percentrate ",
        });
    }

    // percentrate
    //     .update(req.body)
    //     .then((num) => {
    //         if (num == 1) {
    //             res.send({
    //                 message: "percentrate was updated successfully.",
    //             });
    //         } else {
    //             res.send({
    //                 message: `Cannot update percentrate. Maybe Question was not found or req.body is empty!`,
    //             });
    //         }
    //     })
    //     .catch((err) => {
    //         res.status(500).send({
    //             message: "Error updating percentrate ",
    //         });
    //     });
}