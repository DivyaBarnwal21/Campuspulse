const express = require('express');
const router = express.Router();
const { analyzeResume } = require('../controllers/resumeController');
const { protect } = require('../middleware/authMiddleware');

router.post('/analyze', protect, analyzeResume);

module.exports = router;
