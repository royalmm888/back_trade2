const db = require("../models");
const tradelist = db.tradelist;
const people = db.people;

const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");
dayjs.extend(utc);
dayjs.extend(timezone);

const axios = require('axios');
const api_key = "4c1ae80e15-97c9c85ef4-sibb6h";
const api_key_gold = "goldapi-ltotnpsm3x2mr8o-io";
var cron = require('node-cron');

const sequelize = require("sequelize");
const sequelizeInstance = db.sequelize;
const op = sequelize.Op;




function genRand(min, max, decimalPlaces) {
  var rand = Math.random() * (max - min) + min;
  var power = Math.pow(10, decimalPlaces);
  return Math.floor(rand * power) / power;
}

const Math2float = (num) => {
  return parseFloat(num.toFixed(2));
}

function randomCoinWin(number) {
  let point = countDecimals(number);
  if (point <= 1) {
    var rand = Math.random() * (2.9 - 0.01) + 0.01;
    var power = Math.pow(10, 2);
    var sum = number + (Math.floor(rand * power) / power)
    return Math.floor(sum * power) / power;
  } else {

    const random7 = Math.floor(Math.random() * 10) / Math.pow(10, point - 1);
    const random8 = Math.floor(Math.random() * 10) / Math.pow(10, point);
    var power = Math.pow(10, point);
    const sum = number + (random7 + random8);

    const result = Math.floor(sum * power) / power;

    return result;

  }
}
function randomCoinLoss(number) {
  let point = countDecimals(number);
  if (point <= 1) {
    var rand = Math.random() * (2.9 - 0.01) + 0.01;
    var power = Math.pow(10, 2);
    var sum = number - (Math.floor(rand * power) / power)
    return Math.floor(sum * power) / power;
  } else {
    const random7 = Math.floor(Math.random() * 10) / Math.pow(10, point - 1);
    const random8 = Math.floor(Math.random() * 10) / Math.pow(10, point);
    var power = Math.pow(10, point);
    const sum = number - (random7 + random8);

    const result = Math.floor(sum * power) / power;

    return result;
  }
}

function getRandomSign() {
  return Math.random() < 0.5 ? -1 : 1;
}

function randomCoinLossOrWin(number) {
  let point = countDecimals(number);
  if (point <= 1) {
    var rand = Math.random() * (2.9 - 0.01) + 0.01;
    var power = Math.pow(10, 2);
    var sum = number - (Math.floor(rand * power) / power);
    return Math.floor(sum * power) / power;
  } else {
    const random7 = Math.floor(Math.random() * 10) / Math.pow(10, point - 1);
    const random8 = Math.floor(Math.random() * 10) / Math.pow(10, point);

    // ใช้ getRandomSign เพื่อตัดสินใจว่าจะบวกหรือลบ
    var power = Math.pow(10, point);
    const sign = getRandomSign();
    const sum = number + sign * (random7 + random8);

    const result = Math.floor(sum * power) / power;

    return result;
  }
}

function countDecimals(number) {
  if (Math.floor(number) === number) return 0;

  const str = number.toString();
  const index = str.indexOf('.');
  return index === -1 ? 0 : str.length - index - 1;
}

// cron.schedule('*/5 * * * * *',async () => {
//   console.log('running a task every minute');
// });

// cron.schedule('* * * * *', async() => { //ทุกนาที

