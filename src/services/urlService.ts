import { Product } from '../types';

/**
 * Returns relative path for product page (works seamlessly across Netlify & static hosts)
 */
export function getProductPath(productId: string): string {
  return `/?product=${encodeURIComponent(productId)}`;
}

/**
 * Returns full absolute URL for Facebook Ads, WhatsApp, and social sharing
 */
export function getProductFullUrl(productId: string): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  return `${origin}/?product=${encodeURIComponent(productId)}`;
}

/**
 * Extracts product ID from current browser URL:
 * - Query param: ?product=id or ?p=id
 * - Pathname: /product/id
 * - Hash: #/product/id or #product-id
 */
export function getProductIdFromUrl(): string | null {
  if (typeof window === 'undefined') return null;

  try {
    const url = new URL(window.location.href);

    // 1. Check query parameter ?product=xyz or ?p=xyz
    const queryProduct = url.searchParams.get('product') || url.searchParams.get('p');
    if (queryProduct) return queryProduct;

    // 2. Check path /product/xyz
    const pathMatch = url.pathname.match(/\/product\/([^/?#]+)/i);
    if (pathMatch && pathMatch[1]) return decodeURIComponent(pathMatch[1]);

    // 3. Check hash #product-xyz or #/product/xyz
    const hashMatch = url.hash.match(/#(?:product[-/]|[\/]?product\/)([^/?#&]+)/i);
    if (hashMatch && hashMatch[1]) return decodeURIComponent(hashMatch[1]);
  } catch (err) {
    console.error('Error parsing product ID from URL:', err);
  }

  return null;
}

/**
 * Copies the product URL to clipboard for Facebook Ads campaigns
 */
export async function copyProductLinkToClipboard(productId: string): Promise<boolean> {
  const fullUrl = getProductFullUrl(productId);
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(fullUrl);
      return true;
    } else {
      // Fallback for older browsers or insecure contexts
      const textArea = document.createElement('textarea');
      textArea.value = fullUrl;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
    }
  } catch (err) {
    console.error('Failed to copy product link:', err);
    return false;
  }
}

/**
 * Updates browser history so the address bar reflects the product link without page refresh
 */
export function updateProductHistoryUrl(productId: string | null) {
  if (typeof window === 'undefined') return;

  try {
    if (productId) {
      const newUrl = `/?product=${encodeURIComponent(productId)}`;
      if (window.location.search !== `?product=${productId}`) {
        window.history.pushState({ productId }, '', newUrl);
      }
    } else {
      // Return to homepage cleanly
      const currentParam = new URLSearchParams(window.location.search).get('product');
      if (currentParam || window.location.pathname.includes('/product/')) {
        window.history.pushState({}, '', '/');
      }
    }
  } catch (err) {
    console.error('Error updating history state:', err);
  }
}

/**
 * Dynamic SEO and OpenGraph tag updater for Facebook Ads crawlers and social previews
 */
export function updateProductSeo(product: Product | null, storeName: string, currencySymbol: string) {
  if (typeof document === 'undefined') return;

  if (product) {
    const formattedPrice = `${currencySymbol}${product.price.toFixed(2)}`;
    document.title = `${product.name} (${formattedPrice}) | ${storeName}`;

    const desc = product.description
      ? product.description.slice(0, 160)
      : `Order ${product.name} online at ${storeName}. Fast Cash on Delivery available!`;

    const imageUrl = product.media?.find(m => m.type === 'image')?.url || product.media?.[0]?.url || '';
    const productUrl = getProductFullUrl(product.id);

    setOrCreateMetaTag('description', desc);
    setOrCreateMetaProperty('og:title', `${product.name} - ${formattedPrice} | ${storeName}`);
    setOrCreateMetaProperty('og:description', desc);
    setOrCreateMetaProperty('og:url', productUrl);
    setOrCreateMetaProperty('og:type', 'product');
    if (imageUrl) {
      setOrCreateMetaProperty('og:image', imageUrl);
    }
  } else {
    document.title = `${storeName} - Premium Groceries & Goods`;
    setOrCreateMetaTag('description', `Shop fresh groceries, pantry essentials, and artisanal goods with fast delivery at ${storeName}.`);
  }
}

function setOrCreateMetaTag(name: string, content: string) {
  let tag = document.querySelector(`meta[name="${name}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute('name', name);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}

function setOrCreateMetaProperty(property: string, content: string) {
  let tag = document.querySelector(`meta[property="${property}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute('property', property);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}
