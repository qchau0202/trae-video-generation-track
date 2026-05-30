const express = require('express');
const authRoutes = require('./auth.routes');
const { requireAuth } = require('../middleware/auth.middleware');
const { requireWorkspace, requireWorkspaceRole } = require('../middleware/workspace.middleware');

const brandProfiles = require('../controllers/brandProfiles.controller');
const productInputs = require('../controllers/productInputs.controller');
const offers = require('../controllers/offers.controller');
const frameworkTemplates = require('../controllers/frameworkTemplates.controller');
const campaigns = require('../controllers/campaigns.controller');
const variants = require('../controllers/variants.controller');
const videoAssets = require('../controllers/videoAssets.controller');
const generationJobs = require('../controllers/generationJobs.controller');
const feedback = require('../controllers/feedback.controller');
const shareLinks = require('../controllers/shareLinks.controller');
const exportBundles = require('../controllers/exportBundles.controller');
const workspaces = require('../controllers/workspaces.controller');

const router = express.Router();

router.get('/health', (req, res) => res.json({ ok: true }));
router.use('/auth', authRoutes);

router.get('/share/:token', shareLinks.publicView);
router.post('/share/:token/feedback', shareLinks.publicCreateFeedback);

router.use(requireAuth);

router.get('/workspaces', workspaces.listMyWorkspaces);
router.post('/workspaces', workspaces.createWorkspace);
router.put('/workspaces/:id', workspaces.updateWorkspace);
router.delete('/workspaces/:id', workspaces.deleteWorkspace);
router.get('/workspaces/:id/members', workspaces.listMembers);
router.post('/workspaces/:id/members', workspaces.inviteMember);

router.use(requireWorkspace);

router.get('/brand-profiles', brandProfiles.list);
router.post('/brand-profiles', brandProfiles.create);
router.get('/brand-profiles/:id', brandProfiles.get);
router.put('/brand-profiles/:id', brandProfiles.update);
router.delete('/brand-profiles/:id', brandProfiles.remove);

router.get('/product-inputs', productInputs.list);
router.post('/product-inputs', productInputs.create);
router.get('/product-inputs/:id', productInputs.get);
router.put('/product-inputs/:id', productInputs.update);
router.delete('/product-inputs/:id', productInputs.remove);

router.get('/offers', offers.list);
router.post('/offers', offers.create);
router.get('/offers/:id', offers.get);
router.put('/offers/:id', offers.update);
router.delete('/offers/:id', offers.remove);

router.get('/framework-templates', frameworkTemplates.list);
router.post('/framework-templates', requireWorkspaceRole('admin'), frameworkTemplates.create);
router.get('/framework-templates/:id', frameworkTemplates.get);
router.put('/framework-templates/:id', requireWorkspaceRole('admin'), frameworkTemplates.update);
router.delete('/framework-templates/:id', requireWorkspaceRole('admin'), frameworkTemplates.remove);

router.get('/campaigns', campaigns.list);
router.post('/campaigns', campaigns.create);
router.get('/campaigns/:id', campaigns.get);
router.put('/campaigns/:id', campaigns.update);
router.delete('/campaigns/:id', campaigns.remove);
router.post('/campaigns/:id/generate', campaigns.generate);

router.get('/variants', variants.list);
router.post('/variants', variants.create);
router.get('/variants/:id', variants.get);
router.put('/variants/:id', variants.update);
router.delete('/variants/:id', variants.remove);

router.get('/video-assets', videoAssets.list);
router.post('/video-assets', requireWorkspaceRole('admin'), videoAssets.create);
router.get('/video-assets/:id', videoAssets.get);
router.put('/video-assets/:id', requireWorkspaceRole('admin'), videoAssets.update);
router.delete('/video-assets/:id', requireWorkspaceRole('admin'), videoAssets.remove);

router.get('/generation-jobs', generationJobs.list);
router.post('/generation-jobs', requireWorkspaceRole('admin'), generationJobs.create);
router.get('/generation-jobs/:id', generationJobs.get);
router.put('/generation-jobs/:id', requireWorkspaceRole('admin'), generationJobs.update);
router.delete('/generation-jobs/:id', requireWorkspaceRole('admin'), generationJobs.remove);

router.get('/feedback', feedback.list);
router.post('/feedback', feedback.create);
router.get('/feedback/:id', feedback.get);
router.put('/feedback/:id', feedback.update);
router.delete('/feedback/:id', feedback.remove);

router.get('/share-links', shareLinks.list);
router.post('/share-links', shareLinks.create);
router.get('/share-links/:id', shareLinks.get);
router.put('/share-links/:id', shareLinks.update);
router.delete('/share-links/:id', shareLinks.remove);

router.get('/export-bundles', exportBundles.list);
router.post('/export-bundles', exportBundles.create);
router.get('/export-bundles/:id', exportBundles.get);
router.delete('/export-bundles/:id', exportBundles.remove);

module.exports = router;
