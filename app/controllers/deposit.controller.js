const db = require("../models");
const dayjs = require("dayjs");
const people = db.people;
const deposit = db.deposit;
const withdraw = db.withdraw;
const creditadmin = db.creditadmin;
const user = db.user;

const sequelize = require("sequelize");
const sequelizeInstance = db.sequelize;
const op = sequelize.Op;




const multer = require("multer");
const path = require("path");
const fs = require("fs");
const sharp = require("sharp");


const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    // setting destination of uploading files
    // if uploading resume
    cb(null, "./app/images/slip");
  },
  filename: (req, file, cb) => {
    // naming file
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const fileFilter = async (req, file, cb) => {
  // if uploading resume
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    // check file type to be pdf, doc, or docx
    cb(null, true);
  } else {
    cb(null, false); // else fails
  }
};

var upload_test = multer({
  storage: fileStorage,
  limits: {
    fileSize: "1048576",
  },
  fileFilter: fileFilter,
}).fields([
  {
    name: "imageslip",
    maxCount: 1,
  },
]);
exports.uploadimage = upload_test;

exports.checkDeposit = async (req, res) => {
  deposit
    .count({ where: { peopleId: req.body.peopleId, status: 0, type: 1 } })
    .then(async (user) => {
      if (user > 0) {
        res.status(400).send({
          status: 400,
          message: "Failed! deposit is already in use!",
        });
        return;
      }
      return res.status(200).send({ status: true });
    })
    .catch((err) => {
      console.log(err);
    });
};


