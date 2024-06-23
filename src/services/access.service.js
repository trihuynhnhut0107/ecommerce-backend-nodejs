"use strict";

const userModel = require("../models/user.model");
const bcrypt = require("bcrypt");
const crypto = require("node:crypto");
const KeyTokenService = require("./keyToken.service");
const { createTokenPair } = require("../auth/authUtils");
const { getInfoData } = require("../utils");

const RoleUser = {
  ADMIN: "admin",
  USER: "user",
};

class AccessService {
  static signUp = async ({ name, email, password }) => {
    try {
      // step 1: check email exists

      const holderUser = await userModel.findOne({ email }).lean();
      if (holderUser) {
        return {
          code: "xxxx",
          message: "User already exists",
        };
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

        console.log({ privateKey, publicKey }); //save to collection KeyStore

        const keyStore = await KeyTokenService.createKeyToken({
          userID: newUser._id,
          publicKey,
          privateKey,
        });

        if (!keyStore) {
          return {
            code: "xxxx",
            message: "Error create publicKey",
          };
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
