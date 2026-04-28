import { useEffect, useMemo, useState } from 'react'
import { Link, NavLink, Route, Routes, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'

const navItems = [
  { label: 'New Arrivals', to: '/new-arrivals' },
  { label: 'Lingerie Sets', to: '/lingerie-sets' },
  { label: 'Nightwear', to: '/nightwear' },
  { label: 'Accessories', to: '/accessories' },
]

const dummyDescriptions = [
  'Designed with soft stretch lace and breathable lining for confidence and all-day comfort.',
  'A modern silhouette with delicate details, balancing elegance and everyday wearability.',
  'Boutique-inspired styling with premium finishing and smooth fit under any outfit.',
  'Crafted for flattering support using lightweight fabrics and adjustable comfort features.',
]

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
  2: { name: 'Whisper', price: '£24.99' },
  3: { name: 'Ivory Whispher Set', price: '£34.99' },
  9: { name: 'Midnight Muse', price: '£29.99' },
  13: { name: 'Obsidian Lace Bodysuit', price: '£39.99' },
  19: { name: 'Midnight Bloom', price: '£29.99' },
  22: { name: 'Midnight Bloom', price: '£29.99' },
  27: { name: 'Midnight Bloom', price: '£29.99' },
  36: { name: 'Blush Crush', price: '£29.99' },
  40: { name: 'Bow Babydoll', price: '£34.99' },
  43: { name: 'Whispher Bodyysuit', price: '£34.99' },
  48: { name: 'French Kiss Maid Set', price: '£34.99' },
  49: { name: 'French Kiss Maid Set', price: '£34.99' },
  1001: { name: 'Bride Bloom Set', price: '£39.99' },
  1002: { name: 'Bride Bloom Set', price: '£39.99' },
  1003: { name: 'Love Spell Set', price: '£19.99' },
  1005: { name: 'Love Lace Set', price: '£19.99' },
  1006: { name: 'sculptBodysuit', price: '£24.99' },
  1007: { name: 'Whispher Bodysuit', price: '£34.99' },
  1008: { name: 'Love Story Set', price: '£64.99' },
  1009: { name: 'Love Story Set', price: '£64.99' },
  1021: { name: 'Love Story Set', price: '£64.99' },
}

const applyProductOverride = (product) => {
  const override = productOverrides[product.id]
  return override ? { ...product, ...override } : product
}

