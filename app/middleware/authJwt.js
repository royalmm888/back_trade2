const jwt = require("jsonwebtoken");
const config = require("../config/auth.config.js");
const db = require("../models");
const User = db.user;
// verifyToken = (req, res, next) => {
//   let token = req.body.xaccesstoken;
//   // let token = req.headers["x-access-token"];
//   if (!token) {
//     return res.status(403).send({
//       message: "No token provided!"
//     });
//   }
//   jwt.verify(token, config.secret, (err, decoded) => {
//     if (err) {
//       return res.status(401).send({
//         message: "Unauthorized!"
//       });
//     }
//     req.userId = decoded.id;
//     next();
//   });
// };
verifyToken = async (req, res, next) => {
  let token = req.body.xaccesstoken;

  if (!token) {
    return res.status(403).send({
      message: "No token provided!"
    });
  }

  try {
    const decoded = jwt.verify(token, config.secret);
    
    // เช็ค version กับ user ในฐานข้อมูล
    const user = await User.findByPk(decoded.id);
    
    if (!user) {
      return res.status(401).send({
        message: "User not found!"
      });
    }

    // ถ้า version ไม่ตรงกัน แสดงว่า token หมดอายุ
    if (user.version !== decoded.version) {
      return res.status(401).send({
        message: "Token is expired due to user update!"
      });
    }

    req.userId = decoded.id;
    next();
  } catch (err) {
    return res.status(401).send({
      message: "Unauthorized!"
    });
  }
};
isAdmin = (req, res, next) => {
  User.findByPk(req.userId).then(user => {
    user.getRoles().then(roles => {
      for (let i = 0; i < roles.length; i++) {
        if (roles[i].name === "admin") {
          next();
          return;
        }
      }
      res.status(403).send({
        message: "Require Admin Role!"
      });
      return;
    });
  });
};
isModerator = (req, res, next) => {
  User.findByPk(req.userId).then(user => {
    user.getRoles().then(roles => {
      for (let i = 0; i < roles.length; i++) {
        if (roles[i].name === "mod") {
          next();
          return;
        }
      }
      res.status(403).send({
        message: "Require Moderator Role!"
      });
    });
  });
};
isModeratorOrAdmin = (req, res, next) => {
  User.findByPk(req.userId).then(user => {
    user.getRoles().then(roles => {
      for (let i = 0; i < roles.length; i++) {
        if (roles[i].name === "mod") {
          next();
          return;
        }
        if (roles[i].name === "admin") {
          next();
          return;
        }
      }
      res.status(403).send({
        message: "Require Moderator or Admin Role!"
      });
    });
  });
};
const authJwt = {
  verifyToken: verifyToken,
  isAdmin: isAdmin,
  isModerator: isModerator,
  isModeratorOrAdmin: isModeratorOrAdmin
};
module.exports = authJwt;