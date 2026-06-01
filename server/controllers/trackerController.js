const Application = require('../models/Application');

// @desc    Get all applications for logged-in user
// @route   GET /api/tracker
// @access  Protected
const getApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({ userId: req.user._id }).sort({ appliedDate: -1 });

    res.status(200).json({
      success: true,
      data: applications,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a new placement application
// @route   POST /api/tracker
// @access  Protected
const createApplication = async (req, res, next) => {
  try {
    const { companyName, role, appliedDate, status, notes } = req.body;

    if (!companyName || !role || !appliedDate) {
      res.status(400);
      throw new Error('Company name, role, and applied date are required');
    }

    const application = await Application.create({
      userId: req.user._id,
      companyName,
      role,
      appliedDate,
      status: status || 'Applied',
      notes,
    });

    res.status(201).json({
      success: true,
      data: application,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update application status or notes
// @route   PUT /api/tracker/:id
// @access  Protected
const updateApplication = async (req, res, next) => {
  try {
    const { companyName, role, appliedDate, status, notes } = req.body;
    let application = await Application.findById(req.params.id);

    if (!application) {
      res.status(404);
      throw new Error('Application not found');
    }

    // Ensure application belongs to logged in user
    if (application.userId.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('Not authorized to update this application');
    }

    application = await Application.findByIdAndUpdate(
      req.params.id,
      { companyName, role, appliedDate, status, notes },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: application,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete application
// @route   DELETE /api/tracker/:id
// @access  Protected
const deleteApplication = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      res.status(404);
      throw new Error('Application not found');
    }

    // Ensure application belongs to logged in user
    if (application.userId.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('Not authorized to delete this application');
    }

    await application.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getApplications,
  createApplication,
  updateApplication,
  deleteApplication,
};
