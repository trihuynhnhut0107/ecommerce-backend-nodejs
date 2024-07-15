"use strict";

const express = require("express");
const asyncHandler = require("../../helpers/asyncHandler");
const AccessController = require("../../controllers/access.controller");

const { authentication } = require("../../auth/authUtils");
const router = express.Router();

//

// signUp
router.post("/user/signup", asyncHandler(AccessController.signUp));

// login
router.post("/user/login", asyncHandler(AccessController.login));

// authentication
router.use(authentication);

// logout
router.post("/user/logout", asyncHandler(AccessController.logout));

module.exports = router;
