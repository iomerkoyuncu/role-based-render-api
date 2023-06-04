const express = require("express")
const router = express.Router()
const {
  registerUser,
  loginUser,
  addUser,
  updateUser,
  deleteUser,
  getUsers,
  getUserRole
} = require("../controllers/userController")

const { protect } = require("../middlewares/authMiddleware")

router.post("/register", registerUser)
router.post("/login", loginUser)
router.get("/all", getUsers)
router.post("/", addUser)
router.put("/:id", updateUser)
router.delete("/:id", deleteUser)
router.get("/role/:id", getUserRole)


module.exports = router
