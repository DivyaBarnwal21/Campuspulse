const express = require('express');
const router = express.Router();
const {
  getGithubRepos,
  getWeather,
  getNews,
} = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');

// Protect all routes in this router
router.use(protect);

router.get('/github', getGithubRepos);
router.get('/weather', getWeather);
router.get('/news', getNews);

module.exports = router;
