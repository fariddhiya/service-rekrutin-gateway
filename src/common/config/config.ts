import * as dotenv from 'dotenv';

// Set the NODE_ENV to 'development' by default
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

const envFound = dotenv.config();
if (!envFound) {
  throw new Error("⚠️  Couldn't find .env file  ⚠️");
}

export default () => ({
  port: process.env.PORT || 3000,
  mysqlConfig: {
    master: {
      host: process.env.DBHOST,
      port: parseInt(process.env.DBPORT),
      user: process.env.DBUSER,
      password: process.env.DBPASSWORD,
      database: process.env.DBNAME,
      connectionLimit: 3,
    },
    slave: {
      host: process.env.DBHOST_SLAVE,
      port: parseInt(process.env.DBPORT_SLAVE),
      user: process.env.DBUSER_SLAVE,
      password: process.env.DBPASSWORD_SLAVE,
      database: process.env.DBNAME_SLAVE,
      connectionLimit: 3,
    },
  },
  api: {
    prefix: process.env.API_PREFIX || 'api',
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    publicKey: process.env.JWT_PUBLIC_KEY,
    privateKey: process.env.JWT_PRIVATE_KEY,
    tokenExpired: process.env.JWT_TOKEN_EXPIRED,
  },
  grpc: {
    hostCustomer: process.env.GRPC_HOST_CUSTOMER,
  },
});