function App() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const imageModules = import.meta.glob('./assets/images/*.jpeg', { eager: true, import: 'default' })
  const newImageModules = import.meta.glob('./assets/new/*.jpeg', { eager: true, import: 'default' })
  const videoModules = {
    ...import.meta.glob('./assets/images/*.MP4', { eager: true, import: 'default' }),
    ...import.meta.glob('./assets/images/*.MOV', { eager: true, import: 'default' }),
    ...import.meta.glob('./assets/images/*.mp4', { eager: true, import: 'default' }),
    ...import.meta.glob('./assets/images/*.mov', { eager: true, import: 'default' }),
  }
  const [bagItems, setBagItems] = useState([])
  const [notice, setNotice] = useState('')
  const [customerData, setCustomerData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    notes: '',
  })

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

    return productsWithSet54.map((product) => {
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
        return applyProductOverride({
          ...product,
          gallery: [product.src, imageQ.src, imageT.src, imageS.src],
        })
      }

      return applyProductOverride(product)
    })
  }, [imageModules])

  const heroImage = products[0]?.src
  const featureImage = products[1]?.src
  const extraLingerieProducts = useMemo(() => {
    const newImages = Object.entries(newImageModules)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([path, src]) => ({
        fileName: path.split('/').pop()?.replace('.jpeg', '').toLowerCase() ?? '',
        src,
      }))

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

    const customProducts = []

    if (imageA && imageB) {
      customProducts.push({
        id: 1001,
        src: imageA.src,
        gallery: [imageA.src, imageB.src],
        name: 'Luxe Set 1001',
        price: '£39.00',
        description: 'Combined product gallery for Luxe Set 1001. Scroll through 2 preview images for full product angles.',
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
      customProducts.push({
        id: 1004,
        src: imageF.src,
        gallery: [imageF.src],
        name: 'Luxe Set 1004',
        price: '£37.00',
        description: 'Single product preview for Luxe Set 1004.',
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

    if (imageOO) {
      customProducts.push({
        id: 1006,
        src: imageOO.src,
        gallery: [imageOO.src],
        name: 'Luxe Set 1006',
        price: '£38.00',
        description: 'Single product preview for Luxe Set 1006.',
      })
    }

    if (imageLL) {
      customProducts.push({
        id: 1007,
        src: imageBB?.src ?? imageLL.src,
        gallery: imageAA && imageBB ? [imageBB.src, imageAA.src, imageLL.src] : [imageLL.src],
        name: 'Luxe Set 1007',
        price: '£38.00',
        description:
          imageAA && imageBB
            ? 'Combined product gallery for Luxe Set 1007. Scroll through 3 preview images for full product angles.'
            : 'Single product preview for Luxe Set 1007.',
      })
    }

    return customProducts.map(applyProductOverride)
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
  const productsForLookup = [...products, ...extraLingerieProducts, ...extraNightwearProducts]
  const heroCategoryCards = [
    { label: 'Lingerie', productId: 9, sourcePath: '/lingerie-sets' },
    { label: 'Sex Toys', productId: 36, sourcePath: '/accessories' },
    { label: 'Erotic Lingerie', productId: 43, sourcePath: '/lingerie-sets' },
    { label: 'Nightwear', productId: 1008, sourcePath: '/nightwear' },
    { label: 'Bondage', productId: 22, sourcePath: '/accessories' },
    { label: 'Swimwear', productId: 27, sourcePath: '/new-arrivals' },
  ].map((item) => ({
    ...item,
    image: productsForLookup.find((product) => product.id === item.productId)?.src ?? heroImage,
  }))
  const featuredProducts = products.slice(2, 10)
  const lingerieSets = [...extraLingerieProducts, ...products.slice(0, Math.min(16, products.length))].filter(
    (item) => ![1, 54].includes(item.id),
  )
  const newArrivals = lingerieSets.slice(0, Math.min(12, lingerieSets.length))
  const nightwear = useMemo(() => {
    const baseNightwear = [...extraNightwearProducts, ...products.filter((_, index) => index % 2 === 0)].filter(
      (item) => item.id !== 57,
    )

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
  }, [extraNightwearProducts, products])
  const accessories = products.filter((_, index) => index % 3 === 0).filter((item) => item.id !== 57)
  const checkoutProductId = Number(searchParams.get('product'))
  const checkoutProduct = productsForLookup.find((item) => item.id === checkoutProductId) ?? bagItems[0] ?? null
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

  const addToBag = (product) => {
    setBagItems((prev) => [...prev, product])
    setNotice(`${product.name} added to bag.`)
  }

  const openCheckout = (product) => {
    navigate(`/checkout?product=${product.id}`)
    setNotice('')
  }

  const submitCustomerDetails = (event) => {
    event.preventDefault()
    navigate('/thank-you')
    setNotice(`Order confirmed for ${checkoutProduct ? checkoutProduct.name : 'selected item'}.`)
  }

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [location.pathname, location.search])

  const ProductGrid = ({ items, sourcePath }) => (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 lg:gap-6">
      {items.map((product) => (
        <article key={product.id} className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-[#efdfe8]">
          <Link to={`/product/${product.id}`} state={{ from: sourcePath }} className="block">
            <div className="aspect-[3/4] overflow-hidden sm:aspect-[4/5]">
              <img src={product.src} alt={product.name} className="h-full w-full object-cover transition duration-500 hover:scale-105" />
            </div>
          </Link>
          <div className="p-2.5 sm:p-4">
            <p className="text-[11px] uppercase tracking-wider text-[#8f6580] sm:text-sm sm:normal-case sm:tracking-normal">Bestseller</p>
            <h3 className="mt-1 line-clamp-2 text-sm font-medium leading-snug text-[#45253a] sm:text-lg">{product.name}</h3>
            <div className="mt-3 flex flex-col gap-2 sm:mt-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-semibold">{product.price}</p>
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
      <h2 className="text-2xl font-semibold text-[#3f1f34] sm:text-3xl">{title}</h2>
      <p className="mt-2 text-sm text-[#7d5d70]">Select any product card to open the product page.</p>
      <div className="mt-5 sm:mt-8">
        <ProductGrid items={items} sourcePath={sourcePath} />
      </div>
    </section>
  )

  const ProductDetailsPage = () => {
    const { id } = useParams()
    const product = productsForLookup.find((item) => item.id === Number(id))
    const [selectedPreview, setSelectedPreview] = useState(0)
    const showSetOfferNotice = product ? [1008, 1009, 1021].includes(product.id) : false
    const previousCollectionPath = location.state?.from
    const isAccessoryProduct = product ? accessories.some((item) => item.id === product.id) : false
    const isNightwearProduct = product ? nightwear.some((item) => item.id === product.id) : false
    const isNewArrivalProduct = product ? newArrivals.some((item) => item.id === product.id) : false
    const backPath = previousCollectionPath ?? (isAccessoryProduct ? '/accessories' : isNightwearProduct ? '/nightwear' : isNewArrivalProduct ? '/new-arrivals' : '/lingerie-sets')
    const backLabelMap = {
      '/accessories': 'Back to Accessories',
      '/nightwear': 'Back to Nightwear',
      '/new-arrivals': 'Back to New Arrivals',
      '/lingerie-sets': 'Back to Lingerie Sets',
    }
    const backLabel = backLabelMap[backPath] ?? 'Back to Collection'
    const productGallery =
      product?.id === 40 && extraGalleryImageForSet40
        ? [...product.gallery, extraGalleryImageForSet40]
        : product?.gallery ?? []
    const hasSinglePieceOptions = showSetOfferNotice && productGallery.length > 1
    const selectedSinglePiece = hasSinglePieceOptions && selectedPreview > 0
    const activeProductPrice = selectedSinglePiece ? '£19.99' : product?.price ?? ''
    const activeProductName =
      selectedSinglePiece && product
        ? `${product.name} - Single Piece ${selectedPreview}`
        : product?.name ?? ''

    useEffect(() => {
      setSelectedPreview(0)
    }, [id])

    if (!product) {
      return (
        <section className="mx-auto max-w-3xl px-6 py-12 text-center">
          <h2 className="text-3xl font-semibold text-[#3f1f34]">Product not found</h2>
          <Link to={backPath} className="mt-6 inline-block rounded-full bg-[#7d2f56] px-5 py-2.5 text-sm font-semibold uppercase tracking-wide text-white">
            {backLabel}
          </Link>
        </section>
      )
    }

    return (
      <section className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        <Link to={backPath} className="mb-6 inline-block rounded-full border border-[#dcc5d1] px-4 py-2 text-xs font-semibold uppercase tracking-wider hover:bg-white">
          {backLabel}
        </Link>
        <article className="grid gap-8 rounded-3xl bg-white p-6 ring-1 ring-[#ead9e4] md:grid-cols-2 md:p-8">
          <div>
            <img
              src={productGallery[selectedPreview] ?? product.src}
              alt={product.name}
              className="h-full w-full rounded-2xl object-cover"
            />
            {productGallery.length > 1 ? (
              <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
                {productGallery.map((preview, index) => (
                  <button
                    key={preview}
                    type="button"
                    onClick={() => setSelectedPreview(index)}
                    className={`h-20 w-16 shrink-0 overflow-hidden rounded-lg border ${selectedPreview === index ? 'border-[#7d2f56]' : 'border-[#dcc5d1]'}`}
                  >
                    <img src={preview} alt={`${product.name} preview ${index + 1}`} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            ) : null}
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a34977]">Product Detail</p>
            <h2 className="mt-3 text-4xl font-semibold text-[#3f1f34]">{activeProductName}</h2>
            <p className="mt-4 text-xl font-semibold text-[#662845]">{activeProductPrice}</p>
            <p className="mt-5 text-base leading-7 text-[#6e5362]">{product.description}</p>
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
                      className={`rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-wide ${
                        selectedPreview === index
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
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() =>
                  addToBag({
                    ...product,
                    name: activeProductName,
                    price: activeProductPrice,
                  })
                }
                className="rounded-full border border-[#d8bfd0] px-5 py-2.5 text-sm font-semibold uppercase tracking-wide hover:bg-[#fff0f7]"
              >
                Add to Bag
              </button>
              <button
                type="button"
                onClick={() =>
                  openCheckout({
                    ...product,
                    name: activeProductName,
                    price: activeProductPrice,
                  })
                }
                className="rounded-full bg-[#7d2f56] px-5 py-2.5 text-sm font-semibold uppercase tracking-wide text-white hover:bg-[#632242]"
              >
                Buy Now
              </button>
            </div>
          </div>
        </article>
      </section>
    )
  }

  return (
    <main className="min-h-screen bg-[#f9f5f7] text-[#2f1f2a]">
      <div className="bg-[#7d2f56] px-6 py-2 text-center text-sm font-semibold text-white">
        Free UK Standard delivery over £50 spend
      </div>
      <header className="border-b border-[#e7d9e3] bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          <Link to="/" className="text-2xl font-semibold tracking-[0.18em] text-[#7f395b]">Hush Sweety</Link>
          <nav className="hidden gap-8 text-sm font-medium md:flex">
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} className={({ isActive }) => `transition hover:text-[#bb4d7f] ${isActive ? 'text-[#7d2f56]' : ''}`}>
                {item.label}
              </NavLink>
            ))}
          </nav>
          <Link to="/bag" className="rounded-full border border-[#d8c0cf] px-4 py-2 text-xs font-semibold uppercase tracking-wider transition hover:bg-[#fff0f7]">
            My Bag ({bagItems.length})
          </Link>
        </div>
      </header>

      {notice ? <div className="mx-auto mt-4 max-w-7xl rounded-2xl bg-[#f6e7ef] px-4 py-3 text-sm text-[#7d2f56] lg:px-8">{notice}</div> : null}

      <Routes>
        <Route
          path="/"
          element={
            <>
              <section className="mx-auto max-w-7xl px-6 pt-6 lg:px-8">
                <article className="rounded-3xl bg-gradient-to-r from-[#7d2f56] to-[#b14f7f] px-6 py-5 text-white shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#f8d8ea]">Member Offer</p>
                  <h2 className="mt-2 text-2xl font-semibold leading-tight sm:text-3xl">
                    Sign up to emails and get 15% off on your first order
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-[#f7e4ee]">
                    Join our email list for early access to new drops, exclusive promotions, and your welcome 15% discount on your first order.
                  </p>
                  <Link to="/checkout" className="mt-5 inline-block rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[#7d2f56]">
                    Sign Up Now
                  </Link>
                </article>
              </section>

              <section className="mx-auto grid max-w-7xl gap-6 px-6 py-10 lg:grid-cols-5 lg:px-8">
                <article className="flex flex-col justify-center rounded-3xl bg-[#fff] p-8 shadow-sm ring-1 ring-[#f2e6ee] lg:col-span-3">
                  <p className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-[#b14f7f]">Spring Collection 2026</p>
                  <h1 className="max-w-xl text-4xl font-semibold leading-tight text-[#3f1f34] sm:text-5xl">Elegant intimatewear designed for confidence.</h1>
                  <p className="mt-5 max-w-lg text-base leading-7 text-[#755368]">Discover curated lingerie sets, soft mesh layers, and timeless silhouettes inspired by modern boutique styling.</p>
                  <div className="mt-8 flex flex-wrap gap-3">
                    <Link to="/lingerie-sets" className="rounded-full bg-[#7d2f56] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#6e284b]">Shop Lingerie Sets</Link>
                    <Link to="/new-arrivals" className="rounded-full border border-[#d6bccb] px-6 py-3 text-sm font-semibold transition hover:bg-[#fff0f7]">View Bestsellers</Link>
                  </div>
                </article>
                <article className="rounded-3xl bg-[#f1e6ed] p-5 lg:col-span-2">
                  <div className="grid grid-cols-2 gap-x-5 gap-y-6">
                    {heroCategoryCards.map((item) => (
                      <Link
                        key={item.label}
                        to={`/product/${item.productId}?from=${encodeURIComponent(item.sourcePath)}`}
                        state={{ from: item.sourcePath }}
                        className="flex flex-col items-center text-center"
                      >
                        <div className="h-28 w-28 overflow-hidden rounded-full bg-white ring-1 ring-[#ead9e4] sm:h-32 sm:w-32">
                          <img src={item.image} alt={item.label} className="h-full w-full object-cover" />
                        </div>
                        <p className="mt-2 text-sm font-medium text-[#3f1f34] sm:text-base">{item.label}</p>
                      </Link>
                    ))}
                  </div>
                </article>
              </section>

              <section className="mx-auto max-w-7xl px-6 pb-4 lg:px-8">
                <div className="flex flex-wrap gap-3">
                  <Link to="/lingerie-sets" className="rounded-full border border-[#dec8d4] bg-white px-4 py-2 text-sm text-[#6a455a] hover:border-[#c99ab2] hover:text-[#a14072]">Most Loved</Link>
                  <Link to="/new-arrivals" className="rounded-full border border-[#dec8d4] bg-white px-4 py-2 text-sm text-[#6a455a] hover:border-[#c99ab2] hover:text-[#a14072]">Romantic Lace</Link>
                  <Link to="/nightwear" className="rounded-full border border-[#dec8d4] bg-white px-4 py-2 text-sm text-[#6a455a] hover:border-[#c99ab2] hover:text-[#a14072]">Bold & Provocative</Link>
                  <Link to="/accessories" className="rounded-full border border-[#dec8d4] bg-white px-4 py-2 text-sm text-[#6a455a] hover:border-[#c99ab2] hover:text-[#a14072]">Perfect Gift</Link>
                  <Link to="/new-arrivals" className="rounded-full border border-[#dec8d4] bg-white px-4 py-2 text-sm text-[#6a455a] hover:border-[#c99ab2] hover:text-[#a14072]">Soft & Comfortable</Link>
                </div>
              </section>

              <section className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
                <div className="mb-6 flex items-end justify-between">
                  <h2 className="text-3xl font-semibold text-[#3f1f34]">Featured Lingerie Sets</h2>
                  <Link to="/lingerie-sets" className="text-sm font-semibold text-[#9a3d6c] hover:text-[#7d2f56]">View all products</Link>
                </div>
                <ProductGrid items={featuredProducts} sourcePath="/lingerie-sets" />
              </section>

              <section className="mx-auto grid max-w-7xl gap-6 px-6 py-10 lg:grid-cols-3 lg:px-8">
                <article className="overflow-hidden rounded-3xl bg-white ring-1 ring-[#efdfe8] lg:col-span-2">
                  <img src={featureImage} alt="Delicate lace details" className="h-[320px] w-full object-cover sm:h-[420px]" />
                </article>
                <article className="rounded-3xl bg-[#7d2f56] p-8 text-white">
                  <p className="text-xs uppercase tracking-[0.2em] text-[#f8d8ea]">Online Exclusive</p>
                  <h3 className="mt-3 text-3xl font-semibold leading-tight">Limited-Time Picks from Our Bestseller Edit</h3>
                  <p className="mt-4 text-sm leading-7 text-[#f3d6e6]">Explore statement silhouettes, signature lace details, and must-have pieces selected from our most-loved collection.</p>
                  <Link to="/lingerie-sets" className="mt-7 inline-block rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[#7d2f56]">Shop Bestsellers</Link>
                </article>
              </section>
            </>
          }
        />
        <Route path="/new-arrivals" element={<CollectionPage title="New Arrivals" items={newArrivals} sourcePath="/new-arrivals" />} />
        <Route path="/lingerie-sets" element={<CollectionPage title="Lingerie Sets" items={lingerieSets} sourcePath="/lingerie-sets" />} />
        <Route path="/nightwear" element={<CollectionPage title="Nightwear" items={nightwear} sourcePath="/nightwear" />} />
        <Route path="/accessories" element={<CollectionPage title="Accessories" items={accessories} sourcePath="/accessories" />} />
        <Route path="/product/:id" element={<ProductDetailsPage />} />
        <Route
          path="/bag"
          element={
            <section className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
              <h2 className="text-3xl font-semibold text-[#3f1f34]">My Bag</h2>
              {bagItems.length === 0 ? (
                <p className="mt-3 text-[#6e5362]">Your bag is empty. Add a product from the collection.</p>
              ) : (
                <div className="mt-6 grid gap-4">
                  {bagItems.map((item, index) => (
                    <article key={`${item.id}-${index}`} className="rounded-2xl bg-white p-4 ring-1 ring-[#ebdde5]">
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-sm text-[#6e5362]">{item.price}</p>
                    </article>
                  ))}
                </div>
              )}
              <div className="mt-8 flex gap-3">
                <Link to="/lingerie-sets" className="rounded-full border border-[#d8bfd0] px-5 py-2.5 text-sm font-semibold uppercase tracking-wide hover:bg-[#fff0f7]">Continue Shopping</Link>
                <Link to="/checkout" className="rounded-full bg-[#7d2f56] px-5 py-2.5 text-sm font-semibold uppercase tracking-wide text-white hover:bg-[#632242]">Checkout</Link>
              </div>
            </section>
          }
        />
        <Route
          path="/checkout"
          element={
            <section className="mx-auto max-w-3xl px-6 py-10 lg:px-8">
              <h2 className="text-3xl font-semibold text-[#3f1f34]">Customer Details</h2>
              <p className="mt-2 text-sm text-[#6e5362]">Complete details for {checkoutProduct ? checkoutProduct.name : 'your selected products'}.</p>
              <form onSubmit={submitCustomerDetails} className="mt-6 space-y-4 rounded-3xl bg-white p-6 ring-1 ring-[#ead9e4]">
                {[
                  { key: 'fullName', label: 'Full Name', type: 'text' },
                  { key: 'email', label: 'Email', type: 'email' },
                  { key: 'phone', label: 'Phone Number', type: 'tel' },
                  { key: 'address', label: 'Address', type: 'text' },
                  { key: 'city', label: 'City', type: 'text' },
                ].map((field) => (
                  <label key={field.key} className="block">
                    <span className="mb-1 block text-sm font-medium text-[#5d3a4e]">{field.label}</span>
                    <input
                      required
                      type={field.type}
                      value={customerData[field.key]}
                      onChange={(event) => setCustomerData((prev) => ({ ...prev, [field.key]: event.target.value }))}
                      className="w-full rounded-xl border border-[#ddc9d5] px-3 py-2 outline-none focus:border-[#b9638c]"
                    />
                  </label>
                ))}
                <label className="block">
                  <span className="mb-1 block text-sm font-medium text-[#5d3a4e]">Order Notes</span>
                  <textarea
                    rows="3"
                    value={customerData.notes}
                    onChange={(event) => setCustomerData((prev) => ({ ...prev, notes: event.target.value }))}
                    className="w-full rounded-xl border border-[#ddc9d5] px-3 py-2 outline-none focus:border-[#b9638c]"
                  />
                </label>
                <button type="submit" className="rounded-full bg-[#7d2f56] px-5 py-2.5 text-sm font-semibold uppercase tracking-wide text-white hover:bg-[#632242]">
                  Confirm Buy Now
                </button>
              </form>
            </section>
          }
        />
        <Route
          path="/thank-you"
          element={
            <section className="mx-auto max-w-3xl px-6 py-14 text-center lg:px-8">
              <h2 className="text-4xl font-semibold text-[#3f1f34]">Thank you for your order</h2>
              <p className="mt-4 text-[#6e5362]">Your customer details were submitted successfully. We will contact you shortly.</p>
              <Link to="/" className="mt-7 inline-block rounded-full bg-[#7d2f56] px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white hover:bg-[#632242]">Back to Home</Link>
            </section>
          }
        />
      </Routes>

      {landingVideos.length > 0 ? (
        <section className="mx-auto mt-6 max-w-7xl px-6 pb-10 lg:px-8">
          <div className="mb-5 flex items-end justify-between">
            <h2 className="text-3xl font-semibold text-[#3f1f34]">Style In Motion</h2>
            <p className="text-sm text-[#7d5d70]">A quick look at our latest collection videos.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {landingVideos.map((videoSrc, index) => (
              <article key={videoSrc} className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-[#efdfe8]">
                <video
                  src={videoSrc}
                  className="h-[360px] w-full object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                  controls
                  preload="metadata"
                />
                <div className="p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a34977]">Lookbook Clip {index + 1}</p>
                  <p className="mt-1 text-sm text-[#6e5362]">Signature details and fit highlights from the latest edit.</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <footer className="mt-8 border-t border-[#e7d9e3] bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-10 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
          <div>
            <Link to="/" className="text-lg font-semibold text-[#7f395b]">Hush Sweety</Link>
            <p className="mt-3 text-sm leading-6 text-[#7b5a6e]">Discreet shipping, premium sets, and easy returns across the UK.</p>
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-[#5d3a4e]">Shop</p>
            <div className="mt-3 grid gap-2">
              <Link to="/lingerie-sets" className="text-left text-sm text-[#7b5a6e] hover:text-[#9a3d6c]">Lingerie Sets</Link>
              <Link to="/nightwear" className="text-left text-sm text-[#7b5a6e] hover:text-[#9a3d6c]">Nightwear</Link>
              <Link to="/accessories" className="text-left text-sm text-[#7b5a6e] hover:text-[#9a3d6c]">Accessories</Link>
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-[#5d3a4e]">Help</p>
            <div className="mt-3 grid gap-2">
              <Link to="/checkout" className="text-left text-sm text-[#7b5a6e] hover:text-[#9a3d6c]">Delivery & Returns</Link>
              <Link to="/checkout" className="text-left text-sm text-[#7b5a6e] hover:text-[#9a3d6c]">Size Guide</Link>
              <Link to="/checkout" className="text-left text-sm text-[#7b5a6e] hover:text-[#9a3d6c]">Contact Us</Link>
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-[#5d3a4e]">Stay in Touch</p>
            <div className="mt-3 flex overflow-hidden rounded-full border border-[#dbc5d2]">
              <input type="email" placeholder="Email address" className="w-full px-4 py-2 text-sm outline-none placeholder:text-[#a17f93]" />
              <button type="button" onClick={() => setNotice('Thanks for joining our newsletter.')} className="bg-[#7d2f56] px-4 text-xs font-semibold uppercase tracking-wider text-white">
                Join
              </button>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}

export default App
