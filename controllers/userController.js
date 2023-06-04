const asyncHandler = require("express-async-handler")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const pool = require("../config/db")
const jwtGenerator = require("../utils/jwtGenerator")

//@desc 	Register a new user
//@route 	POST /api/user
//@access Public
const registerUser = asyncHandler(async (req, res) => {
  const { user_id, email, password, secondary_email, gsm, firstname, lastname, locale, timezone, status } = req.body

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
    "INSERT INTO users (user_id, email, password, secondary_email, gsm, firstname, lastname, locale, timezone, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *",
    [user_id, email, hashedPassword, secondary_email, gsm, firstname, lastname, locale, timezone, status]
  );

  if (newUser.rows.length > 0) {
    res.status(201).json({
      id: newUser.rows[0].user_id,
      email: newUser.rows[0].email,
      password: newUser.rows[0].password,
      secondary_email: newUser.rows[0].secondary_email,
      gsm: newUser.rows[0].gsm,
      firstname: newUser.rows[0].firstname,
      lastname: newUser.rows[0].lastname,
      locale: newUser.rows[0].locale,
      timezone: newUser.rows[0].timezone,
      status: newUser.rows[0].status,
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
      secondary_email: user.rows[0].secondary_email,
      gsm: user.rows[0].gsm,
      firstname: user.rows[0].firstname,
      lastname: user.rows[0].lastname,
      locale: user.rows[0].locale,
      timezone: user.rows[0].timezone,
      status: user.rows[0].status,
      role: user.rows[0].role,
      token: jwtGenerator(user.rows[0].user_id),
    })
  } else {
    res.status(401)
    throw new Error("Invalid credentials")
  }
})

// @desc    Add user
// @route   POST /api/users
// @access  Private
const addUser = asyncHandler(async (req, res) => {
  const { user_id, email, password, secondary_email, gsm, firstname, lastname, locale, timezone, status } = req.body

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
    "INSERT INTO users (user_id, email, password, secondary_email, gsm, firstname, lastname, locale, timezone, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *",
    [user_id, email, hashedPassword, secondary_email, gsm, firstname, lastname, locale, timezone, status]
  );

  if (newUser.rows.length > 0) {
    res.status(201).json({
      id: newUser.rows[0].user_id,
      email: newUser.rows[0].email,
      message: "User created successfully",
    })
  } else {
    res.status(400)
    throw new Error("Invalid user data")
  }
})


// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private
const updateUser = asyncHandler(async (req, res) => {
  const { user_id, email, password, secondary_email, gsm, firstname, lastname, locale, timezone, status } = req.body

  const user = await pool.query("SELECT * FROM users WHERE email = $1", [
    email
  ]);

  //Update User
  const updatedUser = await pool.query(
    "UPDATE users SET user_id = $1, email = $2, password = $3, secondary_email = $4, gsm = $5, firstname = $6, lastname = $7, locale = $8, timezone = $9, status = $10 WHERE user_id = $1 RETURNING *",
    [user_id, email, password, secondary_email, gsm, firstname, lastname, locale, timezone, status]
  );

  if (updatedUser.rows.length > 0) {
    res.status(201).json({
      id: updatedUser.rows[0].user_id,
      email: updatedUser.rows[0].email,
      message: "User updated successfully",
    })
  } else {
    res.status(400)
    throw new Error("Invalid user data")
  }
})

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private

const deleteUser = asyncHandler(async (req, res) => {
  const user = await pool.query("SELECT * FROM users WHERE user_id = $1", [
    req.params.id
  ]);

  if (user.rows.length === 0) {
    return res.status(404).json("User not found");
  }

  await pool.query("DELETE FROM users WHERE user_id = $1", [
    req.params.id
  ]);

  res.status(200).json("User deleted successfully");
});


// @desc    Get users
// @route   GET /api/users/all
// @access  Private

const getUsers = asyncHandler(async (req, res) => {
  const users = await pool.query("SELECT * FROM users ORDER BY user_id ASC");
  res.json(users.rows);
});

// @desc    Get user role and permissions by user id
// @route   GET /api/users/role/:id
// @access  Private
const getUserRole = asyncHandler(async (req, res) => {
  let permissions = []

  const user = await pool.query("SELECT * FROM users WHERE user_id = $1", [
    req.params.id
  ]);

  if (user.rows.length === 0) {
    return res.status(404).json("User not found");
  }

  console.log(user.rows[0].user_id)

  const userRoleId = await pool.query("SELECT role_id FROM user_roles WHERE user_id = $1", [
    user.rows[0].user_id
  ]);

  console.log(userRoleId);

  const userPermissions = await pool.query("SELECT * FROM role_permissions WHERE role_id = $1", [
    userRoleId.rows[0].role_id
  ])

  if (userPermissions.rows.length === 0) {
    return res.status(404).json("User role not found");
  }


  userPermissions.rows.forEach(element => {
    permissions.push(element.permission_id)
  });

  res.json(
    {
      user_id: user.rows[0].user_id,
      role_id: userRoleId.rows[0].role_id,
      permissions: permissions
    }
  );
});

module.exports = {
  registerUser,
  loginUser,
  addUser,
  updateUser,
  deleteUser,
  getUsers,
  getUserRole
}
