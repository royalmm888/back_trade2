const dayjs = require("dayjs");
const sequelize = require("sequelize");
const op = sequelize.Op;
const { user } = require("../models");
const db = require("../models");
const people = db.people;
const creditadmin = db.creditadmin;


exports.createCreditadmin = async (req, res) => {
  const credittype = req.body.credittype;
  if (req.body.amount <= 0) {
    res.status(400).send({
      status: 400,
      message: "ป้อนจำนวนเงินให้ถูกต้อง",
    });
    return;
  }
  people
    .count({ where: { phone: req.body.phone } })
    .then(async (user) => {
      if (user <= 0) {
        res.status(400).send({
          status: 400,
          message: "Failed! phone is already in use!",
        });
        return;
      }

      let peopledata = await people.findOne({
        attributes: ["id", "credit"],
        where: { phone: req.body.phone },
      });
      peopledata = JSON.stringify(peopledata);
      peopledata = JSON.parse(peopledata);

      if(Number(peopledata.credit)<=0&&credittype === 2){
        res.status(401).send({
          status: 401,
          message: "The amount is already zero.",
        });
        return;
      }

      try {
        await creditadmin.create({
          credittype: req.body.credittype,
          amount: req.body.amount,
          note: req.body.note,
          preamount: peopledata.credit,
          peopleId: peopledata.id,
          userId: req.body.userId,
        });
        if (credittype === 1) {
          people.increment("credit", {
            by: req.body.amount,
            where: { phone: req.body.phone },
          });
        } else {
          req.body.amount > peopledata.credit ?
            await people.increment("credit", {
              by: -peopledata.credit,
              where: { id: peopledata.id },
            }) : await people.increment("credit", {
              by: -req.body.amount,
              where: { id: peopledata.id },
            })
        }
        res.status(200).send({ status: true });
      } catch (error) {
        res.status(500).send({
          status: 500,
          message:
            error.message || "Some error occurred while creating the Product.",
        });
      }
    });
};

exports.getAllCreditAdminToday = async (req, res) => {
  const TODAY_START = dayjs().format("YYYY-MM-DD 00:00");
  const NOW = dayjs().format("YYYY-MM-DD 23:59");
  creditadmin
    .findAll({
      include: [
        {
          model: people,
          as: "people",
          attributes: ["firstname", "lastname", "uid", "credit"],
        },
        {
          model: user,
          as: "user",
          attributes: ["id", "name"],
        },
      ],
      where: {
        createdAt: {
          [op.between]: [TODAY_START, NOW],
        },
      },
      order: [["createdAt", "DESC"]],
    })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving User.",
      });
    });
};

exports.getAllCreditAdmin = async (req, res) => {

  creditadmin
    .findAll({
      include: [
        {
          model: people,
          as: "people",
          attributes: ["firstname", "lastname", "uid", "credit","phone"],
        },
        {
          model: user,
          as: "user",
          attributes: ["id", "name"],
        },
      ],

      order: [["createdAt", "DESC"]],
    })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving User.",
      });
    });
};

exports.getAllDepositUserHistory = async (req, res) => {
  const id = req.params.id;
  creditadmin
    .findAll(
      //   {
      //   include: [
      //     {
      //       model: people,
      //       as: "people",
      //       attributes: [
      //         "firstname",
      //         "lastname",
      //         "uid",
      //         "credit",

      //       ],
      //     },
      //     // {
      //     //   model: user,
      //     //   as: "user",
      //     //   attributes: ["id", "name"],
      //     // },
      //   ],

      //   order: [["createdAt", "DESC"]],
      // },
      { where: { peopleId: id, credittype: 1 },order: [["createdAt", "DESC"]], })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving User.",
      });
    });
};
