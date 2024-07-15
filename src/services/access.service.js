"use strict";

const userModel = require("../models/user.model");
const bcrypt = require("bcrypt");
const crypto = require("node:crypto");
const KeyTokenService = require("./keyToken.service");
const { createTokenPair } = require("../auth/authUtils");
const { getInfoData } = require("../utils");
const { BadRequestError, AuthFailureError } = require("../core/error.response");

// services
const { findByEmail } = require("./user.service");

const RoleUser = {
  ADMIN: "admin",
  USER: "user",
};

/* 
  1 - Check email in dbs
  2 - Match password
  3 - create AuthToken and RefreshToken and save
  4 - Generate tokens
  5 - Get data return login
*/

class AccessService {
  static logout = async (keyUser) => {
    console.log(`Key User::: ${keyUser}`);
    const delKey = await KeyTokenService.removeKeyById(keyUser._id);
    console.log({ delKey });
    return delKey;
  };

  static login = async ({ email, password, refreshToken = null }) => {
    // 1.
    const foundUser = await findByEmail({ email });
    if (!foundUser) throw new BadRequestError("User not registered");
    // 2.
    const match = bcrypt.compare(password, foundUser.password);
    if (!match) throw new AuthFailureError("Authentication error");

    // 3.
    // create privateKey, publicKey
    const privateKey = crypto.randomBytes(64).toString("hex");
    const publicKey = crypto.randomBytes(64).toString("hex");

    // 4.

    const { _id: userId } = foundUser;
    const tokens = await createTokenPair(
      {
        userId,
        email,
      },
      publicKey,
      privateKey
    );
    await KeyTokenService.createKeyToken({
      refreshToken: tokens.refreshToken,
      privateKey,
      publicKey,
      userId,
    });
    return {
      user: getInfoData({
        fields: ["_id", "name", "email"],
        object: foundUser,
      }),
      tokens,
    };
  };

  static signUp = async ({ name, email, password }) => {
    try {
      // step 1: check email exists

      const holderUser = await userModel.findOne({ email }).lean();
      if (holderUser) {
        throw new BadRequestError("Error: User already registered!");
      }
      const passwordHash = await bcrypt.hash(password, 10);
      const newUser = await userModel.create({
        name,
        email,
        password: passwordHash,
        roles: [RoleUser.USER],
      });

      if (newUser) {
        // create privateKey, publicKey
        // const { privateKey, publicKey } = crypto.generateKeyPairSync("rsa", {
        //   modulusLength: 4096,
        //   publicKeyEncoding: {
        //     type: "pkcs1", // public key cryptography standards 1
        //     format: "pem",
        //   },
        //   privateKeyEncoding: {
        //     type: "pkcs1", // public key cryptography standards 1
        //     format: "pem",
        //   },
        // });
        const privateKey = crypto.randomBytes(64).toString("hex");
        const publicKey = crypto.randomBytes(64).toString("hex");

        console.log({ privateKey, publicKey }); //save to collection keyUser

        const keyUser = await KeyTokenService.createKeyToken({
          userID: newUser._id,
          publicKey,
          privateKey,
        });

        if (!keyUser) {
          throw new BadRequestError("Error: User key error");
        }

        // create token pair
        const tokens = await createTokenPair(
          {
            userID: newUser._id,
            email,
          },
          publicKey,
          privateKey
        );
        console.log(`Created token success:: `, tokens);
        return {
          code: 201,
          metadata: {
            user: getInfoData({
              fields: ["_id", "name", "email"],
              object: newUser,
            }),
            tokens,
          },
        };
      }
      return {
        code: 200,
        metadata: null,
      };
    } catch (error) {
      return {
        code: "xxx",
        message: error.message,
        status: "error",
      };
    }
  };
}

module.exports = AccessService;
