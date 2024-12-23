const db = require("../models");
const people = db.people;
const tradelist = db.tradelist;
const creditadmin = db.creditadmin;
const deposit = db.deposit;


const multer = require("multer");
const path = require("path");
const fs = require("fs");
const sharp = require("sharp");
const { Op } = require("sequelize");
const dayjs = require("dayjs");
const sequelize = require("sequelize");
const op = sequelize.Op;




function makecode(length) {
  var result = "";
  var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

function pad(d) {
  // return (1050 + d).toString();
  return (1111111 + d).toString();
}
// import multer from 'multer'

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    // setting destination of uploading files
    // if uploading resume
    if (file.fieldname === "imagefrontcard") {
      cb(null, "./app/images/frontcard");
    } else if (file.fieldname === "imagebackcard") {
      cb(null, "./app/images/backcard");
    } else {
      cb(null, "./app/images/bank");
    }

  },
  filename: (req, file, cb) => {
    // naming file
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
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
    name: "imagefrontcard",
    maxCount: 1,
  },
  {
    name: "imagebackcard",
    maxCount: 1,
  },
  {
    name: "imageqrbank",
    maxCount: 1,
  },
]);
exports.uploadimage = upload_test;

exports.deleteImageFrontImage = async (req, res) => {
  const filePath = req.body.imageFrontCardBackup;

  const id = req.body.id;

  fs.unlink(filePath, async (err) => {
    if (err) {
      res.status(400).send({
        message: "Content can not be empty!",
      });
      return;
    }
    await people
      .update(
        { imagefrontcard: null },
        {
          where: { id: id },
        }
      )
      .then((num) => {
        return res.send({
          message: "User was updated successfully.",
        });
      })
      .catch((err) => {
        return res.status(500).send({
          message: "Error updating User ",
        });
      });
  });

  return;
};
exports.deleteImageBackImage = async (req, res) => {
  const filePath = req.body.imageBackCardBackup;

  const id = req.body.id;

  fs.unlink(filePath, async (err) => {
    if (err) {
      res.status(400).send({
        message: "Content can not be empty!",
      });
      return;
    }
    await people
      .update(
        { imagebackcard: null },
        {
          where: { id: id },
        }
      )
      .then((num) => {
        return res.send({
          message: "User was updated successfully.",
        });
      })
      .catch((err) => {
        return res.status(500).send({
          message: "Error updating User ",
        });
      });
  });

  return;
};

exports.createPeople = async (req, res) => {

  if (req.body == null) {
    res.status(400).send({
      message: "Content can not be empty!",
    });
    return;
  }

  people
    .findOne({ where: { phone: req.body.phone } })
    .then(async (user) => {
      if (user) {
        res.status(400).send({
          status: 400,
          message: "Failed! Phone is already in use!",
        });
        return;
      }
      var data_people = {};

      try {
        await sharp(req.files.imagefrontcard[0].path)
          .resize(400, 400)
          .jpeg({ quality: 50 })
          .toFile(
            path.resolve(
              req.files.imagefrontcard[0].destination,
              "resized",
              req.files.imagefrontcard[0].filename
            )
          );
        fs.unlinkSync(req.files.imagefrontcard[0].path);
      } catch (err) { }
      //************************************************************ */

      var imagefrontcardtxt = null;

      try {
        imagefrontcardtxt =
          "app\\images\\profile\\resized\\" +
          req.files.imagefrontcard[0].filename;
      } catch (err) {
        imagefrontcardtxt = null;
      }

      try {
        data_people = {
          imagefrontcard: imagefrontcardtxt,
          firstname: req.body.firstname,
          lastname: req.body.lastname,
          password: req.body.password,
          credit: req.body.credit,
          phone: req.body.phone,
          idbank: req.body.idbank,
          codebank: req.body.codebank,
          addressnow: req.body.addressnow,
          email: req.body.email,
          verify_status: req.body.verify_status,
          // firstnamebank: req.body.firstnamebank,
          // lastnamebank: req.body.lastnamebank,

          refcode: makecode(8),
        };
      } catch (err) { }

      return await people
        .create(data_people)
        .then(async (data) => {

          await people.update({ uid: pad(data.id) }, { where: { id: data.id } })
          res.status(200).send({ status: true, id: data.id });
        })
        .catch((err) => {
          console.log(err);
          res.status(500).send({
            status: 500,
            message:
              err.message || "Some error occurred while creating the People.",
          });
        });
    });
};

