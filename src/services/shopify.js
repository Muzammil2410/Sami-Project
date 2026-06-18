const domain = import.meta.env.VITE_SHOPIFY_STORE_DOMAIN;
const storefrontToken = import.meta.env.VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN;
const apiVersion = import.meta.env.VITE_SHOPIFY_API_VERSION || '2024-01';

const storefrontFetch = async (query, variables = {}) => {
  if (!domain || !storefrontToken) {
    throw new Error('Shopify domain or storefront token is missing in environment variables.');
  }

  const url = `https://${domain}/api/${apiVersion}/graphql.json`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': storefrontToken,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`Shopify API error: ${response.status} ${response.statusText}`);
  }

  const json = await response.json();
  if (json.errors) {
    throw new Error(json.errors.map(e => e.message).join(', '));
  }

  return json.data;
};

const GET_PRODUCTS_QUERY = `
  query GetProducts($first: Int!) {
    products(first: $first) {
      edges {
        node {
          id
          title
          handle
          description
          availableForSale
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
            maxVariantPrice {
              amount
              currencyCode
            }
          }
          images(first: 20) {
            edges {
              node {
                url
                altText
              }
            }
          }
          options {
            name
            values
          }
          variants(first: 100) {
            edges {
              node {
                id
                title
                availableForSale
                price {
                  amount
                  currencyCode
                }
                compareAtPrice {
                  amount
                  currencyCode
                }
                image {
                  url
                  altText
                }
                selectedOptions {
                  name
                  value
                }
              }
            }
          }
        }
      }
    }
  }
`;

const CREATE_CART_MUTATION = `
  mutation cartCreate($input: CartInput!) {
    cartCreate(input: $input) {
      cart {
        id
        checkoutUrl
      }
      userErrors {
        field
        message
      }
    }
  }
`;

/**
 * Fetch all active products from Shopify
 */
export const getShopifyProducts = async (limit = 50) => {
  try {
    const data = await storefrontFetch(GET_PRODUCTS_QUERY, { first: limit });
    if (!data || !data.products) return [];
    
    // Map Shopify products to a simplified format for the application
    return data.products.edges.map(({ node: product }) => {
      const images = product.images.edges.map(({ node: img }) => img.url);
      const variants = product.variants.edges.map(({ node: variant }) => ({
        id: variant.id,
        title: variant.title,
        price: variant.price.amount,
        currencyCode: variant.price.currencyCode,
        available: variant.availableForSale,
        compareAtPrice: variant.compareAtPrice?.amount || null,
        image: variant.image?.url || null,
        selectedOptions: variant.selectedOptions.reduce((acc, opt) => {
          acc[opt.name.toLowerCase()] = opt.value;
          return acc;
        }, {}),
      }));

      // Extract options
      const options = product.options.map(opt => ({
        name: opt.name,
        values: opt.values
      }));

      // Color and size swatches
      const colors = product.options.find(o => o.name.toLowerCase() === 'color')?.values || [];
      const sizes = product.options.find(o => o.name.toLowerCase() === 'size')?.values || [];

      return {
        shopifyId: product.id, // Store original GID
        id: product.handle,    // Use URL handle as identifier (routing)
        name: product.title,
        handle: product.handle,
        description: product.description,
        price: `£${parseFloat(product.priceRange.minVariantPrice.amount).toFixed(2)}`,
        rawPrice: parseFloat(product.priceRange.minVariantPrice.amount),
        currencyCode: product.priceRange.minVariantPrice.currencyCode,
        src: images[0] || '',
        gallery: images,
        options,
        variants,
        colors,
        sizes,
        available: product.availableForSale,
      };
    });
  } catch (error) {
    console.error('Failed to fetch Shopify products:', error);
    throw error;
  }
};

/**
 * Create a checkout session and return checkout webUrl
 * @param {Array<{variantId: string, quantity: number}>} lineItems 
 */
export const createShopifyCheckout = async (lineItems) => {
  try {
    const variables = {
      input: {
        lines: lineItems.map(item => ({
          merchandiseId: item.variantId,
          quantity: item.quantity
        }))
      }
    };
    
    console.log('[Shopify Checkout] selected variant IDs:', lineItems.map(item => item.variantId));
    console.log('[Shopify Checkout] mutation request variables:', JSON.stringify(variables, null, 2));
    
    const data = await storefrontFetch(CREATE_CART_MUTATION, variables);
    console.log('[Shopify Checkout] mutation response data:', JSON.stringify(data, null, 2));
    
    const cartResult = data.cartCreate;
    
    if (cartResult.userErrors && cartResult.userErrors.length > 0) {
      throw new Error(cartResult.userErrors[0].message);
    }
    
    let checkoutUrl = cartResult.cart.checkoutUrl;
    console.log('[Shopify Checkout] original returned checkoutUrl:', checkoutUrl);

    // Force checkoutUrl to Shopify domain to bypass custom storefront DNS redirection
    if (checkoutUrl && domain) {
      try {
        const urlObj = new URL(checkoutUrl);
        urlObj.hostname = domain;
        checkoutUrl = urlObj.toString();
        console.log('[Shopify Checkout] transformed checkoutUrl (force Shopify domain):', checkoutUrl);
      } catch (e) {
        console.error('[Shopify Checkout] Failed to parse/transform checkout URL:', e);
      }
    }
    
    return {
      webUrl: checkoutUrl
    };
  } catch (error) {
    console.error('Failed to create Shopify checkout:', error);
    throw error;
  }
};
