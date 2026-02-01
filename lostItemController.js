/**
 * Lost Item Controller
 * Handles CRUD operations for lost items
 */

const LostItem = require('../models/LostItem');
const { sendMatchNotification } = require('../utils/emailService');

/**
 * @desc    Get all lost items with filters
 * @route   GET /api/lost-items
 * @access  Public
 */
const getLostItems = async (req, res) => {
  try {
    const { category, search, startDate, endDate, status } = req.query;
    let query = {};

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Search in item name, description, and location
    if (search) {
      query.$text = { $search: search };
    }

    // Filter by date range
    if (startDate || endDate) {
      query.dateLost = {};
      if (startDate) query.dateLost.$gte = new Date(startDate);
      if (endDate) query.dateLost.$lte = new Date(endDate);
    }

    const items = await LostItem.find(query)
      .populate('postedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: items.length, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get single lost item by ID
 * @route   GET /api/lost-items/:id
 * @access  Public
 */
const getLostItemById = async (req, res) => {
  try {
    const item = await LostItem.findById(req.params.id).populate('postedBy', 'name email phone');

    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    // Increment views
    item.views += 1;
    await item.save();

    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Create new lost item
 * @route   POST /api/lost-items
 * @access  Private
 */
const createLostItem = async (req, res) => {
  try {
    const { itemName, category, description, dateLost, location, contactPhone } = req.body;

    const item = await LostItem.create({
      itemName,
      category,
      description,
      dateLost,
      location,
      image: req.file ? `/uploads/${req.file.filename}` : '',
      postedBy: req.user._id,
      contactEmail: req.user.email,
      contactPhone,
    });

    res.status(201).json({ success: true, data: item });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Update lost item
 * @route   PUT /api/lost-items/:id
 * @access  Private
 */
const updateLostItem = async (req, res) => {
  try {
    let item = await LostItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    // Check ownership (unless admin)
    if (item.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this item' });
    }

    // Update fields
    const updates = { ...req.body };
    if (req.file) {
      updates.image = `/uploads/${req.file.filename}`;
    }

    item = await LostItem.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, data: item });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Delete lost item
 * @route   DELETE /api/lost-items/:id
 * @access  Private
 */
const deleteLostItem = async (req, res) => {
  try {
    const item = await LostItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    // Check ownership (unless admin)
    if (item.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this item' });
    }

    await item.deleteOne();

    res.json({ success: true, message: 'Item removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get lost items posted by current user
 * @route   GET /api/lost-items/my-items
 * @access  Private
 */
const getMyLostItems = async (req, res) => {
  try {
    const items = await LostItem.find({ postedBy: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, count: items.length, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getLostItems,
  getLostItemById,
  createLostItem,
  updateLostItem,
  deleteLostItem,
  getMyLostItems,
};
