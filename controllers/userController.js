const asyncHandler = require("express-async-handler")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const pool = require("../config/db")
const jwtGenerator = require("../utils/jwtGenerator")

//@desc 	Register a new user
//@route 	POST /api/user
//@access Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body

  const user = await pool.query("SELECT * FROM users WHERE email = $1", [
    email
  ]);

  //Find if user already exists
  if (user.rows.length > 0) {
    return res.status(401).json("User already exist!");
  }

  //Hash the password
  const salt = await bcrypt.genSalt(10)
  const hashedPassword = await bcrypt.hash(password, salt)

  //Create User
  const newUser = await pool.query(
    "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *",
    [name, email, hashedPassword, role]
  );

  if (newUser.rows.length > 0) {
    res.status(201).json({
      id: newUser.rows[0].user_id,
      name: newUser.rows[0].name,
      email: newUser.rows[0].email,
      role: newUser.rows[0].role,
      token: jwtGenerator(newUser.rows[0].user_id),
    })
  } else {
    res.status(400)
    throw new Error("Invalid user data")
  }

})

//@desc 	Login a user
//@route 	POST /api/user/login
//@access Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body

  const user = await pool.query("SELECT * FROM users WHERE email = $1", [
    email
  ]);

  if (user.rows.length === 0) {
    return res.status(401).json("Invalid Credential");
  }

  //Check user and passwords match
  if (user && (await bcrypt.compare(password, user.rows[0].password))) {
    res.status(200).json({
      id: user.rows[0].user_id,
      name: user.rows[0].name,
      email: user.rows[0].email,
      role: user.rows[0].role,
      token: jwtGenerator(user.rows[0].user_id),
    })
  } else {
    res.status(401)
    throw new Error("Invalid credentials")
  }
})

module.exports = {
  registerUser,
  loginUser,
}
