const express = require("express");
const router = new express.Router();
const ExpressError = require("../expressError");
const Message = require("../models/message");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { BCRYPT_WORK_FACTOR, SECRET_KEY } = require("../config");

/** GET /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Make sure that the currently-logged-in users is either the to or from user.
 *
 **/

router.get("/:id", async function(req, res, next) {
try {
    const id = req.params.id;
    const result = await Message.get(id);
    return res.json(result); // we don't need return because there's nothing after this
} catch(e) {
    return next(e); // we need the return to pass it to middleware
}
});


/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/

router.post("/", async function(req, res, next){
try{
    const {from_username, to_username, body} = req.body;
    const result = await Message.create({from_username, to_username, body})
    return res.json(result);
} catch (e) {
    return next(e);
}
});



/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Make sure that the only the intended recipient can mark as read.
 *
 **/
router.post("/:id/read", async function(req, res, next) {
try {
    const {id} = req.params;
    const result = await Message.markRead(id);
    return res.json(result);
} catch(e) {
    return next(e)
}

});


module.exports = router;