const bcryptjs = require('bcryptjs');

const { Sequelize } = require('sequelize');
const db = require('../config/postgres');

const Admin = db.define('admin', {
  full_name: {
    type: Sequelize.STRING,
    unique: true,
    allowNull: false,
  },
  email: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  country: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  avatar: {
    type: Sequelize.STRING,
  },
  authToken: {
    type: Sequelize.STRING,
  },
  access_token: {
    type: Sequelize.STRING,
  },
  refresh_token: {
    type: Sequelize.STRING,
  },
  numAccess: {
    type: Sequelize.INTEGER,
  },
  date_Token: {
    type: Sequelize.STRING,
  },
  tokenEmail: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  tokenPassword: {
    type: Sequelize.STRING,
  },
  created_at_token_password: {
    type: Sequelize.DATE,
  },
  last_login: {
    type: Sequelize.DATE,
  },
});

module.exports = Admin;

module.exports.createUser = (newUser, callback) => {
  bcryptjs.genSalt(10, (err, salt) => {
    bcryptjs.hash(newUser.password, salt, (error, hash) => {
      const newUserResource = newUser;
      newUserResource.password = hash;
      newUserResource.save(callback);
    });
  });
};
module.exports.getUserByEmail = function(email, callback) {
  var query = { email: email };
  User.findOne(query, callback);
};

module.exports.comparePassword = function(candidatePassword, hash, callback) {
  bcrypt.compare(candidatePassword, hash, function(err, isMatch) {
    if (err) throw err;
    callback(null, isMatch);
  });
};
//Oussama Kriaa
