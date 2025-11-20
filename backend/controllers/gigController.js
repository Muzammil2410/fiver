const Gig = require('../models/Gig');

// Create a new gig
exports.createGig = async (req, res) => {
  try {
    // Log request size for debugging
    const requestSize = JSON.stringify(req.body).length;
    const requestSizeMB = requestSize / (1024 * 1024);
    console.log(`📥 Received request size: ${requestSizeMB.toFixed(2)} MB`);
    
    const {
      title,
      description,
      price,
      deliveryTime,
      category,
      skills,
      coverImage,
      images,
      packages,
      requirements,
      seller
    } = req.body;

    // Validate required fields
    if (!title || !description || !category || !coverImage) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, category, and cover image are required'
      });
    }

    // Validate packages
    if (!packages || packages.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one package is required'
      });
    }

    // Get seller ID from token or request body
    let sellerId = req.userId || seller?.id;

    if (!sellerId) {
      return res.status(401).json({
        success: false,
        message: 'Seller ID is required. Please ensure you are logged in.'
      });
    }

    // Convert string ID to ObjectId if needed (for MongoDB)
    if (typeof sellerId === 'string' && !sellerId.match(/^[0-9a-fA-F]{24}$/)) {
      // If it's not a valid MongoDB ObjectId, we'll use it as is
      // In production, you'd want to look up the user and get their MongoDB _id
    }

    // Create gig
    const gig = new Gig({
      title,
      description,
      price: price || (packages[0]?.price || 0),
      deliveryTime: deliveryTime || (packages[0]?.deliveryTime || 1),
      category,
      skills: skills || [],
      coverImage,
      images: images || [],
      packages: packages || [],
      requirements: requirements || [],
      sellerId,
      seller: seller || {
        id: sellerId,
        name: 'Unknown Seller',
        level: 'Expert'
      },
      active: true
    });

    await gig.save();

    res.status(201).json({
      success: true,
      message: 'Gig created successfully',
      data: gig
    });
  } catch (error) {
    console.error('Error creating gig:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create gig',
      error: error.message
    });
  }
};

// Get all gigs with filters
exports.getAllGigs = async (req, res) => {
  try {
    const {
      q, // search query
      category,
      minPrice,
      maxPrice,
      sort = 'createdAt',
      deliveryTime,
      level,
      page = 1,
      limit = 20,
      sellerId // for seller's own gigs
    } = req.query;

    // Build filter object
    const filter = { active: true };

    // Filter by seller if provided
    if (sellerId) {
      filter.sellerId = sellerId;
    }

    // Filter by category
    if (category) {
      filter.category = category;
    }

    // Filter by price range
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseInt(minPrice);
      if (maxPrice) filter.price.$lte = parseInt(maxPrice);
    }

    // Filter by delivery time
    if (deliveryTime) {
      filter.deliveryTime = { $lte: parseInt(deliveryTime) };
    }

    // Search query
    if (q) {
      filter.$text = { $search: q };
    }

    // Sort options
    let sortOption = {};
    switch (sort) {
      case 'price-asc':
        sortOption = { price: 1 };
        break;
      case 'price-desc':
        sortOption = { price: -1 };
        break;
      case 'rating':
        sortOption = { rating: -1 };
        break;
      case 'newest':
        sortOption = { createdAt: -1 };
        break;
      case 'oldest':
        sortOption = { createdAt: 1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const gigs = await Gig.find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Get total count for pagination
    const total = await Gig.countDocuments(filter);

    res.json({
      success: true,
      data: {
        gigs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
          hasMore: skip + gigs.length < total
        }
      }
    });
  } catch (error) {
    console.error('Error fetching gigs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch gigs',
      error: error.message
    });
  }
};

// Get single gig by ID
exports.getGigById = async (req, res) => {
  try {
    const { id } = req.params;

    const gig = await Gig.findById(id)
      .lean();

    if (!gig) {
      return res.status(404).json({
        success: false,
        message: 'Gig not found'
      });
    }

    res.json({
      success: true,
      data: gig
    });
  } catch (error) {
    console.error('Error fetching gig:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch gig',
      error: error.message
    });
  }
};

// Update gig
exports.updateGig = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const sellerId = req.userId;

    // Find gig
    const gig = await Gig.findById(id);

    if (!gig) {
      return res.status(404).json({
        success: false,
        message: 'Gig not found'
      });
    }

    // Check if user owns the gig (handle both string and ObjectId)
    const gigSellerId = gig.sellerId?.toString() || gig.sellerId;
    if (gigSellerId !== sellerId && gig.seller?.id !== sellerId) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this gig'
      });
    }

    // Update fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        gig[key] = updateData[key];
      }
    });

    gig.updatedAt = Date.now();
    await gig.save();

    res.json({
      success: true,
      message: 'Gig updated successfully',
      data: gig
    });
  } catch (error) {
    console.error('Error updating gig:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update gig',
      error: error.message
    });
  }
};

// Delete gig
exports.deleteGig = async (req, res) => {
  try {
    const { id } = req.params;
    const sellerId = req.userId;

    const gig = await Gig.findById(id);

    if (!gig) {
      return res.status(404).json({
        success: false,
        message: 'Gig not found'
      });
    }

    // Check if user owns the gig (handle both string and ObjectId)
    const gigSellerId = gig.sellerId?.toString() || gig.sellerId;
    if (gigSellerId !== sellerId && gig.seller?.id !== sellerId) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this gig'
      });
    }

    await Gig.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Gig deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting gig:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete gig',
      error: error.message
    });
  }
};

// Toggle gig active status
exports.toggleGigStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const sellerId = req.userId;

    const gig = await Gig.findById(id);

    if (!gig) {
      return res.status(404).json({
        success: false,
        message: 'Gig not found'
      });
    }

    // Check if user owns the gig (handle both string and ObjectId)
    const gigSellerId = gig.sellerId?.toString() || gig.sellerId;
    if (gigSellerId !== sellerId && gig.seller?.id !== sellerId) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this gig'
      });
    }

    gig.active = !gig.active;
    await gig.save();

    res.json({
      success: true,
      message: `Gig ${gig.active ? 'activated' : 'deactivated'} successfully`,
      data: gig
    });
  } catch (error) {
    console.error('Error toggling gig status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle gig status',
      error: error.message
    });
  }
};

