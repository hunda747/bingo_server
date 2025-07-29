const Admin = require('../models/admin');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const logger = require('../logger');

class AdminController {
  constructor() {
    this.generateAccessToken = this.generateAccessToken.bind(this);
    this.generateRefreshToken = this.generateRefreshToken.bind(this);
    this.verifyAccessToken = this.verifyAccessToken.bind(this);
    this.verifyRefreshToken = this.verifyRefreshToken.bind(this);
    this.login = this.login.bind(this);
    this.refreshToken = this.refreshToken.bind(this);
  }

  generateAccessToken(admin, role = 'admin') {
    return jwt.sign(
      { adminId: admin.id, role },
      process.env.JWT_ACCESS_SECRET || 'your_access_secret_key',
      { expiresIn: '15m' }
    );
  }

  async generateRefreshToken(admin) {
    const refreshToken = uuidv4();
    await Admin.query().patchAndFetchById(admin.id, {
      refreshToken,
      updated_at: new Date().toISOString()
    });
    return refreshToken;
  }

  async login(req, res, next) {
    const { username, password } = req.body;
    try {
      const admin = await Admin.query().findOne({ username });
      if (!admin || !(await bcrypt.compare(password, admin.password))) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const accessToken = this.generateAccessToken(admin, 'admin');
      const refreshToken = await this.generateRefreshToken(admin);
      res.header('Refresh-Token', refreshToken);
      res.json({ accessToken, refreshToken, admin: { id: admin.id, username: admin.username } });
    } catch (error) {
      logger.error(`Login error: ${error.message}`);
      next(error);
    }
  }

  async changePassword(req, res, next) {
    const { id } = req.params;
    const { oldPassword, newPassword } = req.body;
    try {
      const admin = await Admin.query().findById(id);
      if (!admin) {
        return res.status(404).json({ error: 'Admin not found' });
      }
      if (!(await bcrypt.compare(oldPassword, admin.password))) {
        return res.status(401).json({ error: 'Invalid old password' });
      }
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await Admin.query().patchAndFetchById(id, {
        password: hashedPassword,
        updated_at: new Date().toISOString()
      });
      res.json({ message: 'Password changed successfully' });
    } catch (error) {
      logger.error(`Change password error: ${error.message}`);
      next(error);
    }
  }

