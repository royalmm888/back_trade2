const db = require("../models");
const countdown = db.countdown;

exports.getTime = (req, res) => {
    countdown
      .findOne({
        where: { id: 1 },
      })
      .then((time) => {
        if (!time) {
          return res.status(404).send({ message: "time Not found." });
        }
        res.status(200).send({ time });
      })
      .catch((err) => {
        res.status(500).send({
          message: err.message || "Some error occurred while retrieving Exams.",
        });
      });
  };

exports.updateTime = async (req, res) => {
    countdown
      .update(req.body, {
        where: { id: 1 },
      })
      .then((num) => {
        if (num == 1) {
          res.send({
            message: "Time was updated successfully.",
          });
        } else {
          res.send({
            message: `Cannot update Time with . Maybe Question was not found or req.body is empty!`,
          });
        }
      })
      .catch((err) => {
        res.status(500).send({
          message: "Error updating Time with id",
        });
      });
  };