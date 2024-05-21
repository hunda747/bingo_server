// controllers/AuthController.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Admin = require('../models/admin');

class AuthController {
  constructor() {
    this.changePassword = this.changePassword.bind(this);
  }

  // Function to change password
  async changePassword(req, res) {
    const { id } = req.params;
    const { oldPassword, newPassword } = req.body;

    try {
      // Fetch the user from the database (either a shop owner or a cashier)
      const user = await req.model.query().findById(id);

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Check the old password
      const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);

      if (!isOldPasswordValid) {
        return res.status(401).json({ error: 'Invalid old password' });
      }

      // Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update the user's password in the database
      await req.model.query().patch({ password: hashedPassword }).where('id', id);

      res.json({ message: 'Password changed successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
  async generateAccessToken(user, role) {
    // console.log('k', process.env.ACCESS_TOKEN_SECRET)
    return jwt.sign({ id: user.id, username: user.username, role: role }, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: '1m',
    });
  }

  async generateRefreshToken(user) {
    return jwt.sign({ id: user.id, username: user.username }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '3m' });
  }

  async generateNewAccessToken(refreshToken) {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    // console.log('id', decoded.id);
    // Assuming you have a User model with findById method
    const user = await Admin.findById(decoded.id);

    if (!user) {
      throw new Error('User not found');
    }

    return generateAccessToken(user, 'admin');
  };
}

module.exports = new AuthController();