exports.getAllUser = async (req, res) => {
  people
    .findAll()
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving User.",
      });
    });
};

exports.getlast10user = async (req, res) => {
  people
    .findAll({
      attributes: ['id', 'firstname', 'lastname', 'uid', 'phone', "verify_status", 'credit'], order: [
        ["createdAt", "DESC"],
      ],
    })
    .then((data) => {
      if (data.length > 10) {
        data.length = 10;
      }
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving User.",
      });
    });
};

exports.getCountUser = async (req, res) => {
  const TODAY_START = dayjs().format("YYYY-MM-DD 00:00");
  const NOW = dayjs().format("YYYY-MM-DD 23:59");
  const monthStart = dayjs().startOf('month').format("YYYY-MM-DD 00:00");
  const monthEnd = dayjs().endOf('month').format("YYYY-MM-DD 23:59");
  try {
    let allpeople = await people.count({
    });
    let todaypeople = await people.count({
      where: {
        createdAt: {
          [op.between]: [TODAY_START, NOW],
        },
      }
    });
    let tradingpeople = await tradelist.count({
      where: {
        status: 0
      }
    });
    let monthpeople = await people.count({
      where: {
        createdAt: {
          [op.between]: [monthStart, monthEnd],
        },
      }
    });
    let todaydeposit = await creditadmin.sum("amount", {
      where: {
        createdAt: {
          [op.between]: [TODAY_START, NOW],
        }, credittype: 1
      }
    });
    let monthdeposit = await creditadmin.sum("amount", {
      where: {
        createdAt: {
          [op.between]: [monthStart, monthEnd],
        }, credittype: 1
      }
    });
    let todaywithdraw = await deposit.sum("amount", {
      where: {
        createdAt: {
          [op.between]: [TODAY_START, NOW],
        }, status: 1
      }
    });
    let monthwithdraw = await deposit.sum("amount", {
      where: {
        createdAt: {
          [op.between]: [monthStart, monthEnd],
        }, status: 1
      }
    });

    res.status(200).send({
      todaypeople: todaypeople,
      monthpeople: monthpeople,
      allpeople: allpeople,
      tradingpeople: tradingpeople,
      todaydeposit: todaydeposit !== null ? todaydeposit : 0,
      monthdeposit: monthdeposit !== null ? monthdeposit : 0,
      todaywithdraw: todaywithdraw !== null ? todaywithdraw : 0,
      monthwithdraw: monthwithdraw !== null ? monthwithdraw : 0

    });
  } catch (error) {
    res.status(500).send({
      message: error,
    });
  }

};

exports.getAllUsernew = async (req, res) => {
  people
    .findAll({ where: { statusproduct: { [Op.in]: [0, 4] } } })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving User.",
      });
    });
};





exports.getOneUser = (req, res) => {

  people
    .findOne({
      attributes: ['id', 'firstname', 'lastname', 'uid', 'phone', 'email', 'password', 'idbank'],
      where: { [Op.or]: [{ phone: req.body.phone }, { uid: req.body.phone }] },
    })
    .then((user) => {
      if (!user) {
        return res.status(404).send({ message: "User Not found." });
      }
      if (req.body.password != user.password) {
        return res.status(401).send({
          accessToken: null,
          message: "Invalid Password!",
        });
      }
      res.status(200).send({ user });
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving Exams.",
      });
    });
};

exports.getOneUserAdmin = (req, res) => {
  people
    .findOne({
      where: { id: req.params.id },
    })
    .then((user) => {

      res.status(200).send({ user });
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving Exams.",
      });
    });
};

exports.getOneUserAfter = (req, res) => {
  const id = req.params.id;
  people
    .findOne({
      // attributes: ["id", "firstname", "lastname", "uid",
      //   "credit", "phone", "imagefrontcard", "imagebackcard", "email",
      //   "idbank", "codebank", "addressnow"],
      where: { id: id },
    })
    .then((user) => {
      if (!user) {
        return res.status(404).send({ message: "User Not found." });
      }
      res.status(200).send({ user });
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving Exams.",
      });
    });
};

