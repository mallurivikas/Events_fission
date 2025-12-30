import express from 'express';
import { body } from 'express-validator';
import {
  createEvent,
  getEvents,
  getEvent,
  updateEvent,
  deleteEvent,
  rsvpEvent,
  cancelRsvp,
} from '../controllers/eventController.js';
import { protect } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// Validation rules
const eventValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 100 })
    .withMessage('Title cannot exceed 100 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
  body('date')
    .notEmpty()
    .withMessage('Date is required')
    .isISO8601()
    .withMessage('Invalid date format'),
  body('location').trim().notEmpty().withMessage('Location is required'),
  body('capacity')
    .isInt({ min: 1, max: 10000 })
    .withMessage('Capacity must be between 1 and 10000'),
];

// Routes
router.route('/')
  .get(getEvents)
  .post(protect, upload.single('image'), eventValidation, createEvent);

router.route('/:id')
  .get(getEvent)
  .put(protect, upload.single('image'), eventValidation, updateEvent)
  .delete(protect, deleteEvent);

router.post('/:id/rsvp', protect, rsvpEvent);
router.delete('/:id/rsvp', protect, cancelRsvp);

export default router;
