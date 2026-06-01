const express = require('express');
const router = express.Router();
const { analyzeResume } = require('../controllers/resumeController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/analyze', analyzeResume);

module.exports = router;
