const express = require("express")
const router = express.Router()

const {
  createSurvey,
  getSurveys,
  getSurveyById,
  getSurveysByUserId,
  updateSurvey,
  deleteSurvey,
} = require("../controllers/surveyController")

const { protect } = require("../middlewares/authMiddleware")

router.route("/").post(protect, createSurvey).get(protect, getSurveys)
router
  .route("/:id")
  .get(protect, getSurveyById)
  .put(protect, updateSurvey)
  .delete(protect, deleteSurvey)
router.route("/user/:id").get(protect, getSurveysByUserId)

module.exports = router
