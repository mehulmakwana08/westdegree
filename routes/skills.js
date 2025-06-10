const express = require('express');
const router = express.Router();
const { SkillController, upload } = require('../controllers/SkillController');
const methodOverride = require('method-override');

// Use method override for PUT and DELETE requests
router.use(methodOverride('_method'));

// Admin Routes
router.get('/', SkillController.index);
router.get('/create', SkillController.create);
router.post('/', upload.single('icon'), SkillController.store);
router.get('/:id/edit', SkillController.edit);
router.put('/:id', upload.single('icon'), SkillController.update);
router.delete('/:id', SkillController.destroy);
router.post('/:id/toggle', SkillController.toggleStatus);

// API Routes for frontend
router.get('/api/skills', SkillController.getSkills);

module.exports = router;