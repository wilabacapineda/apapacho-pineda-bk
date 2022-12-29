import dotenv from 'dotenv'
dotenv.config()

export const connectionStringUrl = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@${process.env.MONGO_HOST}/${process.env.MONGO_DBNAME}?retryWrites=true&w=majority`
export const connectionStringUrlSessions = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@${process.env.MONGO_HOST}/${process.env.MONGO_DBNAMESESSIONS}?retryWrites=true&w=majority`

export default connectionStringUrl