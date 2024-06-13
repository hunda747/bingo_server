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
      const shop = await Shop.query().where({ shopOwnerId: id }).withGraphFetched("owner");
      if (shop) {
        res.json(shop);
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
    console.log(rtp);
    if (!gameId || !stake || !id || !rtp) {
      return res.status(404).json({ error: 'Please provide all the required fileds!' })
    }
    if (rtp < 0 || rtp > 100) {
      return res.status(404).json({ error: 'RTP must be between 0 to 100!' })
    }
    try {
      const updatedShop = await Shop.query().patchAndFetchById(id, { stake: stake, rtp: rtp, gameType });
      const updatedGame = await Game.query().findById(gameId).patch({ stake: stake, gameType });

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

  async update(req, res, next) {
    const { id } = req.params;
    const { stake, gameId, rtp, location, shopOwnerId, status, gameType } = req.body;
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
        updatedShopData.gameType = gameType;
      }
      const updatedShop = await Shop.query().patchAndFetchById(id, updatedShopData);

      if (gameId && stake) {
        const updatedGame = await Game.query().findById(gameId).patch({ stake: stake, gameType: gameType });
      }

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
      const admin = await Shop.query().findOne({ username });

      if (!admin || !(await bcrypt.compare(password, admin.password))) {
        return res.status(401).json({ error: 'Invalid username or password' });
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
