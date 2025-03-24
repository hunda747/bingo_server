// controllers/ShopController.js
const Shop = require("../models/shop");
const Cashier = require("../models/cashier");
const bcrypt = require("bcrypt");
const AuthController = require("./AuthController");
const { error } = require("winston");
const Game = require("../models/game");

class ShopController {
  async getAll(req, res) {
    try {
      const shops = await Shop.query().withGraphFetched("owner");

      // Convert gameType to array format in each shop
      shops.forEach(shop => {
        if (shop.gameType && typeof shop.gameType === 'string') {
          try {
            shop.gameType = JSON.parse(shop.gameType);
          } catch (e) {
            shop.gameType = [shop.gameType];
          }
        }
      });

      res.json(shops);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  async getById(req, res) {
    const { id } = req.params;
    try {
      const shop = await Shop.query().findById(id).withGraphFetched("owner");
      if (shop) {
        // Convert gameType to array format
        if (shop.gameType && typeof shop.gameType === 'string') {
          try {
            shop.gameType = JSON.parse(shop.gameType);
          } catch (e) {
            shop.gameType = [shop.gameType];
          }
        }

        res.json(shop);
      } else {
        res.status(404).json({ error: "Shop not found" });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  async getByShopowner(req, res) {
    const { id } = req.params;
    try {
      const shops = await Shop.query().where({ shopOwnerId: id }).withGraphFetched("owner");
      if (shops) {
        // Convert gameType to array format in each shop
        shops.forEach(shop => {
          if (shop.gameType && typeof shop.gameType === 'string') {
            try {
              shop.gameType = JSON.parse(shop.gameType);
            } catch (e) {
              shop.gameType = [shop.gameType];
            }
          }
        });

        res.json(shops);
      } else {
        res.status(404).json({ error: "Shop not found" });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  async create(req, res, next) {
    const shopData = req.body;
    if (!shopData.password || !shopData.username || !shopData.location || !shopData.shopOwnerId) {
      return res.status(404).json({ error: 'Please provide all the required fileds!' })
    }
    try {
      const hashedCashPassword = await bcrypt.hash(shopData.password, 10);
      const newShop = await Shop.query().insert({
        shopOwnerId: shopData.shopOwnerId,
        username: shopData.username,
        password: hashedCashPassword,
        location: shopData.location,
      });

      res.json(newShop);
    } catch (error) {
      // console.error(error);
      next(error);
    }
  }

  async updateFromGame(req, res, next) {
    const { id } = req.params;
    const { stake, gameId, rtp, gameType } = req.body;
    // console.log(rtp);
    // || !rtp
    if (!gameId || !stake || !id) {
      return res.status(404).json({ error: 'Please provide all the required fileds!' })
    }
    // if (rtp < 0 || rtp > 100) {
    //   return res.status(404).json({ error: 'RTP must be between 0 to 100!' })
    // } rtp: rtp,
    try {
      // Always stringify arrays, assume client sends arrays
      const processedGameType = Array.isArray(gameType)
        ? JSON.stringify(gameType)
        : JSON.stringify([gameType]);

      const updatedShop = await Shop.query().patchAndFetchById(id, {
        stake: stake,
        gameType: processedGameType
      });
      console.log(gameId);
      console.log(processedGameType);
      const updatedGame = await Game.query().patchAndFetchById(gameId, {
        stake: stake,
        gameType: processedGameType
      });
      console.log(updatedGame);

      if (updatedShop) {
        // Parse gameType back to array before sending response
        if (updatedShop.gameType && typeof updatedShop.gameType === 'string') {
          try {
            updatedShop.gameType = JSON.parse(updatedShop.gameType);
          } catch (e) {
            updatedShop.gameType = [updatedShop.gameType];
          }
        }

        res.json(updatedShop);
      } else {
        res.status(404).json({ error: "Shop not found" });
      }
    } catch (error) {
      console.error(error);
      next(error)
    }
  }

  async update(req, res, next) {
    const { id } = req.params;
    const { stake, gameId, rtp, location, shopOwnerId, status, gameType, currentLimit, defaultLimit } = req.body;
    console.log('game id', gameId);
    try {
      const updatedShopData = {};
      if (stake !== undefined) {
        updatedShopData.stake = stake;
      }
      if (rtp !== undefined) {
        updatedShopData.rtp = rtp;
      }
      if (location !== undefined) {
        updatedShopData.location = location;
      }
      if (shopOwnerId !== undefined) {
        updatedShopData.shopOwnerId = shopOwnerId;
      }
      if (status !== undefined) {
        updatedShopData.status = status;
      }
      if (gameType !== undefined) {
        // Simply stringify arrays, assume client sends arrays
        updatedShopData.gameType = Array.isArray(gameType)
          ? JSON.stringify(gameType)
          : JSON.stringify([gameType]);
      }
      if (currentLimit !== undefined) {
        updatedShopData.currentLimit = currentLimit;
      }
      if (defaultLimit !== undefined) {
        updatedShopData.defaultLimit = defaultLimit;
      }
      const updatedShop = await Shop.query().patchAndFetchById(id, updatedShopData);

      if (gameId && stake) {
        const gameUpdateData = { stake: stake };
        if (updatedShopData.gameType !== undefined) {
          gameUpdateData.gameType = updatedShopData.gameType;
        }
        const updatedGame = await Game.query().findById(gameId).patch(gameUpdateData);
      }

      if (updatedShop) {
        // Parse gameType back to array before sending response
        if (updatedShop.gameType && typeof updatedShop.gameType === 'string') {
          try {
            updatedShop.gameType = JSON.parse(updatedShop.gameType);
          } catch (e) {
            updatedShop.gameType = [updatedShop.gameType];
          }
        }

        res.json(updatedShop);
      } else {
        res.status(404).json({ error: "Shop not found" });
      }
    } catch (error) {
      console.error(error);
      next(error)
    }
  }

  async extendLimit(req, res, next) {
    const { id } = req.params;
    const { newLimit } = req.body;
    if (!id || !newLimit) {
      return res.status(404).json({ error: 'Please provide all the required fileds!' })
    }

    try {
      const updatedShop = await Shop.query().patchAndFetchById(id, {
        currentLimit: Shop.raw('?? + ?', 'currentLimit', newLimit)
      });

      if (updatedShop) {
        res.json(updatedShop);
      } else {
        res.status(404).json({ error: "Shop not found" });
      }
    } catch (error) {
      console.error(error);
      next(error)
    }
  }

  async delete(req, res) {
    const { id } = req.params;
    try {
      const deletedCount = await Shop.query().deleteById(id);
      if (deletedCount > 0) {
        res.json({ message: "Shop deleted successfully" });
      } else {
        res.status(404).json({ error: "Shop not found" });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  async login(req, res, next) {
    const { username, password } = req.body;

    try {
      const admin = await Shop.query().findOne({ username }).withGraphFetched("owner");

      if (admin.status != 'active') {
        return res.status(401).json({ error: 'Shop is Blocked! Contact admin.' });
      }
      if (admin.owner.status != 'active') {
        return res.status(401).json({ error: 'Shop Owner is Blocked! Contact admin.' });
      }

      if (!admin || !(await bcrypt.compare(password, admin.password))) {
        return res.status(401).json({ error: 'Invalid username or password' });
      }

      // Parse gameType to array before sending
      if (admin.gameType && typeof admin.gameType === 'string') {
        try {
          admin.gameType = JSON.parse(admin.gameType);
        } catch (e) {
          admin.gameType = [admin.gameType];
        }
      }

      // Generate tokens upon successful login
      const accessToken = await AuthController.generateAccessToken(admin, 'admin');
      const refreshToken = await AuthController.generateRefreshToken(admin);

      delete admin.password;

      res.json({ accessToken, refreshToken, admin });
    } catch (error) {
      console.error(error);
      next(error);
      // res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async changePassword(req, res) {
    const { id } = req.params;
    const { newPassword } = req.body;

    try {
      // Fetch the user from the database (either a shop owner or a cashier)
      const user = await Shop.query().findById(id);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update the user's password in the database
      await Shop.query()
        .patch({ password: hashedPassword })
        .where("id", id);

      res.json({ message: "Password changed successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  async changeOwnPassword(req, res) {
    const { id } = req.params;
    const { oldPassword, newPassword } = req.body;
    // console.log(id);
    try {
      // Fetch the user from the database (either a shop owner or a cashier)
      const user = await Shop.query().findById(id);

      if (!user) {
        return res.status(404).json({ error: "Shop not found" });
      }

      // Check the old password
      const isOldPasswordValid = await bcrypt.compare(
        oldPassword,
        user.password
      );

      if (!isOldPasswordValid) {
        return res.status(401).json({ error: "Invalid old password" });
      }

      // Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update the user's password in the database
      await Shop.query()
        .patch({ password: hashedPassword })
        .where("id", id);

      res.json({ message: "Password changed successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
}

module.exports = new ShopController();
