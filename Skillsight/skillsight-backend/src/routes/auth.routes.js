const express = require('express')
const router = express.Router()
const { registerUser, loginUser, getCurrentUser, updateCurrentUser } = require('../controllers/auth.controller')
const authMiddleware = require('../middleware/auth.middleware')

router.post('/register', registerUser)
router.post('/login', loginUser)
router.get('/me', authMiddleware, getCurrentUser)
router.patch('/me', authMiddleware, updateCurrentUser)

module.exports = router
