/**
 * Found Item Controller
 * Handles CRUD operations for found items
 */

const FoundItem = require('../models/FoundItem');
const LostItem = require('../models/LostItem');
const { sendMatchNotification } = require('../utils/emailService');
const { findMatchesForFoundItem } = require('../utils/matchingService');

/**
 * @desc    Get all found items with filters and potential matches
 * @route   GET /api/found-items
 * @access  Public
 */
const getFoundItems = async (req, res) => {
  try {
    const { category, search, startDate, endDate, status, includeMatches } = req.query;
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
      query.dateFound = {};
      if (startDate) query.dateFound.$gte = new Date(startDate);
      if (endDate) query.dateFound.$lte = new Date(endDate);
    }

    const items = await FoundItem.find(query)
      .populate('postedBy', 'name email')
      .sort({ createdAt: -1 });

    // Include potential matches if requested
    if (includeMatches === 'true') {
      const itemsWithMatches = await Promise.all(
        items.map(async (item) => {
          const matches = await findMatchesForFoundItem(item.toObject(), LostItem);
          return {
            ...item.toObject(),
            potentialMatches: matches,
          };
        })
      );
      return res.json({ success: true, count: itemsWithMatches.length, data: itemsWithMatches });
    }

    res.json({ success: true, count: items.length, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get single found item by ID with potential matches
 * @route   GET /api/found-items/:id
 * @access  Public
 */
const getFoundItemById = async (req, res) => {
  try {
    const item = await FoundItem.findById(req.params.id).populate('postedBy', 'name email phone');

    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    // Increment views
    item.views += 1;
    await item.save();

    // Find potential matches
    const matches = await findMatchesForFoundItem(item.toObject(), LostItem);

    res.json({ 
      success: true, 
      data: {
        ...item.toObject(),
        potentialMatches: matches,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Create new found item
 * @route   POST /api/found-items
 * @access  Private
 */
const createFoundItem = async (req, res) => {
  try {
    const { itemName, category, description, dateFound, location, contactPhone } = req.body;

    const item = await FoundItem.create({
      itemName,
      category,
      description,
      dateFound,
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
 * @desc    Update found item
 * @route   PUT /api/found-items/:id
 * @access  Private
 */
const updateFoundItem = async (req, res) => {
  try {
    let item = await FoundItem.findById(req.params.id);

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

    item = await FoundItem.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, data: item });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Delete found item
 * @route   DELETE /api/found-items/:id
 * @access  Private
 */
const deleteFoundItem = async (req, res) => {
  try {
    const item = await FoundItem.findById(req.params.id);

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
 * @desc    Get found items posted by current user
 * @route   GET /api/found-items/my-items
 * @access  Private
 */
const getMyFoundItems = async (req, res) => {
  try {
    const items = await FoundItem.find({ postedBy: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, count: items.length, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getFoundItems,
  getFoundItemById,
  createFoundItem,
  updateFoundItem,
  deleteFoundItem,
  getMyFoundItems,
};
