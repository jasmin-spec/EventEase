const express = require("express");
const router = express.Router();
const { auth } = require("../middlewares/auth");
const upload = require('../middlewares/upload');

const {
  createEvent,
  getEvents,
  getEventById, 
  getMyEvents,
  updateEvent,
  deleteEvent,
  toggleInterest,
} = require("../controllers/eventController");
router.get("/", getEvents);
router.get("/single/:id", getEventById); 
router.post('/', auth, upload.single('coverImage'), createEvent);
// router.post(
//   '/',
//   auth,
//   (req, res, next) => {
//     upload.single('coverImage')(req, res, (err) => {

//       if (err) {
//         console.error('====================================');
//         console.error('❌ MULTER / CLOUDINARY ERROR');
//         console.error('====================================');

//         console.error('Error object:', err);
//         console.error('Error name:', err?.name);
//         console.error('Error message:', err?.message);
//         console.error('Error stack:', err?.stack);

//         return res.status(500).json({
//           success: false,
//           message: err?.message || 'Image upload failed',
//           error: String(err?.message || err)
//         });
//       }

//       console.log('====================================');
//       console.log('✅ UPLOAD SUCCESS');
//       console.log('File:', req.file);
//       console.log('====================================');

//       next();
//     });
//   },
//   createEvent
// );
router.post('/create', auth, upload.single('coverImage'), createEvent);
router.get("/my-events", auth, getMyEvents);
router.put("/:id", auth, upload.single('coverImage'), updateEvent);
router.delete("/:id", auth, deleteEvent);
router.put('/interest/:id', auth, toggleInterest);

module.exports = router;