cron.schedule('*/10 * * * * *', async () => {
  // const NOW = dayjs().subtract(4, 'second').format("YYYY-MM-DD HH:mm:ss");
  // const DayBefore = dayjs().subtract(7, "day").format("YYYY-MM-DD HH:mm:ss");
  const NOW = dayjs().utc().tz("Asia/Bangkok").format("YYYY-MM-DD HH:mm:ss");
  const DayBefore = dayjs().utc().tz("Asia/Bangkok").subtract(7, "day").format("YYYY-MM-DD HH:mm:ss");

  try {
    const countTrade = await tradelist.count({
      where: {
        closing_time: {
          [op.between]: [DayBefore, NOW],
        }, status: 0
      }
    });
    if (countTrade > 0) {
      console.log(countTrade);
      const TradeTimeoutList = await tradelist.findAll({
        where: {
          closing_time: {
            [op.between]: [DayBefore, NOW],
          }, status: 0
        }
      });
      try {
        const response = await axios.get('https://api.binance.com/api/v3/ticker/price?symbols=["BTCUSDT","ETHUSDT","SHIBUSDT","BNBUSDT","DOGEUSDT","SOLUSDT","XRPUSDT","ADAUSDT","DOTUSDT","LTCUSDT","LINKUSDT","AVAXUSDT","MATICUSDT","ATOMUSDT"]', {
        });
        const data = response.data;
        TradeTimeoutList.map(async (trade) => {
          let onetradelist = await tradelist.findOne({
            where: { id: trade.id, status: 0 },
          });

          if (!onetradelist) {

            return;
          }
          if (trade.adminstatus === 0) { //admin ไม่ได้เซ็ต
            let closing_price = 0;
            let net = 0;
            let people_amout = 0;
            let trade_result = 0;
            let symbolName = "";
            if (trade.symbol === "EURUSD" || trade.symbol === "BGPUSD" || trade.symbol === "AUDUSD") {
              symbolName = trade.symbol.substring(0, trade.symbol.length - 3)
              try {
                const response = await axios.get(`https://api.fastforex.io/fetch-one?from=${symbolName}&to=USD&api_key=${api_key}`, {
                });
                closing_price = Number(response.data.result.USD) === Number(trade.opening_price) ? randomCoinLossOrWin(Number(trade.opening_price)) : response.data.result.USD;
                // closing_price = response.data.result.USD;

              } catch (error) {
                closing_price = randomCoinLossOrWin(trade.opening_price)
              }
            } else if (trade.symbol === "JPYUSD") {
              symbolName = trade.symbol.substring(0, trade.symbol.length - 3)
              try {
                const response = await axios.get(`https://api.fastforex.io/fetch-one?from=USD&to=${symbolName}&api_key=${api_key}`, {
                })
                closing_price = Number(response.data.result.JPY) === Number(trade.opening_price) ? randomCoinLossOrWin(Number(trade.opening_price)) : response.data.result.JPY;
                // closing_price = response.data.result.JPY;

              } catch (error) {
                closing_price = randomCoinLossOrWin(trade.opening_price)

              }
            } else if (trade.symbol === "CADUSD") {
              symbolName = trade.symbol.substring(0, trade.symbol.length - 3)
              try {
                const response = await axios.get(`https://api.fastforex.io/fetch-one?from=USD&to=${symbolName}&api_key=${api_key}`, {
                });
                closing_price = Number(response.data.result.CAD) === Number(trade.opening_price) ? randomCoinLossOrWin(Number(trade.opening_price)) : response.data.result.CAD;
                // closing_price = response.data.result.CAD;

              } catch (error) {
                closing_price = randomCoinLossOrWin(trade.opening_price)
              }
            } else if (trade.symbol === "XAUUSD") {
              symbolName = trade.symbol.substring(0, trade.symbol.length - 3)
              try {

                const options = {
                  method: 'GET',
                  url: 'https://www.goldapi.io/api/XAU/USD',
                  headers: {
                    "x-access-token": api_key_gold,
                    "Content-Type": "application/json"
                  }
                };
                const response = await axios.request(options);
                closing_price = Number(response.data.price) === Number(trade.opening_price) ? randomCoinLossOrWin(Number(trade.opening_price)) : response.data.price;

              } catch (error) {
                closing_price = randomCoinLossOrWin(trade.opening_price)
              }
            }
            else {
              const avax = data.find(item => item.symbol === trade.symbol);
              closing_price = avax.price

            }
            if (trade.type_order === 1) { //เลือกขึ้น

              if (trade.opening_price < closing_price) { //ชนะตลาด
                net = ((Math2float(trade.amount) * Math2float(trade.selectPercent)) / 100);
                people_amout = Math2float(net) + Math2float(trade.amount);
                trade_result = 0;
                await people.increment("credit", { by: people_amout, where: { id: trade.peopleId }, }).then((data) => {

                }).catch((err) => {
                  console.log(err.message);

                })
              } else {//แพ้ตลาด
                net = Math2float(trade.amount);
                trade_result = 1;
              }
            } else {//เลือกลง
              if (trade.opening_price > closing_price) { //ชนะตลาด
                net = ((Math2float(trade.amount) * Math2float(trade.selectPercent)) / 100);
                trade_result = 0;
                people_amout = Math2float(net) + Math2float(trade.amount);
                await people.increment("credit", { by: people_amout, where: { id: trade.peopleId }, }).then((data) => {

                }).catch((err) => {
                  console.log(err.message);

                })
              } else {//แพ้ตลาด
                net = Math2float(trade.amount);
                trade_result = 1;
              }
            }
            await tradelist
              .update(
                { status: 1, trade_result: trade_result, net: net, closing_price: closing_price },
                {
                  where: { id: trade.id },
                }
              ).then((data) => {

              }).catch((err) => {
                console.log(err.message);

              })
          } else if (trade.adminstatus === 1) {//admin ให้ชนะ
            let net = ((Math2float(trade.amount) * Math2float(trade.selectPercent)) / 100);
            let people_amout = Math2float(net) + Math2float(trade.amount);
            await people.increment("credit", { by: people_amout, where: { id: trade.peopleId }, }).then((data) => {

            }).catch((err) => {
              console.log(err.message);

            })
            await tradelist
              .update(
                { status: 1, trade_result: 0, net: net },
                {
                  where: { id: trade.id },
                }
              ).then((data) => {

              }).catch((err) => {
                console.log(err.message);

              })
          } else {//admin ให้แพ้
            let net = Math2float(trade.amount);
            await tradelist
              .update(
                { status: 1, trade_result: 1, net: net },
                {
                  where: { id: trade.id },
                }
              )
          }
        });

      } catch (error) {
        res.status(500).json({ error: error.message });
      }


    } else {
      console.log("no data");

    }
  } catch (error) {
    res.status(500).send({
      status: 500,
      message:
        error.message || "Some error occurred while creating the People.",
    });
  }

});


