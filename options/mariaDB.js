import dotenv from 'dotenv'
dotenv.config()

const options = {
  client: 'mysql',
  connection: {
      host: process.env.MYSQL_HOST,
      port: process.env.MYSQL_PORT,
      user: process.env.MYSQL_USER,
      password: '',
      database: process.env.MYSQL_DBNAME
  }
}

export default options