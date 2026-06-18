import { useEffect, useMemo, useState } from 'react'
import { Link, NavLink, Route, Routes, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import logoImg from './assets/new/logo.jpeg'
import { getShopifyProducts, createShopifyCheckout } from './services/shopify'

const navItems = [
  { label: 'SHOP', to: '/#hero' },
  { label: 'SHOP', to: '/lingerie-sets' },
  { label: 'SHOP', to: '/#collections' },
  { label: 'NEW ARRIVAL', to: '/full-body-set' },
  { label: 'ABOUT US', to: '/about-us' },
  { label: 'CONTACT', to: '/contact-us' },
  { label: 'RETURN & REFUND POLICY', to: '/return-and-refund-policy' },
]

const dummyDescriptions = [
  'Designed with soft stretch lace and breathable lining for confidence and all-day comfort.',
  'A modern silhouette with delicate details, balancing elegance and everyday wearability.',
  'Boutique-inspired styling with premium finishing and smooth fit under any outfit.',
  'Crafted for flattering support using lightweight fabrics and adjustable comfort features.',
]

const lingerieCircleProductNames = [
  'Bow Babydoll',
  'Midnight Bloom',
  'Luxe Set 41',
  'Ivory Whispher Set',
  'Bride Bloom Set',
  'Desire Fringe Set',
  'Love Spell Set',
  'Sculpt Bodysuit',
]
const lingerieCircleExtraProductIds = [22, 27, 1312, 1313, 1314]
const midnightBloomVariantIds = [19, 22, 27]
const bowLuxeVariantIds = [40, 41]
const bowLuxeSwatchColors = ['#000000', '#dc2626']

const bodysuitsCircleProductNames = ['Whisper', 'Midnight Muse', 'Whispher Bodyysuit', 'Love Affair Dress']
const bodysuitsCircleExtraProductIds = [13, 43, 1004, 55]
const sleepwearCircleProductNames = ['Blush Crush']
const sleepwearCircleExtraProductIds = []
const sleepwearFringeVariantIds = [48, 49]
const sleepwearFringeSwatchColors = ['#000000', '#dc2626']
const leatherCircleProductIds = [1206, 1207, 1209]
const wrapSetCircleProductNames = ['Wrap set']
const fullBodySetCircleProductIds = [1008, 1009, 1021]
const midnightBloomSwatchColors = ['#000000', '#16a34a', '#dc2626']

const groupedProductSets = [
  [3, 4, 5, 6, 7, 8, 31, 32, 33, 34, 35, 53],
  [9, 10, 11, 12],
  [13, 14, 15, 16, 17, 18],
  [19, 20, 21],
  [22, 23, 24, 25, 26],
  [27, 28, 29, 30],
  [36, 37, 38, 39],
  [40, 42],
  [43, 44, 45, 46],
  [49, 50, 51, 52],
]

const productOverrides = {
  1: { name: 'Love Affair Dress', price: '£34.99' },
  2: { name: 'Whisper', price: '£24.99', description: '' },
  3: { name: 'Ivory Whispher Set', price: '£34.99' },
  9: { name: 'Midnight Muse', price: '£29.99' },
  13: { name: 'Obsidian Lace Bodysuit', price: '£39.99' },
  19: { name: 'Midnight Bloom', price: '£29.99' },
  22: { name: 'Midnight Bloom', price: '£29.99' },
  27: { name: 'Midnight Bloom', price: '£29.99' },
  36: { name: 'Blush Crush', price: '£29.99' },
  40: { name: 'Bow Babydoll', price: '£34.99' },
  43: { name: 'Whispher Bodysuit', price: '£34.99' },
  47: { name: 'Loce Affair dress', price: '£34.99', description: '' },
  48: { name: 'French Kiss Maid Set', price: '£34.99' },
  49: { name: 'French Kiss Maid Set', price: '£34.99' },
  55: { name: 'Ethereal Sheer Slip dress', price: '£34.99', description: '' },
  1001: { name: 'Bride Bloom Set', price: '£39.99' },
  1002: { name: 'Bride Bloom Set', price: '£39.99' },
  1003: { name: 'Love Spell Set', price: '£19.99' },
  1005: { name: 'Love Lace Set', price: '£19.99' },
  1006: { name: 'Sculpt Bodysuit', price: '£24.99' },
  1007: { name: 'Whispher Bodysuit', price: '£34.99' },
  1008: { name: 'Love Story Set', price: '£64.99' },
  1009: { name: 'Love Story Set', price: '£64.99' },
  1021: { name: 'Love Story Set', price: '£64.99' },
}



const applyProductOverride = (product) => {
  const override = productOverrides[product.id]
  return override ? { ...product, ...override } : product
}

const brandWordmarkStyle = {
  fontFamily: '"Playfair Display", "Times New Roman", Georgia, serif',
  fontWeight: 700,
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
}

const ShopifyCheckoutRedirect = ({ bagItems, productsForLookup }) => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let active = true
    const initiateCheckout = async () => {
      try {
        setLoading(true)
        setError(null)
        
        let lineItems = []

        // Check if checking out a single product (Buy Now)
        const checkoutProductId = searchParams.get('product')
        const checkoutColor = searchParams.get('color')
        const checkoutSize = searchParams.get('size')
        
        if (checkoutProductId) {
          // Find product by id (handle or shopifyId or id)
          const product = productsForLookup.find(
            (p) => String(p.id) === String(checkoutProductId) || String(p.shopifyId) === String(checkoutProductId)
          )
          if (!product) {
            throw new Error('Product not found.')
          }
          
          // Find the matching Shopify variant ID based on selected size/color
          let variantId = product.variants?.[0]?.id
          if (product.variants && product.variants.length > 0) {
            const matchedVariant = product.variants.find((v) => {
              const matchesColor = !checkoutColor || v.selectedOptions.color?.toLowerCase() === checkoutColor.toLowerCase()
              const matchesSize = !checkoutSize || v.selectedOptions.size?.toLowerCase() === checkoutSize.toLowerCase()
              return matchesColor && matchesSize
            })
            if (matchedVariant) {
              variantId = matchedVariant.id
            }
          }
          
          if (!variantId) {
            // Fallback for demo products: use first available Shopify product variant to allow checkout redirect testing
            const fallbackProduct = productsForLookup.find(p => p.shopifyId && p.variants && p.variants.length > 0);
            if (fallbackProduct && fallbackProduct.variants && fallbackProduct.variants.length > 0) {
              variantId = fallbackProduct.variants[0].id;
              console.log(`Demo product checkout fallback: using variant ${variantId} from ${fallbackProduct.name}`);
            }
          }
          
          if (!variantId) {
            // If it's a static demo product without Shopify variants, we can show a clear message
            if (!product.shopifyId) {
              throw new Error(`"${product.name}" is a demo product. To enable checkout, please ensure it is added and published on your Shopify Store.`);
            }
            throw new Error('Selected product variant is not available.');
          }

          lineItems = [{ variantId, quantity: 1 }]
        } else {
          // Checkout all items in the bag
          if (bagItems.length === 0) {
            throw new Error('Your bag is empty.')
          }
          
          lineItems = bagItems.map((item) => {
            let variantId = item.shopifyVariantId || item.variants?.[0]?.id
            if (item.variants && item.variants.length > 1) {
              const matchedVariant = item.variants.find((v) => {
                const matchesColor = !item.selectedColor || v.selectedOptions.color?.toLowerCase() === item.selectedColor.toLowerCase()
                const matchesSize = !item.selectedSize || v.selectedOptions.size?.toLowerCase() === item.selectedSize.toLowerCase()
                return matchesColor && matchesSize
              })
              if (matchedVariant) {
                variantId = matchedVariant.id
              }
            }
            
            if (!variantId) {
              const fallbackProduct = productsForLookup.find(p => p.shopifyId && p.variants && p.variants.length > 0);
              if (fallbackProduct && fallbackProduct.variants && fallbackProduct.variants.length > 0) {
                variantId = fallbackProduct.variants[0].id;
              }
            }

            return {
              variantId,
              quantity: item.quantity || 1
            }
          }).filter((item) => item.variantId)
          
          if (lineItems.length === 0) {
            throw new Error('No valid product variants found in your bag.');
          }
        }

        console.log('[ShopifyCheckoutRedirect] Line items:', JSON.stringify(lineItems, null, 2))
        const checkout = await createShopifyCheckout(lineItems)
        console.log('[ShopifyCheckoutRedirect] Shopify webUrl returned:', checkout.webUrl)
        
        if (active) {
          console.log('[ShopifyCheckoutRedirect] Redirecting browser immediately to:', checkout.webUrl)
          window.location.href = checkout.webUrl
        }
      } catch (err) {
        console.error('[ShopifyCheckoutRedirect] Checkout error:', err)
        if (active) {
          setError(err.message || 'An error occurred while creating checkout.')
          setLoading(false)
        }
      }
    }

    initiateCheckout()
    return () => {
      active = false
    }
  }, [bagItems, productsForLookup, searchParams])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-4 min-h-[60vh] text-center bg-[#fff0f7]">
        {/* Loading Spinner */}
        <div className="w-16 h-16 border-4 border-[#7d2f56]/30 border-t-[#7d2f56] rounded-full animate-spin"></div>
        <h2 className="mt-8 text-2xl font-semibold text-[#3f1f34]">Preparing Your Secure Checkout</h2>
        <p className="mt-2 text-gray-500 max-w-md">We are redirecting you to Shopify to complete your purchase safely. Please do not close this window.</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 min-h-[60vh] text-center bg-[#fff0f7]">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-6">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-2xl font-semibold text-[#3f1f34]">Checkout Failed</h2>
        <p className="mt-2 text-red-600 max-w-md bg-red-50 p-4 rounded-xl ring-1 ring-red-200">{error}</p>
        <button 
          onClick={() => navigate(-1)} 
          className="mt-8 rounded-full bg-[#7d2f56] px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white hover:bg-[#632242] transition-transform hover:scale-105"
        >
          Go Back
        </button>
      </div>
    )
  }

  return null
}

