import UsersDaoMongoDb from './UsersDaoMongoDb.js'

const loadUsers = () => {
    const users = new UsersDaoMongoDb
    return users
}

export default loadUsers