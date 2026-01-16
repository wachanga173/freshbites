const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const fs = require('fs')
const path = require('path')
const { JWT_SECRET } = require('./auth')

const usersPath = path.join(__dirname, 'users.json')

function readUsers() {
  try {
    const data = fs.readFileSync(usersPath, 'utf8')
    return JSON.parse(data)
  } catch (err) {
    return { users: [] }
  }
}

function writeUsers(data) {
  fs.writeFileSync(usersPath, JSON.stringify(data, null, 2))
}

function findUserByUsername(username) {
  const data = readUsers()
  return data.users.find(u => u.username === username)
}

function findUserByEmail(email) {
  const data = readUsers()
  return data.users.find(u => u.email === email)
}

function createUser(userData) {
  const data = readUsers()
  const newUser = {
    id: Date.now().toString(),
    ...userData,
    createdAt: new Date().toISOString()
  }
  data.users.push(newUser)
  writeUsers(data)
  return newUser
}

function getAllUsers() {
  const data = readUsers()
  return data.users.map(u => ({
    id: u.id,
    username: u.username,
    email: u.email,
    role: u.role,
    createdAt: u.createdAt
  }))
}

function updateUser(id, updates) {
  const data = readUsers()
  const index = data.users.findIndex(u => u.id === id)
  if (index === -1) return null

  data.users[index] = { ...data.users[index], ...updates }
  writeUsers(data)
  return data.users[index]
}

function deleteUser(id) {
  const data = readUsers()
  const filtered = data.users.filter(u => u.id !== id)
  if (filtered.length === data.users.length) return false

  writeUsers({ users: filtered })
  return true
}

function updateUserPassword(id, hashedPassword) {
  const data = readUsers()
  const index = data.users.findIndex(u => u.id === id)
  if (index === -1) return false

  data.users[index].password = hashedPassword
  data.users[index].passwordUpdatedAt = new Date().toISOString()
  writeUsers(data)
  return true
}

async function hashPassword(password) {
  return bcrypt.hash(password, 10)
}

async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash)
}

function generateToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  )
}

module.exports = {
  findUserByUsername,
  findUserByEmail,
  createUser,
  getAllUsers,
  updateUser,
  deleteUser,
  updateUserPassword,
  hashPassword,
  comparePassword,
  generateToken
}