function App() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const imageModules = import.meta.glob('./assets/images/*.jpeg', { eager: true, import: 'default' })
  const newImageModules = import.meta.glob('./assets/new/*.jpeg', { eager: true, import: 'default' })
  const newVideoModules = {
    ...import.meta.glob('./assets/new/*.MP4', { eager: true, import: 'default' }),
    ...import.meta.glob('./assets/new/*.MOV', { eager: true, import: 'default' }),
    ...import.meta.glob('./assets/new/*.mp4', { eager: true, import: 'default' }),
    ...import.meta.glob('./assets/new/*.mov', { eager: true, import: 'default' }),
  }
  const videoModules = {
    ...import.meta.glob('./assets/images/*.MP4', { eager: true, import: 'default' }),
    ...import.meta.glob('./assets/images/*.MOV', { eager: true, import: 'default' }),
    ...import.meta.glob('./assets/images/*.mp4', { eager: true, import: 'default' }),
    ...import.meta.glob('./assets/images/*.mov', { eager: true, import: 'default' }),
  }
  const [bagItems, setBagItems] = useState([])
  const [notice, setNotice] = useState('')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [customerData, setCustomerData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    notes: '',
    cardNumber: '',
    cardExpiry: '',
    cardCvc: '',
    cardName: '',
  })
  const [paymentMethod, setPaymentMethod] = useState('card')

  const [shopifyProducts, setShopifyProducts] = useState([])
  const [isProductsLoading, setIsProductsLoading] = useState(true)
  const [productsError, setProductsError] = useState(null)

  useEffect(() => {
    let isMounted = true
    const loadShopifyData = async () => {
      try {
        setIsProductsLoading(true)
        const items = await getShopifyProducts()
        if (isMounted) {
          setShopifyProducts(items)
          setProductsError(null)
        }
      } catch (err) {
        console.error('Failed to fetch Shopify products on load:', err)
        if (isMounted) {
          setProductsError('Failed to load products from Shopify.')
        }
      } finally {
        if (isMounted) {
          setIsProductsLoading(false)
        }
      }
    }
    loadShopifyData()
    return () => {
      isMounted = false
    }
  }, [])

  const products = useMemo(() => {
    const rawProducts = Object.entries(imageModules)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([path, src], index) => ({
        id: index + 1,
        fileName: path.split('/').pop()?.replace('.jpeg', '').toLowerCase() ?? '',
        src,
        gallery: [src],
        name: `Luxe Set ${String(index + 1).padStart(2, '0')}`,
        price: `£${34 + ((index * 3) % 19)}.00`,
        description: dummyDescriptions[index % dummyDescriptions.length],
      }))

    const groupedProducts = groupedProductSets
      .map((setIds) => {
        const members = setIds
          .map((setId) => rawProducts.find((item) => item.id === setId))
          .filter(Boolean)

        if (members.length < 2) {
          return null
        }

        const sortedIds = members.map((item) => item.id).sort((a, b) => a - b)

        return {
          ...members[0],
          id: sortedIds[0],
          name: `Luxe Set ${sortedIds[0]}`,
          src: members[0].src,
          gallery: members.map((item) => item.src),
          description: `Combined product gallery for Luxe Sets ${sortedIds.join(', ')}. Scroll through ${members.length} preview images for full product angles.`,
        }
      })
      .filter(Boolean)

    const groupedIds = new Set(groupedProductSets.flat())
    const standaloneProducts = rawProducts.filter((item) => !groupedIds.has(item.id))

    const combinedProducts = [...standaloneProducts, ...groupedProducts].sort((a, b) => a.id - b.id)

    const imageR = rawProducts.find((item) => item.fileName === 'r')
    const imageQ = rawProducts.find((item) => item.fileName === 'q')
    const imageT = rawProducts.find((item) => item.fileName === 't')
    const imageS = rawProducts.find((item) => item.fileName === 's')
    const newImages = Object.entries(newImageModules)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([path, src]) => ({
        fileName: path.split('/').pop()?.replace('.jpeg', '').toLowerCase() ?? '',
        src,
      }))
    const findNewImageByNames = (...possibleNames) => {
      const normalizedTargets = possibleNames.map((name) => name.toLowerCase().replace(/\s+/g, ''))
      return newImages.find((item) => normalizedTargets.includes(item.fileName.replace(/\s+/g, '')))
    }

    const productsWithSet54 =
      imageR && imageQ && imageT && imageS
        ? combinedProducts.map((product) =>
          product.id === 54
            ? {
              ...product,
              src: imageR.src,
              gallery: [imageR.src, imageQ.src, imageT.src, imageS.src],
              description: 'Combined product gallery for Luxe Set 54. Scroll through 4 preview images for full product angles.',
            }
            : product,
        )
        : combinedProducts

    return productsWithSet54
      .map((product) => {
        if (product.id === 9) {
          const blackSequence = product.gallery
          const whiteSequence = [
            findNewImageByNames('a1(31)', 'a1 (31)')?.src,
            findNewImageByNames('a1(32)', 'a1 (32)')?.src,
            findNewImageByNames('a1(33)', 'a1 (33)')?.src,
            findNewImageByNames('a1(35)', 'a1 (35)')?.src,
          ].filter(Boolean)
          const redSequence = [
            findNewImageByNames('a1(40)', 'a1 (40)')?.src,
            findNewImageByNames('a1(34)', 'a1 (34)')?.src,
            findNewImageByNames('a1(38)', 'a1 (38)')?.src,
            findNewImageByNames('a1(39)', 'a1 (39)')?.src,
          ].filter(Boolean)

          return applyProductOverride({
            ...product,
            colorOptions: [
              {
                id: 901,
                label: 'Black',
                image: blackSequence[0],
                gallery: blackSequence,
                swatchColor: '#000000',
              },
              ...(whiteSequence.length > 0
                ? [
                  {
                    id: 902,
                    label: 'White',
                    image: whiteSequence[0],
                    gallery: whiteSequence,
                    swatchColor: '#ffffff',
                    soldOut: true,
                  },
                ]
                : []),
              ...(redSequence.length > 0
                ? [
                  {
                    id: 903,
                    label: 'Red',
                    image: redSequence[0],
                    gallery: redSequence,
                    swatchColor: '#dc2626',
                    soldOut: true,
                  },
                ]
                : []),
            ],
          })
        }

        if (product.id === 13) {
          const blackSequence = product.gallery
          const redSequence = [
            findNewImageByNames('a1(72)', 'a1 (72)')?.src,
            findNewImageByNames('a1(70)', 'a1 (70)')?.src,
            findNewImageByNames('a1(68)', 'a1 (68)')?.src,
            findNewImageByNames('a1(71)', 'a1 (71)')?.src,
          ].filter(Boolean)
          const whiteSequence = [
            findNewImageByNames('a1(61)', 'a1 (61)')?.src,
            findNewImageByNames('a1(62)', 'a1 (62)')?.src,
            findNewImageByNames('a1(63)', 'a1 (63)')?.src,
            findNewImageByNames('a1(64)', 'a1 (64)')?.src,
            findNewImageByNames('a1(65)', 'a1 (65)')?.src,
            findNewImageByNames('a1(66)', 'a1 (66)')?.src,
            findNewImageByNames('a1(67)', 'a1 (67)')?.src,
            findNewImageByNames('a1(69)', 'a1 (69)')?.src,
          ].filter(Boolean)

          return applyProductOverride({
            ...product,
            colorOptions: [
              {
                id: 1301,
                label: 'Black',
                image: blackSequence[0],
                gallery: blackSequence,
                swatchColor: '#000000',
              },
              ...(redSequence.length > 0
                ? [
                  {
                    id: 1302,
                    label: 'Red',
                    image: redSequence[0],
                    gallery: redSequence,
                    swatchColor: '#dc2626',
                  },
                ]
                : []),
              ...(whiteSequence.length > 0
                ? [
                  {
                    id: 1303,
                    label: 'White',
                    image: whiteSequence[0],
                    gallery: whiteSequence,
                    swatchColor: '#ffffff',
                    soldOut: true,
                  },
                ]
                : []),
            ],
          })
        }

        if (product.id === 19) {
          const pic2 = findNewImageByNames('a1(29)', 'a1 (29)')
          const newGallery = [...product.gallery]
          if (pic2) newGallery.push(pic2.src)

          return applyProductOverride({
            ...product,
            gallery: newGallery,
          })
        }

        if (product.id === 47) {
          const l1 = findNewImageByNames('l(1)', 'l (1)')
          const l2 = findNewImageByNames('l(2)', 'l (2)')
          const newGallery = []
          if (l2) newGallery.push(l2.src)
          if (l1) newGallery.push(l1.src)
          newGallery.push(product.src)

          return applyProductOverride({
            ...product,
            src: l2 ? l2.src : product.src,
            gallery: newGallery,
            soldOut: true,
          })
        }

        if (product.id === 49 && product.gallery.length >= 2) {
          const displayImage = product.gallery[product.gallery.length - 1]
          const reorderedGallery = [...product.gallery.slice(1), product.gallery[0]]

          return applyProductOverride({
            ...product,
            src: displayImage,
            gallery: reorderedGallery,
          })
        }

        if (product.id === 55 && imageQ && imageT && imageS) {
          const redSequence = [product.src, imageQ.src, imageT.src, imageS.src]
          const blackSequence = [
            findNewImageByNames('a1(16)', 'a1 (16)')?.src,
            findNewImageByNames('a1(17)', 'a1 (17)')?.src,
            findNewImageByNames('a1(15)', 'a1 (15)')?.src,
            findNewImageByNames('a1(18)', 'a1 (18)')?.src,
          ].filter(Boolean)
          const whiteSequence = [
            findNewImageByNames('a1(23)', 'a1 (23)')?.src,
            findNewImageByNames('a1(20)', 'a1 (20)')?.src,
            findNewImageByNames('a1(21)', 'a1 (21)')?.src,
            findNewImageByNames('a1(19)', 'a1 (19)')?.src,
            findNewImageByNames('a1(25)', 'a1 (25)')?.src,
          ].filter(Boolean)
          const brownSequence = [
            findNewImageByNames('a3(1)', 'a3 (1)')?.src,
            findNewImageByNames('a3(2)', 'a3 (2)')?.src,
            findNewImageByNames('a3(3)', 'a3 (3)')?.src,
            findNewImageByNames('a3(4)', 'a3 (4)')?.src,
          ].filter(Boolean)

          return applyProductOverride({
            ...product,
            gallery: redSequence,
            colorOptions: [
              {
                id: 5501,
                label: 'Red',
                image: redSequence[0],
                gallery: redSequence,
                swatchColor: '#dc2626',
              },
              ...(blackSequence.length > 0
                ? [
                  {
                    id: 5502,
                    label: 'Black',
                    image: blackSequence[0],
                    gallery: blackSequence,
                    swatchColor: '#000000',
                    soldOut: true,
                  },
                ]
                : []),
              ...(whiteSequence.length > 0
                ? [
                  {
                    id: 5503,
                    label: 'White',
                    image: whiteSequence[0],
                    gallery: whiteSequence,
                    swatchColor: '#ffffff',
                    soldOut: true,
                  },
                ]
                : []),
              ...(brownSequence.length > 0
                ? [
                  {
                    id: 5504,
                    label: 'Brown',
                    image: brownSequence[0],
                    gallery: brownSequence,
                    swatchColor: '#8b4513',
                  },
                ]
                : []),
            ],
          })
        }

        if (product.id === 2) {
          const hi1 = findNewImageByNames('hi(1)', 'hi (1)')
          const hi2 = findNewImageByNames('hi(2)', 'hi (2)')
          const hi3 = findNewImageByNames('hi(3)', 'hi (3)')
          const hiImages = [hi1, hi2, hi3].filter(Boolean).map(img => img.src)
          if (hiImages.length > 0) {
            return applyProductOverride({
              ...product,
              gallery: [...product.gallery, ...hiImages],
            })
          }
        }

        return applyProductOverride(product)
      })
      .filter((product) => ![1, 56].includes(product.id))
  }, [imageModules, newImageModules])

  const heroImage = products[0]?.src
  const featureImage = products[1]?.src
  const extraLingerieProducts = useMemo(() => {
    const newImages = Object.entries(newImageModules)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([path, src]) => ({
        fileName: path.split('/').pop()?.replace('.jpeg', '').toLowerCase() ?? '',
        src,
      }))
    const findNewImageByNames = (...possibleNames) => {
      const normalizedTargets = possibleNames.map((name) => name.toLowerCase().replace(/\s+/g, ''))
      return newImages.find((item) => normalizedTargets.includes(item.fileName.replace(/\s+/g, '')))
    }

    const imageA = newImages.find((item) => item.fileName === 'a')
    const imageB = newImages.find((item) => item.fileName === 'b')
    const imageC = newImages.find((item) => item.fileName === 'c')
    const imageD = newImages.find((item) => item.fileName === 'd')
    const imageN = newImages.find((item) => item.fileName === 'n')
    const imageP = newImages.find((item) => item.fileName === 'p')
    const imageJ = newImages.find((item) => item.fileName === 'j')
    const imageF = newImages.find((item) => item.fileName === 'f')
    const imageO = newImages.find((item) => item.fileName === 'o')
    const imageK = newImages.find((item) => item.fileName === 'k')
    const imageL = newImages.find((item) => item.fileName === 'l')
    const imageM = newImages.find((item) => item.fileName === 'm')
    const imageOO = newImages.find((item) => item.fileName === 'oo')
    const imageLL = newImages.find((item) => item.fileName === 'll')
    const imageAA = newImages.find((item) => item.fileName === 'aa')
    const imageBB = newImages.find((item) => item.fileName === 'bb')
    const imageM11 = newImages.find((item) => item.fileName === 'm1 (1)')
    const imageM12 = newImages.find((item) => item.fileName === 'm1 (2)')
    const imageM13 = newImages.find((item) => item.fileName === 'm1 (3)')
    const imageM14 = newImages.find((item) => item.fileName === 'm1 (4)')
    const imageM21 = newImages.find((item) => item.fileName === 'm2 (1)')
    const imageM22 = newImages.find((item) => item.fileName === 'm2 (2)')
    const imageM23 = newImages.find((item) => item.fileName === 'm2 (3)')
    const imageM24 = newImages.find((item) => item.fileName === 'm2 (4)')
    const imageM25 = newImages.find((item) => item.fileName === 'm2 (5)')
    const imageM3 = newImages.find((item) => item.fileName === 'm3')
    const imageM4 = newImages.find((item) => item.fileName === 'm4')
    const imageM51 = findNewImageByNames('m5 (1)', 'm5(1)')
    const imageM52 = findNewImageByNames('m5 (2)', 'm5(2)')
    const imageM53 = findNewImageByNames('m5 (3)', 'm5(3)')
    const imageM54 = findNewImageByNames('m5 (4)', 'm5(4)')
    const imageM55 = findNewImageByNames('m5 (5)', 'm5(5)')
    const imageM56 = findNewImageByNames('m5 (6)', 'm5(6)')
    const imageM57 = findNewImageByNames('m5 (7)', 'm5(7)')
    const imageM58 = findNewImageByNames('m5 (8)', 'm5(8)')
    const imageM59 = findNewImageByNames('m5 (9)', 'm5(9)')
    const imageM510 = findNewImageByNames('m5 (10)', 'm5(10)')
    const imageM511 = findNewImageByNames('m5 (11)', 'm5(11)')
    const imageA21 = findNewImageByNames('a2 (1)', 'a2(1)')
    const imageA22 = findNewImageByNames('a2 (2)', 'a2(2)')

    const customProducts = []

    if (imageA && imageB) {
      const whiteGallery = [imageA.src, imageB.src]
      const pinkGallery = (imageA21 && imageA22) ? [imageA21.src, imageA22.src] : []

      customProducts.push({
        id: 1001,
        src: imageA.src,
        gallery: whiteGallery,
        name: 'Luxe Set 1001',
        price: '£39.00',
        description: '',
        colorOptions: [
          {
            id: 100101,
            label: 'White',
            image: whiteGallery[0],
            gallery: whiteGallery,
            swatchColor: '#ffffff',
            soldOut: true,
          },
          ...(pinkGallery.length > 0 ? [{
            id: 100102,
            label: 'Pink',
            image: pinkGallery[0],
            gallery: pinkGallery,
            swatchColor: '#ffb6c1',
          }] : [])
        ]
      })
    }

    if (imageC && imageD) {
      customProducts.push({
        id: 1002,
        src: imageC.src,
        gallery: [imageC.src, imageD.src],
        name: 'Luxe Set 1002',
        price: '£41.00',
        description: 'Combined product gallery for Luxe Set 1002. Scroll through 2 preview images for full product angles.',
      })
    }

    if (imageN && imageP && imageJ) {
      customProducts.push({
        id: 1003,
        src: imageN.src,
        gallery: [imageN.src, imageP.src, imageJ.src],
        name: 'Luxe Set 1003',
        price: '£43.00',
        description: 'Combined product gallery for Luxe Set 1003. Scroll through 3 preview images for full product angles.',
      })
    }

    if (imageF) {
      const blackGallery = [imageF.src]
      const redGallery = [
        findNewImageByNames('a3(5)', 'a3 (5)')?.src,
        findNewImageByNames('a3(6)', 'a3 (6)')?.src,
        findNewImageByNames('a3(7)', 'a3 (7)')?.src,
      ].filter(Boolean)

      customProducts.push({
        id: 1004,
        src: imageF.src,
        gallery: blackGallery,
        name: 'Obsidian Harness Set',
        price: '£39.99',
        description: '',
        colorOptions: [
          {
            id: 100401,
            label: 'Black',
            image: blackGallery[0],
            gallery: blackGallery,
            swatchColor: '#000000',
            soldOut: true,
          },
          ...(redGallery.length > 0 ? [{
            id: 100402,
            label: 'Red',
            image: redGallery[0],
            gallery: redGallery,
            swatchColor: '#dc2626',
            soldOut: true,
          }] : [])
        ]
      })
    }

    if (imageO && imageK && imageL && imageM) {
      customProducts.push({
        id: 1005,
        src: imageO.src,
        gallery: [imageO.src, imageK.src, imageL.src, imageM.src],
        name: 'Luxe Set 1005',
        price: '£45.00',
        description: 'Combined product gallery for Luxe Set 1005. Scroll through 4 preview images for full product angles.',
      })
    }

    const imageA2 = findNewImageByNames('a2')
    const imageA23 = findNewImageByNames('a2 (3)', 'a2(3)')
    const imageA24 = findNewImageByNames('a2 (4)', 'a2(4)')
    const imageA25 = findNewImageByNames('a2 (5)', 'a2(5)')
    const imageA26 = findNewImageByNames('a2 (6)', 'a2(6)')
    const imageA27 = findNewImageByNames('a2 (7)', 'a2(7)')
    const imageA28 = findNewImageByNames('a2 (8)', 'a2(8)')

    const blackSculpt = imageA2 ? [imageA2.src] : []
    const redSculpt = (imageA23 && imageA24 && imageA25 && imageA26) ? [imageA23.src, imageA24.src, imageA25.src, imageA26.src] : []
    const whiteSculpt = (imageA27 && imageA28) ? [imageA27.src, imageA28.src] : []
    const defaultSculptSequence = blackSculpt.length > 0 ? blackSculpt : (redSculpt.length > 0 ? redSculpt : (whiteSculpt.length > 0 ? whiteSculpt : (imageOO ? [imageOO.src] : [])))

    if (defaultSculptSequence.length > 0) {
      customProducts.push({
        id: 1006,
        src: defaultSculptSequence[0],
        gallery: defaultSculptSequence,
        name: 'Sculpt Bodysuit',
        price: '£24.99',
        description: '',
        colorOptions: [
          ...(blackSculpt.length > 0 ? [{
            id: 100601,
            label: 'Black',
            image: blackSculpt[0],
            gallery: blackSculpt,
            swatchColor: '#000000',
          }] : []),
          ...(redSculpt.length > 0 ? [{
            id: 100602,
            label: 'Red',
            image: redSculpt[0],
            gallery: redSculpt,
            swatchColor: '#dc2626',
            soldOut: true,
          }] : []),
          ...(whiteSculpt.length > 0 ? [{
            id: 100603,
            label: 'White',
            image: whiteSculpt[0],
            gallery: whiteSculpt,
            swatchColor: '#ffffff',
            soldOut: true,
          }] : [])
        ]
      })
    }

    if (imageLL) {
      customProducts.push({
        id: 1007,
        src: imageLL.src,
        gallery: [imageLL.src],
        name: 'Luxe Set 1007',
        price: '£38.00',
        description: 'Single product preview for Luxe Set 1007.',
      })
    }

    if (imageM11 && imageM12 && imageM13 && imageM14) {
      customProducts.push({
        id: 1101,
        src: imageM14.src,
        gallery: [imageM14.src, imageM13.src, imageM11.src, imageM12.src],
        name: 'Desire Fringe Set',
        price: '£34.99',
        description: 'Combined product gallery for Desire Fringe Set. Scroll through 4 preview images for full product angles.',
      })
    }

    const imageA1_41 = findNewImageByNames('a1(41)', 'a1 (41)')
    const imageA1_42 = findNewImageByNames('a1(42)', 'a1 (42)')
    const imageA1_43 = findNewImageByNames('a1(43)', 'a1 (43)')
    const imageA1_44 = findNewImageByNames('a1(44)', 'a1 (44)')
    const imageA1_45 = findNewImageByNames('a1(45)', 'a1 (45)')
    const imageA1_46 = findNewImageByNames('a1(46)', 'a1 (46)')
    const imageA1_47 = findNewImageByNames('a1(47)', 'a1 (47)')
    const imageA1_48 = findNewImageByNames('a1(48)', 'a1 (48)')
    const imageA1_49 = findNewImageByNames('a1(49)', 'a1 (49)')
    const imageA1_50 = findNewImageByNames('a1(50)', 'a1 (50)')
    const imageA1_51 = findNewImageByNames('a1(51)', 'a1 (51)')
    const imageA1_52 = findNewImageByNames('a1(52)', 'a1 (52)')
    const imageA1_53 = findNewImageByNames('a1(53)', 'a1 (53)')

    const pinkGallery1312 = [imageA1_46, imageA1_42, imageA1_50].filter(Boolean).map(img => img.src)
    const redGallery1312 = [imageA1_44, imageA1_45, imageA1_51, imageA1_52].filter(Boolean).map(img => img.src)
    const greenGallery1312 = [imageA1_53, imageA1_49].filter(Boolean).map(img => img.src)
    const lightBlueGallery1312 = [imageA1_41, imageA1_47, imageA1_48].filter(Boolean).map(img => img.src)
    const defaultGallery1312 = lightBlueGallery1312.length > 0 ? lightBlueGallery1312 : (pinkGallery1312.length > 0 ? pinkGallery1312 : (redGallery1312.length > 0 ? redGallery1312 : (greenGallery1312.length > 0 ? greenGallery1312 : [])))

    if (defaultGallery1312.length > 0) {
      customProducts.push({
        id: 1312,
        src: defaultGallery1312[0],
        gallery: defaultGallery1312,
        name: 'Love Lace Set',
        price: '£19.99',
        description: '',
        colorOptions: [
          ...(lightBlueGallery1312.length > 0 ? [{
            id: 131201,
            label: 'Light Blue',
            image: lightBlueGallery1312[0],
            gallery: lightBlueGallery1312,
            swatchColor: '#add8e6',
            soldOut: true,
          }] : []),
          ...(pinkGallery1312.length > 0 ? [{
            id: 131202,
            label: 'Pink',
            image: pinkGallery1312[0],
            gallery: pinkGallery1312,
            swatchColor: '#ffb6c1',
            soldOut: true,
          }] : []),
          ...(redGallery1312.length > 0 ? [{
            id: 131203,
            label: 'Red',
            image: redGallery1312[0],
            gallery: redGallery1312,
            swatchColor: '#dc2626',
          }] : []),
          ...(greenGallery1312.length > 0 ? [{
            id: 131204,
            label: 'Black',
            image: greenGallery1312[0],
            gallery: greenGallery1312,
            swatchColor: '#000000',
            soldOut: true,
          }] : [])
        ]
      })
    }

    const imageA1_54 = findNewImageByNames('a1(54)', 'a1 (54)')
    const imageA1_55 = findNewImageByNames('a1(55)', 'a1 (55)')
    const imageA1_56 = findNewImageByNames('a1(56)', 'a1 (56)')
    const imageA1_57 = findNewImageByNames('a1(57)', 'a1 (57)')
    const imageA1_58 = findNewImageByNames('a1(58)', 'a1 (58)')
    const imageA1_59 = findNewImageByNames('a1(59)', 'a1 (59)')
    const imageA1_60 = findNewImageByNames('a1(60)', 'a1 (60)')
    const imageA1_22 = findNewImageByNames('a1(22)', 'a1 (22)')
    const imageA1_24 = findNewImageByNames('a1(24)', 'a1 (24)')
    const imageA1_26 = findNewImageByNames('a1(26)', 'a1 (26)')
    const imageA1_28 = findNewImageByNames('a1(28)', 'a1 (28)')

    const redGallery1313 = [imageA1_56, imageA1_55, imageA1_54, imageA1_57, imageA1_58, imageA1_59, imageA1_60].filter(Boolean).map(img => img.src)
    const blackGallery1313 = [imageA1_22, imageA1_24, imageA1_26, imageA1_28].filter(Boolean).map(img => img.src)
    const defaultGallery1313 = redGallery1313.length > 0 ? redGallery1313 : (blackGallery1313.length > 0 ? blackGallery1313 : [])

    if (defaultGallery1313.length > 0) {
      customProducts.push({
        id: 1313,
        src: defaultGallery1313[0],
        gallery: defaultGallery1313,
        name: 'The Showpiece Basque',
        price: '£34.99',
        description: '',
        colorOptions: [
          ...(redGallery1313.length > 0 ? [{
            id: 131301,
            label: 'Red',
            image: redGallery1313[0],
            gallery: redGallery1313,
            swatchColor: '#dc2626',
            soldOut: true,
          }] : []),
          ...(blackGallery1313.length > 0 ? [{
            id: 131302,
            label: 'Black',
            image: blackGallery1313[0],
            gallery: blackGallery1313,
            swatchColor: '#000000',
          }] : [])
        ]
      })
    }

    if (imageM21 && imageM22 && imageM23 && imageM24 && imageM25) {
      const blackGallery = [imageM21.src, imageM22.src, imageM23.src];
      const pinkGallery = (imageM3 && imageM4) ? [imageM3.src, imageM4.src] : [];
      const redGallery = (imageM51 && imageM52 && imageM53 && imageM54) ? [imageM51.src, imageM52.src, imageM54.src] : [];

      customProducts.push({
        id: 1102,
        src: imageM21.src,
        gallery: blackGallery,
        name: 'Wrap set',
        price: '£30.00',
        description: '',
        colorOptions: [
          {
            id: 110201,
            label: 'Black',
            image: blackGallery[0],
            gallery: blackGallery,
            swatchColor: '#000000',
          },
          ...(pinkGallery.length > 0 ? [{
            id: 110202,
            label: 'Pink',
            image: pinkGallery[0],
            gallery: pinkGallery,
            swatchColor: '#ffb6c1',
          }] : []),
          ...(redGallery.length > 0 ? [{
            id: 110203,
            label: 'Red',
            image: redGallery[0],
            gallery: redGallery,
            swatchColor: '#dc2626',
          }] : [])
        ]
      })
    }

    if (imageAA && imageBB) {
      customProducts.push({
        id: 1314,
        src: imageAA.src,
        gallery: [imageAA.src, imageBB.src],
        name: 'Midnight Desire',
        price: '£24.99',
        description: '',
        soldOut: true,
      })
    }

    const leatherSingles = [imageM55, imageM56, imageM57, imageM58, imageM59, imageM510, imageM511]
    leatherSingles.forEach((image, index) => {
      if (!image) {
        return
      }

      const currentId = 1205 + index

      if (currentId === 1209) {
        const blackImageSrc = imageM58 ? imageM58.src : null;
        const colorOptions = [
          {
            id: 120901,
            label: 'Red',
            image: image.src,
            gallery: [image.src],
            swatchColor: '#dc2626',
          }
        ];

        if (blackImageSrc) {
          colorOptions.push({
            id: 120902,
            label: 'Black',
            image: blackImageSrc,
            gallery: [blackImageSrc],
            swatchColor: '#000000',
          });
        }

        customProducts.push({
          id: currentId,
          src: image.src,
          gallery: [image.src],
          name: 'Women Harness',
          price: '£34.99',
          description: '',
          colorOptions
        })
      } else {
        customProducts.push({
          id: currentId,
          src: image.src,
          gallery: [image.src],
          name: 'Women Harness',
          price: '£34.99',
          description: 'Single product preview for Women Harness.',
        })
      }
    })

    return customProducts
      .map(applyProductOverride)
      .filter((product) => ![1205, 1208, 1210, 1211].includes(product.id))
  }, [newImageModules])
  const extraNightwearProducts = useMemo(() => {
    const newImages = Object.entries(newImageModules)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([path, src]) => ({
        fileName: path.split('/').pop()?.replace('.jpeg', '').toLowerCase() ?? '',
        src,
      }))

    const imageGG = newImages.find((item) => item.fileName === 'gg')
    const imageJJ = newImages.find((item) => item.fileName === 'jj')
    const image00 = newImages.find((item) => item.fileName === '00')
    const image01 = newImages.find((item) => item.fileName === '01')
    const image02 = newImages.find((item) => item.fileName === '02')
    const image03 = newImages.find((item) => item.fileName === '03')
    const image04 = newImages.find((item) => item.fileName === '04')
    const image06 = newImages.find((item) => item.fileName === '06')
    const image07 = newImages.find((item) => item.fileName === '07')
    const image08 = newImages.find((item) => item.fileName === '08')
    const image09 = newImages.find((item) => item.fileName === '09')
    const image10 = newImages.find((item) => item.fileName === '10')
    const image11 = newImages.find((item) => item.fileName === '11')
    const image12 = newImages.find((item) => item.fileName === '12')
    const image13 = newImages.find((item) => item.fileName === '13')
    const image14 = newImages.find((item) => item.fileName === '14')
    const image15 = newImages.find((item) => item.fileName === '15')
    const image16 = newImages.find((item) => item.fileName === '16')
    const image17 = newImages.find((item) => item.fileName === '17')
    const image18 = newImages.find((item) => item.fileName === '18')
    const customNightwear = []

    if (imageGG) {
      const sequenceFor1008 = image00 && image01 && image02 && image03 && image04
        ? [imageGG.src, image00.src, image01.src, image02.src, image03.src, image04.src]
        : [imageGG.src]

      customNightwear.push({
        id: 1008,
        src: sequenceFor1008[0],
        gallery: sequenceFor1008,
        name: 'Luxe Set 1008',
        price: '£40.00',
        description:
          sequenceFor1008.length > 1
            ? 'Combined product gallery for Luxe Set 1008. Scroll through 6 preview images for full product angles.'
            : 'Single product preview for Luxe Set 1008.',
      })
    }

    if (imageJJ) {
      const sequenceFor1009 = image06 && image07 && image08 && image09 && image10 && image11
        ? [imageJJ.src, image06.src, image07.src, image08.src, image09.src, image10.src, image11.src]
        : [imageJJ.src]

      customNightwear.push({
        id: 1009,
        src: sequenceFor1009[0],
        gallery: sequenceFor1009,
        name: 'Luxe Set 1009',
        price: '£40.00',
        description:
          sequenceFor1009.length > 1
            ? 'Combined product gallery for Luxe Set 1009. Scroll through 7 preview images for full product angles.'
            : 'Single product preview for Luxe Set 1009.',
      })
    }

    if (image00) {
      customNightwear.push({
        id: 1010,
        src: image00.src,
        gallery: [image00.src],
        name: 'Luxe Set 1010',
        price: '£40.00',
        description: 'Single product preview for Luxe Set 1010.',
      })
    }

    if (image01) {
      customNightwear.push({
        id: 1011,
        src: image01.src,
        gallery: [image01.src],
        name: 'Luxe Set 1011',
        price: '£40.00',
        description: 'Single product preview for Luxe Set 1011.',
      })
    }

    if (image02) {
      customNightwear.push({
        id: 1012,
        src: image02.src,
        gallery: [image02.src],
        name: 'Luxe Set 1012',
        price: '£40.00',
        description: 'Single product preview for Luxe Set 1012.',
      })
    }

    if (image03) {
      customNightwear.push({
        id: 1013,
        src: image03.src,
        gallery: [image03.src],
        name: 'Luxe Set 1013',
        price: '£40.00',
        description: 'Single product preview for Luxe Set 1013.',
      })
    }

    if (image04) {
      customNightwear.push({
        id: 1014,
        src: image04.src,
        gallery: [image04.src],
        name: 'Luxe Set 1014',
        price: '£40.00',
        description: 'Single product preview for Luxe Set 1014.',
      })
    }

    if (image06) {
      customNightwear.push({
        id: 1015,
        src: image06.src,
        gallery: [image06.src],
        name: 'Luxe Set 1015',
        price: '£40.00',
        description: 'Single product preview for Luxe Set 1015.',
      })
    }

    if (image07) {
      customNightwear.push({
        id: 1016,
        src: image07.src,
        gallery: [image07.src],
        name: 'Luxe Set 1016',
        price: '£40.00',
        description: 'Single product preview for Luxe Set 1016.',
      })
    }

    if (image08) {
      customNightwear.push({
        id: 1017,
        src: image08.src,
        gallery: [image08.src],
        name: 'Luxe Set 1017',
        price: '£40.00',
        description: 'Single product preview for Luxe Set 1017.',
      })
    }

    if (image09) {
      customNightwear.push({
        id: 1018,
        src: image09.src,
        gallery: [image09.src],
        name: 'Luxe Set 1018',
        price: '£40.00',
        description: 'Single product preview for Luxe Set 1018.',
      })
    }

    if (image10) {
      customNightwear.push({
        id: 1019,
        src: image10.src,
        gallery: [image10.src],
        name: 'Luxe Set 1019',
        price: '£40.00',
        description: 'Single product preview for Luxe Set 1019.',
      })
    }

    if (image11) {
      customNightwear.push({
        id: 1020,
        src: image11.src,
        gallery: [image11.src],
        name: 'Luxe Set 1020',
        price: '£40.00',
        description: 'Single product preview for Luxe Set 1020.',
      })
    }

    if (image12) {
      const sequenceFor1021 = image13 && image14 && image15 && image16 && image17 && image18
        ? [image12.src, image13.src, image14.src, image15.src, image16.src, image17.src, image18.src]
        : [image12.src]

      customNightwear.push({
        id: 1021,
        src: sequenceFor1021[0],
        gallery: sequenceFor1021,
        name: 'Luxe Set 1021',
        price: '£40.00',
        description:
          sequenceFor1021.length > 1
            ? 'Combined product gallery for Luxe Set 1021. Scroll through 7 preview images for full product angles.'
            : 'Single product preview for Luxe Set 1021.',
      })
    }

    if (image13) {
      customNightwear.push({
        id: 1022,
        src: image13.src,
        gallery: [image13.src],
        name: 'Luxe Set 1022',
        price: '£40.00',
        description: 'Single product preview for Luxe Set 1022.',
      })
    }

    if (image14) {
      customNightwear.push({
        id: 1023,
        src: image14.src,
        gallery: [image14.src],
        name: 'Luxe Set 1023',
        price: '£40.00',
        description: 'Single product preview for Luxe Set 1023.',
      })
    }

    if (image15) {
      customNightwear.push({
        id: 1024,
        src: image15.src,
        gallery: [image15.src],
        name: 'Luxe Set 1024',
        price: '£40.00',
        description: 'Single product preview for Luxe Set 1024.',
      })
    }

    if (image16) {
      customNightwear.push({
        id: 1025,
        src: image16.src,
        gallery: [image16.src],
        name: 'Luxe Set 1025',
        price: '£40.00',
        description: 'Single product preview for Luxe Set 1025.',
      })
    }

    if (image17) {
      customNightwear.push({
        id: 1026,
        src: image17.src,
        gallery: [image17.src],
        name: 'Luxe Set 1026',
        price: '£40.00',
        description: 'Single product preview for Luxe Set 1026.',
      })
    }

    if (image18) {
      customNightwear.push({
        id: 1027,
        src: image18.src,
        gallery: [image18.src],
        name: 'Luxe Set 1027',
        price: '£40.00',
        description: 'Single product preview for Luxe Set 1027.',
      })
    }

    return customNightwear.map(applyProductOverride)
  }, [newImageModules])

  const customLoveAffairDress = useMemo(() => {
    const newImages = Object.entries(newImageModules)
      .map(([path, src]) => ({
        fileName: path.split('/').pop()?.replace('.jpeg', '').toLowerCase() ?? '',
        src,
      }))
    const findNewImageByNames = (...possibleNames) => {
      const normalizedTargets = possibleNames.map((name) => name.toLowerCase().replace(/\s+/g, ''))
      return newImages.find((item) => normalizedTargets.includes(item.fileName.replace(/\s+/g, '')))
    }

    const laBlack = [
      findNewImageByNames('a1(1)', 'a1 (1)')?.src,
      findNewImageByNames('a1(3)', 'a1 (3)')?.src,
      findNewImageByNames('a1(5)', 'a1 (5)')?.src,
      findNewImageByNames('a1(79)', 'a1 (79)')?.src,
    ].filter(Boolean)

    const laRed = [
      findNewImageByNames('a1(11)', 'a1 (11)')?.src,
      findNewImageByNames('a1(12)', 'a1 (12)')?.src,
      findNewImageByNames('a1(13)', 'a1 (13)')?.src,
      findNewImageByNames('a1(14)', 'a1 (14)')?.src,
      findNewImageByNames('a1(9)', 'a1 (9)')?.src,
    ].filter(Boolean)

    const laWhite = [
      findNewImageByNames('a1(2)', 'a1 (2)')?.src,
      findNewImageByNames('a1(4)', 'a1 (4)')?.src,
      findNewImageByNames('a1(6)', 'a1 (6)')?.src,
      findNewImageByNames('a1(8)', 'a1 (8)')?.src,
      findNewImageByNames('a1(10)', 'a1 (10)')?.src,
      findNewImageByNames('a1(7)', 'a1 (7)')?.src,
    ].filter(Boolean)

    const defaultSequence = laRed.length ? laRed : (laWhite.length ? laWhite : (laBlack.length ? laBlack : []))

    return {
      id: 1310,
      src: defaultSequence[0] || '',
      gallery: defaultSequence,
      name: 'Love Affair Dress',
      price: '£34.99',
      colorOptions: [
        ...(laRed.length > 0 ? [{ id: 13101, label: 'Red', image: laRed[0], gallery: laRed, swatchColor: '#dc2626', soldOut: true }] : []),
        ...(laWhite.length > 0 ? [{ id: 13102, label: 'White', image: laWhite[0], gallery: laWhite, swatchColor: '#ffffff', soldOut: true }] : []),
        ...(laBlack.length > 0 ? [{ id: 13103, label: 'Black', image: laBlack[0], gallery: laBlack, swatchColor: '#000000' }] : []),
      ],
      description: '',
    }
  }, [newImageModules])

  const staticProductsForLookup = useMemo(() => {
    return [...products, ...extraLingerieProducts, ...extraNightwearProducts, customLoveAffairDress]
  }, [products, extraLingerieProducts, extraNightwearProducts, customLoveAffairDress])

  const productsForLookup = useMemo(() => {
    if (!shopifyProducts || shopifyProducts.length === 0) {
      return staticProductsForLookup
    }

    const normalize = (name) => {
      return name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')
        .replace('whispher', 'whisper')
    }

    const isMatch = (name1, name2) => {
      const n1 = normalize(name1)
      const n2 = normalize(name2)
      return n1 === n2 || n1.includes(n2) || n2.includes(n1)
    }

    // Merge static products with Shopify products
    const merged = staticProductsForLookup.map((staticProd) => {
      const matchedShopify = shopifyProducts.find(
        (sp) => isMatch(sp.name, staticProd.name) || isMatch(sp.handle, staticProd.name)
      )

      if (matchedShopify) {
        return {
          ...staticProd,
          shopifyId: matchedShopify.shopifyId,
          variants: matchedShopify.variants,
          colors: matchedShopify.colors,
          sizes: matchedShopify.sizes,
          available: matchedShopify.available,
          price: matchedShopify.price || staticProd.price,
          rawPrice: matchedShopify.rawPrice || staticProd.rawPrice,
          currencyCode: matchedShopify.currencyCode || staticProd.currencyCode,
        }
      }

      return staticProd
    })

    // Add unmatched Shopify products
    shopifyProducts.forEach((sp) => {
      const alreadyMerged = merged.some(
        (m) =>
          m.shopifyId === sp.shopifyId ||
          isMatch(m.name, sp.name)
      )
      if (!alreadyMerged) {
        merged.push(sp)
      }
    })

    return merged
  }, [shopifyProducts, staticProductsForLookup])

  const lingerieCircleProducts = useMemo(() => {
    const selectedByNameProducts = lingerieCircleProductNames
      .map((targetName) => productsForLookup.find((product) => product.name === targetName))
      .filter(Boolean)
    const selectedByIdProducts = [...lingerieCircleExtraProductIds, 47]
      .map((targetId) => productsForLookup.find((product) => product.id === targetId))
      .filter(Boolean)
    const selectedProducts = [...selectedByNameProducts, ...selectedByIdProducts]
    const midnightBloomVariants = midnightBloomVariantIds
      .map((variantId) => productsForLookup.find((product) => product.id === variantId))
      .filter(Boolean)

    const midnightBloomCombinedProduct =
      midnightBloomVariants.length > 0
        ? {
          ...midnightBloomVariants[0],
          id: 19027,
          src: midnightBloomVariants[0].src,
          gallery: midnightBloomVariants.map((item) => item.src),
          name: 'Midnight Bloom',
          price: midnightBloomVariants[0].price,
          colorOptions: midnightBloomVariants.map((item, index) => ({
            id: item.id,
            label: `Color ${index + 1}`,
            image: item.src,
            gallery: item.gallery,
            swatchColor: midnightBloomSwatchColors[index] ?? '#d8bfd0',
            ...(index === 1 ? { soldOut: true } : {}),
          })),
          description: '',
        }
        : null
    const bowLuxeVariants = bowLuxeVariantIds
      .map((variantId) => productsForLookup.find((product) => product.id === variantId))
      .filter(Boolean)
    const bowLuxeCombinedProduct =
      bowLuxeVariants.length > 0
        ? {
          ...bowLuxeVariants[0],
          id: 40041,
          src: bowLuxeVariants[0].src,
          gallery: bowLuxeVariants[0].gallery,
          name: 'Bow Babydoll',
          price: bowLuxeVariants[0].price,
          colorOptions: bowLuxeVariants.map((item, index) => ({
            id: item.id,
            label: index === 0 ? 'Black' : 'Red',
            image: item.src,
            gallery: item.gallery,
            swatchColor: bowLuxeSwatchColors[index] ?? '#d8bfd0',
            ...(index === 1 ? { soldOut: true } : {}),
          })),
          description: '',
        }
        : null

    const sleepwearFringeVariants = sleepwearFringeVariantIds
      .map((variantId) => productsForLookup.find((product) => product.id === variantId))
      .filter(Boolean)
    const sleepwearFringeCombinedProduct = (() => {
      if (sleepwearFringeVariants.length === 0) return null

      const newImages = Object.entries(newImageModules)
        .map(([path, src]) => ({
          fileName: path.split('/').pop()?.replace('.jpeg', '').toLowerCase() ?? '',
          src,
        }))
      const findNewImageByNames = (...possibleNames) => {
        const normalizedTargets = possibleNames.map((name) => name.toLowerCase().replace(/\s+/g, ''))
        return newImages.find((item) => normalizedTargets.includes(item.fileName.replace(/\s+/g, '')))
      }

      const blackKImages = [
        findNewImageByNames('k(1)', 'k (1)'),
        findNewImageByNames('k(2)', 'k (2)'),
        findNewImageByNames('k(3)', 'k (3)'),
        findNewImageByNames('k(4)', 'k (4)'),
        findNewImageByNames('k(5)', 'k (5)'),
      ].map(img => img?.src).filter(Boolean)

      const defaultSrc = blackKImages.length > 0 ? blackKImages[0] : sleepwearFringeVariants[0].src
      const defaultGallery = blackKImages.length > 0 ? blackKImages : (sleepwearFringeVariants[0].gallery ?? [sleepwearFringeVariants[0].src])

      return {
        ...sleepwearFringeVariants[0],
        id: 48049,
        src: defaultSrc,
        gallery: defaultGallery,
        name: sleepwearFringeVariants[0].name,
        price: sleepwearFringeVariants[0].price,
        description: '',
        colorOptions: sleepwearFringeVariants.map((item, index) => {
          const label = index === 0 ? 'Black' : 'Red'

          let gallerySequence
          if (label === 'Black') {
            gallerySequence = defaultGallery
          } else {
            const fallbackSequence = sleepwearFringeVariants
              .flatMap((variant) => variant.gallery ?? [variant.src])
              .filter(Boolean)
            const variantPrimarySequence = item.gallery?.length ? item.gallery : [item.src]
            const mergedSequence = [...variantPrimarySequence, ...fallbackSequence]
            gallerySequence = [...new Set(mergedSequence)]
          }

          return {
            id: item.id,
            label,
            image: gallerySequence[0] ?? item.src,
            gallery: gallerySequence,
            swatchColor: sleepwearFringeSwatchColors[index] ?? '#d8bfd0',
          }
        }),
      }
    })()

    const filteredProducts = selectedProducts.filter(
      (product) => !midnightBloomVariantIds.includes(product.id) && !bowLuxeVariantIds.includes(product.id) && !sleepwearFringeVariantIds.includes(product.id),
    )
    const productsWithCombinedVariants = [
      ...filteredProducts,
      ...(midnightBloomCombinedProduct ? [midnightBloomCombinedProduct] : []),
      ...(bowLuxeCombinedProduct ? [bowLuxeCombinedProduct] : []),
      ...(sleepwearFringeCombinedProduct ? [sleepwearFringeCombinedProduct] : []),
    ]

    const uniqueProducts = productsWithCombinedVariants.filter(
      (product, index, array) => array.findIndex((item) => item.id === product.id) === index,
    )

    return uniqueProducts
  }, [productsForLookup, newImageModules])
  const lingerieCircleProductIds = useMemo(
    () => new Set([
      ...lingerieCircleProducts.map((product) => product.id),
      ...midnightBloomVariantIds,
      ...bowLuxeVariantIds,
      ...sleepwearFringeVariantIds,
      47
    ]),
    [lingerieCircleProducts],
  )
  const bodysuitsCircleProducts = useMemo(() => {
    const selectedByNameProducts = bodysuitsCircleProductNames
      .map((targetName) => productsForLookup.find((product) => product.name === targetName))
      .filter(Boolean)
    const selectedByIdProducts = bodysuitsCircleExtraProductIds
      .map((targetId) => productsForLookup.find((product) => product.id === targetId))
      .filter(Boolean)
    const selectedProducts = [...selectedByNameProducts, ...selectedByIdProducts]

    const uniqueProducts = selectedProducts.filter(
      (product, index, array) => array.findIndex((item) => item.id === product.id) === index,
    )

    return uniqueProducts
  }, [productsForLookup])
  const bodysuitsCircleProductIds = useMemo(
    () => new Set(bodysuitsCircleProducts.map((product) => product.id)),
    [bodysuitsCircleProducts],
  )
  const sleepwearCircleProducts = useMemo(() => {
    const selectedByNameProducts = sleepwearCircleProductNames
      .map((targetName) => productsForLookup.find((product) => product.name === targetName))
      .filter(Boolean)
    const selectedByIdProducts = sleepwearCircleExtraProductIds
      .map((targetId) => productsForLookup.find((product) => product.id === targetId))
      .filter(Boolean)
    const selectedProducts = [...selectedByNameProducts, ...selectedByIdProducts]

    const uniqueProducts = selectedProducts.filter(
      (product, index, array) => array.findIndex((item) => item.id === product.id) === index,
    )

    return uniqueProducts
  }, [productsForLookup])
  const leatherCircleProducts = useMemo(() => {
    const selectedProducts = leatherCircleProductIds
      .map((targetId) => productsForLookup.find((product) => product.id === targetId))
      .filter(Boolean)

    const uniqueProducts = selectedProducts.filter(
      (product, index, array) => array.findIndex((item) => item.id === product.id) === index,
    )

    return uniqueProducts
  }, [productsForLookup])
  const wrapSetCircleProducts = useMemo(() => {
    const selectedProducts = productsForLookup.filter((product) => wrapSetCircleProductNames.includes(product.name))
    const uniqueProducts = selectedProducts.filter(
      (product, index, array) => array.findIndex((item) => item.id === product.id) === index,
    )

    return uniqueProducts
  }, [productsForLookup])
  const fullBodySetCircleProducts = useMemo(() => {
    const selectedProducts = fullBodySetCircleProductIds
      .map((targetId) => productsForLookup.find((product) => product.id === targetId))
      .filter(Boolean)
    const uniqueProducts = selectedProducts.filter(
      (product, index, array) => array.findIndex((item) => item.id === product.id) === index,
    )

    return uniqueProducts
  }, [productsForLookup])
  const heroCircleExcludedProductIds = useMemo(() => {
    const mergedIds = new Set([
      ...lingerieCircleProductIds,
      ...bodysuitsCircleProductIds,
      ...leatherCircleProducts.map((item) => item.id),
      ...fullBodySetCircleProducts.map((item) => item.id),
      ...sleepwearFringeVariantIds,
    ])
    return mergedIds
  }, [lingerieCircleProductIds, bodysuitsCircleProductIds, leatherCircleProducts, fullBodySetCircleProducts])
  const staticBodysuits = bodysuitsCircleProducts
  const staticSleepwear = sleepwearCircleProducts
  const staticLeather = leatherCircleProducts
  const staticWrapSet = wrapSetCircleProducts
  const staticFullBodySet = fullBodySetCircleProducts
  const staticLingerieSets = lingerieCircleProducts
  const staticFeaturedProducts = staticLingerieSets.slice(0, Math.min(6, staticLingerieSets.length))
  const staticNewArrivals = [...extraLingerieProducts, ...products.slice(0, Math.min(16, products.length))]
    .filter((item) => ![1, 54].includes(item.id))
    .filter((item) => !heroCircleExcludedProductIds.has(item.id))
    .slice(0, Math.min(12, products.length))
  const staticNightwear = useMemo(() => {
    const baseNightwear = [...extraNightwearProducts, ...products.filter((_, index) => index % 2 === 0)]
      .filter((item) => item.id !== 57)
      .filter((item) => !heroCircleExcludedProductIds.has(item.id))

    // Move set 1009 after set 1015 so it appears in the second row behind 1015.
    const itemToMoveIndex = baseNightwear.findIndex((item) => item.id === 1009)
    const targetIndex = baseNightwear.findIndex((item) => item.id === 1015)

    if (itemToMoveIndex === -1 || targetIndex === -1) {
      return baseNightwear
    }

    const reorderedNightwear = [...baseNightwear]
    const [itemToMove] = reorderedNightwear.splice(itemToMoveIndex, 1)
    const insertAfterIndex = reorderedNightwear.findIndex((item) => item.id === 1015)
    reorderedNightwear.splice(insertAfterIndex + 1, 0, itemToMove)

    return reorderedNightwear
  }, [extraNightwearProducts, products, heroCircleExcludedProductIds])
  const staticAccessories = products
    .filter((_, index) => index % 3 === 0)
    .filter((item) => item.id !== 57)
    .filter((item) => !heroCircleExcludedProductIds.has(item.id))

  const categorized = useMemo(() => {
    const cats = {
      lingerieSets: [...staticLingerieSets],
      bodysuits: [...staticBodysuits],
      sleepwear: [...staticSleepwear],
      leather: [...staticLeather],
      wrapSet: [...staticWrapSet],
      fullBodySet: [...staticFullBodySet],
      nightwear: [...staticNightwear],
      accessories: [...staticAccessories],
      newArrivals: [...staticNewArrivals],
      featuredProducts: [...staticFeaturedProducts],
    }

    if (shopifyProducts && shopifyProducts.length > 0) {
      const normalize = (name) => name.toLowerCase().replace(/[^a-z0-9]/g, '').replace('whispher', 'whisper')
      const isMatch = (name1, name2) => {
        const n1 = normalize(name1)
        const n2 = normalize(name2)
        return n1 === n2 || n1.includes(n2) || n2.includes(n1)
      }

      // Find Shopify products that are not matched to any static product
      const unmatchedShopify = shopifyProducts.filter(
        (sp) => !staticProductsForLookup.some((staticProd) => isMatch(sp.name, staticProd.name))
      )

      unmatchedShopify.forEach((product) => {
        const title = product.name.toLowerCase()
        if (title.includes('bodysuit') || title.includes('whisper')) {
          cats.bodysuits.push(product)
        } else if (title.includes('set') && (title.includes('lingerie') || title.includes('lace') || title.includes('luxe'))) {
          cats.lingerieSets.push(product)
        } else if (title.includes('sleep') || title.includes('crush') || title.includes('slip') || title.includes('night')) {
          cats.sleepwear.push(product)
        } else if (title.includes('leather')) {
          cats.leather.push(product)
        } else if (title.includes('wrap')) {
          cats.wrapSet.push(product)
        } else if (title.includes('full body') || title.includes('story')) {
          cats.fullBodySet.push(product)
        } else if (title.includes('accessory') || title.includes('accessories')) {
          cats.accessories.push(product)
        } else {
          cats.lingerieSets.push(product)
        }
        cats.newArrivals.push(product)
      })
    }

    return cats
  }, [
    shopifyProducts,
    staticProductsForLookup,
    staticLingerieSets,
    staticBodysuits,
    staticSleepwear,
    staticLeather,
    staticWrapSet,
    staticFullBodySet,
    staticNightwear,
    staticAccessories,
    staticNewArrivals,
    staticFeaturedProducts
  ])

  const bodysuits = categorized.bodysuits
  const sleepwear = categorized.sleepwear
  const leather = categorized.leather
  const wrapSet = categorized.wrapSet
  const fullBodySet = categorized.fullBodySet
  const lingerieSets = categorized.lingerieSets
  const featuredProducts = categorized.featuredProducts
  const newArrivals = categorized.newArrivals
  const nightwear = categorized.nightwear
  const accessories = categorized.accessories

  const heroCategoryCards = [
    { label: 'Bodysuits', productId: shopifyProducts.length > 0 ? (bodysuits[0]?.id || '') : 2, sourcePath: '/bodysuits', to: '/bodysuits' },
    { label: 'Lingerie', productId: shopifyProducts.length > 0 ? (lingerieSets[0]?.id || '') : 1007, sourcePath: '/lingerie-sets', to: '/lingerie-sets' },
    { label: 'Leather', productId: shopifyProducts.length > 0 ? (leather[0]?.id || '') : 1206, sourcePath: '/leather', to: '/leather' },
    { label: 'Sleepwear', productId: shopifyProducts.length > 0 ? (sleepwear[0]?.id || '') : 36, sourcePath: '/sleepwear', to: '/sleepwear' },
    { label: 'Wrap set', productId: shopifyProducts.length > 0 ? (wrapSet[0]?.id || '') : 1102, sourcePath: '/wrap-set', to: '/wrap-set' },
    { label: 'Full body set', productId: shopifyProducts.length > 0 ? (fullBodySet[0]?.id || '') : 1008, sourcePath: '/full-body-set', to: '/full-body-set' },
  ].map((item) => ({
    ...item,
    image: productsForLookup.find((product) => String(product.id) === String(item.productId))?.src ?? heroImage,
  }))

  const checkoutProductId = searchParams.get('product')
  const checkoutColor = searchParams.get('color')
  const checkoutSize = searchParams.get('size')
  const rawCheckoutProduct = productsForLookup.find((item) => String(item.id) === String(checkoutProductId) || String(item.shopifyId) === String(checkoutProductId)) ?? bagItems[0] ?? null
  const checkoutProduct = useMemo(() => {
    if (!rawCheckoutProduct) return null
    return {
      ...rawCheckoutProduct,
      selectedColor: checkoutColor ?? rawCheckoutProduct.selectedColor,
      selectedSize: checkoutSize ?? rawCheckoutProduct.selectedSize,
    }
  }, [rawCheckoutProduct, checkoutColor, checkoutSize])
  const extraGalleryImageForSet40 = useMemo(() => {
    const newImages = Object.entries(newImageModules)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([path, src]) => ({
        fileName: path.split('/').pop()?.replace('.jpeg', '').toLowerCase() ?? '',
        src,
      }))

    return newImages.find((item) => item.fileName === 'e')?.src ?? null
  }, [newImageModules])
  const landingVideos = useMemo(
    () => {
      const preferredOrder = ['v1', 'v2', 'v3', 'v4', 'v5']
      const videoEntries = Object.entries(videoModules)

      const orderedVideos = preferredOrder
        .map((name) =>
          videoEntries.find(([path]) => {
            const normalizedPath = path.toLowerCase().replace(/\\/g, '/')
            return normalizedPath.includes(`/${name}.`)
          }),
        )
        .filter(Boolean)
        .map(([, src]) => src)

      return orderedVideos
    },
    [videoModules],
  )
  const heroSectionVideo = useMemo(() => {
    const videoEntries = Object.entries(newVideoModules)
    const preferredNames = ['video1', 'v3']

    for (const preferredName of preferredNames) {
      const preferredVideo = videoEntries.find(([path]) => {
        const normalizedPath = path.toLowerCase().replace(/\\/g, '/')
        return normalizedPath.includes(`/${preferredName}.`)
      })

      if (preferredVideo) {
        return preferredVideo[1]
      }
    }

    return videoEntries[0]?.[1] ?? null
  }, [newVideoModules])

  const addToBag = (product) => {
    setBagItems((prev) => [...prev, product])
    setNotice(`${product.name} added to bag.`)
  }

  const openCheckout = (product) => {
    const sizeParam = product.selectedSize ? `&size=${encodeURIComponent(product.selectedSize)}` : ''
    const colorParam = product.selectedColor ? `&color=${encodeURIComponent(product.selectedColor)}` : ''
    navigate(`/checkout?product=${product.id}${colorParam}${sizeParam}`)
    setNotice('')
  }

  const formatCardNumber = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 16)
    return digits.replace(/(.{4})/g, '$1 ').trim()
  }

  const formatExpiry = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 4)
    if (digits.length >= 3) return digits.slice(0, 2) + '/' + digits.slice(2)
    return digits
  }

  const submitCustomerDetails = (event) => {
    event.preventDefault()
    if (paymentMethod === 'card') {
      const rawCard = customerData.cardNumber.replace(/\s/g, '')
      if (rawCard.length < 16) { setNotice('Please enter a valid 16-digit card number.'); return }
      const [month, year] = customerData.cardExpiry.split('/')
      if (!month || !year || parseInt(month) < 1 || parseInt(month) > 12) { setNotice('Please enter a valid expiry date (MM/YY).'); return }
      if (customerData.cardCvc.length < 3) { setNotice('Please enter a valid CVV.'); return }
      if (!customerData.cardName.trim()) { setNotice('Please enter the name on card.'); return }
    }
    navigate('/thank-you')
    setNotice(`Order confirmed for ${checkoutProduct ? checkoutProduct.name : 'selected item'}.`)
  }

  useEffect(() => {
    if (location.hash) {
      setTimeout(() => {
        const element = document.getElementById(location.hash.substring(1))
        if (element) {
          const navHeight = document.querySelector('header')?.offsetHeight ?? 60
          const top = element.getBoundingClientRect().top + window.scrollY - navHeight - 8
          window.scrollTo({ top, behavior: 'smooth' })
        }
      }, 150)
    } else {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    }
  }, [location.pathname, location.search, location.hash])

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : 'unset'
    return () => { document.body.style.overflow = 'unset' }
  }, [isMobileMenuOpen])

  const ProductImage = ({ src, alt, frameClassName = '', imageClassName = '' }) => (
    <div className={`product-image-frame flex items-center justify-center overflow-hidden bg-[#faf6f8] ${frameClassName}`}>
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        className={`product-image ${imageClassName}`}
      />
    </div>
  )

  const ProductGrid = ({ items, sourcePath }) => (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
      {items.map((product) => (
        <article key={product.id} className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-[#efdfe8]">
          <Link to={`/product/${product.id}`} state={{ from: sourcePath }} className="block">
            <ProductImage
              src={product.src}
              alt={product.name}
              frameClassName="aspect-[3/4] w-full sm:aspect-[4/5]"
            />
          </Link>
          <div className="p-2.5 sm:p-4">
            <p className="text-[11px] uppercase tracking-wider text-[#8f6580] sm:text-sm sm:normal-case sm:tracking-normal">Bestseller</p>
            <h3 className="mt-1 line-clamp-2 text-sm font-medium leading-snug text-[#45253a] sm:text-lg">{product.name}</h3>
            <div className="mt-3 flex flex-col gap-2 sm:mt-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-[#7d2f56]">{product.price}</p>
                <p className="text-xs font-medium text-[#a34977] line-through">
                  £{(parseFloat(product.price.replace(/[^0-9.]/g, '')) * 1.15).toFixed(2)}
                </p>
              </div>
              <div className="flex gap-1.5 sm:gap-2">
                <button type="button" onClick={() => addToBag(product)} className="rounded-full border border-[#d8bfd0] px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wide hover:bg-[#fff0f7] sm:px-3 sm:text-xs">
                  Add
                </button>
                <button type="button" onClick={() => openCheckout(product)} className="rounded-full bg-[#7d2f56] px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-white hover:bg-[#632242] sm:px-3 sm:text-xs">
                  Buy Now
                </button>
              </div>
            </div>
          </div>
        </article>
      ))}
    </div>
  )

  const CollectionPage = ({ title, items, sourcePath }) => (
    <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
      <Link to="/" className="inline-block">
        <h2 className="text-2xl font-semibold text-[#3f1f34] sm:text-3xl hover:text-[#9a3d6c] transition-colors">{title}</h2>
      </Link>
      <div className="mt-5 sm:mt-8">
        <ProductGrid items={items} sourcePath={sourcePath} />
      </div>
    </section>
  )
  const SearchPage = () => {
    const q = searchParams.get('q') ?? ''
    const results = useMemo(() => {
      if (!q.trim()) return []
      const term = q.toLowerCase()
      const allSearchable = [...productsForLookup, ...lingerieCircleProducts, ...sleepwearCircleProducts]
      const uniqueItems = allSearchable.filter((item, index, self) => self.findIndex(t => t.id === item.id) === index)
      return uniqueItems.filter(item =>
        item.name.toLowerCase().includes(term) ||
        (item.description && item.description.toLowerCase().includes(term))
      )
    }, [q, productsForLookup, lingerieCircleProducts, sleepwearCircleProducts])

    return (
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 min-h-[50vh]">
        <h2 className="mb-2 text-xl font-semibold uppercase tracking-wider text-[#111] sm:text-2xl">Search Results</h2>
        <p className="mb-6 break-words text-sm tracking-wide text-gray-500 sm:mb-8">Showing results for &ldquo;{q}&rdquo;</p>

        {results.length > 0 ? (
          <ProductGrid items={results} sourcePath={`/search?q=${encodeURIComponent(q)}`} />
        ) : (
          <div className="text-center py-20">
            <p className="text-lg text-gray-500">No products found matching your search.</p>
            <Link to="/lingerie-sets" className="inline-block mt-6 px-6 py-3 bg-black text-white text-sm font-semibold uppercase tracking-wider rounded transition-colors hover:bg-gray-800">Shop Collection</Link>
          </div>
        )}
      </section>
    )
  }

  const ProductDetailsPage = () => {
    const { id } = useParams()
    const product = productsForLookup.find(
      (item) => String(item.id) === String(id) || String(item.shopifyId) === String(id)
    )
    const [selectedPreview, setSelectedPreview] = useState(0)
    const [selectedColorIndex, setSelectedColorIndex] = useState(0)
    const [selectedSize, setSelectedSize] = useState('S')
    const showSetOfferNotice = product ? [1008, 1009, 1021].includes(product.id) : false
    const previousCollectionPath = location.state?.from
    const isAccessoryProduct = product ? accessories.some((item) => String(item.id) === String(product.id)) : false
    const isNightwearProduct = product ? nightwear.some((item) => String(item.id) === String(product.id)) : false
    const isNewArrivalProduct = product ? newArrivals.some((item) => String(item.id) === String(product.id)) : false
    const backPath = previousCollectionPath ?? (isAccessoryProduct ? '/accessories' : isNightwearProduct ? '/nightwear' : isNewArrivalProduct ? '/new-arrivals' : '/lingerie-sets')
    const backLabelMap = {
      '/accessories': 'Back to Accessories',
      '/nightwear': 'Back to Nightwear',
      '/sleepwear': 'Back to Sleepwear',
      '/leather': 'Back to Leather',
      '/wrap-set': 'Back to Wrap set',
      '/full-body-set': 'Back to Full body set',
      '/new-arrivals': 'Back to New Arrivals',
      '/lingerie-sets': 'Back to Lingerie Sets',
    }
    const backLabel = backLabelMap[backPath] ?? 'Back to Collection'
    const baseProductGallery =
      product?.id === 40 && extraGalleryImageForSet40
        ? [...product.gallery, extraGalleryImageForSet40]
        : product?.gallery ?? []

    const colorOptions = useMemo(() => {
      if (product?.colorOptions) return product.colorOptions;
      if (product?.colors && product.colors.length > 0) {
        return product.colors.map((color, index) => {
          const variant = product.variants.find(v => v.selectedOptions.color?.toLowerCase() === color.toLowerCase())
          return {
            id: `color-${index}`,
            label: color,
            image: variant?.image || product.src,
            gallery: product.gallery.filter(Boolean),
            swatchColor: color.toLowerCase() === 'black' ? '#000000' 
                       : color.toLowerCase() === 'white' ? '#ffffff'
                       : color.toLowerCase() === 'red' ? '#dc2626'
                       : color.toLowerCase() === 'pink' ? '#ffb6c1'
                       : color.toLowerCase() === 'brown' ? '#8b4513'
                       : '#d8bfd0',
            soldOut: variant ? !variant.available : false
          }
        })
      }
      return []
    }, [product])

    const availableSizes = useMemo(() => {
      if (product?.sizes && product.sizes.length > 0) {
        return product.sizes
      }
      return ['S', 'M', 'L', 'XL']
    }, [product])

    const selectedColorGallery =
      colorOptions.length > 0 && Array.isArray(colorOptions[selectedColorIndex]?.gallery)
        ? colorOptions[selectedColorIndex].gallery
        : null
    const productGallery = selectedColorGallery && selectedColorGallery.length > 0 ? selectedColorGallery : baseProductGallery
    const hasSinglePieceOptions = showSetOfferNotice && productGallery.length > 1
    const selectedSinglePiece = hasSinglePieceOptions && selectedPreview > 0
    const activeProductPrice = selectedSinglePiece ? '£19.99' : product?.price ?? ''
    const activeProductName =
      selectedSinglePiece && product
        ? `${product.name} - Single Piece ${selectedPreview}`
        : product?.name ?? ''
    const shouldHideAutoDescription =
      typeof product?.description === 'string' &&
      (product.description.startsWith('Combined product gallery for') ||
        product.description.startsWith('Single product preview for'))
    const visibleProductDescription = shouldHideAutoDescription ? '' : product?.description ?? ''

    const selectedColorLabel = colorOptions[selectedColorIndex]?.label
    const matchedVariant = useMemo(() => {
      if (!product || !product.variants) return null
      return product.variants.find(v => {
        const matchesColor = !selectedColorLabel || v.selectedOptions.color?.toLowerCase() === selectedColorLabel.toLowerCase()
        const matchesSize = !selectedSize || v.selectedOptions.size?.toLowerCase() === selectedSize.toLowerCase()
        return matchesColor && matchesSize
      }) || product.variants[0]
    }, [product, selectedColorLabel, selectedSize])

    useEffect(() => {
      setSelectedPreview(0)
      setSelectedColorIndex(0)
      if (product) {
        setSelectedSize(product.sizes?.[0] || 'S')
      }
    }, [id, product])

    if (isProductsLoading) {
      return (
        <section className="mx-auto max-w-3xl px-4 py-16 text-center">
          <div className="w-12 h-12 border-4 border-[#7d2f56]/30 border-t-[#7d2f56] rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading product details...</p>
        </section>
      )
    }

    if (!product) {
      return (
        <section className="mx-auto max-w-3xl px-4 py-10 text-center sm:px-6 sm:py-12">
          <h2 className="text-2xl font-semibold text-[#3f1f34] sm:text-3xl">Product not found</h2>
          <Link to={backPath} className="mt-6 inline-block rounded-full bg-[#7d2f56] px-5 py-2.5 text-sm font-semibold uppercase tracking-wide text-white">
            {backLabel}
          </Link>
        </section>
      )
    }

    const handleAddToBag = () => {
      addToBag({
        ...product,
        name: activeProductName,
        price: activeProductPrice,
        src: productGallery[0] || product.src,
        selectedColor: selectedColorLabel,
        selectedSize: selectedSize,
        shopifyVariantId: matchedVariant?.id
      })
    }

    const handleBuyNow = () => {
      const sizeParam = selectedSize ? `&size=${encodeURIComponent(selectedSize)}` : ''
      const colorParam = selectedColorLabel ? `&color=${encodeURIComponent(selectedColorLabel)}` : ''
      navigate(`/checkout?product=${product.id}${colorParam}${sizeParam}`)
    }

    return (
      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
        <Link to={backPath} className="mb-4 inline-block rounded-full border border-[#dcc5d1] px-3 py-2 text-[11px] font-semibold uppercase tracking-wider hover:bg-white sm:mb-6 sm:px-4 sm:text-xs">
          {backLabel}
        </Link>
        <article className="grid gap-5 rounded-3xl bg-white p-4 ring-1 ring-[#ead9e4] sm:gap-8 sm:p-6 md:grid-cols-2 md:p-8">
          <div className="min-w-0">
            <ProductImage
              src={productGallery[selectedPreview] ?? product.src}
              alt={product.name}
              frameClassName="product-image-frame--natural w-full rounded-2xl py-1 sm:py-2"
            />
            {productGallery.length > 1 ? (
              <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
                {productGallery.map((preview, index) => (
                  <button
                    key={preview}
                    type="button"
                    onClick={() => setSelectedPreview(index)}
                    className={`shrink-0 overflow-hidden rounded-lg border ${selectedPreview === index ? 'border-[#7d2f56]' : 'border-[#dcc5d1]'}`}
                  >
                    <ProductImage
                      src={preview}
                      alt={`${product.name} preview ${index + 1}`}
                      frameClassName="h-20 w-16 sm:h-24 sm:w-20"
                    />
                  </button>
                ))}
              </div>
            ) : null}
          </div>
          <div className="min-w-0">
            <h2 className="mt-3 break-words text-2xl font-semibold leading-tight text-[#3f1f34] sm:text-4xl">{activeProductName}</h2>
            <div className="mt-3 flex items-center gap-3 sm:mt-4">
              <p className="text-lg font-semibold text-[#7d2f56] sm:text-xl">{activeProductPrice}</p>
              {activeProductPrice && (
                <p className="text-sm font-medium text-[#a34977] line-through sm:text-base">
                  £{(parseFloat(activeProductPrice.replace(/[^0-9.]/g, '')) * 1.15).toFixed(2)}
                </p>
              )}
            </div>
            {visibleProductDescription ? (
              <p className="mt-4 text-sm leading-7 text-[#6e5362] sm:mt-5 sm:text-base">{visibleProductDescription}</p>
            ) : null}
            {colorOptions.length > 0 ? (
              <div className="mt-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#a34977]">Choose Color</p>
                <div className="flex flex-wrap gap-2">
                  {colorOptions.map((option, index) => (
                    <button
                      key={`color-option-${option.id}`}
                      type="button"
                      onClick={() => {
                        setSelectedColorIndex(index)
                        setSelectedPreview(0)
                      }}
                      aria-label={option.label}
                      className={`relative h-8 w-8 rounded-full border-2 ${selectedColorIndex === index ? 'border-[#7d2f56]' : 'border-[#d8bfd0]'}`}
                    >
                      <span
                        className="block h-full w-full rounded-full"
                        style={{ backgroundColor: option.swatchColor ?? '#d8bfd0' }}
                      />
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
            <div className="mt-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#a34977]">Choose Size</p>
              <div className="flex flex-wrap gap-2">
                {availableSizes.map((size) => (
                  <button
                    key={`size-option-${size}`}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    className={`h-10 w-12 rounded-lg border-2 flex items-center justify-center text-sm font-semibold transition ${selectedSize === size
                      ? 'border-[#7d2f56] bg-[#7d2f56] text-white'
                      : 'border-[#d8bfd0] text-[#7d2f56] hover:bg-[#fff0f7]'
                      }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
            {showSetOfferNotice ? (
              <p className="mt-4 rounded-xl bg-[#f6e7ef] px-4 py-3 text-sm font-semibold text-[#7d2f56]">
                Love Story Set is shown first as the full set. You can also select single pieces from the options below.
              </p>
            ) : null}
            {hasSinglePieceOptions ? (
              <div className="mt-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#a34977]">Choose View</p>
                <div className="flex flex-wrap gap-2">
                  {productGallery.map((_, index) => (
                    <button
                      key={`piece-option-${index}`}
                      type="button"
                      onClick={() => setSelectedPreview(index)}
                      className={`rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-wide ${selectedPreview === index
                        ? 'border-[#7d2f56] bg-[#7d2f56] text-white'
                        : 'border-[#d8bfd0] text-[#7d2f56] hover:bg-[#fff0f7]'
                        }`}
                    >
                      {index === 0 ? 'Full Set' : `Single Piece ${index}`}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
            <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:flex-wrap">
              {(colorOptions[selectedColorIndex]?.soldOut || product?.soldOut) ? (
                <button
                  type="button"
                  disabled
                  className="w-full rounded-full border border-[#d8bfd0] bg-gray-100 px-5 py-2.5 text-sm font-semibold uppercase tracking-wide text-gray-400 cursor-not-allowed sm:w-auto"
                >
                  Sold Out
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleAddToBag}
                    className="w-full rounded-full border border-[#d8bfd0] px-5 py-2.5 text-sm font-semibold uppercase tracking-wide hover:bg-[#fff0f7] sm:w-auto"
                  >
                    Add to Bag
                  </button>
                  <button
                    type="button"
                    onClick={handleBuyNow}
                    className="w-full rounded-full bg-[#7d2f56] px-5 py-2.5 text-sm font-semibold uppercase tracking-wide text-white hover:bg-[#632242] sm:w-auto"
                  >
                    Buy Now
                  </button>
                </>
              )}
            </div>
          </div>
        </article>
      </section>
    )
  }

  return (
    <main className="min-h-screen bg-[#f9f5f7] text-[#2f1f2a]">
      <style>{`
        @keyframes deliveryStripMarquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
      <div className="overflow-hidden bg-[#7d2f56] py-1.5 text-xs font-semibold text-white sm:py-2 sm:text-sm">
        <div
          className="flex w-max whitespace-nowrap"
          style={{ animation: 'deliveryStripMarquee 18s linear infinite' }}
        >
          <span className="px-6">Free worldwide delivery over £50 spend</span>
          <span className="px-6">Free worldwide delivery over £50 spend</span>
          <span className="px-6">Free worldwide delivery over £50 spend</span>
          <span className="px-6">Free worldwide delivery over £50 spend</span>
        </div>
      </div>
      <header className="safe-top sticky top-0 z-50 w-full border-b border-[#fff]/10" style={{ backgroundColor: '#D25F6D' }}>
        <div className="relative mx-auto flex max-w-7xl items-center justify-between gap-2 px-3 py-3 sm:gap-4 sm:px-4 sm:py-4 md:px-8">
          <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-4 md:gap-5">
            <button type="button" className="shrink-0 p-1" aria-label="Open menu" onClick={() => setIsMobileMenuOpen(true)}>
              <svg className="h-6 w-6 sm:h-[26px] sm:w-[26px]" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            </button>
            <button type="button" className="shrink-0 p-1 hover:opacity-70" aria-label="Search" onClick={() => { setIsSearchOpen(!isSearchOpen); setTimeout(() => document.getElementById('searchInput')?.focus(), 100); }}>
              <svg className="h-5 w-5 sm:h-6 sm:w-6" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </button>
          </div>
          <div className="flex min-w-0 flex-1 justify-center px-1">
            <Link to="/" className="text-center text-[clamp(0.7rem,3.8vw,1.5rem)] text-white whitespace-nowrap md:text-2xl" style={{ ...brandWordmarkStyle, letterSpacing: '0.06em' }}>Hush Sweety</Link>
          </div>
          <div className="flex min-w-0 flex-1 items-center justify-end gap-2 text-white sm:gap-4 md:gap-5">
            <img src={logoImg} alt="Hush Sweety Logo" className="h-10 w-10 shrink-0 rounded-full object-cover sm:h-12 sm:w-12" />
            <Link to="/bag" className="relative flex shrink-0 items-center p-1 hover:opacity-70" aria-label="Shopping bag">
              <svg className="h-6 w-6 sm:h-[26px] sm:w-[26px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="2.5 6 21.5 6 19 16 5 16 2.5 6"></polyline>
                <path d="M8 16c0 1.5 1 2 2 2s2-.5 2-2"></path>
                <path d="M16 16c0 1.5 1 2 2 2s2-.5 2-2"></path>
              </svg>
              {bagItems.length > 0 && <span className="absolute -top-1.5 -right-2 bg-white text-[#D25F6D] rounded-full w-[16px] h-[16px] flex items-center justify-center text-[10px] font-bold">{bagItems.length}</span>}
            </Link>
          </div>

          {isSearchOpen && (
            <div className="absolute top-full left-0 z-40 flex w-full items-center gap-2 border-b border-gray-200 bg-white p-3 shadow-sm sm:gap-3 sm:p-4">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="1.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              <input
                id="searchInput"
                type="text"
                placeholder="Search products..."
                className="flex-1 outline-none text-[#111] text-sm tracking-wide bg-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setIsSearchOpen(false)
                    navigate(`/search?q=${encodeURIComponent(searchQuery)}`)
                  }
                }}
              />
              <button type="button" onClick={() => setIsSearchOpen(false)} className="text-[#111] hover:opacity-70">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
          )}
        </div>

        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity" onClick={() => setIsMobileMenuOpen(false)}></div>
        )}

        <div className={`fixed top-0 left-0 z-50 flex h-full w-[min(85vw,400px)] max-w-full flex-col overflow-y-auto bg-white transition-transform duration-300 ease-in-out safe-top safe-bottom ${isMobileMenuOpen ? 'translate-x-0 pointer-events-auto' : '-translate-x-full pointer-events-none'}`}>
          <div className="flex items-center justify-between px-6 py-5 bg-[#eaf1f4]">
            <Link to="/" className="text-xl text-[#111]" style={brandWordmarkStyle} onClick={() => setIsMobileMenuOpen(false)}>Hush Sweety</Link>
            <button type="button" className="p-1" onClick={() => setIsMobileMenuOpen(false)}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>

          <div className="flex-1 px-6 py-10 flex flex-col bg-white">
            <div className="flex flex-col gap-8 text-[14px] tracking-wider font-normal uppercase text-[#111]">
              <button
                className="flex items-center justify-between w-full text-left"
                onClick={() => {
                  setIsMobileMenuOpen(false)
                  if (location.pathname === '/') {
                    setTimeout(() => {
                      const el = document.getElementById('shop-categories')
                      if (el) {
                        const navHeight = document.querySelector('header')?.offsetHeight ?? 60
                        const top = el.getBoundingClientRect().top + window.scrollY - navHeight - 8
                        window.scrollTo({ top, behavior: 'smooth' })
                      }
                    }, 80)
                  } else {
                    navigate('/#shop-categories')
                  }
                }}
              >
                SHOP
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </button>
              {[
                { label: 'NEW ARRIVAL', to: '/full-body-set' },
                { label: 'ABOUT US', to: '/about-us' },
                { label: 'CONTACT', to: '/contact-us' },
                { label: 'RETURN & REFUND POLICY', to: '/return-and-refund-policy' },
              ].map((item) => (
                <Link key={item.label} to={item.to} className="flex items-center justify-between" onClick={() => setIsMobileMenuOpen(false)}>
                  {item.label}
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                </Link>
              ))}
            </div>

            <div className="mt-auto pt-10">
              <div className="mb-6 border-t border-gray-200"></div>
              <p className="text-[12px] mb-4 font-normal uppercase text-[#111]">Free Worldwide Shipping</p>
              <div className="space-y-6 pb-2">
                <a href="https://www.instagram.com/hushsweety__?igsh=cm1oNTA1ZWJzbWIw&utm_source=qr" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-[13px] font-normal uppercase text-[#111] hover:opacity-70 transition-opacity">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                  INSTAGRAM
                </a>
                <a href="https://www.tiktok.com/@dance_mode_on" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-[13px] font-normal uppercase text-[#111] hover:opacity-70 transition-opacity">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path></svg>
                  TIK TOK
                </a>
              </div>
            </div>
          </div>
        </div>
      </header>

      {notice ? <div className="mx-auto mt-4 max-w-7xl rounded-2xl bg-[#f6e7ef] px-4 py-3 text-sm text-[#7d2f56] lg:px-8">{notice}</div> : null}

      <Routes>
        <Route
          path="/"
          element={
            <>
              <section id="hero" className="mx-auto max-w-7xl px-4 pt-4 sm:px-6 sm:pt-6 lg:px-8">
                <article className="rounded-2xl bg-gradient-to-r from-[#7d2f56] to-[#b14f7f] px-4 py-4 text-white shadow-sm sm:rounded-3xl sm:px-6 sm:py-5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#f8d8ea] sm:text-xs sm:tracking-[0.2em]">Member Offer</p>
                  <h2 className="mt-2 text-xl font-semibold leading-tight sm:text-2xl md:text-3xl">
                    Join our email list and enjoy 15% off your first order.
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-[#f7e4ee]">
                    ✨ Get early access to new drops, exclusive offers, and member-only perks.
                  </p>
                  <Link to="/checkout" className="mt-5 inline-block rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[#7d2f56]">
                    Sign Up Now
                  </Link>
                </article>
              </section>

              <section id="collections" className="mx-auto grid max-w-7xl gap-4 px-4 py-8 sm:gap-6 sm:px-6 sm:py-10 lg:grid-cols-5 lg:px-8">
                <article className="flex flex-col justify-center rounded-2xl bg-[#fff] p-4 shadow-sm ring-1 ring-[#f2e6ee] sm:rounded-3xl sm:p-6 lg:col-span-3 lg:p-8">
                  <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#b14f7f] sm:mb-4 sm:text-xs sm:tracking-[0.24em]">Spring Collection 2026</p>
                  <h1 className="max-w-xl text-3xl font-semibold leading-tight text-[#3f1f34] sm:text-4xl md:text-5xl"></h1>
                  {heroSectionVideo ? (
                    <div className="mt-4 overflow-hidden rounded-2xl ring-1 ring-[#ead9e4] sm:mt-5">
                      <video
                        src={heroSectionVideo}
                        className="aspect-[9/16] max-h-[min(70vh,420px)] w-full object-cover sm:aspect-video sm:max-h-none sm:h-[320px] md:h-[420px]"
                        autoPlay
                        muted
                        loop
                        playsInline
                        controls
                        preload="metadata"
                      />
                    </div>
                  ) : null}
                </article>
                <article id="shop-categories" className="rounded-2xl bg-[#f1e6ed] p-3 sm:rounded-3xl sm:p-5 lg:col-span-2">
                  <div className="grid grid-cols-2 gap-x-3 gap-y-4 sm:gap-x-5 sm:gap-y-6 md:grid-cols-3 lg:grid-cols-2">
                    {heroCategoryCards.map((item) => (
                      <Link
                        key={item.label}
                        to={item.to ?? `/product/${item.productId}?from=${encodeURIComponent(item.sourcePath)}`}
                        state={{ from: item.sourcePath }}
                        className="flex flex-col items-center text-center"
                      >
                        <div className="h-20 w-20 overflow-hidden rounded-full bg-white ring-1 ring-[#ead9e4] sm:h-28 sm:w-28 md:h-32 md:w-32">
                          <img src={item.image} alt={item.label} className="h-full w-full object-cover" />
                        </div>
                        <p className="mt-1.5 text-xs font-medium text-[#3f1f34] sm:mt-2 sm:text-sm md:text-base">{item.label}</p>
                      </Link>
                    ))}
                  </div>
                </article>
              </section>

              <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
                <div className="mb-4 flex flex-col gap-2 sm:mb-6 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
                  <h2 className="text-2xl font-semibold text-[#3f1f34] sm:text-3xl">Discover our Collection</h2>
                  <Link to="/lingerie-sets" className="text-sm font-semibold text-[#9a3d6c] hover:text-[#7d2f56]">View all products</Link>
                </div>
                <ProductGrid items={featuredProducts} sourcePath="/lingerie-sets" />
              </section>

              <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
                <article className="rounded-2xl bg-[#7d2f56] p-5 text-center text-white sm:rounded-3xl sm:p-8 md:p-12 lg:p-16">
                  <p className="text-[10px] uppercase tracking-[0.16em] text-[#f8d8ea] sm:text-xs sm:tracking-[0.2em]">Online Exclusive</p>
                  <h3 className="mt-3 text-2xl font-semibold leading-tight sm:text-3xl md:text-4xl lg:text-5xl">Limited-Time Picks from Our Bestseller Edit</h3>
                  <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-[#f3d6e6] sm:text-base sm:leading-8">Explore statement silhouettes, signature lace details, and must-have pieces selected from our most-loved collection.</p>
                  <Link to="/lingerie-sets" className="mt-7 inline-block rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#7d2f56] transition hover:bg-[#fff0f7] hover:scale-105 transform">Shop Bestsellers</Link>
                </article>
              </section>

              <section id="reviews" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
                <div className="mb-5 flex flex-col gap-2 sm:mb-8 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
                  <div className="min-w-0">
                    <h2 className="text-xl font-semibold uppercase tracking-wider text-[#7d2f56] sm:text-2xl">Customer Reviews</h2>
                    <p className="mt-1 text-sm leading-relaxed text-[#7b5a6e] sm:text-base">What our community is saying about Hush Sweety</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5 rounded-full bg-white px-3 py-1.5 ring-1 ring-[#efdfe8] sm:px-4 sm:py-2">
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className="h-3.5 w-3.5 sm:h-4 sm:w-4" style={{ fill: '#fbbf24' }} viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-xs font-semibold text-[#7d2f56] sm:text-sm">5.0</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6">
                  {[
                    {
                      name: "Sarah M.",
                      rating: 5,
                      date: "May 2026",
                      review: "Absolutely in love with the Love Lace Set! The fabric is incredibly soft, fits perfectly, and the design is so elegant. Highly recommend!",
                      verified: true
                    },
                    {
                      name: "Emily R.",
                      rating: 5,
                      date: "April 2026",
                      review: "The Sculpt Bodysuit is a game changer. It holds everything in perfectly while still being super comfortable to wear all day long. Will buy other colors!",
                      verified: true
                    },
                    {
                      name: "Jessica T.",
                      rating: 5,
                      date: "May 2026",
                      review: "Beautiful packaging and very fast delivery. The Love Story Set feels so premium and luxurious. My absolute favorite purchase this year.",
                      verified: true
                    }
                  ].map((item, index) => (
                    <article key={index} className="flex h-full flex-col justify-between rounded-2xl bg-white p-4 shadow-sm ring-1 ring-[#efdfe8] sm:p-5 lg:p-6">
                      <div className="min-w-0">
                        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex min-w-0 flex-wrap items-center gap-1.5">
                            <span className="text-sm font-semibold text-[#3f1f34] sm:text-base">{item.name}</span>
                            {item.verified && (
                              <span className="inline-flex shrink-0 items-center rounded bg-[#fff0f7] px-1.5 py-0.5 text-[10px] font-medium text-[#7d2f56] ring-1 ring-[#7d2f56]/10 sm:text-xs">
                                Verified
                              </span>
                            )}
                          </div>
                          <span className="shrink-0 text-xs text-[#a37f95] sm:text-sm">{item.date}</span>
                        </div>
                        <div className="mb-3 flex gap-0.5" aria-label={`${item.rating} out of 5 stars`}>
                          {[...Array(item.rating)].map((_, i) => (
                            <svg key={i} className="h-3.5 w-3.5 sm:h-4 sm:w-4" style={{ fill: '#fbbf24' }} viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <p className="text-sm leading-relaxed text-[#6e5362] sm:text-[15px] sm:leading-7">&ldquo;{item.review}&rdquo;</p>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            </>
          }
        />
        <Route path="/new-arrivals" element={<CollectionPage title="New Arrivals" items={newArrivals} sourcePath="/new-arrivals" />} />
        <Route path="/bodysuits" element={<CollectionPage title="Bodysuits" items={bodysuits} sourcePath="/bodysuits" />} />
        <Route path="/sleepwear" element={<CollectionPage title="Sleepwear" items={sleepwear} sourcePath="/sleepwear" />} />
        <Route path="/leather" element={<CollectionPage title="Leather" items={leather} sourcePath="/leather" />} />
        <Route path="/wrap-set" element={<CollectionPage title="Wrap set" items={wrapSet} sourcePath="/wrap-set" />} />
        <Route path="/full-body-set" element={<CollectionPage title="Full body set" items={fullBodySet} sourcePath="/full-body-set" />} />
        <Route path="/lingerie-sets" element={<CollectionPage title="Lingerie Sets" items={lingerieSets} sourcePath="/lingerie-sets" />} />
        <Route path="/nightwear" element={<CollectionPage title="Nightwear" items={nightwear} sourcePath="/nightwear" />} />
        <Route path="/accessories" element={<CollectionPage title="Accessories" items={accessories} sourcePath="/accessories" />} />
        <Route path="/product/:id" element={<ProductDetailsPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route
          path="/about-us"
          element={
            <section className="mx-auto max-w-3xl px-4 py-10 text-center sm:px-6 sm:py-14 lg:px-8">
              <h2 className="mb-6 text-3xl font-semibold text-[#3f1f34] sm:mb-8 sm:text-4xl">About Hush Sweety</h2>
              <div className="space-y-5 text-base leading-relaxed text-[#6e5362] sm:space-y-6 sm:text-lg">
                <p>At Hush Sweety, lingerie isn’t just what you wear. It’s how you show up.</p>
                <p>Soft, bold, a little playful. Made to hug you in all the right places and remind you that confidence can be quiet or a little naughty.</p>
                <p>For slow mornings, late nights, and everything in between.<br />Wear it for you. Always.</p>
                <p className="text-xl font-bold text-[#7d2f56] pt-8">Hush Sweety</p>
              </div>
            </section>
          }
        />
        <Route
          path="/bag"
          element={
            <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
              <h2 className="text-2xl font-semibold text-[#3f1f34] sm:text-3xl">My Bag</h2>
              {bagItems.length === 0 ? (
                <p className="mt-3 text-[#6e5362]">Your bag is empty. Add a product from the collection.</p>
              ) : (
                <div className="mt-6 grid gap-4">
                  {bagItems.map((item, index) => (
                    <article key={`${item.id}-${index}`} className="flex flex-col gap-3 rounded-2xl bg-white p-4 ring-1 ring-[#ebdde5] sm:flex-row sm:items-center sm:gap-4">
                      <ProductImage
                        src={item.src}
                        alt={item.name}
                        frameClassName="h-28 w-24 shrink-0 self-start rounded-lg sm:h-32 sm:w-24"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-base font-semibold text-[#3f1f34] sm:text-lg">{item.name}</p>
                        {item.selectedColor ? <p className="mt-0.5 text-sm font-medium text-[#7d2f56]">Color: {item.selectedColor}</p> : null}
                        {item.selectedSize ? <p className="mt-0.5 text-sm font-medium text-[#7d2f56]">Size: {item.selectedSize}</p> : null}
                        <div className="mt-1 flex items-center gap-2">
                          <p className="text-base font-semibold text-[#7d2f56]">{item.price}</p>
                          <p className="text-xs font-medium text-[#a34977] line-through">
                            £{(parseFloat(item.price.replace(/[^0-9.]/g, '')) * 1.15).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
              <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row">
                <Link to="/lingerie-sets" className="w-full rounded-full border border-[#d8bfd0] px-5 py-3 text-center text-sm font-semibold uppercase tracking-wide hover:bg-[#fff0f7] sm:w-auto sm:py-2.5">Continue Shopping</Link>
                <Link to="/checkout" className="w-full rounded-full bg-[#7d2f56] px-5 py-3 text-center text-sm font-semibold uppercase tracking-wide text-white hover:bg-[#632242] sm:w-auto sm:py-2.5">Checkout</Link>
              </div>
            </section>
          }
        />
        <Route
          path="/checkout"
          element={
            <ShopifyCheckoutRedirect 
              bagItems={bagItems} 
              productsForLookup={productsForLookup} 
            />
          }
        />
        <Route
          path="/thank-you"
          element={
            <section className="mx-auto max-w-3xl px-4 py-10 text-center sm:px-6 sm:py-14 lg:px-8">
              <h2 className="text-3xl font-semibold text-[#3f1f34] sm:text-4xl">Thank you for your order</h2>
              <p className="mt-4 text-[#6e5362]">Your customer details were submitted successfully. We will contact you shortly.</p>
              <Link to="/" className="mt-7 inline-block rounded-full bg-[#7d2f56] px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white hover:bg-[#632242]">Back to Home</Link>
            </section>
          }
        />
        <Route
          path="/return-and-refund-policy"
          element={
            <section className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
              <h2 className="mb-6 text-2xl font-semibold text-[#3f1f34] sm:mb-8 sm:text-3xl">Return & Refund Policy (UK Customers)</h2>
              <div className="space-y-6 break-words text-sm leading-relaxed text-[#6e5362] sm:text-base">
                <p>At HushSweety, we want you to be happy with your purchase. This policy explains your rights and how returns and refunds work for UK customers.</p>

                <h3 className="text-xl font-semibold text-[#3f1f34] mt-8">1. Your Right to Cancel (Online Orders)</h3>
                <p>Under the Consumer Contracts Regulations 2013, you have the right to cancel your order.</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>You have 14 days from the day you receive your order to tell us you want to cancel</li>
                  <li>You then have a further 14 days to return the item</li>
                  <li>You do not need to give a reason</li>
                </ul>
                <p>To cancel your order, please contact us at: <a href="mailto:support@hushsweety.com" className="text-[#7d2f56] hover:underline">support@hushsweety.com</a></p>

                <h3 className="text-xl font-semibold text-[#3f1f34] mt-8">2. Returns & Refunds</h3>
                <p>Once we receive your returned item, we will:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Issue a refund to your original payment method</li>
                  <li>Process the refund within 14 days of receiving the item</li>
                </ul>
                <p>If you cancel your entire order, standard delivery costs will also be refunded.</p>
                <p>Return shipping costs are the responsibility of the customer unless the item is faulty or incorrect.</p>

                <h3 className="text-xl font-semibold text-[#3f1f34] mt-8">3. Condition of Returned Items</h3>
                <p>Returned items must be:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Unworn and unused</li>
                  <li>In their original condition</li>
                  <li>With all tags and original packaging intact</li>
                </ul>
                <p>We reserve the right to reduce your refund if the item shows signs of use beyond what is necessary to inspect it.</p>

                <h3 className="text-xl font-semibold text-[#3f1f34] mt-8">4. Hygiene & Sealed Items</h3>
                <p>For hygiene reasons, certain items (such as lingerie or underwear) may not be eligible for return if:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>A hygiene seal is present and has been broken</li>
                </ul>
                <p>If the seal remains intact, your right to cancel still applies.</p>

                <h3 className="text-xl font-semibold text-[#3f1f34] mt-8">5. Faulty, Damaged, or Incorrect Items</h3>
                <p>Under the Consumer Rights Act 2015, you are entitled to a remedy if your item is:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Faulty</li>
                  <li>Not as described</li>
                  <li>Not fit for purpose</li>
                </ul>
                <p>You have the right to:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>A full refund within 30 days of receiving the item</li>
                  <li>A repair or replacement after this period, where appropriate</li>
                </ul>
                <p>If you receive a faulty or incorrect item, please contact us as soon as possible at <a href="mailto:support@hushsweety.com" className="text-[#7d2f56] hover:underline">support@hushsweety.com</a> with details and, where possible, photos.</p>
                <p>We will cover reasonable return shipping costs for faulty or incorrect items.</p>

                <h3 className="text-xl font-semibold text-[#3f1f34] mt-8">6. Exchanges</h3>
                <p>We may offer exchanges (for example, for a different size), subject to stock availability.</p>
                <p>Please contact us to arrange an exchange before returning your item.</p>

                <h3 className="text-xl font-semibold text-[#3f1f34] mt-8">7. How to Return an Item</h3>
                <ol className="list-decimal pl-6 space-y-1">
                  <li>Email <a href="mailto:support@hushsweety.com" className="text-[#7d2f56] hover:underline">support@hushsweety.com</a> with your order details</li>
                  <li>Follow the return instructions provided</li>
                  <li>Send your item using a tracked shipping service</li>
                </ol>
                <p>We recommend keeping proof of postage, as we are not responsible for items lost in transit.</p>

                <h3 className="text-xl font-semibold text-[#3f1f34] mt-8">8. Important Information</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Returns sent after the 14-day cancellation period may not be accepted unless the item is faulty</li>
                  <li>Refunds may be reduced if items are returned in a used or damaged condition</li>
                  <li>This policy does not affect your statutory rights under UK consumer law</li>
                </ul>
                <p>If you have any questions, please contact us at <a href="mailto:support@hushsweety.com" className="text-[#7d2f56] hover:underline">support@hushsweety.com</a></p>
              </div>
            </section>
          }
        />
        <Route
          path="/terms-of-service"
          element={
            <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
              <h2 className="mb-6 text-2xl font-semibold text-[#3f1f34] sm:mb-8 sm:text-3xl">Terms of Service</h2>
              <div className="space-y-6 break-words text-sm leading-relaxed text-[#6e5362] sm:text-base">
                <h3 className="text-xl font-semibold text-[#3f1f34] uppercase tracking-wide">OVERVIEW</h3>
                <p>Welcome to HushSweety! The terms “we”, “us” and “our” refer to HushSweety. HushSweety operates this store and website, including all related information, content, features, tools, products and services in order to provide you, the customer, with a curated shopping experience (the “Services”). HushSweety is powered by Shopify, which enables us to provide the Services to you.</p>
                <p>The below terms and conditions, together with any policies referenced herein (these “Terms of Service” or “Terms”) describe your rights and responsibilities when you use the Services.</p>
                <p>Please read these Terms of Service carefully, as they include important information about your legal rights and cover areas such as warranty disclaimers and limitations of liability.</p>
                <p>By visiting, interacting with or using our Services, you agree to be bound by these Terms of Service and our Privacy Policy hushsweety.com. If you do not agree to these Terms of Service or Privacy Policy, you should not use or access our Services.</p>

                <h3 className="text-xl font-semibold text-[#3f1f34] mt-8 uppercase tracking-wide">SECTION 1 - ACCESS AND ACCOUNT</h3>
                <p>By agreeing to these Terms of Service, you represent that you are at least the age of majority in your state or province of residence, and you have given us your consent to allow any of your minor dependents to use the Services on devices you own, purchase or manage.</p>
                <p>To use the Services, including accessing or browsing our online stores or purchasing any of the products or services we offer, you may be asked to provide certain information, such as your email address, billing, payment, and shipping information. You represent and warrant that all the information you provide in our stores is correct, current and complete and that you have all rights necessary to provide this information.</p>
                <p>You are solely responsible for maintaining the security of your account credentials and for all of your account activity. You may not transfer, sell, assign, or license your account to any other person.</p>

                <h3 className="text-xl font-semibold text-[#3f1f34] mt-8 uppercase tracking-wide">SECTION 2 - OUR PRODUCTS</h3>
                <p>We have made every effort to provide an accurate representation of our products and services in our online stores. However, please note that colors or product appearance may differ from how they may appear on your screen due to the type of device you use to access the store and your device settings and configuration.</p>
                <p>We do not warrant that the appearance or quality of any products or services purchased by you will meet your expectations or be the same as depicted or rendered in our online stores.</p>
                <p>All descriptions of products are subject to change at any time without notice at our sole discretion. We reserve the right to discontinue any product at any time and may limit the quantities of any products that we offer to any person, geographic region or jurisdiction, on a case-by-case basis.</p>

                <h3 className="text-xl font-semibold text-[#3f1f34] mt-8 uppercase tracking-wide">SECTION 3 - ORDERS</h3>
                <p>When you place an order, you are making an offer to purchase. HushSweety reserves the right to accept or decline your order for any reason at its discretion. Your order is not accepted until HushSweety confirms acceptance. We must receive and process your payment before your order is accepted. Please review your order carefully before submitting, as Hush Sweety may be unable to accommodate cancellation requests after an order is accepted. In the event that we do not accept, make a change to, or cancel an order, we will attempt to notify you by contacting the e‑mail, billing address, and/or phone number provided at the time the order was made.</p>
                <p>Your purchases are subject to return or exchange solely in accordance with our Refund Policy hushsweety.com.</p>
                <p>You represent and warrant that your purchases are for your own personal or household use and not for commercial resale or export.</p>

                <h3 className="text-xl font-semibold text-[#3f1f34] mt-8 uppercase tracking-wide">SECTION 4 - PRICES AND BILLING</h3>
                <p>Prices, discounts and promotions are subject to change without notice. The price charged for a product or service will be the price in effect at the time the order is placed and will be set out in your order confirmation email. Unless otherwise expressly stated, posted prices do not include taxes, shipping, handling, customs or import charges.</p>
                <p>Prices posted in our online stores may be different from prices offered in physical stores or in online or other stores operated by third parties. We may offer, from time to time, promotions on the Services that may affect pricing and that are governed by terms and conditions separate from these Terms. If there is a conflict between the terms for a promotion and these Terms, the promotion terms will govern.</p>
                <p>You agree to provide current, complete and accurate purchase, payment and account information for all purchases made at our stores. You agree to promptly update your account and other information, including your email address, credit card numbers and expiration dates, so that we can complete your transactions and contact you as needed.</p>
                <p>You represent and warrant that (i) the credit card information you provide is true, correct, and complete, (ii) you are duly authorized to use such credit card for the purchase, (iii) charges incurred by you will be honored by your credit card company, and (iv) you will pay charges incurred by you at the posted prices, including shipping and handling charges and all applicable taxes, if any.</p>

                <h3 className="text-xl font-semibold text-[#3f1f34] mt-8 uppercase tracking-wide">SECTION 5 - SHIPPING AND DELIVERY</h3>
                <p>We are not liable for shipping and delivery delays. All delivery times are estimates only and are not guaranteed. We are not responsible for delays caused by shipping carriers, customs processing, or events outside our control. Once we transfer products to the carrier, title and risk of loss passes to you.</p>

                <h3 className="text-xl font-semibold text-[#3f1f34] mt-8 uppercase tracking-wide">SECTION 6 - INTELLECTUAL PROPERTY</h3>
                <p>Our Services, including but not limited to all trademarks, brands, text, displays, images, graphics, product reviews, video, and audio, and the design, selection, and arrangement thereof, are owned by Hush Sweety, its affiliates or licensors and are protected by U.S. and foreign patent, copyright and other intellectual property laws.</p>
                <p>These Terms permit you to use the Services for your personal, non-commercial use only. You must not reproduce, distribute, modify, create derivative works of, publicly display, publicly perform, republish, download, store, or transmit any of the material on the Services without our prior written consent. Except as expressly provided herein, nothing in these Terms grants or shall be construed as granting a license or other rights to you under any patent, trademark, copyright, or other intellectual property of Hush Sweety, Shopify or any third party. Unauthorized use of the Services may be a violation of federal and state intellectual property laws. All rights not expressly granted herein are reserved by Hush Sweety.</p>
                <p>Hush Sweety’s names, logos, product and service names, designs, and slogans are trademarks of Hush Sweety or its affiliates or licensors. You must not use such trademarks without the prior written permission of Hush Sweety. Shopify’s name, logo, product and service names, designs and slogans are trademarks of Shopify. All other names, logos, product and service names, designs, and slogans on the Services are the trademarks of their respective owners.</p>

                <h3 className="text-xl font-semibold text-[#3f1f34] mt-8 uppercase tracking-wide">SECTION 7 - OPTIONAL TOOLS</h3>
                <p>You may be provided with access to customer tools offered by third parties as part of the Services, which we neither monitor nor have any control nor input.</p>
                <p>You acknowledge and agree that we provide access to such tools “as is” and “as available” without any warranties, representations or conditions of any kind and without any endorsement. We shall have no liability whatsoever arising from or relating to your use of optional third-party tools.</p>
                <p>Any use by you of the optional tools offered through the site is entirely at your own risk and discretion and you should ensure that you are familiar with and approve of the terms on which tools are provided by the relevant third-party provider(s).</p>
                <p>We may also, in the future, offer new features through the Services (including the release of new tools and resources). Such new features shall also be deemed part of the Services and are subject to these Terms of Service.</p>

                <h3 className="text-xl font-semibold text-[#3f1f34] mt-8 uppercase tracking-wide">SECTION 8 - THIRD-PARTY LINKS</h3>
                <p>The Services may contain materials and hyperlinks to websites provided or operated by third parties (including any embedded third party functionality). We are not responsible for examining or evaluating the content or accuracy of any third-party materials or websites you choose to access. If you decide to leave the Services to access these materials or third party sites, you do so at your own risk.</p>
                <p>We are not liable for any harm or damages related to your access of any third-party websites, or your purchase or use of any products, services, resources, or content on any third-party websites. Please review carefully the third-party's policies and practices and make sure you understand them before you engage in any transaction. Complaints, claims, concerns, or questions regarding third-party products and services should be directed to the third-party.</p>

                <h3 className="text-xl font-semibold text-[#3f1f34] mt-8 uppercase tracking-wide">SECTION 9 - RELATIONSHIP WITH SHOPIFY</h3>
                <p>Hush Sweety is powered by Shopify, which enables us to provide the Services to you. However, any sales and purchases you make in our Store are made directly with Hush Sweety. By using the Services, you acknowledge and agree that Shopify is not responsible for any aspect of any sales between you and Hush Sweety, including any injury, damage, or loss resulting from purchased products and services. You hereby expressly release Shopify and its affiliates from all claims, damages, and liabilities arising from or related to your purchases and transactions with Hush Sweety.</p>

                <h3 className="text-xl font-semibold text-[#3f1f34] mt-8 uppercase tracking-wide">SECTION 10 - PRIVACY POLICY</h3>
                <p>All personal information we collect through the Services is subject to our Privacy Policy, which can be viewed here hushsweety.com, and certain personal information may be subject to Shopify’s Privacy Policy, which can be viewed here. By using the Services, you acknowledge that you have read these privacy policies.</p>
                <p>Because the Services are hosted by Shopify, Shopify collects and processes personal information about your access to and use of the Services in order to provide and improve the Services for you. Information you submit to the Services will be transmitted to and shared with Shopify as well as third parties that may be located in other countries than where you reside, in order to provide services to you.</p>

                <h3 className="text-xl font-semibold text-[#3f1f34] mt-8 uppercase tracking-wide">SECTION 11 - FEEDBACK</h3>
                <p>If you submit, upload, post, email, or otherwise transmit any ideas, suggestions, feedback, reviews, proposals, plans, or other content (collectively, “Feedback”), you grant us a perpetual, worldwide, sublicensable, royalty-free license to use, reproduce, modify, publish, distribute and display such Feedback in any medium for any purpose, including for commercial use. We may, for example, use our rights under this license to operate, provide, evaluate, enhance, improve and promote the Services and to perform our obligations and exercise our rights under the Terms of Service.</p>
                <p>You also represent and warrant that: (i) you own or have all necessary rights to all Feedback; (ii) you have disclosed any compensation or incentives received in connection with your submission of Feedback; and (iii) your Feedback will comply with these Terms. We are and shall be under no obligation (1) to maintain your Feedback in confidence; (2) to pay compensation for your Feedback; or (3) to respond to your Feedback.</p>
                <p>We may, but have no obligation to, monitor, edit or remove Feedback that we determine in our sole discretion to be unlawful, offensive, threatening, libelous, defamatory, pornographic, obscene or otherwise objectionable or violates any party’s intellectual property or these Terms of Service.</p>
                <p>You agree that your Feedback will not violate any right of any third-party, including copyright, trademark, privacy, personality or other personal or proprietary right. You further agree that your Feedback will not contain libelous or otherwise unlawful, abusive or obscene Feedback, or contain any computer virus or other malware that could in any way affect the operation of the Services or any related website. You may not use a false email address, pretend to be someone other than yourself, or otherwise mislead us or third-parties as to the origin of any Feedback. You are solely responsible for any Feedback you make and its accuracy. We take no responsibility and assume no liability for any Feedback posted by you or any third-party.</p>

                <h3 className="text-xl font-semibold text-[#3f1f34] mt-8 uppercase tracking-wide">SECTION 12 - ERRORS, INACCURACIES AND OMISSIONS</h3>
                <p>Occasionally there may be information on or in the Services that contain typographical errors, inaccuracies or omissions that may relate to product descriptions, pricing, promotions, offers, product shipping charges, transit times and availability. We reserve the right to correct any errors, inaccuracies or omissions, and to change or update information or cancel orders if any information is inaccurate at any time without prior notice (including after you have submitted your order).</p>

                <h3 className="text-xl font-semibold text-[#3f1f34] mt-8 uppercase tracking-wide">SECTION 13 - PROHIBITED USES</h3>
                <p>You may access and use the Services for lawful purposes only. You may not access or use the Services, directly or indirectly: (a) for any unlawful or malicious purpose; (b) to violate any international, federal, provincial or state regulations, rules, laws, or local ordinances; (c) to infringe upon or violate our intellectual property rights or the intellectual property rights of others; (d) to harass, abuse, insult, harm, defame, slander, disparage, intimidate, or harm any of our employees or any other person; (e) to transmit false or misleading information; (f) to send, knowingly receive, upload, download, use, or re-use any material that does not comply with the these Terms; (g) to transmit, or procure the sending of, any advertising or promotional material, including any “junk mail,” “chain letter,” “spam,” or any other similar solicitation; (h) to impersonate or attempt to impersonate any other person or entity; or (i) to engage in any other conduct that restricts or inhibits anyone's use or enjoyment of the Services, or which, as determined by us, may harm HushSweety, Shopify or users of the Services, or expose them to liability.</p>
                <p>In addition, you agree not to: (a) upload or transmit viruses or any other type of malicious code that will or may be used in any way that will affect the functionality or operation of the Services; (b) reproduce, duplicate, copy, sell, resell or exploit any portion of the Services; (c) collect or track the personal information of others; (d) spam, phish, pharm, pretext, spider, crawl, or scrape; or (e) interfere with or circumvent the security features of the Services or any related website, other websites, or the Internet. We reserve the right to suspend, disable, or terminate your account at any time, without notice, if we determine that you have violated any part of these Terms.</p>

                <h3 className="text-xl font-semibold text-[#3f1f34] mt-8 uppercase tracking-wide">SECTION 14 - TERMINATION</h3>
                <p>We may terminate this agreement or your access to the Services (or any part thereof) in our sole discretion at any time without notice, and you will remain liable for all amounts due up to and including the date of termination.</p>
                <p>The following sections will continue to apply following any termination: Intellectual Property, Feedback, Termination, Disclaimer of Warranties, Limitation of Liability, Indemnification, Severability, Waiver; Entire Agreement, Assignment, Governing Law, Privacy Policy, and any other provisions that by their nature should survive termination.</p>

                <h3 className="text-xl font-semibold text-[#3f1f34] mt-8 uppercase tracking-wide">SECTION 15 - DISCLAIMER OF WARRANTIES</h3>
                <p>The information presented on or through the Services is made available solely for general information purposes. We do not warrant the accuracy, completeness, or usefulness of this information. Any reliance you place on such information is strictly at your own risk. We disclaim all liability and responsibility arising from any reliance placed on such materials by you or any other visitor to the Services, or by anyone who may be informed of any of its contents.</p>
                <p>EXCEPT AS EXPRESSLY STATED BY Hush Sweety, THE SERVICES AND ALL PRODUCTS OFFERED THROUGH THE SERVICES ARE PROVIDED 'AS IS' AND 'AS AVAILABLE' FOR YOUR USE, WITHOUT ANY REPRESENTATION, WARRANTIES OR CONDITIONS OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING ALL IMPLIED WARRANTIES OR CONDITIONS OF MERCHANTABILITY, MERCHANTABLE QUALITY, FITNESS FOR A PARTICULAR PURPOSE, DURABILITY, TITLE, AND NON-INFRINGEMENT. WE DO NOT GUARANTEE, REPRESENT OR WARRANT THAT YOUR USE OF THE SERVICES WILL BE UNINTERRUPTED, TIMELY, SECURE OR ERROR-FREE. SOME JURISDICTIONS LIMIT OR DO NOT ALLOW THE DISCLAIMER OF IMPLIED OR OTHER WARRANTIES SO THE ABOVE DISCLAIMER MAY NOT APPLY TO YOU.</p>

                <h3 className="text-xl font-semibold text-[#3f1f34] mt-8 uppercase tracking-wide">SECTION 16 - LIMITATION OF LIABILITY</h3>
                <p>TO THE FULLEST EXTENT PROVIDED BY LAW, IN NO CASE SHALL Hush Sweety, OUR PARTNERS, DIRECTORS, OFFICERS, EMPLOYEES, AFFILIATES, AGENTS, CONTRACTORS, SERVICE PROVIDERS OR LICENSORS, OR THOSE OF SHOPIFY AND ITS AFFILIATES, BE LIABLE FOR ANY INJURY, LOSS, CLAIM, OR ANY DIRECT, INDIRECT, INCIDENTAL, PUNITIVE, SPECIAL, OR CONSEQUENTIAL DAMAGES OF ANY KIND, INCLUDING, WITHOUT LIMITATION, LOST PROFITS, LOST REVENUE, LOST SAVINGS, LOSS OF DATA, REPLACEMENT COSTS, OR ANY SIMILAR DAMAGES, WHETHER BASED IN CONTRACT, TORT (INCLUDING NEGLIGENCE), STRICT LIABILITY OR OTHERWISE, ARISING FROM YOUR USE OF ANY OF THE SERVICES OR ANY PRODUCTS PROCURED USING THE SERVICES, OR FOR ANY OTHER CLAIM RELATED IN ANY WAY TO YOUR USE OF THE SERVICES OR ANY PRODUCT, INCLUDING, BUT NOT LIMITED TO, ANY ERRORS OR OMISSIONS IN ANY CONTENT, OR ANY LOSS OR DAMAGE OF ANY KIND INCURRED AS A RESULT OF THE USE OF THE SERVICES OR ANY CONTENT (OR PRODUCT) POSTED, TRANSMITTED, OR OTHERWISE MADE AVAILABLE VIA THE SERVICES, EVEN IF ADVISED OF THEIR POSSIBILITY.</p>

                <h3 className="text-xl font-semibold text-[#3f1f34] mt-8 uppercase tracking-wide">SECTION 17 - INDEMNIFICATION</h3>
                <p>You agree to indemnify, defend and hold harmless Hush Sweety, Shopify, and our affiliates, partners, officers, directors, employees, agents, contractors, licensors, and service providers from any losses, damages, liabilities or claims, including reasonable attorneys’ fees, payable to any third party due to or arising out of (1) your breach of these Terms of Service or the documents they incorporate by reference, (2) your violation of any law or the rights of a third party, or (3) your access to and use of the Services.</p>
                <p>We will notify you of any indemnifiable claim, provided that a failure to promptly notify will not relieve you of your obligations unless you are materially prejudiced. We may control the defense and settlement of such claim at your expense, including choice of counsel, but will not settle any claim requiring non-monetary obligations from you without your consent (not to be unreasonably withheld). You will cooperate in the defense of indemnified claims, including by providing relevant documents.</p>

                <h3 className="text-xl font-semibold text-[#3f1f34] mt-8 uppercase tracking-wide">SECTION 18 - SEVERABILITY</h3>
                <p>In the event that any provision of these Terms of Service is determined to be unlawful, void or unenforceable, such provision shall nonetheless be enforceable to the fullest extent permitted by applicable law, and the unenforceable portion shall be deemed to be severed from these Terms of Service, such determination shall not affect the validity and enforceability of any other remaining provisions.</p>

                <h3 className="text-xl font-semibold text-[#3f1f34] mt-8 uppercase tracking-wide">SECTION 19 - WAIVER; ENTIRE AGREEMENT</h3>
                <p>The failure of us to exercise or enforce any right or provision of these Terms of Service shall not constitute a waiver of such right or provision.</p>
                <p>These Terms of Service and any policies or operating rules posted by us on this site or in respect to the Service constitutes the entire agreement and understanding between you and us and governs your use of the Service, superseding any prior or contemporaneous agreements, communications and proposals, whether oral or written, between you and us (including, but not limited to, any prior versions of the Terms of Service).</p>
                <p>Any ambiguities in the interpretation of these Terms of Service shall not be construed against the drafting party.</p>

                <h3 className="text-xl font-semibold text-[#3f1f34] mt-8 uppercase tracking-wide">SECTION 20 - ASSIGNMENT</h3>
                <p>You may not delegate, transfer or assign this Agreement or any of your rights or obligations under these Terms without our prior written consent, and any such attempt will be null and void. We may transfer, assign, or delegate these Terms and our rights and obligations without consent or notice to you.</p>

                <h3 className="text-xl font-semibold text-[#3f1f34] mt-8 uppercase tracking-wide">SECTION 21 - GOVERNING LAW</h3>
                <p>These Terms of Service and any separate agreements whereby we provide you Services shall be governed by and construed in accordance with the federal and state or territorial courts in the jurisdiction where Hush Sweety is headquartered. You and Hush Sweety consent to venue and personal jurisdiction in such courts.</p>

                <h3 className="text-xl font-semibold text-[#3f1f34] mt-8 uppercase tracking-wide">SECTION 22 - HEADINGS</h3>
                <p>The headings used in this agreement are included for convenience only and will not limit or otherwise affect these Terms.</p>

                <h3 className="text-xl font-semibold text-[#3f1f34] mt-8 uppercase tracking-wide">SECTION 23 - CHANGES TO TERMS OF SERVICE</h3>
                <p>You can review the most current version of the Terms of Service at any time on this page.</p>
                <p>We reserve the right, in our sole discretion, to update, change, or replace any part of these Terms of Service by posting updates and changes to our website. It is your responsibility to check our website periodically for changes. We will notify you of any material changes to these Terms in accordance with applicable law, and such changes will be effective on the date specified in the notice. Your continued use of or access to the Services following the posting of any changes to these Terms of Service constitutes acceptance of those changes.</p>

                <h3 className="text-xl font-semibold text-[#3f1f34] mt-8 uppercase tracking-wide">SECTION 24 - CONTACT INFORMATION</h3>
                <p>Questions about the Terms of Service should be sent to us at <a href="mailto:support@hushsweety.com" className="text-[#7d2f56] hover:underline">support@hushsweety.com</a></p>
              </div>
            </section>
          }
        />
        <Route
          path="/contact-us"
          element={
            <section className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
              <h2 className="mb-6 text-center text-2xl font-semibold text-[#3f1f34] sm:mb-8 sm:text-3xl">Contact Us</h2>
              <div className="space-y-6 break-words rounded-2xl bg-white p-4 text-sm leading-relaxed text-[#6e5362] ring-1 ring-[#ebdde5] sm:p-8 sm:text-base">
                <p>If you have any questions or need to get in touch with us regarding your order, returns, or our policies, please use the contact details below.</p>

                <div className="space-y-4 mt-6">
                  <div>
                    <h3 className="text-lg font-semibold text-[#3f1f34]">General Support & Order Cancellations</h3>
                    <p>For order cancellations, questions about the Terms of Service, and any other general inquiries, please contact us at:</p>
                    <a href="mailto:support@hushsweety.com" className="text-[#7d2f56] hover:underline font-medium">support@hushsweety.com</a>
                  </div>

                  <div className="pt-4 border-t border-[#ebdde5]">
                    <h3 className="text-lg font-semibold text-[#3f1f34]">Faulty or Incorrect Items</h3>
                    <p>If you receive a faulty or incorrect item, please contact us as soon as possible with details and, where possible, photos:</p>
                    <a href="mailto:support@hushsweety.com" className="text-[#7d2f56] hover:underline font-medium">support@hushsweety.com</a>
                  </div>
                </div>
              </div>
            </section>
          }
        />
      </Routes>


      <footer className="safe-bottom mt-8 border-t border-[#e7d9e3] bg-white">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:gap-8 sm:px-6 sm:py-10 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
          <div>
            <Link to="/" className="text-lg text-[#7f395b]" style={brandWordmarkStyle}>Hush Sweety</Link>
            <p className="mt-3 text-sm leading-6 text-[#7b5a6e]">Discreet shipping, premium sets, and easy returns worldwide.</p>
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-[#5d3a4e]">Information</p>
            <div className="mt-3 grid gap-2">
              <a href="mailto:support@hushsweety.com" className="text-left text-sm text-[#7b5a6e] hover:text-[#9a3d6c]">support@hushsweety.com</a>
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-[#5d3a4e]">Help</p>
            <div className="mt-3 grid gap-2">
              <Link to="/return-and-refund-policy" className="text-left text-sm text-[#7b5a6e] hover:text-[#9a3d6c]">Delivery & Returns</Link>
              <Link to="/contact-us" className="text-left text-sm text-[#7b5a6e] hover:text-[#9a3d6c]">Contact Us</Link>
              <Link to="/terms-of-service" className="text-left text-sm text-[#7b5a6e] hover:text-[#9a3d6c]">Terms and Services</Link>
            </div>
          </div>
          <div className="rounded-2xl bg-[#fff6fa] p-4 ring-1 ring-[#efd8e4]">
            <p className="text-2xl font-semibold text-[#4f2e40]">Stay in the loop</p>
            <p className="mt-2 text-sm leading-6 text-[#7b5a6e]">
              Sign up to be the first to hear about new arrivals, exclusive offers, and upcoming drops.
            </p>
            <div className="mt-4 space-y-2">
              <input
                type="email"
                placeholder="Email Address"
                className="w-full rounded-md border border-[#d8bfd0] bg-white px-3 py-2.5 text-sm outline-none placeholder:text-[#a17f93] focus:border-[#b9638c]"
              />
              <button
                type="button"
                onClick={() => setNotice('Thanks for subscribing. You are now in the loop.')}
                className="w-full rounded-md bg-[#f6c9dd] px-4 py-2.5 text-sm font-semibold uppercase tracking-wider text-[#5a2f45] transition hover:bg-[#efb8d1]"
              >
                Subscribe
              </button>
            </div>
            <p className="mt-3 text-xs leading-5 text-[#8a6b7d]">
              See our full Terms and Conditions, Privacy and Cookie Policy to find out more.
            </p>
          </div>
        </div>
      </footer>
    </main>
  )
}

export default App
