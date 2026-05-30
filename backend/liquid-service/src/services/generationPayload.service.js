function buildPrompt({ framework, variantType, offer, product }) {
  const polished = offer.headlinePolished || offer.headlineRaw;
  const base = `Create a ${framework.goalType} e-commerce ad video. Offer: "${polished}". CTA: "${offer.ctaText}". Product: "${product.title || 'Product'}".`;
  if (framework.goalType === 'hook-splitter') {
    if (variantType === 'problem-hook') return `${base} Opening hook: problem-focused pain point.`;
    if (variantType === 'trend-hook') return `${base} Opening hook: trend-focused social proof.`;
    if (variantType === 'discount-hook') return `${base} Opening hook: discount-focused urgency.`;
  }
  if (framework.goalType === 'mega-sale') return `${base} Style: high-urgency mega sale with countdown energy.`;
  if (framework.goalType === 'feature-benefit') return `${base} Style: elegant feature-benefit showcase with 3 callouts.`;
  return base;
}

function buildGenerationPayload({ brand, framework, product, offer, variantType, format }) {
  return {
    format,
    minDurationSeconds: framework.minDurationSeconds || 30,
    brand: {
      name: brand.name,
      logoUrl: brand.logoUrl,
      colors: {
        primary: brand.colorPrimary,
        secondary: brand.colorSecondary,
        accent: brand.colorAccent,
      },
      fontPreset: brand.fontPreset,
      tonePreset: brand.tonePreset,
    },
    product: {
      title: product.title,
      images: product.images,
      price: product.price,
      currency: product.currency,
    },
    offer: {
      headline: offer.headlinePolished || offer.headlineRaw,
      ctaText: offer.ctaText,
      terms: offer.terms,
    },
    framework: {
      id: String(framework._id),
      goalType: framework.goalType,
      name: framework.name,
    },
    variantType,
    prompt: buildPrompt({ framework, variantType, offer, product }),
  };
}

module.exports = { buildGenerationPayload };

