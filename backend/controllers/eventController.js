import { validationResult } from 'express-validator';
import Event from '../models/Event.js';
import cloudinary from '../config/cloudinary.js';

/**
 * Helper function to process image
 * Converts image to base64 for MongoDB storage
 */
const processImage = async (file) => {
  try {
    // Check if Cloudinary is properly configured
    const isCloudinaryConfigured = 
      process.env.CLOUDINARY_CLOUD_NAME && 
      process.env.CLOUDINARY_CLOUD_NAME !== 'demo' &&
      process.env.CLOUDINARY_API_KEY && 
      process.env.CLOUDINARY_API_KEY !== 'demo';

    // If Cloudinary is configured, use it
    if (isCloudinaryConfigured) {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'event-platform',
            transformation: [
              { width: 1200, height: 630, crop: 'limit' },
              { quality: 'auto' },
              { fetch_format: 'auto' },
            ],
          },
          (error, result) => {
            if (error) {
              console.error('Cloudinary upload error:', error);
              reject(error);
            } else {
              resolve(result.secure_url);
            }
          }
        );
        uploadStream.end(file.buffer);
      });
    }

    // Otherwise, convert to base64 and store in MongoDB
    const base64Image = file.buffer.toString('base64');
    const dataUri = `data:${file.mimetype};base64,${base64Image}`;
    console.log('Using base64 image storage (Cloudinary not configured)');
    return dataUri;
  } catch (error) {
    console.error('Image processing error:', error);
    throw new Error('Failed to process image');
  }
};

/**
 * @route   GET /api/events
 * @desc    Get all upcoming events
 * @access  Public
 */
export const getEvents = async (req, res, next) => {
  try {
    const events = await Event.find({ date: { $gte: new Date() } })
      .populate('createdBy', 'email')
      .populate('attendees', '_id email')
      .sort({ date: 1 })
      .lean();

    res.json(events);
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/events/:id
 * @desc    Get single event
 * @access  Public
 */
export const getEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('createdBy', 'email')
      .populate('attendees', 'email');

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json(event);
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/events
 * @desc    Create new event
 * @access  Private
 */
export const createEvent = async (req, res, next) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: errors.array()[0].msg,
      });
    }

    const { title, description, date, location, capacity } = req.body;

    // Validate date is in future
    if (new Date(date) <= new Date()) {
      return res.status(400).json({ message: 'Event date must be in the future' });
    }

    let imageUrl = '';

    // Process image if provided
    if (req.file) {
      try {
        imageUrl = await processImage(req.file);
      } catch (uploadError) {
        console.error('Image processing error:', uploadError);
        return res.status(400).json({ message: 'Failed to process image. Please try again.' });
      }
    }

    // Create event
    const event = await Event.create({
      title,
      description,
      date,
      location,
      capacity: parseInt(capacity),
      imageUrl,
      createdBy: req.user._id,
    });

    const populatedEvent = await Event.findById(event._id).populate(
      'createdBy',
      'email'
    );

    res.status(201).json(populatedEvent);
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/events/:id
 * @desc    Update event
 * @access  Private (only event creator)
 */
export const updateEvent = async (req, res, next) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: errors.array()[0].msg,
      });
    }

    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if user is the creator
    if (event.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        message: 'You are not authorized to update this event' 
      });
    }

    const { title, description, date, location, capacity } = req.body;

    // Validate date is in future
    if (new Date(date) <= new Date()) {
      return res.status(400).json({ message: 'Event date must be in the future' });
    }

    // Validate capacity is not less than current attendees count
    if (parseInt(capacity) < event.attendeesCount) {
      return res.status(400).json({
        message: `Capacity cannot be less than current attendees count (${event.attendeesCount})`,
      });
    }

    // Update fields
    event.title = title;
    event.description = description;
    event.date = date;
    event.location = location;
    event.capacity = parseInt(capacity);

    // Process new image if provided
    if (req.file) {
      try {
        event.imageUrl = await processImage(req.file);
      } catch (uploadError) {
        console.error('Image processing error:', uploadError);
        return res.status(400).json({ message: 'Failed to process image. Please try again.' });
      }
    }

    await event.save();

    const updatedEvent = await Event.findById(event._id).populate(
      'createdBy',
      'email'
    );

    res.json(updatedEvent);
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/events/:id
 * @desc    Delete event
 * @access  Private (only event creator)
 */