exports.updateUser = async (req, res) => {
  people
    .findAll({ where: { phone: req.body.phone } })
    .then(async (user) => {
      if (user.length > 1) {
        res.status(400).send({
          status: 400,
          message: "Failed! phone is already in use!",
        });
        return;
      }

      var data_people = {};

      try {
        await sharp(req.files.imagefrontcard[0].path)
          .resize(400, 400)
          .jpeg({ quality: 50 })
          .toFile(
            path.resolve(
              req.files.imagefrontcard[0].destination,
              "resized",
              req.files.imagefrontcard[0].filename
            )
          );
        fs.unlinkSync(req.files.imagefrontcard[0].path);
      } catch (err) { }

      var imagefrontcardtxt = null;

      try {
        imagefrontcardtxt =
          "app\\images\\profile\\resized\\" +
          req.files.imagefrontcard[0].filename;
      } catch (err) {
        imagefrontcardtxt = null;
      }

      try {
        data_people = {
          firstname: req.body.firstname,
          lastname: req.body.lastname,
          password: req.body.password,
          credit: req.body.credit,
          phone: req.body.phone,
          idbank: req.body.idbank,
          email: req.body.email,
          codebank: req.body.codebank,
          addressnow: req.body.addressnow,
          verify_status: req.body.verify_status
          // lastnamebank: req.body.lastnamebank,
        };
      } catch (err) { }
      if (imagefrontcardtxt !== null) {
        data_people.imagefrontcard = imagefrontcardtxt;
      }

      const id = req.params.id;
      people
        .update(data_people, {
          where: { id: id },
        })
        .then((num) => {
          if (num == 1) {
            res.send({
              message: "User was updated successfully.",
            });
          } else {
            res.send({
              message: `Cannot update User with id=${id}. Maybe Question was not found or req.body is empty!`,
            });
          }
        })
        .catch((err) => {
          res.status(500).send({
            message: "Error updating User with id=" + id,
          });
        });
    });
};