exports.createUserTrade = async (req, res) => {
  dayjs.locale("th");
  let peopledata = null;
  let symbolName = req.body.symbol.toUpperCase();
  let getPrice = 0;
  try {
    peopledata = await people.findOne({
      // attributes: ["id", "credit", "creditwithdraw"],
      attributes: ["id", "credit"],
      where: { id: req.body.peopleId },
    });
    peopledata = JSON.stringify(peopledata);
    peopledata = JSON.parse(peopledata);
  } catch (error) {

    res.status(500).send({
      status: 500,
      message:
        error.message || "Some error occurred while creating the People.",
    });
  }
  if (Number(peopledata.credit) < Number(req.body.amount)) {
    res.status(401).send({
      status: 401,
      message: "Insufficient amount",
    });
    return;
  }
  if (symbolName === "EUR" || symbolName === "GBP" || symbolName === "AUD") {
    try {
      const response = await axios.get(`https://api.fastforex.io/fetch-one?from=${symbolName}&to=USD&api_key=${api_key}`, {
      });
      getPrice = response.data.result.USD;

    } catch (error) {
      getPrice = genRand(0.001, 1, 5);
    }
    symbolName += "USD";
  } else if (symbolName === "JPY") {
    try {

      const response = await axios.get(`https://api.fastforex.io/fetch-one?from=USD&to=${symbolName}&api_key=${api_key}`, {
      });

      getPrice = response.data.result.JPY;


    } catch (error) {

      getPrice = genRand(140, 150, 3);


    }
    symbolName += "USD";
  } else if (symbolName === "CAD") {
    try {
      const response = await axios.get(`https://api.fastforex.io/fetch-one?from=USD&to=${symbolName}&api_key=${api_key}`, {
      });
      getPrice = response.data.result.CAD;

    } catch (error) {
      getPrice = genRand(0.001, 1.3, 5);
    }
    symbolName += "USD";
  } else {
    try {
      const response = await axios.get(`https://api.binance.com/api/v3/ticker/price?symbol=${symbolName}`, {
      });
      getPrice = response.data.price;


    } catch (error) {
      const symbol_subUSDT = symbolName.substring(0, symbolName.length - 4);
      const response = await axios.get(`https://api.fastforex.io//crypto/fetch-prices?pairs=${symbol_subUSDT}/USDT&api_key=${api_key}`, {
      });
      getPrice = Object.values(response.data.prices)[0];

    }
  }
  //  else {
  //   try {

  //     const symbol_subUSDT = symbolName.substring(0, symbolName.length - 4);
  //     const response = await axios.get(`https://api.fastforex.io//crypto/fetch-prices?pairs=${symbol_subUSDT}/USDT&api_key=${api_key}`, {
  //     });
  //     getPrice = Object.values(response.data.prices)[0];


  //   } catch (error) {
  //     const response = await axios.get(`https://api.binance.com/api/v3/ticker/price?symbol=${symbolName}`, {
  //     });
  //     getPrice = response.data.price;
  //   }
  // }

  const user_data = {

    symbol: symbolName,
    type_order: (req.body.selectSell !== 1 && req.body.selectSell !== 2 ? 1 : req.body.selectSell),
    amount: Number(req.body.amount),
    opening_time: dayjs(),
    opening_price: Number(getPrice),
    closing_time: dayjs().add(req.body.countTime, 'minute'), // second , minute , day
    // closing_price: req.body.idbank,
    status: 0,
    adminstatus: 0,
    selectPercent: req.body.selectPercent,
    peopleId: req.body.peopleId,

  }

  return await tradelist
    .create(user_data)
    .then(async (data) => {

      // await people.update({ credit: Number(peopledata.credit) - Number(req.body.amount) }, { where: { id: req.body.peopleId } })
      await people.increment("credit", { by: -req.body.amount, where: { id: req.body.peopleId }, });
      res.status(200).send({ status: true, id: data.id });
    })
    .catch((err) => {

      res.status(500).send({
        status: 500,
        message:
          err.message || "Some error occurred while creating the People.",
      });


    });

};

