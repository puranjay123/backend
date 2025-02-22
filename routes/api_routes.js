const express = require("express");
const db_apis = require("../controllers/event_db_apis");
const router = express.Router();

// Public API routes

router.get("/upcomming-events", async (req, res) => {
  try {
    const data = await db_apis.read_upcomming_events(req, res);
    res.json(data);
  } catch (err) {
    console.log(err);
  }
});

router.get("/ongoing-events", async (req, res) => {
  try {
    const data = await db_apis.read_ongoing_events(req, res);
    res.json(data);
  } catch (err) {
    console.log(err);
  }
});

router.get("/past-events", async (req, res) => {
  try {
    const data = await db_apis.read_past_events();
    res.json(data);
  } catch (err) {
    console.log(err);
  }
});

// For Future "If events are organized by cu"
// router.get('our-events',(req,res)=>{
// })

module.exports = router;
