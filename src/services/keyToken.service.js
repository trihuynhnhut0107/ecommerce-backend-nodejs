"use strict";

const { ObjectId } = require("mongodb");
const keyTokenModel = require("../models/keytoken.model");
const { Types } = require("mongoose");

class KeyTokenService {
  static createKeyToken = async ({
    userID,
    publicKey,
    privateKey,
    refreshToken,
  }) => {
    try {
      // level 0
      // const tokens = await keyTokenModel.create({
      //   user: userID,
      //   publicKey,
      //   privateKey,
      // });
      // return tokens ? tokens.publicKey : null;

      // level x
      const filter = { user: userID },
        update = { publicKey, privateKey, refreshTokenUsed: [], refreshToken },
        options = { upsert: true, new: true };
      const tokens = await keyTokenModel.findOneAndUpdate(
        filter,
        update,
        options
      );
      return tokens ? tokens.publicKey : null;
    } catch (error) {
      return error;
    }
  };
  static findByUserId = async (userId) => {
    console.log("userID:" + userId);

    const result = await keyTokenModel.find({ user: userId }).lean();
    console.log(result[0]);
    return result[0];
  };
  static removeKeyById = async (userId) => {
    console.log(userId);
    return await keyTokenModel.deleteOne({
      _id: userId,
    });
  };
}
module.exports = KeyTokenService;