exports.getTradePrice = async (req, res) => {
  try {


    dayjs.locale("th");
    let peopledata = null;
    let symbolName = req.body.symbol.toUpperCase();
    let getPrice = 0;
    try {
      peopledata = await people.findOne({
        attributes: ["id", "credit"],
        where: { id: req.body.peopleId },
      });
      peopledata = JSON.stringify(peopledata);
      peopledata = JSON.parse(peopledata);
    } catch (error) {

      res.status(500).send({
        status: 500,
        message:
          error.message || "Some error occurred while creating the People.",
      });
    }
    if (Number(peopledata.credit) < Number(req.body.amount)) {
      res.status(401).send({
        status: 401,
        message: "Insufficient amount",
      });
      return;
    }
    if (symbolName === "EUR" || symbolName === "GBP" || symbolName === "AUD") {
      try {
        const response = await axios.get(`https://api.fastforex.io/fetch-one?from=${symbolName}&to=USD&api_key=${api_key}`, {
        });
        getPrice = response.data.result.USD;

      } catch (error) {
        getPrice = genRand(0.001, 1, 5);
      }
      symbolName += "USD";
    } else if (symbolName === "JPY") {
      try {
        const response = await axios.get(`https://api.fastforex.io/fetch-one?from=USD&to=${symbolName}&api_key=${api_key}`, {
        });
        getPrice = response.data.result.JPY;
      } catch (error) {
        getPrice = genRand(140, 150, 3);
      }
      symbolName += "USD";
    } else if (symbolName === "CAD") {
      try {
        const response = await axios.get(`https://api.fastforex.io/fetch-one?from=USD&to=${symbolName}&api_key=${api_key}`, {
        });
        getPrice = response.data.result.CAD;
      } catch (error) {
        getPrice = genRand(0.001, 1.3, 5);
      }
      symbolName += "USD";

    } else if (symbolName === "XAU") {
      try {
        const options = {
          method: 'GET',
          url: 'https://www.goldapi.io/api/XAU/USD',
          headers: {
            "x-access-token": api_key_gold,
            "Content-Type": "application/json"
          }
        };
        const response = await axios.request(options);
        getPrice = response.data.price;
      } catch (error) {
        getPrice = genRand(2620, 2660, 3);
      }
      symbolName += "USD";
    }
    else {
      try {
        const response = await axios.get(`https://api.binance.com/api/v3/ticker/price?symbol=${symbolName}`, {
        });
        getPrice = response.data.price;
      } catch (error) {
        const symbol_subUSDT = symbolName.substring(0, symbolName.length - 4);
        const response = await axios.get(`https://api.fastforex.io//crypto/fetch-prices?pairs=${symbol_subUSDT}/USDT&api_key=${api_key}`, {
        });
        getPrice = Object.values(response.data.prices)[0];
      }
    }
    res.status(200).send({ getPrice: getPrice.toString(), symbolName: symbolName });
  } catch (error) {
    res.status(500).send({
      message: error.message || "Some error occurred while retrieving User.",
    });
  }
}

