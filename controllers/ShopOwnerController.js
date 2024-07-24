// controllers/ShopOwnerController.js
const ShopOwner = require("../models/ShopOwner");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const AuthController = require("./AuthController");

class ShopOwnerController {
  constructor() {
    this.generateAccessToken = this.generateAccessToken.bind(this);
    this.generateRefreshToken = this.generateRefreshToken.bind(this);
    this.verifyAccessToken = this.verifyAccessToken.bind(this);
    this.verifyRefreshToken = this.verifyRefreshToken.bind(this);
    this.login = this.login.bind(this);
    this.refreshToken = this.refreshToken.bind(this);
  }

  generateAccessToken(shopOwnerId) {
    return jwt.sign({ shopOwnerId }, "your_access_secret_key", {
      expiresIn: "15m",
    });
  }

  generateRefreshToken() {
    return uuidv4();
  }

  async login(req, res) {
    const { username, password } = req.body;

    try {
      const shopOwner = await ShopOwner.query().findOne({ username });

      if (!shopOwner || !(await bcrypt.compare(password, shopOwner.password))) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      if (!(shopOwner.status === "active")) {
        return res.status(401).json({ error: `Shop owner is ${shopOwner.status}!` });
      }

      // Generate tokens upon successful login
      const accessToken = this.generateAccessToken(shopOwner.id);
      const refreshToken = this.generateRefreshToken();

      res.json({ accessToken, refreshToken, id: shopOwner.id, shopOwner });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  async changePassword(req, res) {
    const { id } = req.params;
    const { newPassword } = req.body;
    // console.log(id);
    try {
      // Fetch the user from the database (either a shop owner or a cashier)
      const user = await ShopOwner.query().findById(id);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update the user's password in the database
      await ShopOwner.query()
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
    console.log(id);
    try {
      // Fetch the user from the database (either a shop owner or a cashier)
      const user = await ShopOwner.query().findById(id);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
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
      await ShopOwner.query()
        .patch({ password: hashedPassword })
        .where("id", id);

      res.json({ message: "Password changed successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  verifyAccessToken(req, res, next) {
    const token = req.headers["authorization"]?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "Access token not provided" });
    }

    jwt.verify(token, "your_access_secret_key", (err, decoded) => {
      if (err) {
        return res.status(403).json({ error: "Invalid access token" });
      }

      req.shopOwnerId = decoded.shopOwnerId;
      next();
    });
  }

  verifyRefreshToken(refreshToken) {
    try {
      // You may want to store and verify the refresh token securely
      // For demonstration purposes, we're just verifying it using jwt.verify
      const decoded = jwt.verify(refreshToken, "your_refresh_secret_key");
      return decoded;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async refreshToken(req, res) {
    const { refreshToken } = req.body;

    try {
      // Verify the refresh token
      const decodedRefreshToken = this.verifyRefreshToken(refreshToken);

      if (!decodedRefreshToken) {
        return res.status(401).json({ error: "Invalid refresh token" });
      }

      // Generate a new access token
      const newAccessToken = this.generateAccessToken(
        decodedRefreshToken.shopOwnerId
      );

      res.json({ accessToken: newAccessToken });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  async getAll(req, res) {
    try {
      const shopOwners = await ShopOwner.query();
      res.json(shopOwners);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  async getById(req, res) {
    const { id } = req.params;
    try {
      const shopOwner = await ShopOwner.query().findById(id);
      if (shopOwner) {
        res.json(shopOwner);
      } else {
        res.status(404).json({ error: "Shop Owner not found" });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  async create(req, res) {
    const shopOwnerData = req.body;

    // Hash the password before storing it
    const hashedPassword = await bcrypt.hash(shopOwnerData.password, 10);
    shopOwnerData.password = hashedPassword;

    try {
      const newShopOwner = await ShopOwner.query().insert(shopOwnerData);
      res.json(newShopOwner);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  async update(req, res) {
    const { id } = req.params;
    const updatedData = req.body;
    try {
      const updatedShopOwner = await ShopOwner.query().patchAndFetchById(
        id,
        updatedData
      );
      if (updatedShopOwner) {
        res.json(updatedShopOwner);
      } else {
        res.status(404).json({ error: "Shop Owner not found" });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  async delete(req, res) {
    const { id } = req.params;
    try {
      const deletedCount = await ShopOwner.query().deleteById(id);
      if (deletedCount > 0) {
        res.json({ message: "Shop Owner deleted successfully" });
      } else {
        res.status(404).json({ error: "Shop Owner not found" });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
}

module.exports = new ShopOwnerController();