exports.updateUserImage = async (req, res) => {

  var data_people = {};

  try {
    await sharp(req.files.imagefrontcard[0].path)
      .resize(400, 400)
      .jpeg({ quality: 50 })
      .toFile(
        path.resolve(
          req.files.imagefrontcard[0].destination,
          "resized",
          req.files.imagefrontcard[0].filename
        )
      );
    fs.unlinkSync(req.files.imagefrontcard[0].path);
  } catch (err) { }

  var imagefrontcardtxt = null;

  try {
    imagefrontcardtxt =
      "app\\images\\profile\\resized\\" +
      req.files.imagefrontcard[0].filename;
  } catch (err) {
    imagefrontcardtxt = null;
  }

  if (imagefrontcardtxt !== null) {
    data_people.imagefrontcard = imagefrontcardtxt;
  }

  const id = req.params.id;
  people
    .update(data_people, {
      where: { id: id },
    })
    .then((num) => {
      if (num == 1) {
        res.send({
          message: "User was updated successfully.",
        });
      } else {
        res.send({
          message: `Cannot update User with id=${id}. Maybe Question was not found or req.body is empty!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error updating User with id=" + id,
      });
    });

};

exports.updateUseUser = async (req, res) => {
  people
    .update(req.body, {
      where: { id: req.body.id },
    })
    .then((num) => {
      if (num == 1) {
        res.send({
          message: "User was updated successfully.",
        });
      } else {
        res.send({
          message: `Cannot update User with id=${id}. Maybe Question was not found or req.body is empty!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error updating User with id=" + id,
      });
    });
};

exports.deleteUser = (req, res) => {
  const id = req.params.id;

  people
    .destroy({
      where: { id: id },
    })
    .then(() => {
      res.status(200).send({
        message: "User was deleted successfully!",
      });
    })
    .catch((err) => {
      res.status(500).send({
        message: "Could not delete User with id=" + id,
      });
    });
};

// **************** ของผู้ใช้ ******************************
exports.sendVerifyUser = async (req, res) => {

  let checkcount = await people.count({ where: { id: req.body.peopleId, [Op.or]: [{ verify_status: 1 }, { verify_status: 3 }], } })
  if (checkcount > 0) {
    res.status(400).send({
      status: 400,
      message: "รออนุมัติหรืออนุมัติแล้ว",
    });
    return;
  }

  var data_people = {};
  try {
    await sharp(req.files.imagefrontcard[0].path)
      // .resize(400, 400)
      .webp({ quality: 60 })
      .toFile(
        path.resolve(
          req.files.imagefrontcard[0].destination,
          "resized",
          req.files.imagefrontcard[0].filename
        )
      );
    fs.unlinkSync(req.files.imagefrontcard[0].path);

    await sharp(req.files.imagebackcard[0].path)
      // .resize(400, 400)
      .webp({ quality: 60 })
      .toFile(
        path.resolve(
          req.files.imagebackcard[0].destination,
          "resized",
          req.files.imagebackcard[0].filename
        )
      );
    fs.unlinkSync(req.files.imagebackcard[0].path);
  } catch (err) { }


  var imagefrontcardtxt = null;
  var imagebackcardtxt = null;

  try {
    imagefrontcardtxt =
      "app\\images\\frontcard\\resized\\" +
      req.files.imagefrontcard[0].filename;

  } catch (err) {
    imagefrontcardtxt = null;
  }
  try {
    imagebackcardtxt =
      "app\\images\\backcard\\resized\\" +
      req.files.imagebackcard[0].filename;
  } catch (error) {
    imagebackcardtxt = null;
  }

  try {
    data_people = {

      verify_status: 3,
      cardtype: req.body.cardtype
    };
  } catch (err) { }
  if (imagefrontcardtxt !== null) {
    data_people.imagefrontcard = imagefrontcardtxt;
  }
  if (imagebackcardtxt !== null) {
    data_people.imagebackcard = imagebackcardtxt;
  }


  people
    .update(data_people, {
      where: { id: req.body.peopleId },
    })
    .then((num) => {
      if (num == 1) {
        res.send({
          message: "User was updated successfully.",
        });
      } else {
        res.send({
          message: `Cannot update User with id=${id}. Maybe Question was not found or req.body is empty!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error updating User with id=" + id,
      });
    });
}

exports.getAllUserVerify = async (req, res) => {
  people
    .findAll({ where: { verify_status: 3 } })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving User.",
      });
    });
};

exports.UserVerifyFailed = async (req, res) => {
  try {
    const id = req.body.id;
    const filePath = req.body.imagefrontcard;
    const filePath2 = req.body.imagebackcard;
    if (filePath !== null && filePath2 !== null) {
      // fs.unlink(filePath2)
      // fs.unlink(filePath)
      fs.unlink(filePath, async (err) => {
        if (err) {
          res.status(400).send({
            message: "Content can not be empty!",
          });
          return;
        }
      });
      fs.unlink(filePath2, async (err) => {
        if (err) {
          res.status(400).send({
            message: "Content can not be empty!",
          });
          return;
        }
      });
    }


    await people
      .update(
        { imagefrontcard: null, imagebackcard: null, verify_status: 2 },
        {
          where: { id: id },
        }
      )
    return res.send({
      message: "User was updated successfully.",
    });
  } catch (error) {
    return res.status(500).send({
      message: "Error updating User ",
    });

  }


}
exports.UserVerifySuccessful = async (req, res) => {
  try {
    const id = req.body.id;
    await people
      .update(
        { verify_status: 1 },
        {
          where: { id: id },
        }
      )
    return res.send({
      message: "User was updated successfully.",
    });
  } catch (error) {
    return res.status(500).send({
      message: "Error updating User ",
    });

  }


}
exports.UserUpdateInfo = async (req, res) => {
  try {
    if (req.body.phone !== req.body.phoneold) {
      let checkcount = await people.count({ where: { phone: req.body.phone } })
      if (checkcount > 0) {
        res.status(400).send({
          status: 400,
          message: "Failed! Phone is already in use!",
        });
        return;
      }
    }

    await people
      .update(
        req.body,
        {
          where: { id: req.params.id },
        }
      )
    return res.send({
      message: "User was updated successfully.",
    });
  } catch (error) {
    return res.status(500).send({
      message: "Error updating User ",
    });

  }


}
exports.UserUpdatePassword = async (req, res) => {
  try {
    if (req.body.newpassword.length < 8 || req.body.newpassword !== req.body.newpassword2) {

      return res.status(400).send({
        status: 400,
        message: "Failed! Phone is already in use!",
      });

    }


    await people
      .update(
        { password: req.body.newpassword },
        {
          where: { id: req.params.id },
        }
      )
    return res.send({
      message: "User was updated successfully.",
    });
  } catch (error) {
    return res.status(500).send({
      message: "Error updating User ",
    });

  }


}