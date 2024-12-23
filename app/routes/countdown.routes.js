module.exports = (app) => {
  const countdown = require("../controllers/countdown.controller");

  var router = require("express").Router();

  router.get("/gettime", countdown.getTime);
  router.put("/updatetime", countdown.updateTime);

  app.use("/api/countdown", router);
};
