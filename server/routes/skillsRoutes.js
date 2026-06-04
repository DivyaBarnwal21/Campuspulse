const express = require('express');
const router = express.Router();
const { analyzeSkills } = require('../controllers/skillsController');
const { protect } = require('../middleware/authMiddleware');

router.post('/analyze', protect, analyzeSkills);

module.exports = router;
