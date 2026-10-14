const Event = require("../models/eventModel");

// 1. Get all approved events for Homepage
exports.getEvents = async (req, res) => {
  try {
    const events = await Event.find({ isApproved: true });
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2. Get specific events created by the logged-in Organizer
exports.getMyEvents = async (req, res) => {
  try {
    const events = await Event.find({ organizer: req.user.id });
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: "Error fetching your events" });
  }
};

exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 3. CREATE EVENT (Fixed for Dashboard Math)
// 3. CREATE EVENT
exports.createEvent = async (req, res) => {
  try {
    console.log("===== CREATE EVENT =====");

    console.log("Body:", req.body);
    console.log("User:", req.user);
    console.log("File:", req.file);

    const {
      title,
      description,
      date,
      time,
      location,
      price,
      totalTickets,
      availableTickets,
      category,
    } = req.body;

    // --------------------------------------------------
    // AUTHENTICATION CHECK
    // --------------------------------------------------

    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "User authentication information is missing"
      });
    }

    // --------------------------------------------------
    // REQUIRED FIELD VALIDATION
    // --------------------------------------------------

    if (
      !title ||
      !description ||
      !date ||
      !time ||
      !location ||
      price === undefined ||
      price === null ||
      price === "" ||
      availableTickets === undefined ||
      availableTickets === null ||
      availableTickets === ""
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all required fields"
      });
    }

    // --------------------------------------------------
    // NUMBER CONVERSION
    // --------------------------------------------------

    const eventPrice = Number(price);

    // Use availableTickets from frontend
    // If totalTickets is sent, use that instead
    const ticketCount = Number(
      totalTickets || availableTickets
    );

    // --------------------------------------------------
    // NUMBER VALIDATION
    // --------------------------------------------------

    if (!Number.isFinite(eventPrice) || eventPrice < 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid event price"
      });
    }

    if (!Number.isInteger(ticketCount) || ticketCount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Tickets must be a positive whole number"
      });
    }

    // --------------------------------------------------
    // IMAGE CHECK
    // --------------------------------------------------

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Cover image is required"
      });
    }

    console.log("Uploaded image:", req.file);

    // --------------------------------------------------
    // CREATE EVENT
    // --------------------------------------------------

    const newEvent = new Event({
      title: title.trim(),

      description: description.trim(),

      date,

      time,

      location: location.trim(),

      price: eventPrice,

      // Total tickets
      totalTickets: ticketCount,

      // Initially all tickets are available
      availableTickets: ticketCount,

      // Cloudinary / uploaded image URL
      coverImage:
        req.file.path ||
        req.file.secure_url ||
        req.file.url ||
        "",

      category: category || "Events",

      organizer: req.user.id
    });

    console.log("Event before save:", newEvent);

    // --------------------------------------------------
    // SAVE EVENT
    // --------------------------------------------------

    const savedEvent = await newEvent.save();

    console.log(
      "Event created successfully:",
      savedEvent._id
    );

    // --------------------------------------------------
    // RESPONSE
    // --------------------------------------------------

    return res.status(201).json({
      success: true,
      message: "Event created successfully!",
      event: savedEvent
    });

  } catch (err) {
    console.error("===== CREATE EVENT ERROR =====");

    console.error("Error:", err);

    console.error("Error message:", err?.message);

    console.error("Error name:", err?.name);

    console.error("Error stack:", err?.stack);

    // Mongoose validation error
    if (err?.name === "ValidationError") {
      const validationErrors = Object.values(err.errors).map(
        (error) => error.message
      );

      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationErrors
      });
    }

    // Mongoose cast error
    if (err?.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: `Invalid value for ${err.path}`
      });
    }

    // General server error
    return res.status(500).json({
      success: false,
      message: err?.message || "Error creating event"
    });
  }
};
exports.updateEvent = async (req, res) => {
  try {
    // 1. Prepare the update object
    let updates = { ...req.body };

    // 2. If a new file is uploaded, update the coverImage field
    if (req.file) {
      updates.coverImage = req.file.path; // Cloudinary URL
    }

    // 3. Perform the update
    const event = await Event.findByIdAndUpdate(req.params.id, updates, { new: true });
    
    if (!event) return res.status(404).json({ message: "Event not found" });
    
    res.status(200).json(event);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    await Event.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Event deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 4. Toggle Interest (Like/Unlike Event) 
exports.toggleInterest = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Check if user already liked this event
    const userLiked = event.likes.some(likeId => likeId.toString() === userId.toString());

    let updatedEvent;

    if (userLiked) {
      // User already liked it -> REMOVE the like
      updatedEvent = await Event.findByIdAndUpdate(
        id,
        { $pull: { likes: userId } },
        { new: true }
      );
    } else {
      // User hasn't liked it -> ADD the like
      updatedEvent = await Event.findByIdAndUpdate(
        id,
        { $push: { likes: userId } },
        { new: true }
      );
    }

    res.status(200).json({
      message: userLiked ? "Unliked successfully" : "Liked successfully",
      event: updatedEvent,
      likeCount: updatedEvent.likes.length,
      isLiked: !userLiked
    });
  } catch (error) {
    console.error("Toggle Interest Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};