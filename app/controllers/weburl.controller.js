const db = require("../models");
const weburl = db.weburl;

const multer = require("multer");
const path = require("path");
const fs = require("fs");
const sharp = require("sharp");
const { Op } = require("sequelize");

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    // setting destination of uploading files
    // if uploading resume
    if (file.fieldname === "imglogoweb") {
      cb(null, "./app/images/logoweb");
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
    name: "imgbank",
    maxCount: 1,
  },
  {
    name: "imglogoweb",
    maxCount: 1,
  },
]);
exports.uploadimage = upload_test;

exports.getAllWeburl = async (req, res) => {
  weburl.findAll()
    .then(data => {
      res.send(data);
    }).catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving Status."
      });
    });
}
exports.getLogoAndName = async (req, res) => {
  weburl.findAll({
    where: {
      name: {
        [Op.or]: ["imglogoweb", "webname"]
      }
    }
  })
    .then(data => {
      res.send(data);
    }).catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving Status."
      });
    });
}
exports.getAboutus = async (req, res) => {
  weburl.findAll({
    where: {name:
        "aboutus"
    }
  })
    .then(data => {
      res.send(data);
    }).catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving Status."
      });
    });
}
exports.getNotice = async (req, res) => {
  weburl.findAll({
    where: {name:
        "notice"
    }
  })
    .then(data => {
      res.send(data);
    }).catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving Status."
      });
    });
}

exports.createweburl = async (req, res) => {
  return await weburl
    .create(req.body)
    .then((data) => {
      res.status(200).send({ status: true });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send({
        status: 500,
        message:
          err.message || "Some error occurred while creating the Loan.",
      });
    });
  // });

};

exports.deleteweburl = (req, res) => {
  const id = req.params.id;

  weburl
    .destroy({
      where: { id: id },
    })
    .then(() => {
      res.status(200).send({
        message: "Loan was deleted successfully!",
      });
    })
    .catch((err) => {
      res.status(500).send({
        message: "Could not delete Loan with id=" + id,
      });
    });
};

exports.updateWeburl = async (req, res) => {

  try {
    if (req.body.checkimgbank === "true") {
      try {
        await sharp(req.files.imgbank[0].path)
          .jpeg({ quality: 50 })
          .toFile(
            path.resolve(
              req.files.imgbank[0].destination,
              "resized",
              req.files.imgbank[0].filename
            )
          );
        fs.unlinkSync(req.files.imgbank[0].path);
      } catch (err) { }

      var imgbanktxt = null;

      try {
        imgbanktxt =
          "app\\images\\bank\\resized\\" +
          req.files.imgbank[0].filename;
      } catch (err) {
        imgbanktxt = null;
      }
      weburl.update({ nameurl: imgbanktxt }, { where: { name: "imgbank" } });
      //************************************************************ */
    }
    if (req.body.checkimglogoweb === "true") {
      try {
        await sharp(req.files.imglogoweb[0].path)
          .resize(800, 800)
          .webp({ quality: 80 })
          .toFile(
            path.resolve(
              req.files.imglogoweb[0].destination,
              "resized",
              req.files.imglogoweb[0].filename
            )
          );
        fs.unlinkSync(req.files.imglogoweb[0].path);
      } catch (err) { }


      var imglogowebtxt = null;

      try {
        imglogowebtxt =
          "app\\images\\logoweb\\resized\\" +
          req.files.imglogoweb[0].filename;
      } catch (err) {
        imglogowebtxt = null;
      }
      weburl.update({ nameurl: imglogowebtxt }, { where: { name: "imglogoweb" } });

    }

    //************************************************************ */
    weburl.update({ nameurl: req.body.facebookURL }, { where: { name: "facebook" } });
    weburl.update({ nameurl: req.body.websiteURL }, { where: { name: "website" } });
    weburl.update({ nameurl: req.body.lineURL }, { where: { name: "line" } });
    weburl.update({ nameurl: req.body.gmailURL }, { where: { name: "gmail" } });
    weburl.update({ nameurl: req.body.idbank }, { where: { name: "idbank" } });
    weburl.update({ nameurl: req.body.codebank }, { where: { name: "codebank" } });
    weburl.update({ nameurl: req.body.namebank }, { where: { name: "namebank" } });
    weburl.update({ nameurl: req.body.notice }, { where: { name: "notice" } });


    weburl.update({ nameurl: req.body.webname }, { where: { name: "webname" } });
    weburl.update({ nameurl: req.body.bankdetail }, { where: { name: "bankdetail" } });
    weburl.update({ nameurl: req.body.aboutus }, { where: { name: "aboutus" } });

    res.status(200).send({
      message: "Weburl was updated successfully."
    });
  } catch (e) {
    res.status(500).send({
      message: "Error updating weburl "
    });
  }
}

exports.deleteImgBank = async (req, res) => {
  const filePath = req.body.imgbankbackup;

  fs.unlink(filePath, async (err) => {
    if (err) {
      res.status(400).send({
        message: "Content can not be empty!",
      });
      return;
    }
    await weburl
      .update(
        { nameurl: null },
        {
          where: { name: "imgbank" },
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
exports.deleteImgLogoweb = async (req, res) => {
  const filePath = req.body.imglogowebbackup;

  fs.unlink(filePath, async (err) => {
    if (err) {
      res.status(400).send({
        message: "Content can not be empty!",
      });
      return;
    }
    await weburl
      .update(
        { nameurl: null },
        {
          where: { name: "imglogoweb" },
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