export const deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if user is the creator
    if (event.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        message: 'You are not authorized to delete this event' 
      });
    }

    await event.deleteOne();

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/events/:id/rsvp
 * @desc    RSVP to an event with atomic operation to prevent overbooking
 * @access  Private
 * 
 * CRITICAL IMPLEMENTATION:
 * This uses MongoDB's atomic update operations to prevent race conditions.
 * Even under high concurrency, this ensures:
 * 1. No user can RSVP twice to the same event
 * 2. Event capacity is never exceeded
 * 3. attendeesCount is always accurate
 * 
 * The updateOne operation with conditions is atomic - if the conditions
 * aren't met, the update fails and we return an appropriate error.
 */
export const rsvpEvent = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const eventId = req.params.id;

    // First check if event exists
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if event is in the past
    if (event.date < new Date()) {
      return res.status(400).json({ message: 'Cannot RSVP to past events' });
    }

    // Check if user already RSVP'd
    if (event.attendees.includes(userId)) {
      return res.status(400).json({ 
        message: 'You have already RSVP\'d to this event' 
      });
    }

    /**
     * ATOMIC UPDATE OPERATION
     * 
     * This single operation does THREE things atomically:
     * 1. Checks that attendeesCount < capacity
     * 2. Adds user to attendees array (only if not already present)
     * 3. Increments attendeesCount
     * 
     * If ANY condition fails, the entire operation fails.
     * This prevents race conditions where multiple requests
     * could overbooking the event.
     */
    const result = await Event.updateOne(
      {
        _id: eventId,
        attendeesCount: { $lt: event.capacity }, // Ensure capacity not exceeded
        attendees: { $ne: userId }, // Ensure user not already in attendees
      },
      {
        $addToSet: { attendees: userId }, // Add user (no duplicates)
        $inc: { attendeesCount: 1 }, // Increment count
      }
    );

    // Check if update was successful
    if (result.modifiedCount === 0) {
      // Update failed - either event is full or user already registered
      const updatedEvent = await Event.findById(eventId);
      
      if (updatedEvent.attendeesCount >= updatedEvent.capacity) {
        return res.status(400).json({ message: 'Event is full' });
      }
      
      if (updatedEvent.attendees.includes(userId)) {
        return res.status(400).json({ 
          message: 'You have already RSVP\'d to this event' 
        });
      }

      // Shouldn't reach here, but just in case
      return res.status(400).json({ 
        message: 'Unable to RSVP. Please try again.' 
      });
    }

    // Fetch updated event
    const updatedEvent = await Event.findById(eventId)
      .populate('createdBy', 'email')
      .populate('attendees', 'email');

    res.json({
      message: 'RSVP successful',
      event: updatedEvent,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/events/:id/rsvp
 * @desc    Cancel RSVP to an event
 * @access  Private
 * 
 * Also uses atomic operation to maintain data consistency
 */
export const cancelRsvp = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const eventId = req.params.id;

    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if user has RSVP'd
    if (!event.attendees.includes(userId)) {
      return res.status(400).json({ 
        message: 'You have not RSVP\'d to this event' 
      });
    }

    /**
     * ATOMIC UPDATE OPERATION
     * Remove user from attendees and decrement count atomically
     */
    const result = await Event.updateOne(
      {
        _id: eventId,
        attendees: userId, // Ensure user is in attendees
      },
      {
        $pull: { attendees: userId }, // Remove user
        $inc: { attendeesCount: -1 }, // Decrement count
      }
    );

    if (result.modifiedCount === 0) {
      return res.status(400).json({ 
        message: 'Unable to cancel RSVP. Please try again.' 
      });
    }

    // Fetch updated event
    const updatedEvent = await Event.findById(eventId)
      .populate('createdBy', 'email')
      .populate('attendees', 'email');

    res.json({
      message: 'RSVP cancelled successfully',
      event: updatedEvent,
    });
  } catch (error) {
    next(error);
  }
};
