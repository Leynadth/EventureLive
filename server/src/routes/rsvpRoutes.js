const express = require("express");
const { authenticateToken } = require("../middleware/auth");
const { pool } = require("../db");

const router = express.Router();


router.use(authenticateToken);


router.post("/:eventId", async (req, res) => {
  try {
    const userId = req.user.id;
    const eventId = parseInt(req.params.eventId, 10);

    if (!eventId || isNaN(eventId)) {
      return res.status(400).json({ message: "Invalid event ID" });
    }

    
    const [eventRows] = await pool.execute(
      `SELECT id, status, is_public, capacity FROM events WHERE id = ? LIMIT 1`,
      [eventId]
    );

    if (eventRows.length === 0) {
      return res.status(404).json({ message: "Event not found" });
    }

    const event = eventRows[0];

    
    const isPublic = event.is_public === 1 || event.is_public === true;
    if (event.status !== "approved" || !isPublic) {
      const [creatorCheck] = await pool.execute(
        `SELECT created_by FROM events WHERE id = ? LIMIT 1`,
        [eventId]
      );
      if (creatorCheck.length === 0 || String(creatorCheck[0].created_by) !== String(userId)) {
        return res.status(403).json({ message: "Event is not available for RSVP" });
      }
    }

    
    const [existingRsvp] = await pool.execute(
      `SELECT id, status FROM rsvps WHERE user_id = ? AND event_id = ? LIMIT 1`,
      [userId, eventId]
    );

    if (existingRsvp.length > 0) {
      
      await pool.execute(
        `UPDATE rsvps SET status = 'going', updated_at = NOW() WHERE user_id = ? AND event_id = ?`,
        [userId, eventId]
      );
      return res.status(200).json({ message: "RSVP updated", status: "going" });
    }

    
    await pool.execute(
      `INSERT INTO rsvps (user_id, event_id, status, created_at, updated_at) VALUES (?, ?, 'going', NOW(), NOW())`,
      [userId, eventId]
    );

    return res.status(201).json({ message: "RSVP successful", status: "going" });
  } catch (error) {
    console.error("Failed to create RSVP:", error);
    return res.status(500).json({ message: "Failed to RSVP to event" });
  }
});


router.delete("/:eventId", async (req, res) => {
  try {
    const userId = req.user.id;
    const eventId = parseInt(req.params.eventId, 10);

    if (!eventId || isNaN(eventId)) {
      return res.status(400).json({ message: "Invalid event ID" });
    }

    
    const [result] = await pool.execute(
      `DELETE FROM rsvps WHERE user_id = ? AND event_id = ?`,
      [userId, eventId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "RSVP not found" });
    }

    return res.status(200).json({ message: "RSVP cancelled" });
  } catch (error) {
    console.error("Failed to cancel RSVP:", error);
    return res.status(500).json({ message: "Failed to cancel RSVP" });
  }
});


router.get("/:eventId", async (req, res) => {
  try {
    const userId = req.user.id;
    const eventId = parseInt(req.params.eventId, 10);

    if (!eventId || isNaN(eventId)) {
      return res.status(400).json({ message: "Invalid event ID" });
    }

    const [rsvpRows] = await pool.execute(
      `SELECT status FROM rsvps WHERE user_id = ? AND event_id = ? LIMIT 1`,
      [userId, eventId]
    );

    if (rsvpRows.length === 0) {
      return res.status(200).json({ isRsvped: false, status: null });
    }

    return res.status(200).json({ isRsvped: true, status: rsvpRows[0].status });
  } catch (error) {
    console.error("Failed to check RSVP:", error);
    return res.status(500).json({ message: "Failed to check RSVP status" });
  }
});

module.exports = router;