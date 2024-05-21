const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  // const token = req.header('Authorization');
  const token = req.headers['authorization']?.split(' ')[1];

  // console.log(token);
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized - Token not provided' });
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Forbidden - Invalid token' });
    }

    // Check if the user has the required role (e.g., 'client')
    // if (user.role !== 'admin') {
    //   return res.status(403).json({ error: 'Forbidden - Insufficient privileges' });
    // }

    req.user = user;
    next();
  });
};

module.exports = {
  authenticateToken
};