exports.createDeposit = async (req, res) => {
  deposit
    .count({ where: { peopleId: req.body.peopleId, status: 0, type: 1 } })
    .then(async (user) => {
      if (user > 0) {
        res.status(400).send({
          status: 400,
          message: "Failed! deposit is already in use!",
        });
        return;
      }

      var data_deposit = {};

      let peopledata = await people.findOne({
        attributes: ["firstname", "lastname", "uid", "credit"],
        where: { id: req.body.peopleId },
      });
      peopledata = JSON.stringify(peopledata);
      peopledata = JSON.parse(peopledata);

      try {
        await sharp(req.files.imageslip[0].path)
          .jpeg({ mozjpeg: true })

          .toFile(
            path.resolve(
              req.files.imageslip[0].destination,
              "resized",
              req.files.imageslip[0].filename
            )
          );
        fs.unlinkSync(req.files.imageslip[0].path);
      } catch (err) { }
      //************************************************************ */

      var imagesliptxt = null;

      try {
        imagesliptxt =
          "app\\images\\slip\\resized\\" + req.files.imageslip[0].filename;
      } catch (err) {
        imagesliptxt = null;
      }

      try {
        data_deposit = {
          imageslip: imagesliptxt,
          type: 1,
          amount: req.body.amount,
          sliptime: req.body.sliptime,
          preamount: peopledata.credit,
          peopleId: req.body.peopleId,
          net: 0,
          status: 0,
        };
      } catch (err) { }

      return await deposit
        .create(data_deposit)
        .then((data) => {
          res.status(200).send({ status: true });
        })
        .catch((err) => {
          res.status(500).send({
            status: 500,
            message:
              err.message || "Some error occurred while creating the People.",
          });
        });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.updateDeposit = async (req, res) => {
  const id = req.body.id;

  const peopleId = req.body.peopleId;
  const userId = req.body.userId;
  const status = req.body.status;
  const amount = req.body.amount;

  let peopledata = null;
  try {
    peopledata = await people.findOne({
      attributes: ["id", "credit"],
      where: { id: peopleId },
    });
    peopledata = JSON.stringify(peopledata);
    peopledata = JSON.parse(peopledata);
  } catch (error) { }

  if (status === 1) {
    deposit
      .update(
        { status: status, userId: userId, preamount: peopledata.credit, net: (Number(amount) + Number(peopledata.credit)) },
        {
          where: { id: id },
        }
      )
      .then(async (data) => {
        people.increment("credit", {
          by: amount,
          where: { id: peopleId },
        });
        res.status(200).send({ status: true });
      })
      .catch((err) => {
        res.status(500).send({
          status: 500,
          message:
            err.message || "Some error occurred while creating the Deposit.",
        });
      });
  } else {
    deposit
      .update(
        { status: status, userId: userId, preamount: peopledata.credit, net: peopledata.credit },
        {
          where: { id: id },
        }
      )
      .then(async (data) => {

        res.status(200).send({ status: true });
      })
      .catch((err) => {
        res.status(500).send({
          status: 500,
          message:
            err.message || "Some error occurred while creating the Deposit.",
        });
      });
  }
};

exports.createWithdraw = async (req, res) => {
  const amount = req.body.amount;
  const pincode = req.body.pincode;
  deposit
    .count({ where: { peopleId: req.body.peopleId, status: 0, type: 2 } })
    .then(async (user) => {
      if (user > 0) {
        res.status(400).send({
          status: 400,
          message: "Failed! deposit is already in use!",
        });
        return;
      }
      var data_deposit = {};

      let peopledata = await people.findOne({
        // attributes: ["firstname", "lastname", "uid", "credit", "creditwithdraw","pincode"],
        attributes: ["firstname", "lastname", "uid", "credit"],
        where: { id: req.body.peopleId },
      });
      peopledata = JSON.stringify(peopledata);
      peopledata = JSON.parse(peopledata);
      // if (peopledata.pincode !== pincode) return res.status(402).send({ status: 402, message: "รหัส Pin ไม่ถูกต้อง", });
      // if (peopledata.creditwithdraw < amount) {
      if (peopledata.credit < amount) {
        res.status(401).send({
          status: 401,
          message: "จำนวนถอนน้อยกว่ายอดที่ถอนได้",
        });
        return;
      }
      try {
        data_deposit = {
          imageslip: null,
          type: 2,
          amount: amount,
          sliptime: dayjs(),
          preamount: peopledata.credit,
          // preamount: peopledata.creditwithdraw,
          peopleId: req.body.peopleId,
          // net: Number(peopledata.creditwithdraw) - Number(amount),
          net: (Number(peopledata.credit) - Number(amount)),
          status: 0,
        };
      } catch (err) { }

      return await deposit
        .create(data_deposit)
        .then((data) => {
          people.decrement("credit", {
            by: Number(amount),
            where: { id: req.body.peopleId },
          });
          res.status(200).send({ status: true });
        })
        .catch((err) => {
          res.status(500).send({
            status: 500,
            message:
              err.message || "Some error occurred while creating the People.",
          });
        });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.updateWithdraw = async (req, res) => {
  const transaction = await sequelizeInstance.transaction();
  const id = req.body.id;

  const peopleId = req.body.peopleId;
  const userId = req.body.userId;
  const status = req.body.status;
  const amount = req.body.amount;
  const note = req.body.note;
  let peopledata = null;

  let oneWithdraw = await deposit.findOne({
    where: { id: id, status: 0 },
    lock: transaction.LOCK.UPDATE,  // Lock the row to prevent concurrent updates
    transaction: transaction         // Use the transaction
  });

  if (!oneWithdraw) {
    const updatedTrade = await deposit.findOne({
      where: { id: id },
      transaction: transaction
    });
    await transaction.commit(); // Commit the transaction
    return res.status(200).send(updatedTrade);
  }
  try {
    peopledata = await people.findOne({
      // attributes: ["id", "credit", "creditwithdraw"],
      attributes: ["id", "credit"],
      where: { id: peopleId },
    });
    peopledata = JSON.stringify(peopledata);
    peopledata = JSON.parse(peopledata);
  } catch (error) { }



  if (status === 1) {
    deposit
      .update(
        { status: status, userId: userId, note: note },
        {
          where: { id: id }, transaction: transaction
        }
      )
      .then(async (data) => {
        await transaction.commit();
        res.status(200).send({ status: true });
      })
      .catch(async (err) => {
        await transaction.rollback();
        res.status(500).send({
          status: 500,
          message:
            err.message || "Some error occurred while creating the Deposit.",
        });
      });
  } else {
    deposit
      .update(
        { status: status, userId: userId, preamount: peopledata.credit, net: (Number(peopledata.credit) + Number(amount)), note: note },
        {
          where: { id: id }, transaction: transaction
        }
      )
      .then(async (data) => {
        people.increment("credit", {
          by: Number(amount),
          where: { id: peopleId },
        });
        await transaction.commit();
        res.status(200).send({ status: true });
      })
      .catch(async (err) => {
        await transaction.rollback();
        res.status(500).send({
          status: 500,
          message:
            err.message || "Some error occurred while creating the Deposit.",
        });
      });
  }
};

exports.getAllDepositPending = async (req, res) => {
  deposit
    .findAll({
      include: [
        {
          model: people,
          as: "people",
          attributes: [
            "firstname",
            "lastname",
            // "firstnamebank",
            // "lastnamebank",
            "uid",
            "credit",

          ],
        },
        {
          model: user,
          as: "user",
          attributes: ["id", "name"],
        },
      ],
      where: { type: 1, status: 0 },
      order: [["createdAt", "ASC"]],
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

exports.getAllDeposit = async (req, res) => {
  deposit
    .findAll({
      include: [
        {
          model: people,
          as: "people",
          attributes: [
            "firstname",
            "lastname",
            // "firstnamebank",
            // "lastnamebank",
            "uid",
            "credit",

          ],
        },
        {
          model: user,
          as: "user",
          attributes: ["id", "name"],
        },
      ],
      where: { type: 1 },
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

exports.getAllWithDrawPending = async (req, res) => {
  deposit
    .findAll({
      include: [
        {
          model: people,
          as: "people",
          attributes: [
            "firstname",
            "lastname",
            // "firstnamebank",
            // "lastnamebank",
            "codebank",
            "idbank",
            "uid",
            "credit",

          ],
        },
        {
          model: user,
          as: "user",
          attributes: ["id", "name"],
        },
      ],
      where: { type: 2, status: 0 },
      order: [["createdAt", "ASC"]],
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

exports.getAllHistory = async (req, res) => {
  deposit
    .findAll({
      include: [
        {
          model: people,
          as: "people",
          attributes: [
            "firstname",
            "lastname",
            // "firstnamebank",
            // "lastnamebank",
            "uid",
            "credit",

          ],
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

exports.getAllWithDraw = async (req, res) => {
  deposit
    .findAll({
      include: [
        {
          model: people,
          as: "people",
          attributes: [
            "firstname",
            "lastname",
            // "firstnamebank",
            // "lastnamebank",
            "idbank",
            "codebank",
            "uid",
            "credit",

          ],
        },
        {
          model: user,
          as: "user",
          attributes: ["id", "name"],
        },
      ],
      where: { type: 2 },
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



exports.getAllCountToday = async (req, res) => {
  const TODAY_START = dayjs().format("YYYY-MM-DD 00:00");
  const NOW = dayjs().format("YYYY-MM-DD 23:59");
  deposit
    .findAll({
      attributes: [
        "amount",
        "sliptime",
        "type",
      ],
      where: {
        sliptime: {
          [op.between]: [TODAY_START, NOW],
        },
        status: 1,

      },

    })
    .then((data) => {
      data = JSON.stringify(data);
      data = JSON.parse(data);
      let withdrawcount = 0;
      let depositcount = 0;
      let deposittotal = 0;
      let withdrawtotal = 0;
      for (let property in data) {
        if (data[property].type === 1) {
          deposittotal += data[property].amount;
          depositcount += 1;
        } else {
          withdrawtotal += data[property].amount;
          withdrawcount += 1;
        }

      }
      res.status(200).send({
        depositcount: depositcount,
        deposittotal: deposittotal,
        withdrawcount: withdrawcount,
        withdrawtotal: withdrawtotal,

      });
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving User.",
      });
    });
};

exports.getAllCountMonth = async (req, res) => {
  const monthStart = dayjs().startOf('month').format("YYYY-MM-DD 00:00");
  const monthEnd = dayjs().endOf('month').format("YYYY-MM-DD 23:59");
  deposit
    .findAll({
      attributes: [
        "amount",
        "createdAt",
        "type",
      ],
      where: {
        createdAt: {
          [op.between]: [monthStart, monthEnd],
        },
        status: 1,

      },

    })
    .then((data) => {
      data = JSON.stringify(data);
      data = JSON.parse(data);
      let withdrawcount = 0;
      let depositcount = 0;
      let deposittotal = 0;
      let withdrawtotal = 0;
      for (let property in data) {
        if (data[property].type === 1) {
          deposittotal += data[property].amount;
          depositcount += 1;
        } else {
          withdrawtotal += data[property].amount;
          withdrawcount += 1;
        }

      }
      res.status(200).send({
        depositcountMonth: depositcount,
        deposittotalMonth: deposittotal,
        withdrawcountMonth: withdrawcount,
        withdrawtotalMonth: withdrawtotal,

      });
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving User.",
      });
    });
};

exports.getOneUserDeposit = async (req, res) => {
  await deposit
    .findAll({
      include: [
        {
          model: people,
          as: "people",
          attributes: [
            "uid",
            // "firstnamebank",
            // "lastnamebank",
            "credit",

          ],
        },
        {
          model: user,
          as: "user",
          attributes: ["id", "name"],
        },
      ],
      where: { type: 1, peopleId: req.params.id },
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

exports.getOneUserWithDraw = async (req, res) => {
  deposit
    .findAll({
      include: [
        // {
        //   model: people,
        //   as: "people",
        //   attributes: [
        //     "uid",
        //     "credit",
        //     // "firstnamebank",
        //     // "lastnamebank",
        //     // "idbank",
        //     // "codebank",

        //   ],
        // },
        {
          model: user,
          as: "user",
          attributes: ["id", "name"],
        },
      ],
      where: { type: 2, peopleId: req.params.id },
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