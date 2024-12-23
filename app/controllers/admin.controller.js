const db = require("../models");
const user = db.user;
const role = db.role;
const crypto = require("crypto");
const sequelize = require("sequelize");

exports.getAllAdmin = async (req, res) => {
    role.findByPk(2, {
        include: [
            {
                model: user,
                as: 'users',
                through: {
                    attributes: [],
                }
            }
        ]
    })
        .then(data => {
            res.send(data);
        }).catch(err => {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while retrieving Admin."
            });
        });
}

exports.getOneAdmin = (req, res) => {
    const id = req.params.id;
    user.findOne({ where: { id: id } })
        .then(user => {
            res.status(200).send({ user });
        })
        .catch(err => {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while retrieving Admin."
            });
        });

}

exports.updateAdmin = async (req, res) => {


    user.findAll({ where: { username: req.body.username } })
    .then(async (checkuser) => {
      
      if (checkuser.length > 1) {
        res.status(400).send({
          status: 400,
          message: "Failed! Username is already in use!"
        });
        return;
      }
  
      const id = req.params.id;
      user.update({
        ...req.body,
        version: sequelize.literal('version + 1')
      }, {
        where: { id: id }
      })
        .then(num => {
            if (num == 1) {
                res.send({
                    message: "Admin was updated successfully."
                });
            } else {
                res.send({
                    message: `Cannot update Admin with id=${id}. Maybe Question was not found or req.body is empty!`
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Error updating Admin with id=" + id
            });
        });
      
    });

    
}

exports.deleteAdmin = (req, res) => {
    const id = req.params.id;

    // user.findOne({
    //     where: {
    //       id: id
    //     }
    //   }).then(data=>{
    //     data.getRoles().then(roles => {
    //         if(roles[0].name=="mod"){
    //           return  res.status(500).send({
    //                 message: "Could not delete SuperAdmin with id=" + id
    //               });
    //         }
          
    //       });
    //   });
    user.destroy({
      where: { id: id }
    })
      .then(() => {
        res.status(200).send({
          message: "Admin was deleted successfully!"
        });
      })
      .catch(err => {
        res.status(500).send({
          message: "Could not delete Admin with id=" + id
        });
      });
  };

  exports.genHMAC=async(req,res)=>{
    try {
        const key = '3wdAmpT1ag2Ky81QLVhrg5jb';
        const message = req.body.message;
      
        if (!message) {
          return res.status(400).json({ error: "Message is required" });
        }
      
        const hash = crypto.createHmac('sha256', key).update(message).digest('hex');
        res.json({ hash });
    } catch (error) {
        console.log(error.message);
        
    }

}