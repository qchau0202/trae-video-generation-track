function polishHeadline(raw, { maxLength = 60 } = {}) {
  const input = String(raw || '').trim();
  if (!input) return '';

  const compact = input.replace(/\s+/g, ' ');
  if (compact.length <= maxLength) return compact;

  const truncated = compact.slice(0, maxLength - 1).trimEnd();
  return `${truncated}…`;
}

module.exports = { polishHeadline };