exports.createUserTradeConfirm = async (req, res) => {
  const symbolName = req.body.symbol.toUpperCase();
  const getPrice = req.body.getPrice;

  // const openingTime = dayjs().tz("Asia/Bangkok").format("YYYY-MM-DD HH:mm:ss");

  const openingTime = dayjs().tz("Asia/Bangkok").format("YYYY-MM-DD HH:mm:ss");
  const closingTime = dayjs().tz("Asia/Bangkok").add(req.body.countTime, 'second').format("YYYY-MM-DD HH:mm:ss");
  let user_data = {

    symbol: symbolName,
    type_order: (req.body.selectSell !== 1 && req.body.selectSell !== 2 ? 1 : req.body.selectSell),
    amount: Number(req.body.amount),
    opening_time: openingTime,
    opening_price: Number(getPrice),
    closing_time: closingTime,
    // closing_time: dayjs().add(req.body.countTime, 'minute'), // second , minute , day
    status: 0,
    adminstatus: 0,
    selectPercent: req.body.selectPercent,
    peopleId: req.body.peopleId,

  }

  return await tradelist
    .create(user_data)
    .then(async (data) => {

      // await people.update({ credit: Number(peopledata.credit) - Number(req.body.amount) }, { where: { id: req.body.peopleId } })
      await people.increment("credit", { by: -req.body.amount, where: { id: req.body.peopleId }, });
      res.status(200).send({ status: true, id: data.id });
    })
    .catch((err) => {

      res.status(500).send({
        status: 500,
        message:
          err.message || "Some error occurred while creating the People.",
      });


    });
}

// exports.getOneUserTrading = async (req, res) => {
//   await tradelist
//     .findAll({
//       include: [
//         {
//           model: people,
//           as: "people",
//           attributes: [
//             "uid",
//             "credit",

//           ],
//         }
//       ],
//       where: { status: 0, peopleId: req.params.id },
//       order: [["createdAt", "DESC"]],
//     }).then((data) => {
//       res.send(data);
//     })
//     .catch((err) => {
//       res.status(500).send({
//         message: err.message || "Some error occurred while retrieving User.",
//       });
//     });
// }

exports.getOneUserTrading = async (req, res) => {
  await tradelist
    .findAll({
      include: [
        {
          model: people,
          as: "people",
          attributes: [
            "uid",
            "credit",
          ],
        }
      ],
      where: { status: 0, peopleId: req.params.id },
      order: [["createdAt", "DESC"]],
    })
    .then((data) => {
      // คำนวณความต่างของเวลาก่อนส่งไปยัง frontend
      const currentTime = dayjs().tz("Asia/Bangkok");
      
      // เพิ่มข้อมูลความต่างของเวลาลงในแต่ละรายการ
      const dataWithTimeDiff = data.map(item => {
        const itemData = item.toJSON(); // แปลง Sequelize instance เป็น JSON
        
        // คำนวณความต่างของเวลาปิดการซื้อขาย (อยู่ในหน่วยวินาที)
        const closingTime = dayjs.tz(itemData.closing_time, "Asia/Bangkok");
        const timeDiff = closingTime.diff(currentTime, "second");
        
        // ใช้ Math.max เพื่อให้แน่ใจว่าไม่มีค่าติดลบ
        itemData.timeRemainingSeconds = Math.max(0, timeDiff);
        
        return itemData;
      });
      
      res.send(dataWithTimeDiff);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving User.",
      });
    });
};
exports.getOneUserAllTrade = async (req, res) => {
  await tradelist
    .findAll({
      // include: [
      //   {
      //     model: people,
      //     as: "people",
      //     attributes: [
      //       "uid",
      //       "credit",

      //     ],
      //   }
      // ],
      where: { status: 1, peopleId: req.params.id },
      order: [["createdAt", "DESC"]],
    }).then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving User.",
      });
    });
}
exports.getOneUserAllTradeAdmin = async (req, res) => {
  await tradelist
    .findAll({
      // include: [
      //   {
      //     model: people,
      //     as: "people",
      //     attributes: [
      //       "uid",
      //       "credit",

      //     ],
      //   }
      // ],
      where: { peopleId: req.params.id },
      order: [["createdAt", "DESC"]],
    }).then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving User.",
      });
    });
}
// exports.getUserAllTradeAdmin = async (req, res) => {
//   await tradelist
//     .findAll({
//       include: [
//         {
//           model: people,
//           as: "people",
//           attributes: [
//             "uid",
//             "credit",
//             "firstname"

