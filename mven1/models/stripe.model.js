const { Sequelize } = require('sequelize');
const db = require('../config/postgres');

const Stripe = db.define('stripe', {
  api_key: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  secret_key: {
    type: Sequelize.STRING,
    allowNull: false,
  },
});

module.exports = Stripe;

/*module.exports.createUser = (newUser, callback) => {
    bcryptjs.genSalt(10, (err, salt) => {
        bcryptjs.hash(newUser.password, salt, (error, hash) => {
            const newUserResource = newUser;
            newUserResource.password = hash;
            newUserResource.save(callback);
        });
    });
};
module.exports.getUserByEmail = function (email, callback) {
    var query = {email: email}
    User.findOne(query, callback)
};

module.exports.comparePassword = function (candidatePassword, hash, callback) {
    bcrypt.compare(candidatePassword, hash, function (err, isMatch) {
        if (err) throw err;
        callback(null, isMatch);
    })
}*/
//Oussama Kriaa
