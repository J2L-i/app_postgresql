module.exports = {
  // Configure database
  db: {
    postgres: {
      host: '127.0.0.1',
      port: 5432,
      user: 'postgres',
      pass: 'root',
      database: 'usa',
    },
  },

  google: {
    clientID:
      '  858889952041-6vqt3qakaiksu83ha1jue51pp26atboa.apps.googleusercontent.com  ',
    clientSecret: 'b1DsaSzlJEemWV6vVLS30VdZ',
  },
  mongodb: {
    dbURI: 'mongodb://localhost/usa',
  },
  zohocrm: {
    clientID: '1000.DU4KD2QWARJO84212J8FVNPO6UFSMH',
    clientSecret: '3ebdb0336de1f4595e293f794809acf43b2c82d813',
    email: 'yassinoubou93@gmail.com',
    password: 'Bh55Bh55',
    displayName: 'yassineBouassida',
    grant_type: 'authtooauth',
    scope: 'ZohoCRM.modules.all',
  },
  SECRET: 'kusudama00',
  mailgun: {
    apiKey: 'key-766b4f7fab3a58679e7849399b5259f4',
    domain: 'sandbox7a1b859ac2dd4e949420d2ad9adaa885.mailgun.org',
  },
  expressSession: 'authTokenSZ',
  zipcodeApi:
    'lMWiLFggXJJiy4JeLBvIAnPrRhfEf38b7Yt99GmER4juXlZrVVYe2m5EjBRJW0Ra',
};