//           ],
//         }
//       ],
//       where: { status: 0 },
//       order: [["createdAt", "ASC"]],
//     }).then((data) => {
//       res.send(data);
//     })
//     .catch((err) => {
//       res.status(500).send({
//         message: err.message || "Some error occurred while retrieving User.",
//       });
//     });
// }
exports.getUserAllTradeAdmin = async (req, res) => {
  await tradelist
    .findAll({
      include: [
        {
          model: people,
          as: "people",
          attributes: [
            "uid",
            "credit",
            "firstname"
          ],
        }
      ],
      where: { status: 0 },
      order: [["createdAt", "ASC"]],
    })
    .then((data) => {

      const dataWithTimestamp = data.map(item => {
       const itemData = item.toJSON();
        
        // เฉพาะตัวที่ตรงกับ dayjs(alltrade.closing_time).tz("Asia/Bangkok").valueOf() + 3000
        const closingTime = dayjs.tz(itemData.closing_time, "Asia/Bangkok");
        itemData.closingTimestamp = closingTime.valueOf() + 3000;
        
        return itemData;
      });
      
      res.send(dataWithTimestamp);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving User.",
      });
    });
};
exports.getUserAllTradeHistoryAdmin = async (req, res) => {
  await tradelist
    .findAll({
      include: [
        {
          model: people,
          as: "people",
          attributes: [
            "uid",
            "credit",
            "firstname"

          ],
        }
      ],
      where: { status: 1 },
      order: [["createdAt", "DESC"]],
    }).then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving User.",
      });
    });
}


exports.AdminSetTrade = async (req, res) => {

  try {
    let opening_price = Number(req.body.opening_price);
    let result = 0;
    const adminstatus = req.body.adminstatus;
    const type_order = req.body.type_order;
    if (adminstatus === 1) {
      if (type_order === 1) {
        opening_price = randomCoinWin(opening_price);

      } else {
        opening_price = randomCoinLoss(opening_price);
      }

    } else {
      if (type_order === 1) {
        opening_price = randomCoinLoss(opening_price);

      } else {
        opening_price = randomCoinWin(opening_price);
      }

    }
    const data = await tradelist
      .update(
        { closing_price: opening_price, adminstatus: adminstatus },
        {
          where: { id: req.body.id },
        }
      )
    res.status(200).send(data);
  } catch (error) {
    res.status(500).send({
      message: error.message || "Some error occurred while retrieving getOneUserTradingTimeout.",
    });


  }


}

