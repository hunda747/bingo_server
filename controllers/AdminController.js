// controllers/AdminController.js
const Admin = require('../models/admin');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const AuthController = require('./AuthController');

class AdminController {
  constructor() {
    this.generateAccessToken = this.generateAccessToken.bind(this);
    this.generateRefreshToken = this.generateRefreshToken.bind(this);
    this.verifyAccessToken = this.verifyAccessToken.bind(this);
    this.verifyRefreshToken = this.verifyRefreshToken.bind(this);
    this.login = this.login.bind(this);
    this.refreshToken = this.refreshToken.bind(this);
  }

  generateAccessToken(adminId) {
    return jwt.sign({ adminId }, 'your_access_secret_key', { expiresIn: '15m' });
  }

  generateRefreshToken() {
    return uuidv4();
  }

  async login(req, res, next) {
    const { username, password } = req.body;

    try {
      const admin = await Admin.query().findOne({ username });

      if (!admin || !(await bcrypt.compare(password, admin.password))) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Generate tokens upon successful login
      const accessToken = await AuthController.generateAccessToken(admin, 'admin');
      const refreshToken = await AuthController.generateRefreshToken(admin);
      // console.log(accessToken);
      // Store the refresh token (you may want to store it securely in a database)
      // For demonstration purposes, we're just attaching it to the response header
      res.header('Refresh-Token', refreshToken);

      res.json({ accessToken, refreshToken, admin });
    } catch (error) {
      console.error(error);
      next(error);
      // res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async changePassword(req, res) {
    req.model = Admin; // Set the model for the AuthController
    AuthController.changePassword(req, res);
  }

  verifyAccessToken(req, res, next) {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access token not provided' });
    }

    jwt.verify(token, 'your_access_secret_key', (err, decoded) => {
      if (err) {
        return res.status(403).json({ error: 'Invalid access token' });
      }

      req.adminId = decoded.adminId;
      next();
    });
  }

  verifyRefreshToken(refreshToken) {
    try {
      // You may want to store and verify the refresh token securely
      // For demonstration purposes, we're just verifying it using jwt.verify
      const decoded = jwt.verify(refreshToken, 'your_refresh_secret_key');
      return decoded;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async refreshToken(req, res) {
    const { refreshToken } = req.body;
    console.log('refresh:', refreshToken);
    try {
      // Verify the refresh token
      const decodedRefreshToken = this.verifyRefreshToken(refreshToken);

      if (!decodedRefreshToken) {
        return res.status(401).json({ error: 'Invalid refresh token' });
      }

      // Generate a new access token
      const newAccessToken = this.generateAccessToken(decodedRefreshToken.adminId);

      res.json({ accessToken: newAccessToken });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async getAll(req, res, next) {
    try {
      const admins = await Admin.query();
      res.json(admins);
    } catch (error) {
      // console.error(error);
      next(error);
      // res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async getById(req, res, next) {
    const { id } = req.params;
    try {
      const admin = await Admin.query().findById(id);
      if (admin) {
        res.json(admin);
      } else {
        res.status(404).json({ error: 'Shop Owner not found' });
      }
    } catch (error) {
      next(error);
      // console.error(error);
      // res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async create(req, res, next) {
    const adminData = req.body;

    // Hash the password before storing it
    const hashedPassword = await bcrypt.hash(adminData.password, 10);
    adminData.password = hashedPassword;

    try {
      const newAdmin = await Admin.query().insert(adminData);
      res.json(newAdmin);
    } catch (error) {
      next(error);
      // console.error(error);
      // res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async update(req, res, next) {
    const { id } = req.params;
    const updatedData = req.body;
    try {
      const updatedAdmin = await Admin.query().patchAndFetchById(id, updatedData);
      if (updatedAdmin) {
        res.json(updatedAdmin);
      } else {
        res.status(404).json({ error: 'Shop Owner not found' });
      }
    } catch (error) {
      next(error);
      // console.error(error);
      // res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async delete(req, res, next) {
    const { id } = req.params;
    try {
      const deletedCount = await Admin.query().deleteById(id);
      if (deletedCount > 0) {
        res.json({ message: 'Shop Owner deleted successfully' });
      } else {
        res.status(404).json({ error: 'Shop Owner not found' });
      }
    } catch (error) {
      next(error);
      // console.error(error);
      // res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

module.exports = new AdminController();
