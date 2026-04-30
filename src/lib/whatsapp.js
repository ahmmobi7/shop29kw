// Replace with your actual WhatsApp business number (no + or spaces)
export const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || '1234567890';

/**
 * Build a wa.me deep-link with a pre-filled order message.
 * @param {object} post - post row from Supabase
 * @returns {string} full WhatsApp URL
 */
export function buildWhatsAppUrl(post) {
  const productLink = `${window.location.origin}/video/${post.id}`;
  const message = [
    `Hi! I'd like to order:`,
    `• Product: ${post.product_name || 'Item from Shop29'}`,
    post.product_brand ? `• Brand: ${post.product_brand}` : null,
    post.product_price ? `• Price: $${Number(post.product_price).toFixed(2)}` : null,
    `• Link: ${productLink}`,
  ]
    .filter(Boolean)
    .join('\n');

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
