const mongoose = require('mongoose');
const BrandProfile = require('../models/BrandProfile');
const Campaign = require('../models/Campaign');
const FrameworkTemplate = require('../models/FrameworkTemplate');
const GenerationJob = require('../models/GenerationJob');
const Offer = require('../models/Offer');
const ProductInput = require('../models/ProductInput');
const Variant = require('../models/Variant');
const VideoAsset = require('../models/VideoAsset');
const { buildGenerationPayload } = require('../services/generationPayload.service');

async function list(req, res, next) {
  try {
    const items = await Campaign.find({ workspaceId: req.workspace.id, deletedAt: null }).sort({ createdAt: -1 });
    res.json({ items });
  } catch (err) {
    next(err);
  }
}

async function get(req, res, next) {
  try {
    const campaign = await Campaign.findOne({ _id: req.params.id, workspaceId: req.workspace.id, deletedAt: null });
    if (!campaign) {
      res.status(404);
      throw new Error('Not found');
    }

    const variants = await Variant.find({ campaignId: campaign._id, workspaceId: req.workspace.id, deletedAt: null }).sort({
      createdAt: 1,
    });
    const videoAssets = await VideoAsset.find({ campaignId: campaign._id, workspaceId: req.workspace.id, deletedAt: null });
    const jobs = await GenerationJob.find({ campaignId: campaign._id, workspaceId: req.workspace.id, deletedAt: null });

    res.json({ campaign, variants, videoAssets, jobs });
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const { name, brandProfileId, productInputId, offerId, frameworkTemplateId } = req.body || {};
    if (!name || !brandProfileId || !productInputId || !offerId || !frameworkTemplateId) {
      res.status(400);
      throw new Error('name, brandProfileId, productInputId, offerId, frameworkTemplateId are required');
    }

    const [brand, product, offer, framework] = await Promise.all([
      BrandProfile.findOne({ _id: brandProfileId, workspaceId: req.workspace.id, deletedAt: null }),
      ProductInput.findOne({ _id: productInputId, workspaceId: req.workspace.id, deletedAt: null }),
      Offer.findOne({ _id: offerId, workspaceId: req.workspace.id, deletedAt: null }),
      FrameworkTemplate.findOne({
        _id: frameworkTemplateId,
        deletedAt: null,
        $or: [{ workspaceId: null }, { workspaceId: req.workspace.id }],
      }),
    ]);

    if (!brand || !product || !offer || !framework) {
      res.status(400);
      throw new Error('Invalid references (brand/product/offer/framework)');
    }

    const campaign = await Campaign.create({
      workspaceId: req.workspace.id,
      name,
      brandProfileId: brand._id,
      productInputId: product._id,
      offerId: offer._id,
      frameworkTemplateId: framework._id,
      status: 'draft',
    });

    res.status(201).json({ campaign });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const campaign = await Campaign.findOne({ _id: req.params.id, workspaceId: req.workspace.id, deletedAt: null });
    if (!campaign) {
      res.status(404);
      throw new Error('Not found');
    }
    const { name, status } = req.body || {};
    if (name !== undefined) campaign.name = name;
    if (status !== undefined) campaign.status = status;
    await campaign.save();
    res.json({ campaign });
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const campaign = await Campaign.findOne({ _id: req.params.id, workspaceId: req.workspace.id, deletedAt: null });
    if (!campaign) {
      res.status(404);
      throw new Error('Not found');
    }
    campaign.deletedAt = new Date();
    campaign.status = 'archived';
    await campaign.save();
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

function getVariantTypesForFramework(goalType) {
  if (goalType === 'hook-splitter') return ['problem-hook', 'trend-hook', 'discount-hook'];
  return ['single'];
}

async function generate(req, res, next) {
  const session = await mongoose.startSession();
  try {
    const { regenerate = false } = req.body || {};

    let resultPayload = null;
    await session.withTransaction(async () => {
      const campaign = await Campaign.findOne({ _id: req.params.id, workspaceId: req.workspace.id, deletedAt: null }).session(
        session
      );
      if (!campaign) {
        res.status(404);
        throw new Error('Not found');
      }
      if (campaign.status === 'archived') {
        res.status(400);
        throw new Error('Campaign archived');
      }

      const [brand, product, offer, framework] = await Promise.all([
        BrandProfile.findOne({ _id: campaign.brandProfileId, workspaceId: req.workspace.id, deletedAt: null }).session(session),
        ProductInput.findOne({ _id: campaign.productInputId, workspaceId: req.workspace.id, deletedAt: null }).session(session),
        Offer.findOne({ _id: campaign.offerId, workspaceId: req.workspace.id, deletedAt: null }).session(session),
        FrameworkTemplate.findOne({
          _id: campaign.frameworkTemplateId,
          deletedAt: null,
          $or: [{ workspaceId: null }, { workspaceId: req.workspace.id }],
        }).session(session),
      ]);

      if (!brand || !product || !offer || !framework) {
        res.status(400);
        throw new Error('Campaign references invalid or deleted resources');
      }

      if (!Array.isArray(product.images) || product.images.length === 0) {
        res.status(400);
        throw new Error('Product must include at least 1 image URL');
      }

      const formats = Array.isArray(framework.supportedFormats) && framework.supportedFormats.length ? framework.supportedFormats : ['9:16', '1:1'];
      const variantTypes = getVariantTypesForFramework(framework.goalType);

      const variants = [];
      for (const variantType of variantTypes) {
        const variant = await Variant.findOneAndUpdate(
          { campaignId: campaign._id, variantType, workspaceId: req.workspace.id, deletedAt: null },
          { workspaceId: req.workspace.id, campaignId: campaign._id, variantType, status: 'generating' },
          { upsert: true, new: true, session }
        );
        variants.push(variant);
      }

      campaign.status = 'generating';
      await campaign.save({ session });

      for (const variant of variants) {
        for (const format of formats) {
          if (regenerate) {
            await GenerationJob.updateMany(
              { variantId: variant._id, format, workspaceId: req.workspace.id, deletedAt: null },
              { deletedAt: new Date() },
              { session }
            );
            await VideoAsset.updateMany(
              { variantId: variant._id, format, workspaceId: req.workspace.id, deletedAt: null },
              { deletedAt: new Date() },
              { session }
            );
          }

          const requestPayload = buildGenerationPayload({
            brand,
            framework,
            product,
            offer,
            variantType: variant.variantType,
            format,
          });

          await GenerationJob.findOneAndUpdate(
            { variantId: variant._id, format, workspaceId: req.workspace.id, deletedAt: null },
            {
              workspaceId: req.workspace.id,
              campaignId: campaign._id,
              variantId: variant._id,
              format,
              provider: 'pixverse',
              status: 'submitted',
              requestPayload,
              resultPayload: {},
              errorMessage: '',
              lockedAt: null,
            },
            { upsert: true, new: true, session }
          );
        }
      }

      resultPayload = { ok: true, campaignId: String(campaign._id) };
    });

    res.json(resultPayload || { ok: true });
  } catch (err) {
    next(err);
  } finally {
    session.endSession();
  }
}

module.exports = { list, get, create, update, remove, generate };