exports.getOneUserTradingTimeout = async (req, res) => {
  const transaction = await sequelizeInstance.transaction(); // Start a transaction
  try {

    let onetradelist = await tradelist.findOne({
      where: { id: req.body.id, status: 0 },
      lock: transaction.LOCK.UPDATE,  // Lock the row to prevent concurrent updates
      transaction: transaction         // Use the transaction
    });

    if (!onetradelist) {
      const updatedTrade = await tradelist.findOne({
        where: { id: req.body.id },
        transaction: transaction
      });
      await transaction.commit(); // Commit the transaction
      return res.status(200).send(updatedTrade);
    }

    onetradelist = JSON.stringify(onetradelist);
    onetradelist = JSON.parse(onetradelist);

    let price_stock = 0; // Call API to get stock price
    let trade_result = 0;
    let net = 0;
    let people_amout = 0;
    let credit_to_add = 0;
    let symbolName = "";

    if (onetradelist.adminstatus == 0) { //แอดมินไม่ได้เซ็ต
      switch (onetradelist.symbol) {
        case "EURUSD": case "GBPUSD": case "AUDUSD":
          symbolName = onetradelist.symbol.substring(0, onetradelist.symbol.length - 3)
          try {
            const response = await axios.get(`https://api.fastforex.io/fetch-one?from=${symbolName}&to=USD&api_key=${api_key}`, {
            });
            price_stock = response.data.result.USD;

          } catch (error) {
            price_stock = randomCoinLossOrWin(onetradelist.opening_price);
          }
          break;
        case "JPYUSD":
          symbolName = onetradelist.symbol.substring(0, onetradelist.symbol.length - 3)
          try {
            const response = await axios.get(`https://api.fastforex.io/fetch-one?from=USD&to=${symbolName}&api_key=${api_key}`, {
            })
            price_stock = response.data.result.JPY;

          } catch (error) {
            price_stock = randomCoinLossOrWin(onetradelist.opening_price);

          }
          break;
        case "CADUSD":
          symbolName = onetradelist.symbol.substring(0, onetradelist.symbol.length - 3)
          try {
            const response = await axios.get(`https://api.fastforex.io/fetch-one?from=USD&to=${symbolName}&api_key=${api_key}`, {
            });
            price_stock = response.data.result.CAD;

          } catch (error) {
            price_stock = randomCoinLossOrWin(onetradelist.opening_price);
          }
          break;
        case "XAUUSD":
          symbolName = onetradelist.symbol.substring(0, onetradelist.symbol.length - 3)
          try {
            const options = {
              method: 'GET',
              url: 'https://www.goldapi.io/api/XAU/USD',
              headers: {
                "x-access-token": api_key_gold,
                "Content-Type": "application/json"
              }
            };
            const response = await axios.request(options);
            price_stock = response.data.price;

          } catch (error) {
            price_stock = randomCoinLossOrWin(onetradelist.opening_price);
          }
          break;

        default:
          try {
            const response = await axios.get(`https://api.binance.com/api/v3/ticker/price?symbol=${onetradelist.symbol}`, {
            });
            price_stock = response.data.price;



          } catch (error) {
            const symbol_subUSDT = onetradelist.symbol.substring(0, onetradelist.symbol.length - 4);
            const response = await axios.get(`https://api.fastforex.io//crypto/fetch-prices?pairs=${symbol_subUSDT}/USDT&api_key=${api_key}`, {
            });
            price_stock = Object.values(response.data.prices)[0];

          }
        // break;

        // default:
        //   try {

        //     const symbol_subUSDT = onetradelist.symbol.substring(0, onetradelist.symbol.length - 4);
        //     const response = await axios.get(`https://api.fastforex.io//crypto/fetch-prices?pairs=${symbol_subUSDT}/USDT&api_key=${api_key}`, {
        //     });
        //     price_stock = Object.values(response.data.prices)[0];


        //   } catch (error) {
        //     const response = await axios.get(`https://api.binance.com/api/v3/ticker/price?symbol=${onetradelist.symbol}`, {
        //     });
        //     price_stock = response.data.price;
        //   }
      }
      if (onetradelist.type_order === 1) { //เลือกขึ้น

        if (onetradelist.opening_price < price_stock) { //ชนะตลาด

          // net = ((Math2float(onetradelist.amount) * Math2float(onetradelist.selectPercent)) / 100);
          net = ((onetradelist.amount * onetradelist.selectPercent) / 100);


          trade_result = 0;
          // people_amout = Math2float(net) + Math2float(onetradelist.amount);
          // people_amout = net + onetradelist.amount;
          credit_to_add = net + onetradelist.amount;

          // await people.increment("credit", { by: people_amout, where: { id: onetradelist.peopleId },transaction: t });


        } else {//แพ้ตลาด

          // net = Math2float(onetradelist.amount);
          net = onetradelist.amount;
          trade_result = 1;
        }
      } else {//เลือกลง
        if (onetradelist.opening_price > price_stock) { //ชนะตลาด

          // net = ((Math2float(onetradelist.amount) * Math2float(onetradelist.selectPercent)) / 100);
          net = ((onetradelist.amount * onetradelist.selectPercent) / 100);


          trade_result = 0;
          // people_amout = Math2float(net) + Math2float(onetradelist.amount);
          // people_amout = net + onetradelist.amount;
          credit_to_add = net + onetradelist.amount;
          // await people.increment("credit", { by: people_amout, where: { id: onetradelist.peopleId },transaction: t });

        } else {//แพ้ตลาด

          // net = Math2float(onetradelist.amount);
          net = onetradelist.amount;
          trade_result = 1;
        }
      }

    } else if (onetradelist.adminstatus == 1) { //แอดมินให้ชนะ
      price_stock = onetradelist.closing_price;
      // net = ((Math2float(onetradelist.amount) * Math2float(onetradelist.selectPercent)) / 100);
      net = ((onetradelist.amount * onetradelist.selectPercent) / 100);

      trade_result = 0;
      // people_amout = Math2float(net) + Math2float(onetradelist.amount);
      // people_amout = net + onetradelist.amount;
      credit_to_add = net + onetradelist.amount;
      // await people.increment("credit", { by: people_amout, where: { id: onetradelist.peopleId } ,transaction: t});

    } else { //แอดมินให้แพ้
      price_stock = onetradelist.closing_price;
      // net = Math2float(onetradelist.amount);
      net = onetradelist.amount;
      trade_result = 1;
    }
    let person = await people.findOne({
      where: { id: onetradelist.peopleId },
      lock: transaction.LOCK.UPDATE,  // ล็อคแถวของ people สำหรับการอัปเดต
      transaction: transaction
    });
    if (credit_to_add > 0) {
      await people.increment("credit", {
        by: credit_to_add,
        where: { id: onetradelist.peopleId },
        transaction: transaction // Include the transaction
      });
      console.log(credit_to_add);

    }
    await tradelist.update(
      { closing_price: price_stock, status: 1, trade_result: trade_result, net: net },
      { where: { id: req.body.id }, transaction: transaction } // Use the transaction
    );

    const updatedTrade = await tradelist.findOne({
      where: { id: req.body.id },
      transaction: transaction // Use the transaction
    });

    await transaction.commit(); // Commit the transaction

    res.status(200).send(updatedTrade);

  } catch (err) {
    await transaction.rollback(); // Rollback on error
    res.status(500).send({
      message: err.message || "Some error occurred while retrieving getOneUserTradingTimeout.",
    });
  }

}


