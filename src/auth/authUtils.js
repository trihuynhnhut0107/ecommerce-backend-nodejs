"use strict";
const JWT = require("jsonwebtoken");
const asyncHandler = require("../helpers/asyncHandler");
const { AuthFailureError, NotFoundError } = require("../core/error.response");

const { findByUserId } = require("../services/keyToken.service");

const HEADER = {
  API_KEY: "x-api-key",
  CLIENT_ID: "x-client-id",
  AUTHORIZATION: "authorization",
};

const createTokenPair = async (payload, publicKey, privateKey) => {
  try {
    // accessToken
    const accessToken = await JWT.sign(payload, publicKey, {
      expiresIn: "2 days",
    });
    const refreshToken = await JWT.sign(payload, privateKey, {
      expiresIn: "7 days",
    });

    //

    JWT.verify(accessToken, publicKey, (err, decode) => {
      if (err) {
        console.log(`error verify:: `, err);
      }
      console.log(`decode verify:: `, decode);
    });
    return { accessToken, refreshToken };
  } catch (error) {}
};

const authentication = asyncHandler(async (req, res, next) => {
  /*
  1 - Check userId missing?
  2 - Get accessToken
  3 - verifyToken
  4 - check user in dbs?
  5 - check keyUser with this userId
  6 - true all => return next()
  */

  // 1.
  const userId = req.headers[HEADER.CLIENT_ID];
  if (!userId) throw new AuthFailureError("Invalid request");

  // 2.
  console.log(userId);
  const keyUser = await findByUserId(userId);
  if (!keyUser) throw new NotFoundError("User key not found");

  // 3.

  const accessToken = req.headers[HEADER.AUTHORIZATION];
  if (!accessToken) throw new AuthFailureError("Invalid Request");

  try {
    console.log("keyuser:", keyUser);
    const decodeUser = JWT.verify(accessToken, keyUser.privateKey);
    if (userId !== decodeUser.userId)
      throw new AuthFailureError("Invalid User ID");
    req.keyUser = keyUser;
    return next();
  } catch (error) {
    throw error;
  }
});

module.exports = {
  createTokenPair,
  authentication,
};
