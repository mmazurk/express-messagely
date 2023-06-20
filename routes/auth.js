const express = require("express");
const router = new express.Router();
const ExpressError = require("../expressError");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { BCRYPT_WORK_FACTOR, SECRET_KEY } = require("../config");

/** POST /login - login: {username, password} => {token}
 *
 * Make sure to update their last-login!
 *
 **/
router.post("/login", async function (req, res, next) {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      throw new ExpressError("Username and password required", 400);
    }
    const isValidUser = await User.authenticate(username, password);
    if (isValidUser) {
      const token = jwt.sign({ username }, SECRET_KEY);
      const timestamp = await User.updateLoginTimestamp(username);
      return res.json({ message: "valid user", new_timestamp: timestamp, token });
    }
    else {
      throw new ExpressError("Invalid username or password", 400)
    }
  } catch (e) {
    return next(e);
  }
});

/** POST /register - register user: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 *
 *  Make sure to update their last-login!
 */
router.post("/register", async function (req, res, next) {
  try {
    const { username, password, first_name, last_name, phone } = req.body;
    if (!username || !password) {
      throw new ExpressError("Username and password required", 400);
    }
    const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);
    const user = await User.register({
      username,
      hashedPassword,
      first_name,
      last_name,
      phone,
    });
    const token = jwt.sign(user.username, SECRET_KEY);
    return res.json({ message: "registered!", token });
  } catch (e) {
    return next(e);
  }
});

module.exports = router;