  verifyAccessToken(req, res, next) {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Access token not provided' });
    }
    jwt.verify(token, process.env.JWT_ACCESS_SECRET || 'your_access_secret_key', (err, decoded) => {
      if (err) {
        return res.status(403).json({ error: 'Invalid access token' });
      }
      req.adminId = decoded.adminId;
      req.role = decoded.role;
      next();
    });
  }

  async verifyRefreshToken(refreshToken) {
    try {
      const admin = await Admin.query().findOne({ refreshToken });
      return admin ? { adminId: admin.id } : null;
    } catch (error) {
      logger.error(`Refresh token verification error: ${error.message}`);
      return null;
    }
  }

  async refreshToken(req, res, next) {
    const { refreshToken } = req.body;
    try {
      const decoded = await this.verifyRefreshToken(refreshToken);
      if (!decoded) {
        return res.status(401).json({ error: 'Invalid refresh token' });
      }
      const admin = await Admin.query().findById(decoded.adminId);
      if (!admin) {
        return res.status(404).json({ error: 'Admin not found' });
      }
      const newAccessToken = this.generateAccessToken(admin, 'admin');
      res.json({ accessToken: newAccessToken });
    } catch (error) {
      logger.error(`Refresh token error: ${error.message}`);
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      const admins = await Admin.query().select('id', 'username', 'created_at', 'updated_at');
      res.json(admins);
    } catch (error) {
      logger.error(`Get all admins error: ${error.message}`);
      next(error);
    }
  }

  async getById(req, res, next) {
    const { id } = req.params;
    try {
      const admin = await Admin.query().findById(id).select('id', 'username', 'created_at', 'updated_at');
      if (!admin) {
        return res.status(404).json({ error: 'Admin not found' });
      }
      res.json(admin);
    } catch (error) {
      logger.error(`Get admin ${id} error: ${error.message}`);
      next(error);
    }
  }

  async create(req, res, next) {
    const { username, password, ...adminData } = req.body;
    try {
      const existingAdmin = await Admin.query().findOne({ username });
      if (existingAdmin) {
        return res.status(400).json({ error: 'Username already exists' });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const newAdmin = await Admin.query().insert({
        ...adminData,
        username,
        password: hashedPassword,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      res.status(201).json({
        id: newAdmin.id,
        username: newAdmin.username,
        created_at: newAdmin.created_at,
        updated_at: newAdmin.updated_at
      });
    } catch (error) {
      logger.error(`Create admin error: ${error.message}`);
      next(error);
    }
  }

  async update(req, res, next) {
    const { id } = req.params;
    const { password, ...updatedData } = req.body;
    try {
      const updateData = { ...updatedData, updated_at: new Date().toISOString() };
      if (password) {
        updateData.password = await bcrypt.hash(password, 10);
      }
      const updatedAdmin = await Admin.query().patchAndFetchById(id, updateData);
      if (!updatedAdmin) {
        return res.status(404).json({ error: 'Admin not found' });
      }
      res.json({
        id: updatedAdmin.id,
        username: updatedAdmin.username,
        created_at: updatedAdmin.created_at,
        updated_at: updatedAdmin.updated_at
      });
    } catch (error) {
      logger.error(`Update admin ${id} error: ${error.message}`);
      next(error);
    }
  }

  async delete(req, res, next) {
    const { id } = req.params;
    try {
      const deletedCount = await Admin.query().deleteById(id);
      if (deletedCount === 0) {
        return res.status(404).json({ error: 'Admin not found' });
      }
      res.json({ message: 'Admin deleted successfully' });
    } catch (error) {
      logger.error(`Delete admin ${id} error: ${error.message}`);
      next(error);
    }
  }
}

module.exports = new AdminController();







// // controllers/AdminController.js
// const Admin = require('../models/admin');
// const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');
// const { v4: uuidv4 } = require('uuid');
// const AuthController = require('./AuthController');

// class AdminController {
//   constructor() {
//     this.generateAccessToken = this.generateAccessToken.bind(this);
//     this.generateRefreshToken = this.generateRefreshToken.bind(this);
//     this.verifyAccessToken = this.verifyAccessToken.bind(this);
//     this.verifyRefreshToken = this.verifyRefreshToken.bind(this);
//     this.login = this.login.bind(this);
//     this.refreshToken = this.refreshToken.bind(this);
//   }

//   generateAccessToken(adminId) {
//     return jwt.sign({ adminId }, 'your_access_secret_key', { expiresIn: '15m' });
//   }

//   generateRefreshToken() {
//     return uuidv4();
//   }

//   async login(req, res, next) {
//     const { username, password } = req.body;

//     try {
//       const admin = await Admin.query().findOne({ username });

//       if (!admin || !(await bcrypt.compare(password, admin.password))) {
//         return res.status(401).json({ error: 'Invalid credentials' });
//       }

//       // Generate tokens upon successful login
//       const accessToken = await AuthController.generateAccessToken(admin, 'admin');
//       const refreshToken = await AuthController.generateRefreshToken(admin);
//       // console.log(accessToken);
//       // Store the refresh token (you may want to store it securely in a database)
//       // For demonstration purposes, we're just attaching it to the response header
//       res.header('Refresh-Token', refreshToken);

//       res.json({ accessToken, refreshToken, admin });
//     } catch (error) {
//       console.error(error);
//       next(error);
//       // res.status(500).json({ error: 'Internal Server Error' });
//     }
//   }

//   async changePassword(req, res) {
//     req.model = Admin; // Set the model for the AuthController
//     AuthController.changePassword(req, res);
//   }

//   verifyAccessToken(req, res, next) {
//     const token = req.headers['authorization']?.split(' ')[1];

//     if (!token) {
//       return res.status(401).json({ error: 'Access token not provided' });
//     }

//     jwt.verify(token, 'your_access_secret_key', (err, decoded) => {
//       if (err) {
//         return res.status(403).json({ error: 'Invalid access token' });
//       }

//       req.adminId = decoded.adminId;
//       next();
//     });
//   }

//   verifyRefreshToken(refreshToken) {
//     try {
//       // You may want to store and verify the refresh token securely
//       // For demonstration purposes, we're just verifying it using jwt.verify
//       const decoded = jwt.verify(refreshToken, 'your_refresh_secret_key');
//       return decoded;
//     } catch (error) {
//       console.error(error);
//       return null;
//     }
//   }

//   async refreshToken(req, res) {
//     const { refreshToken } = req.body;
//     console.log('refresh:', refreshToken);
//     try {
//       // Verify the refresh token
//       const decodedRefreshToken = this.verifyRefreshToken(refreshToken);

//       if (!decodedRefreshToken) {
//         return res.status(401).json({ error: 'Invalid refresh token' });
//       }

//       // Generate a new access token
//       const newAccessToken = this.generateAccessToken(decodedRefreshToken.adminId);

//       res.json({ accessToken: newAccessToken });
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ error: 'Internal Server Error' });
//     }
//   }

//   async getAll(req, res, next) {
//     try {
//       const admins = await Admin.query();
//       res.json(admins);
//     } catch (error) {
//       // console.error(error);
//       next(error);
//       // res.status(500).json({ error: 'Internal Server Error' });
//     }
//   }

//   async getById(req, res, next) {
//     const { id } = req.params;
//     try {
//       const admin = await Admin.query().findById(id);
//       if (admin) {
//         res.json(admin);
//       } else {
//         res.status(404).json({ error: 'Shop Owner not found' });
//       }
//     } catch (error) {
//       next(error);
//       // console.error(error);
//       // res.status(500).json({ error: 'Internal Server Error' });
//     }
//   }

//   async create(req, res, next) {
//     const adminData = req.body;

//     // Hash the password before storing it
//     const hashedPassword = await bcrypt.hash(adminData.password, 10);
//     adminData.password = hashedPassword;

//     try {
//       const newAdmin = await Admin.query().insert(adminData);
//       res.json(newAdmin);
//     } catch (error) {
//       next(error);
//       // console.error(error);
//       // res.status(500).json({ error: 'Internal Server Error' });
//     }
//   }

//   async update(req, res, next) {
//     const { id } = req.params;
//     const updatedData = req.body;
//     try {
//       const updatedAdmin = await Admin.query().patchAndFetchById(id, updatedData);
//       if (updatedAdmin) {
//         res.json(updatedAdmin);
//       } else {
//         res.status(404).json({ error: 'Shop Owner not found' });
//       }
//     } catch (error) {
//       next(error);
//       // console.error(error);
//       // res.status(500).json({ error: 'Internal Server Error' });
//     }
//   }

//   async delete(req, res, next) {
//     const { id } = req.params;
//     try {
//       const deletedCount = await Admin.query().deleteById(id);
//       if (deletedCount > 0) {
//         res.json({ message: 'Shop Owner deleted successfully' });
//       } else {
//         res.status(404).json({ error: 'Shop Owner not found' });
//       }
//     } catch (error) {
//       next(error);
//       // console.error(error);
//       // res.status(500).json({ error: 'Internal Server Error' });
//     }
//   }
// }

// module.exports = new AdminController();
