import dotenv from 'dotenv'
dotenv.config()

const options3 = {
    client: "sqlite3",
    connection: {
        filename: process.env.SQL3_FILE
    },
    useNullAsDefault: true
}

export default options3