exports.callcoinapi = async (req, res) => {
  // try {

  //   // const response = await axios.get('https://api.binance.com/api/v3/ticker/price?symbols=["BTCUSDT","ETHUSDT","SHIBUSDT","BNBUSDT","DOGEUSDT","SOLUSDT","XRPUSDT","ADAUSDT","DOTUSDT","LTCUSDT","LINKUSDT","AVAXUSDT","MATICUSDT","ATOMUSDT"]', {
  //     // const response = await axios.get('https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT', {
  //     // const response = await axios.get('https://api.binance.com/api/v3/ticker/price?symbol=GBPUSDT', {
  //   });
  //   // const price_btc = response.data.price;
  //   // const getPrice = Math2float(price_btc);
  //   // res.json(getPrice);
  //   // res.json(response.data);
  //   res.json(response.data)

  // } catch (error) {
  //   res.status(500).json({ error: error.message });
  // }


  // try {

  //   // const response = await axios.get('https://api.fastforex.io/fetch-multi?from=USD&to=EUR%2CGBP%2CAUD%2CJPY%2CCAD&api_key=4c1ae80e15-97c9c85ef4-sibb6h', {
  //   // const response = await axios.get(`https://api.fastforex.io/fetch-one?from=EUR&to=USD&api_key=${api_key}`, {
  //   const response = await axios.get(`https://api.fastforex.io/fetch-multi?from=USD&to=JPY,CAD&api_key=${api_key}`, {
  //     // const response = await axios.get(`https://api.bitget.com/api/v2/spot/market/tickers?symbol=EURUSD`, {

  //   });

  //   // res.json(Object.values(response.data.result)[0]);
  //   res.json(response.data);
  // } catch (error) {
  //   res.status(500).json({ error: error.message });
  // }



  const options = {
    method: 'GET',
    url: 'https://www.goldapi.io/api/XAU/USD',
    headers: {
      "x-access-token": api_key_gold,
      "Content-Type": "application/json"
    }
  };


  try {
    const response = await axios.request(options);
    res.json(response.data.price);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }


}