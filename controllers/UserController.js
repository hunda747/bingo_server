// controllers/UserController.js
const User = require('../models/user');

const UserController = {
  getAllUsers: async (req, res) => {
    try {
      const users = await User.query();
      res.json(users);
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  },

  getUserById: async (req, res) => {
    const { id } = req.params;
    try {
      const user = await User.query().findById(id);
      if (user) {
        res.json(user);
      } else {
        res.status(404).send('User not found');
      }
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  },

  createUser: async (req, res) => {
    const userData = req.body;
    try {
      const newUser = await User.query().insert(userData);
      res.json(newUser);
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  },

  updateUser: async (req, res) => {
    const { id } = req.params;
    const updatedUserData = req.body;
    try {
      const updatedUser = await User.query().patchAndFetchById(id, updatedUserData);
      if (updatedUser) {
        res.json(updatedUser);
      } else {
        res.status(404).send('User not found');
      }
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  },

  deleteUser: async (req, res) => {
    const { id } = req.params;
    try {
      const deletedUser = await User.query().deleteById(id);
      if (deletedUser) {
        res.json({ message: 'User deleted successfully' });
      } else {
        res.status(404).send('User not found');
      }
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  },
};

module.exports = UserController;
