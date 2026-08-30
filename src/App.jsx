import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion, useScroll, useTransform, useReducedMotion } from 'framer-motion'
import { Retune } from 'retune'

const MOTION = { type: 'tween', ease: 'linear', duration: 0.18 }

/* Noontree dirham (AED) glyph — private-use codepoint U+E001 */
const DH = ''
function Dh() {
  return <span className="dh" aria-label="AED">{DH}</span>
}

export default function App() {
  return (
    <div className="stage">
      <div className="phone">
        <PDP />
      </div>
      <Retune force />
    </div>
  )
}

function PDP() {
  const [summaryOption, setSummaryOption] = useState(3)
  const [sheetOpen, setSheetOpen] = useState(false)
  // Global content mode (Normal / Head-sub) chosen from the toggle below the
  // top bar. It swaps the "Product at a glance" body across every option.
  const [contentMode, setContentMode] = useState('Normal')

  // Switching design options resets the option-4 sheet state so the widget
  // (and its streaming teaser) plays fresh each time it's re-selected.
  function selectOption(n) {
    setSummaryOption(n)
    setSheetOpen(false)
  }

  // Scroll-linked gallery: the product image shrinks as the page scrolls,
  // so the content sliding over the pinned gallery feels more interactive.
  const scrollRef = useRef(null)
  const { scrollY } = useScroll({ container: scrollRef })
  const imgScale = useTransform(scrollY, [0, 320], [1, 0.7], { clamp: true })
  const imgOpacity = useTransform(scrollY, [0, 260, 400], [1, 1, 0.35], { clamp: true })

  return (
    <div className="pdp">
      <StatusBar
        summaryOption={summaryOption}
        onSummaryOption={selectOption}
        contentMode={contentMode}
        onContentMode={setContentMode}
      />
      <div className="pdp-scroll" ref={scrollRef}>
        <Gallery imgScale={imgScale} imgOpacity={imgOpacity} />
        <div className="pdp-sections">
          {summaryOption === 2 && (
            <Option2Summary onOpen={() => setSheetOpen(true)} />
          )}
          <MainInfo />
          <Delivery />
          {summaryOption === 1 && <ProductGlance mode={contentMode} />}
          {summaryOption === 5 && <DetailsNoraSummary mode={contentMode} />}
          <PaymentOffers />
          <VariantPicker />
          <Trustmarkers />
          <ProductDetails summaryOption={summaryOption} contentMode={contentMode} />
          <AdditionalInfo />
          <SellerWidget />
          <Reviews />
        </div>
      </div>
      <BottomNav />
      {summaryOption === 2 && (
        <SummarySheet open={sheetOpen} onClose={() => setSheetOpen(false)} mode={contentMode} />
      )}
    </div>
  )
}

/* -------------------------------- Bottom nav ------------------------------- */
function NoraFab() {
  return (
    <button className="nora-fab" aria-label="Ask Nora">
      <img src="/icons/nora-flower.svg" alt="" width="24" height="26" />
    </button>
  )
}

function BottomNav() {
  return (
    <div className="pdp-bottomnav">
      <NoraFab />
      <div className="pdp-bottomnav-row">
        <div className="qty-box">
          <span className="qty-label">QTY</span>
          <span className="qty-val">1</span>
        </div>
        <button className="cta buy-now">Buy now</button>
        <button className="cta add-cart">Add to cart</button>
      </div>
      <div className="home-bar"><span /></div>
    </div>
  )
}

/* ----------------------------- Status bar + header ----------------------------- */
/* Shared top navigation. state 1: back + search(icon) + wishlist + share.
   state 2: back + search(pill) + share. */
function TopNav({ state = 1, onBack, center }) {
  return (
    <div className="tb-nav">
      <button className="tb-btn" onClick={onBack} aria-label="Back">
        <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden><path fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6"/></svg>
      </button>
      {center}
      <div className="tb-actions">
        {state === 2 ? (
          <motion.button
            className="tb-search"
            aria-label="Search"
            initial={{ width: 44 }}
            animate={{ width: 112 }}
            exit={{ width: 44 }}
            transition={{ type: 'tween', ease: [0.22, 0.61, 0.36, 1], duration: 0.32 }}
            style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2"/><path stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="m20 20-3.5-3.5"/></svg>
            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>Search</motion.span>
          </motion.button>
        ) : (
          <button className="tb-btn" aria-label="Search">
            <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="1.9"/><path stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" d="m20 20-3.5-3.5"/></svg>
          </button>
        )}
        {state === 1 && (
          <button className="tb-btn" aria-label="Wishlist">
            <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden><path fill="none" stroke="currentColor" strokeWidth="1.9" d="M12 20s-7-4.4-7-9.5A3.5 3.5 0 0 1 12 7a3.5 3.5 0 0 1 7 3.5C19 15.6 12 20 12 20z"/></svg>
          </button>
        )}
        <button className="tb-btn" aria-label="Share">
          <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden><path fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" d="M12 3v13M8 7l4-4 4 4M5 14v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5"/></svg>
        </button>
      </div>
    </div>
  )
}

function StatusBar({ summaryOption, onSummaryOption, contentMode, onContentMode }) {
  const toggle = (
    <div className="summary-toggle" role="group" aria-label="Product summary design">
      {/* Options 1, 2, 4 and 5 are parked while 3 and 6 are being compared. */}
      {[6, 3].map((n) => (
        <button
          key={n}
          className={`summary-toggle-btn${summaryOption === n ? ' on' : ''}`}
          onClick={() => onSummaryOption(n)}
          aria-pressed={summaryOption === n}
        >
          {n}
        </button>
      ))}
    </div>
  )
  return (
    <div className="pdp-topbar">
      <TopNav state={1} center={toggle} />
      <div className="mswitch content-toggle" role="group" aria-label="Summary content mode">
        {CONTENT_TABS.map((c) => (
          <button
            key={c}
            className={`mswitch-seg${contentMode === c ? ' on' : ''}`}
            onClick={() => onContentMode(c)}
            aria-pressed={contentMode === c}
          >
            {c}
          </button>
        ))}
      </div>
    </div>
  )
}

/* --------------------------------- Gallery --------------------------------- */
function Gallery({ imgScale, imgOpacity }) {
  return (
    <div className="gallery">
      <motion.img
        className="gallery-img"
        style={{ scale: imgScale, opacity: imgOpacity }}
        src="/anker-charger.png"
        alt="Anker 737 GaN USB-C charger"
      />
      <div className="gallery-dots">
        <span className="dot on" /><span className="dot" /><span className="dot" />
      </div>
    </div>
  )
}

/* -------------------------------- Main info -------------------------------- */
function InfoDot() {
  return <svg width="15" height="15" viewBox="0 0 24 24" className="i-info" aria-hidden><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.7"/><path fill="currentColor" d="M11 10h2v7h-2zm0-4h2v2h-2z"/></svg>
}

function MainInfo() {
  return (
    <section className="main-info">
      <div className="store-row">
        <span className="store-name">
          <svg width="17" height="17" viewBox="0 0 24 24" aria-hidden className="i-verified"><path fill="currentColor" d="m12 2 2.4 1.8 3 .1 1 2.8 2.4 1.8-1 2.8 1 2.8-2.4 1.8-1 2.8-3 .1L12 22l-2.4-1.8-3-.1-1-2.8L3.2 15.5l1-2.8-1-2.8 2.4-1.8 1-2.8 3-.1L12 2Z"/><path fill="#fff" d="m10.6 14.6-2-2-1.2 1.2 3.2 3.2 5.8-5.8-1.2-1.2z"/></svg>
          Anker
        </span>
        <button className="store-visit">Visit Store <Chev /></button>
      </div>

      <div className="mi-card">
      <button className="pdp-title">
        <span>USB C Plug, 735 Charger (Nano II 65W), PPS 3-Port Fast Compact USB C Charge&hellip;</span>
        <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden className="title-chev"><path fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6"/></svg>
      </button>

      <div className="rating-row">
        <span className="rating">
          <span className="rstar">★</span> 4.3 <span className="rmuted">(126 reviews)</span>
        </span>
        <span className="tag-prepaid">
          <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden><rect x="3" y="6" width="18" height="12" rx="2" fill="none" stroke="currentColor" strokeWidth="1.8"/><path stroke="currentColor" strokeWidth="1.8" d="M3 10h18"/></svg>
          Prepaid Only
        </span>
      </div>

      <div className="price-row">
        <span className="price-now"><Dh />109</span>
        <span className="price-was"><Dh />209</span>
        <span className="price-off">47% OFF</span>
        <span className="price-vat">(incl. of VAT)</span>
        <InfoDot />
      </div>

      <div className="combo-row">
        <img className="combo-ico" src="/icons/combo-icon.gif" alt="" width="20" height="20" />
        <span className="combo-txt">Saving <Dh />45 with Combo</span>
        <InfoDot />
      </div>

      <div className="unit-row">
        <span>500ml</span>
        <span className="unit-div" />
        <span><Dh />2.35/ml</span>
      </div>

      <div className="coupons">
        <span className="coupon">
          <CouponIcon /> Extra 15%, CODE: ENDD15
        </span>
        <span className="coupon">
          <CouponIcon /> Extra 10% o
        </span>
      </div>

      <button className="bestseller">
        <span className="bs-badge">
          <svg viewBox="0 0 16 16" aria-hidden><path fill="#1d2539" d="M8 0l1.6 1.2 2-.2.9 1.8 1.8.9-.2 2L15.9 8l-1.2 1.6.2 2-1.8.9-.9 1.8-2-.2L8 15.9l-1.6-1.2-2 .2-.9-1.8-1.8-.9.2-2L.1 8l1.2-1.6-.2-2 1.8-.9.9-1.8 2 .2z"/></svg>
          <span className="bs-badge-num">1</span>
        </span>
        <span className="bs-txt">Bestseller #1 in <a>Chargers</a></span>
        <Chev className="row-chev" />
      </button>
      </div>
    </section>
  )
}

function CouponIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden className="i-coupon">
      <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="1.6"/>
      <path stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" d="m8 16 8-8"/>
      <circle cx="9" cy="9" r="1.3" fill="currentColor"/><circle cx="15" cy="15" r="1.3" fill="currentColor"/>
    </svg>
  )
}

/* --------------------------------- Delivery -------------------------------- */
function Delivery() {
  return (
    <section className="card delivery">
      <div className="delivery-head">
        <h3>Delivery Information</h3>
        <span className="one-badge"><span className="one-pill">one</span> member</span>
      </div>
      <div className="delivery-express">
        <span className="express-pill">express</span>
        <span>Get it <b>Tomorrow before 12 PM</b></span>
      </div>
      <button className="row-item other-delivery">
        <span>Other Delivery Options</span>
        <Chev className="row-chev down" />
      </button>
    </section>
  )
}

/* --------------------- Product at a glance (AI summary) -------------------- */
// Content modes selected by the toggle below the top bar. Each mode swaps the
// summary body: Normal = plain bullets, Focus = the same bullets with the key
// phrase emphasised, Pair = a compact spec table, Head-sub = starred items with
// a bold head + descriptive sub-line (titled "Key summary"). "Good to know"
// rides along with the bullet modes; Pair/Head-sub carry their own last line.
const CONTENT_MODES = {
  Normal: {
    bullets: [
      [['Fast charges laptops and smartphones']],
      [['Power up 3 devices at once']],
      [['Works with MacBook, iPhone & Samsung']],
      [['Efficient GaN technology for less heat']],
      [['Compact enough for everyday travel']],
    ],
    goodToKnow: 'Does not support 240V power supply.',
  },
  Focus: {
    bullets: [
      [['65W fast charging', true], [' for laptops and phones']],
      [['Power up '], ['3 devices', true], [' at once']],
      [['Works with MacBook, iPhone & Samsung']],
      [['Efficient '], ['GaN technology', true], [' for less heat']],
      [['Compact', true], [' enough for everyday travel']],
    ],
    goodToKnow: 'Does not support 240V power supply.',
  },
  Pair: {
    table: [
      ['Charging', '65W Fast charging'],
      ['Usage', '3 devices'],
      ['Ports', '2 x USB + 1 USB-A'],
      ['Compatibility', 'Macbook, iPhone, Samsung'],
      ['Technology', 'GaN + PPS'],
    ],
  },
  'Head-sub': {
    title: 'Key summary',
    items: [
      ['Power 3 devices:', ' 65W fast charging for up to three devices simultaneously.'],
      ['Broad compatibility:', ' Works with MacBook, iPhone, Samsung, and other USB-C devices.'],
      ['Travel-ready design:', ' Compact GaN charger with efficient cooling.'],
      ['Keep in mind:', ' 240V power not supported'],
    ],
  },
}
const CONTENT_TABS = ['Normal', 'Head-sub']

function renderBullet(parts) {
  return parts.map(([t, bold], i) => (bold ? <b key={i}>{t}</b> : <span key={i}>{t}</span>))
}

function SumCheck({ src }) {
  if (src) return <img className="psum-check" src={src} alt="" aria-hidden />
  return (
    <svg className="psum-check" width="16" height="16" viewBox="0 0 16 16" aria-hidden>
      <path fill="none" stroke="#757ADB" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" d="M3.2 8.4l3 3 6.6-7"/>
    </svg>
  )
}

function InfoCircle() {
  return (
    <svg className="psum-info" width="16" height="16" viewBox="0 0 24 24" aria-hidden>
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.8"/>
      <path stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" d="M12 11v5"/>
      <circle cx="12" cy="7.7" r="1.1" fill="currentColor"/>
    </svg>
  )
}

function Sparkle() {
  return (
    <svg className="psum-star" width="10" height="20" viewBox="0 0 10 20" fill="none" aria-hidden>
      <path
        fill="url(#psum-star-grad)"
        d="M5.3842 6.20401C5.2523 5.84703 4.7477 5.84703 4.6158 6.20401C4.04161 7.75541 2.81856 8.97845 1.26773 9.55208C0.910756 9.68398 0.910756 10.1886 1.26773 10.3205C2.81913 10.8947 4.04217 12.1177 4.6158 13.6685C4.7477 14.0255 5.2523 14.0255 5.3842 13.6685C5.9584 12.1172 7.18144 10.8941 8.73227 10.3205C9.08924 10.1886 9.08924 9.68398 8.73227 9.55208C7.18087 8.97788 5.95783 7.75484 5.3842 6.20401Z"
      />
      <defs>
        <linearGradient id="psum-star-grad" x1="5" y1="5.93628" x2="5" y2="13.9363" gradientUnits="userSpaceOnUse">
          <stop stopColor="#E96CC4" />
          <stop offset="1" stopColor="#B06DFF" />
        </linearGradient>
      </defs>
    </svg>
  )
}

// A summary point that types in one character at a time (trailing characters
// fade 10% -> 100%, same effect as StreamingTeaser). The whole row — star
// included — stays unmounted until its `startDelay` elapses, so the star never
// shows ahead of its text; the row's height then animates open so the card
// grows smoothly instead of jumping.
function StreamRow({ as = 'li', className, before, text, speed = 18, startDelay = 0 }) {
  const [tick, setTick] = useState(-1)
  useEffect(() => {
    const t = setTimeout(() => setTick(0), startDelay)
    return () => clearTimeout(t)
  }, [startDelay])
  useEffect(() => {
    if (tick < 0 || tick >= text.length + 9) return
    const id = setTimeout(() => setTick((v) => v + 1), speed)
    return () => clearTimeout(id)
  }, [tick, text, speed])
  if (tick < 0) return null
  const MotionTag = motion[as]
  return (
    <MotionTag
      className={className}
      layout
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      transition={{ duration: 0.28, ease: 'easeOut' }}
    >
      {before}
      <span>
        {text.split('').map((ch, i) => {
          if (i > tick) return null
          const d = tick - i
          const opacity = d >= 9 ? 1 : 0.1 + (0.9 * d) / 9
          return <span key={i} style={{ opacity }}>{ch}</span>
        })}
      </span>
    </MotionTag>
  )
}

// Shared "Product at a glance" body — bullets (+ Good to know) or a spec table,
// selected by the active content mode. When streamStart is set, the final
// `streamLastN` bullets type in one after another instead of appearing at once.
function GlanceBody({ mode = 'Normal', checkAsset, showGoodToKnow = true, bulletAsset, streamLastN = 0, streamStart = false }) {
  const m = CONTENT_MODES[mode] || CONTENT_MODES.Normal
  const starMarker = bulletAsset
    ? <img className="psum-star-img" src={bulletAsset} alt="" aria-hidden width="20" height="20" />
    : null
  const bulletMarker = starMarker || <SumCheck src={checkAsset} />
  if (m.table) {
    return (
      <div className="psum-table">
        {m.table.map(([k, v]) => (
          <div className="psum-trow" key={k}>
            <span className="psum-tkey">{k}</span>
            <span className="psum-tval">{v}</span>
          </div>
        ))}
      </div>
    )
  }
  if (m.items) {
    return (
      <ul className="psum-list psum-list--headsub">
        {m.items.map(([head, sub], i) => (
          <li key={i}>
            {starMarker || <Sparkle />}
            <span><b className="psum-headsub-head">{head}</b>{sub}</span>
          </li>
        ))}
      </ul>
    )
  }
  return (
    <>
      <ul className="psum-list">
        {m.bullets.map((b, i) => {
          const streamed = streamLastN > 0 && i >= m.bullets.length - streamLastN
          if (streamed) {
            if (!streamStart) return null
            const plain = b.map(([t]) => t).join('')
            const order = i - (m.bullets.length - streamLastN)
            return <StreamRow key={i} before={bulletMarker} text={plain} startDelay={order * 620} />
          }
          return <li key={i}>{bulletMarker}{renderBullet(b)}</li>
        })}
      </ul>
      {showGoodToKnow && m.goodToKnow && (
        streamLastN > 0 ? (
          streamStart && (
            <div className="psum-know">
              <StreamRow as="p" className="psum-know-h" text="Good to know" startDelay={700} />
              <StreamRow as="div" className="psum-know-row" before={<InfoCircle />} text={m.goodToKnow} startDelay={1150} />
            </div>
          )
        ) : (
          <div className="psum-know">
            <p className="psum-know-h">Good to know</p>
            <div className="psum-know-row">
              <InfoCircle />
              <span>{m.goodToKnow}</span>
            </div>
          </div>
        )
      )}
    </>
  )
}

function ProductGlance({ mode }) {
  return (
    <section className="psum">
      <div className="psum-head">
        <span className="psum-title psum-title--shimmer">Product summary</span>
        <span className="psum-ai">Summarised by AI</span>
      </div>
      <GlanceBody mode={mode} />
      <div className="psum-foot">
        <span className="psum-foot-q">Still have a question about product?</span>
        <button className="psum-ask">
          <span className="psum-ask-txt">Ask Nora</span>
          <Chev className="psum-ask-chev" />
        </button>
      </div>
    </section>
  )
}

/* --------------- Option 2: below-image summary widget + sheet --------------- */
const WIDGET_TEASER = 'Fast GaN charger with 3-device charging, laptop support and travel-ready design.'

// Option 2: product-summary widget placed below the gallery (in flow,
// not overlapping). Streams a teaser first, then collapses to a compact
// title-only row 3s after the text finishes — or immediately when tapped.
// Tapping also opens the full summary sheet.
function Option2Summary({ onOpen }) {
  const streamedRef = useRef(false)
  const [compact, setCompact] = useState(false)
  const [streamDone, setStreamDone] = useState(false)

  // Collapse to compact 3s after the teaser finishes streaming.
  useEffect(() => {
    if (!streamDone || compact) return
    const id = setTimeout(() => setCompact(true), 3000)
    return () => clearTimeout(id)
  }, [streamDone, compact])

  return (
    <div
      className={`sumw sumw--inflow${compact ? ' sumw--compact' : ''}`}
      role="button"
      tabIndex={0}
      onClick={() => { setCompact(true); onOpen() }}
    >
      <img className="ai-glow" src="/icons/ai-glow.svg" alt="" aria-hidden />
      <div className="sumw-top">
        <span className="sumw-label">Product summary</span>
        <Chev className="sumw-chev" />
      </div>
      <div className={`sumw-teaser-wrap${compact ? ' compact' : ''}`}>
        <StreamingTeaser text={WIDGET_TEASER} streamedRef={streamedRef} className="sumw-teaser" onDone={() => setStreamDone(true)} />
      </div>
    </div>
  )
}

function SummarySheet({ open, onClose, mode }) {
  return (
    <div className={`cart-overlay sum-overlay${open ? ' open' : ''}`} onClick={onClose}>
      <div className="cart-sheet sum-sheet" onClick={(e) => e.stopPropagation()}>
        <img className="ai-glow" src="/icons/ai-glow.svg" alt="" aria-hidden />
        <div className="sum-head">
          <span className="sum-title">Product summary</span>
          <span className="psum-ai">Summarised by AI</span>
        </div>
        <GlanceBody mode={mode} />
        <button className="sum-okbtn" onClick={onClose}>Ok, Got it</button>
      </div>
    </div>
  )
}

/* ------------------------------ Payment offers ----------------------------- */
const PAY_OFFERS = [
  { img: '/icons/pay-noon-card.png', kind: 'card', inline: true },
  { img: '/icons/save-tabby.png', kind: 'logo', title: 'Get extra 5% cashback', sub: 'on using ENBD noon VISA credit card' },
  { img: '/icons/save-tamara.png', kind: 'logo', title: 'Split your payment in 4', sub: 'Pay zero interest on 4 instalments' },
]
function PaymentOffers() {
  return (
    <section className="card pay-offers">
      <h3 className="po-title">Payment offers</h3>
      <div className="po-rail">
        {PAY_OFFERS.map((o, i) => (
          <div className="po-card" key={i}>
            <span className={`po-icon po-icon-${o.kind}`}><img src={o.img} alt="" /></span>
            {o.inline ? (
              <p className="po-desc"><b>Get extra 5% cashback</b> using ENBD noon VISA credit card <a className="po-cta">Apply Now</a></p>
            ) : (
              <div className="po-stack">
                <p className="po-h">{o.title}</p>
                <p className="po-sub">{o.sub}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}

/* ------------------------------ Variant picker ----------------------------- */
const VP_COLOURS = [
  { name: '735 GaN', img: '/anker-charger.png' },
  { name: '735 GaN II', img: '/pab-wallcharger.jpg' },
  { name: '736 GaN II', img: '/pab-anker737.png' },
  { name: '736 GaN', img: '/pab-powerbank.png', oos: true },
]
function VariantPicker() {
  const [version, setVersion] = useState('UK 3 PIN')
  const [model, setModel] = useState('UK 3 PIN')
  const [colour, setColour] = useState('735 GaN II')
  return (
    <section className="card variant-picker">
      <div className="vp-group">
        <div className="vp-head">
          <h3 className="vp-title">Versions</h3>
          <button className="vp-link"><InfoDot /> Learn more</button>
        </div>
        <div className="vp-chips">
          {['UK 3 PIN', 'US 2 PIN'].map((v) => (
            <button key={v} className={`vp-chip${version === v ? ' on' : ''}`} onClick={() => setVersion(v)}>{v}</button>
          ))}
        </div>
      </div>
      <div className="vp-group">
        <div className="vp-head">
          <h3 className="vp-title">Charger Model</h3>
          <button className="vp-link">Size Guide <Chev className="row-chev" /></button>
        </div>
        <div className="vp-chips">
          {['UK 3 PIN', 'US 2 PIN'].map((v) => (
            <button key={v} className={`vp-chip${model === v ? ' on' : ''}`} onClick={() => setModel(v)}>{v}</button>
          ))}
        </div>
      </div>
      <div className="vp-group">
        <div className="vp-head">
          <h3 className="vp-title">Colour</h3>
          <button className="vp-link vp-viewall">View All</button>
        </div>
        <div className="vp-colours">
          {VP_COLOURS.map((c) => (
            <button
              key={c.name}
              className={`vp-colour${colour === c.name ? ' on' : ''}${c.oos ? ' oos' : ''}`}
              onClick={() => !c.oos && setColour(c.name)}
            >
              <span className="vp-colour-img">
                <img src={c.img} alt={c.name} />
                {c.oos && <span className="vp-oos">OUT OF STOCK</span>}
              </span>
              <span className="vp-colour-name">{c.name}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ------------------------------- Trustmarkers ------------------------------ */
function Trustmarkers() {
  const items = [
    { label: 'High\nRated', icon: '/icons/trust-return.svg' },
    { label: 'Low & Easy\nReturns', icon: '/icons/trust-verified.svg' },
    { label: 'Secure\nTransactions', icon: '/icons/trust-support.svg' },
  ]
  return (
    <section className="card trust-row">
      {items.map((it) => (
        <div className="trust-col" key={it.label}>
          <img className="trust-ico" src={it.icon} alt="" width="20" height="20" />
          <span className="trust-label">{it.label.split('\n').map((l, i) => <span key={i}>{l}</span>)}</span>
        </div>
      ))}
    </section>
  )
}

/* ----------------------------- Product details ----------------------------- */
// Reveals text one character at a time the first time it scrolls
// into view. The trailing 10 characters fade in (10% -> 100% opacity); older
// characters are already fully opaque. `streamedRef` remembers completion so
// re-showing the node (e.g. re-collapsing an accordion) doesn't replay it.
function StreamingTeaser({ text, streamedRef, className, onDone }) {
  const [tick, setTick] = useState(streamedRef.current ? text.length + 9 : -1)
  const elRef = useRef(null)
  const doneFiredRef = useRef(false)

  useEffect(() => {
    if (streamedRef.current) return
    const el = elRef.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setTick(0)
          io.disconnect()
        }
      },
      { threshold: 0.1 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [streamedRef])

  useEffect(() => {
    if (tick < 0) return
    const maxTick = text.length + 9
    if (tick >= maxTick) {
      streamedRef.current = true
      if (!doneFiredRef.current) {
        doneFiredRef.current = true
        onDone?.()
      }
      return
    }
    const id = setTimeout(() => setTick((t) => t + 1), 15)
    return () => clearTimeout(id)
  }, [tick, text, streamedRef, onDone])

  const revealedCount = tick < 0 ? 0 : Math.min(tick + 1, text.length)

  return (
    <p className={className} ref={elRef}>
      {text.split('').map((ch, i) => {
        if (i >= revealedCount) return null
        const distance = tick - i
        const opacity = distance >= 9 ? 1 : 0.1 + (0.9 * distance) / 9
        return <span key={i} style={{ opacity }}>{ch}</span>
      })}
    </p>
  )
}

function DetailAccordions() {
  const rows = ['Description', 'Highlights', 'Specifications']
  const [open, setOpen] = useState(null)
  return (
    <>
      {rows.map((r) => (
        <div className="accordion" key={r}>
          <button className="accordion-head" onClick={() => setOpen(open === r ? null : r)}>
            <span>{r}</span>
            <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden className={`acc-chev${open === r ? ' open' : ''}`}><path fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6"/></svg>
          </button>
          <AnimatePresence initial={false}>
            {open === r && (
              <motion.div className="accordion-body" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={MOTION}>
                <p>Compact 3-port GaN charger delivering up to 65W with PPS fast charging. Charge a MacBook Air, iPhone and AirPods simultaneously.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </>
  )
}

function AskNoraFoot() {
  return (
    <div className="det-foot">
      <span className="det-foot-q">Still have a question about product?</span>
      <button className="psum-ask">
        <span className="psum-ask-txt">Ask Nora</span>
        <Chev className="psum-ask-chev" />
      </button>
    </div>
  )
}

// Option 3: Product Details with an "AI Summary | All details" segmented switch.
// Defaults to the AI-summary view; its body follows the active content mode.
// "All details" swaps in the accordion list. Ask Nora stays pinned at the bottom
// of either tab.
function DetailsTabs({ mode }) {
  const [tab, setTab] = useState('ai')
  // Stream the last summary points in once the card is >70% in the viewport.
  const [streamStart, setStreamStart] = useState(false)
  const sectionRef = useRef(null)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].intersectionRatio >= 0.7) {
          setStreamStart(true)
          io.disconnect()
        }
      },
      { threshold: [0, 0.7, 1] }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <section className="card details det-card det-card--tabs" ref={sectionRef}>
      <h3 className="section-h det-h">Product Details</h3>
      <div className="det-body">
        <div className="mswitch det-switch" role="tablist" aria-label="Product details view">
          <button className={`mswitch-seg mswitch-seg--ai${tab === 'ai' ? ' on' : ''}`} role="tab" aria-selected={tab === 'ai'} onClick={() => setTab('ai')}>
            <img className="mswitch-ai-icon" src="/icons/ai-summary-sparkles.svg" alt="" aria-hidden />
            <span>AI Summary</span>
          </button>
          <button className={`mswitch-seg${tab === 'all' ? ' on' : ''}`} role="tab" aria-selected={tab === 'all'} onClick={() => setTab('all')}>All details</button>
        </div>
        {/* Only the middle panel morphs between tabs — the height eases and the
            content crossfades, while the Ask Nora footer below stays put. */}
        <motion.div className="det-swap" layout transition={{ duration: 0.26, ease: [0.22, 0.61, 0.36, 1] }}>
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={tab}
              style={{ width: '100%' }}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
            >
              {tab === 'ai' ? (
                <div className="det-glance">
                  <GlanceBody mode={mode} streamLastN={1} streamStart={streamStart} />
                </div>
              ) : (
                <div className="det-all">
                  <DetailAccordions />
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
      <AskNoraFoot />
    </section>
  )
}

// Option 4: Product Overview with an "AI mode" toggle in the header. ON shows
// the AI summary ("Summarized by nora AI"); OFF shows the normal accordions.
//
// The first time the section reaches ~50% visibility it plays a one-shot
// onboarding sequence that introduces AI mode: the label gradient sweeps toward
// the toggle, the toggle flips ON with a pulse, a soft ripple flows across the
// card, the accordions dissolve and the AI summary rises in. After it finishes
// (or under prefers-reduced-motion) the toggle is a plain interactive crossfade.
function DetailsAiToggle({ mode }) {
  const reduce = useReducedMotion()
  const [aiOn, setAiOn] = useState(false)
  const [sweep, setSweep] = useState(false)
  const [pulse, setPulse] = useState(false)
  const [reveal, setReveal] = useState(false)
  const [revealed, setRevealed] = useState(false)
  const [layerHeights, setLayerHeights] = useState({ initial: 0, summary: 0 })
  const [maskMetrics, setMaskMetrics] = useState({ x: 0, y: 0, radius: 480 })
  const sectionRef = useRef(null)
  const toggleRef = useRef(null)
  const stackRef = useRef(null)
  const initialLayerRef = useRef(null)
  const summaryLayerRef = useRef(null)
  const startedRef = useRef(false)
  const timersRef = useRef([])

  const updateMaskMetrics = () => {
    const toggle = toggleRef.current
    const stack = stackRef.current
    const summary = summaryLayerRef.current
    if (!toggle || !stack || !summary) return

    const toggleRect = toggle.getBoundingClientRect()
    const stackRect = stack.getBoundingClientRect()
    const summaryHeight = summary.getBoundingClientRect().height
    // The ON-position thumb center sits 8px in from the track's right edge.
    const x = toggleRect.right - 8 - stackRect.left
    const y = toggleRect.top + toggleRect.height / 2 - stackRect.top
    const width = stackRect.width
    const height = Math.max(summaryHeight, stackRect.height)
    const radius = Math.ceil(Math.max(
      Math.hypot(x, y),
      Math.hypot(width - x, y),
      Math.hypot(x, height - y),
      Math.hypot(width - x, height - y),
    ) + 36)
    setMaskMetrics({ x, y, radius })
  }

  useLayoutEffect(() => {
    const initialLayer = initialLayerRef.current
    const summaryLayer = summaryLayerRef.current
    if (!initialLayer || !summaryLayer) return

    const update = () => {
      const next = {
        initial: Math.ceil(initialLayer.getBoundingClientRect().height),
        summary: Math.ceil(summaryLayer.getBoundingClientRect().height),
      }
      setLayerHeights((current) => (
        current.initial === next.initial && current.summary === next.summary ? current : next
      ))
      updateMaskMetrics()
    }
    update()
    const observer = new ResizeObserver(update)
    observer.observe(initialLayer)
    observer.observe(summaryLayer)
    window.addEventListener('resize', update)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', update)
    }
  }, [mode])

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const run = () => {
      if (startedRef.current) return
      startedRef.current = true
      const T = timersRef.current
      if (reduce) {
        // Reduced motion: skip the flourish and expose the AI layer directly.
        T.push(setTimeout(() => {
          updateMaskMetrics(); setAiOn(true); setRevealed(true)
        }, 200))
        return
      }
      T.push(setTimeout(() => setSweep(true), 400))             // gradient sweeps label
      T.push(setTimeout(() => {                                  // gradient reaches toggle
        updateMaskMetrics(); setSweep(false); setAiOn(true); setPulse(true); setReveal(true); setRevealed(false)
      }, 900))
      T.push(setTimeout(() => setPulse(false), 1400))
      // Reveal the second layer from the thumb center; the ripple shares this
      // exact origin, radius, easing, and 800ms duration.
      T.push(setTimeout(() => {
        setReveal(false); setRevealed(true)
      }, 1700))
    }
    const io = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) { io.disconnect(); run() } },
      { threshold: 0.5 }
    )
    io.observe(el)
    return () => { io.disconnect(); timersRef.current.forEach(clearTimeout) }
  }, [reduce])

  const handleToggle = () => {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
    startedRef.current = true
    setSweep(false)
    setPulse(false)
    setReveal(false)

    if (aiOn) {
      setAiOn(false)
      setRevealed(false)
      return
    }

    updateMaskMetrics()
    setAiOn(true)
    if (reduce) {
      setRevealed(true)
      return
    }
    setPulse(true)
    setReveal(true)
    setRevealed(false)
    timersRef.current.push(setTimeout(() => setPulse(false), 500))
    timersRef.current.push(setTimeout(() => {
      setReveal(false); setRevealed(true)
    }, 800))
  }

  const activeHeight = aiOn ? layerHeights.summary : layerHeights.initial
  const stackStyle = {
    '--ai-mask-origin-x': `${maskMetrics.x}px`,
    '--ai-mask-origin-y': `${maskMetrics.y}px`,
    '--ai-mask-max-radius': `${maskMetrics.radius}px`,
    height: activeHeight || 0,
  }

  return (
    <section className="card details det-card" ref={sectionRef}>
      <div className="det-head-row">
        <h3 className="section-h det-h">Product Overview</h3>
        <button
          className={`ai-mode${aiOn ? ' on' : ''}`}
          role="switch"
          aria-checked={aiOn}
          onClick={handleToggle}
        >
          <span className={`ai-mode-label${sweep ? ' sweeping' : ''}`}>AI Summary</span>
          <span ref={toggleRef} className={`ai-toggle${pulse ? ' pulsing' : ''}`}><span className="ai-toggle-knob" /></span>
        </button>
      </div>
      <div className="det-body det-body--nofoot">
        <motion.div
          ref={stackRef}
          className="det-swap det-layer-stack"
          style={stackStyle}
        >
          <div
            ref={initialLayerRef}
            className={`det-layer det-layer--initial${reveal ? ' is-fading' : ''}${revealed ? ' is-hidden' : ''}`}
            aria-hidden={aiOn}
            inert={aiOn ? '' : undefined}
          >
            <div className="det-all"><DetailAccordions /></div>
          </div>
          <div
            ref={summaryLayerRef}
            className={`det-layer det-layer--summary${aiOn ? ' is-active' : ''}${reveal ? ' is-revealing' : ''}${revealed ? ' is-revealed' : ''}`}
            aria-hidden={!aiOn}
            inert={aiOn ? undefined : ''}
          >
            <div className="det-glance">
              <span className="det-glance-title">Summarized by nora AI</span>
              <GlanceBody mode={mode} />
            </div>
          </div>
          {reveal && <span className="det-layer-ripple" aria-hidden />}
        </motion.div>
      </div>
    </section>
  )
}

// Option 5: a persistent AI product summary with Nora follow-up prompts.
// Its body follows the global content mode while the Nora details remain fixed.
function DetailsNoraSummary({ mode }) {
  const suggestions = ['Compare models', 'Is it worth buying?', 'Warranty']
  const [questionActive, setQuestionActive] = useState(false)
  // Stream the last summary points in once the section is >70% in the viewport.
  const [streamStart, setStreamStart] = useState(false)
  const sectionRef = useRef(null)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].intersectionRatio >= 0.7) {
          setStreamStart(true)
          io.disconnect()
        }
      },
      { threshold: [0, 0.7, 1] }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  function handleQuestionSubmit(event) {
    event.preventDefault()
  }

  return (
    <section className="nora-summary" ref={sectionRef}>
      <div className="nora-summary-head">
        <span className="nora-summary-title nora-summary-title--shimmer">Product at a glance</span>
        <span className="nora-summary-byline">Summarised by nora AI</span>
      </div>
      <div className="nora-summary-content">
        <div className="nora-glance-card">
          <GlanceBody
            mode={mode}
            bulletAsset="/icons/nora-summary-star.svg"
            showGoodToKnow={false}
            streamLastN={2}
            streamStart={streamStart}
          />
        </div>
      </div>
      <div className="nora-summary-more">
        <img className="nora-summary-glow" src="/icons/nora-summary-glow.svg" alt="" aria-hidden />
        <div className="nora-summary-more-head">
          <span>Know more with nora AI</span>
        </div>
        <div className="nora-suggestions">
          {suggestions.map((suggestion) => (
            <button className="nora-suggestion" key={suggestion}>
              <img src="/icons/nora-suggestion-arrow.svg" alt="" aria-hidden />
              <span>{suggestion}</span>
            </button>
          ))}
        </div>
        <form className="nora-question" onSubmit={handleQuestionSubmit}>
          <input
            type="text"
            aria-label="Ask Nora about this product"
            placeholder="Ask me about “Charging specs”"
            autoComplete="off"
            enterKeyHint="send"
            onFocus={() => setQuestionActive(true)}
          />
          <button
            className={`nora-question-send${questionActive ? ' is-active' : ''}`}
            type="submit"
            aria-label="Send question"
            disabled={!questionActive}
          >
            <span className="nora-question-send-icon" aria-hidden />
          </button>
        </form>
      </div>
    </section>
  )
}

/* ------------- Option 6: Product Overview with a peek-and-expand summary ------------ */
// Figma "PDP-new-features" → Product Overview (24239:630686 collapsed,
// 24239:630775 expanded). The AI summary is the first row of Product Overview:
// a gradient card clipped to a partial view (~2½ lines) behind a soft fade that
// expands on tap. When the card scrolls into view, the last two lines of that
// partial view type in.
const OV_COLLAPSED = 68 // clipped list height: two 20px lines + a 10px gap + an 18px sliver
const OV_SPEED = 18     // ms per character — same cadence as StreamRow
const OV_ROW_GAP = 260  // pause before the next row starts typing

// The Figma content is the head + sub copy. The Normal content mode has no
// heads, so option 6 keeps the head-sub rows in either mode.
function overviewRows(mode) {
  const m = CONTENT_MODES[mode] || {}
  const items = m.items || CONTENT_MODES['Head-sub'].items
  return items.map(([head, sub]) => ({ text: `${head}${sub}`, boldLen: head.length }))
}

// Every character is its own span, so the real line boxes can be measured after
// layout: whichever characters open the last two lines of the collapsed window
// are the ones that stream in.
//
// The typing itself writes span.style.opacity directly instead of re-rendering.
// React never owns those inline styles, so they survive re-renders (expanding
// the card) — and a tick costs ten style writes rather than a full re-render of
// every character in the summary.
function OverviewSummary({ mode, open, onToggle, streamStart }) {
  const rows = overviewRows(mode)
  const listRef = useRef(null)
  const charsRef = useRef([])
  const starsRef = useRef([])
  const [plan, setPlan] = useState(null) // ordered [{ row, i }] of streamed characters

  useLayoutEffect(() => {
    const list = listRef.current
    if (!list) return
    // Measure with every character visible, so line boxes are the real ones.
    charsRef.current.forEach((row) => (row || []).forEach((span) => { if (span) span.style.opacity = '' }))
    starsRef.current.forEach((star) => { if (star) star.style.opacity = '' })
    const listTop = list.getBoundingClientRect().top
    const lines = []
    charsRef.current.slice(0, rows.length).forEach((row, r) => {
      let top = null
      ;(row || []).forEach((span, i) => {
        if (!span || !span.textContent.trim()) return
        const y = Math.round(span.getBoundingClientRect().top - listTop)
        if (top === null || y - top > 1) {
          lines.push({ row: r, i, y })
          top = y
        }
      })
    })
    const peek = lines.filter((l) => l.y < OV_COLLAPSED)
    const first = peek[peek.length - 2] || peek[0]
    const last = peek[peek.length - 1]
    if (!first || !last) {
      setPlan([])
      return
    }
    const order = []
    for (let r = first.row; r <= last.row; r++) {
      for (let i = r === first.row ? first.i : 0; i < charsRef.current[r].length; i++) {
        order.push({ row: r, i })
      }
    }
    setPlan(order)
  }, [mode])

  // Characters waiting to be typed keep their space (opacity 0 via .is-typing)
  // so nothing reflows; a row whose stream starts at its first character also
  // holds its star back, so the marker never sits ahead of the copy.
  const typing = useMemo(() => {
    const chars = new Set()
    const stars = new Set()
    ;(plan || []).forEach((c) => {
      chars.add(`${c.row}:${c.i}`)
      if (c.i === 0) stars.add(c.row)
    })
    return { chars, stars }
  }, [plan])

  useEffect(() => {
    if (!streamStart || !plan || !plan.length) return
    let pos = 0
    let timer
    const step = () => {
      // Reveal the head character and refresh the 9-character fade behind it.
      for (let k = Math.max(0, pos - 9); k <= pos && k < plan.length; k++) {
        const c = plan[k]
        const span = charsRef.current[c.row] && charsRef.current[c.row][c.i]
        if (!span) continue
        const d = pos - k
        span.style.opacity = d >= 9 ? '1' : String(0.1 + (0.9 * d) / 9)
      }
      const head = plan[pos]
      if (head && head.i === 0 && starsRef.current[head.row]) {
        starsRef.current[head.row].style.opacity = '1'
      }
      pos += 1
      if (pos >= plan.length + 9) return
      const crossesRow = plan[pos] && plan[pos - 1] && plan[pos].row !== plan[pos - 1].row
      timer = setTimeout(step, crossesRow ? OV_ROW_GAP : OV_SPEED)
    }
    timer = setTimeout(step, 0)
    return () => clearTimeout(timer)
  }, [streamStart, plan])

  return (
    <div
      className={`ov-sum${open ? ' is-open' : ''}`}
      role="button"
      tabIndex={0}
      aria-expanded={open}
      onClick={onToggle}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onToggle() }
      }}
    >
      <div className="ov-sum-head-row">
        <span className="ov-sum-title">Summarised by AI</span>
        <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden className={`acc-chev ov-sum-chev${open ? ' open' : ''}`}>
          <path fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6"/>
        </svg>
      </div>
      <motion.div
        className="ov-sum-clip"
        initial={false}
        animate={{ height: open ? 'auto' : OV_COLLAPSED }}
        transition={{ duration: 0.28, ease: [0.22, 0.61, 0.36, 1] }}
      >
        <ul className="psum-list psum-list--headsub ov-sum-list" ref={listRef}>
          {rows.map((row, r) => {
            if (!charsRef.current[r]) charsRef.current[r] = []
            return (
              <li key={r}>
                <span
                  className={`ov-sum-star${typing.stars.has(r) ? ' is-typing' : ''}`}
                  ref={(el) => { starsRef.current[r] = el }}
                >
                  <Sparkle />
                </span>
                <span className="ov-sum-text">
                  {row.text.split('').map((ch, i) => (
                    <span
                      key={i}
                      ref={(el) => { charsRef.current[r][i] = el }}
                      className={`${i < row.boldLen ? 'ov-sum-b' : ''}${typing.chars.has(`${r}:${i}`) ? ' is-typing' : ''}`}
                    >
                      {ch}
                    </span>
                  ))}
                </span>
              </li>
            )
          })}
        </ul>
      </motion.div>
      <AnimatePresence initial={false}>
        {!open && (
          <motion.span
            className="ov-sum-fade"
            aria-hidden
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function DetailsOverviewCollapse({ mode }) {
  const [open, setOpen] = useState(false)
  const [streamStart, setStreamStart] = useState(false)
  const sectionRef = useRef(null)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].intersectionRatio >= 0.7) {
          setStreamStart(true)
          io.disconnect()
        }
      },
      { threshold: [0, 0.7, 1] }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <section className="card details det-card ov-card" ref={sectionRef}>
      <h3 className="section-h det-h">Product Overview</h3>
      <div className="det-body det-body--nofoot">
        <OverviewSummary
          mode={mode}
          open={open}
          streamStart={streamStart}
          onToggle={() => { setStreamStart(true); setOpen((v) => !v) }}
        />
        <div className="det-all"><DetailAccordions /></div>
      </div>
    </section>
  )
}

function ProductDetails({ summaryOption, contentMode }) {
  if (summaryOption === 3) return <DetailsTabs mode={contentMode} />
  if (summaryOption === 4) return <DetailsAiToggle mode={contentMode} />
  if (summaryOption === 6) return <DetailsOverviewCollapse mode={contentMode} />
  return (
    <section className="card details">
      <h3 className="section-h">Product Details</h3>
      <DetailAccordions />
    </section>
  )
}

/* --------------------------- Additional information -------------------------- */
function AdditionalInfo() {
  const rows = [
    { label: 'Not eligible for returns', icon: <path fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" d="M3 8l4-4h10l4 4v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1zM3 8h18M9 12h6"/> },
    { label: 'Free delivery with Lockers & Pickup', icon: <path fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" d="M5 4h14v16H5zM9 4v6l3-2 3 2V4"/> },
    { label: '1 year warranty applicable', icon: <path fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" d="M12 3l7 3v5c0 4.4-3 8.3-7 9.5C8 19.3 5 15.4 5 11V6zM9.5 12l1.8 1.8L15 10"/> },
  ]
  return (
    <section className="card add-info">
      <h3 className="section-h">Additional Information</h3>
      {rows.map((r) => (
        <button className="row-item info-row" key={r.label}>
          <span className="info-ico">
            <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>{r.icon}</svg>
          </span>
          <span className="info-label">{r.label}</span>
          <Chev className="row-chev" />
        </button>
      ))}
    </section>
  )
}

/* ------------------------------- Seller widget ------------------------------ */
function SellerWidget() {
  const chips = ['Low Return Seller', 'Great Recent Ratings', 'Partner Since 5+ Years', 'Item as Described 100%']
  return (
    <section className="card seller">
      <div className="seller-head">
        <span className="seller-logo">
          <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden fill="currentColor"><path d="M16.4 12.6c0-2 1.6-3 1.7-3-.9-1.4-2.4-1.5-2.9-1.6-1.2-.1-2.4.7-3 .7-.6 0-1.6-.7-2.6-.7-1.3 0-2.6.8-3.3 2-1.4 2.4-.4 6 1 8 .7 1 1.4 2 2.5 2 1 0 1.3-.6 2.5-.6s1.5.6 2.5.6 1.7-1 2.4-2c.7-1.1 1-2.1 1-2.2 0 0-1.9-.7-1.9-2.9zM14.5 6.4c.5-.7.9-1.6.8-2.5-.8 0-1.7.5-2.3 1.2-.5.6-.9 1.5-.8 2.4.9 0 1.8-.5 2.3-1.1z"/></svg>
        </span>
        <div className="seller-meta">
          <button className="seller-name">Sold by <b>Anker UAE Inc.</b> <Chev /></button>
          <div className="seller-rating">
            <span className="rstar">★</span> 4.3 <span className="rmuted">(128)</span>
            <span className="seller-pos"><b>74% Positive</b> Seller Ratings</span>
          </div>
        </div>
      </div>

      <div className="seller-chips">
        {chips.map((c) => (
          <span className="seller-chip" key={c}>
            <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden><path fill="currentColor" d="M12 3l2.5 5 5.5.8-4 3.9.9 5.5L12 16.6 7.1 18.2l.9-5.5-4-3.9L9.5 8z"/></svg>
            {c === 'Item as Described 100%'
              ? <span>Item as Described <b className="emerald">100%</b></span>
              : <span>{c}</span>}
          </span>
        ))}
      </div>

      <button className="seller-offers">
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden className="i-tag"><path fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" d="M3 11V4h7l10 10-7 7L3 11z"/><circle cx="7.5" cy="7.5" r="1.3" fill="currentColor"/></svg>
        <span>5 offers from other sellers from <span className="offers-price"><Dh />649</span></span>
        <Chev className="row-chev" />
      </button>
    </section>
  )
}

/* ------------------------------ Ratings & Reviews ----------------------------- */
const REVIEW_SUMMARY = [
  'The portrait mode includes a fantastic wide-angle',
  'Users appreciate the overall performance of phone.',
  'Enjoy the wide-angle capability while using portrait a fantastic wide-angle',
  'Users appreciate the overall performance of this phone.',
]
const REVIEW_PHOTOS = ['/icons/rev-photo-1.png', '/icons/rev-photo-2.png', '/icons/rev-photo-3.png', '/icons/rev-photo-1.png']
const TOP_REVIEWS = [
  {
    id: 'r1', name: 'John Anderson', stars: 4, verified: true, when: '8 days ago',
    specs: ['Mac OS', '8 GB RAM', 'Internal Version', '256 GB'],
    title: 'This is simply amazing!',
    body: 'If the camera had the wide angle feature in the portrait mode. If the camera has more fe..',
    more: 'More', helpful: 15, photos: ['/icons/rev-photo-1.png', '/icons/rev-photo-2.png'],
  },
  {
    id: 'r2', name: 'John Anderson', stars: 5, source: 'from trusted source', when: '6 months ago',
    specs: ['Mac OS', '8 GB RAM', 'Internal Version', '256 GB'],
    title: 'This is simply amazing!',
    body: 'If the camera had the wide angle feature in the portrait mode. If the camera has more fewer features than than the last one it will be worse better than others.',
    more: 'Less', helpful: 14, photos: ['/icons/rev-photo-1.png', '/icons/rev-photo-2.png'],
  },
]

function Stars({ value, size = 15 }) {
  return (
    <span className="rv-stars" aria-label={`${value} out of 5`}>
      {[0, 1, 2, 3, 4].map((i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24" aria-hidden className={i < value ? 'on' : ''}>
          <path fill="currentColor" d="M12 3l2.5 5 5.5.8-4 3.9.9 5.5L12 16.6 7.1 18.2l.9-5.5-4-3.9L9.5 8z"/>
        </svg>
      ))}
    </span>
  )
}

function Reviews() {
  return (
    <section className="card reviews">
      <h3 className="section-h">Ratings &amp; Reviews</h3>

      <div className="rv-summary-top">
        <span className="rv-score">4.8</span>
        <Stars value={5} size={20} />
        <button className="rv-info" aria-label="About ratings">
          <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.8"/><path stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M12 11v5M12 8h.01"/></svg>
        </button>
      </div>
      <p className="rv-sub">Avg. rating based on 64 reviews from trusted sources</p>

      <button className="rv-ai">
        <span className="rv-ai-txt"><b>64 reviews</b>, summarised by <b className="rv-ai-noon">noon AI</b></span>
        <svg className="rv-ai-spark" width="16" height="16" viewBox="0 0 24 24" aria-hidden><path fill="currentColor" d="M12 2l1.6 5.4L19 9l-5.4 1.6L12 16l-1.6-5.4L5 9l5.4-1.6z"/></svg>
      </button>
      <ul className="rv-bullets">
        {REVIEW_SUMMARY.map((t, i) => <li key={i}>{t}</li>)}
      </ul>

      <h4 className="rv-h">Photo Reviews (64)</h4>
      <div className="rv-photos">
        {REVIEW_PHOTOS.map((src, i) => <img key={i} src={src} alt="review" />)}
      </div>

      <h4 className="rv-h">Top Reviews (64)</h4>
      {TOP_REVIEWS.map((r) => (
        <div className="rv-card" key={r.id}>
          <div className="rv-card-head">
            <span className="rv-name">{r.name}</span>
            {r.verified && (
              <span className="rv-verified">
                <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden><circle cx="12" cy="12" r="10" fill="var(--emerald)"/><path fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" d="M7 12.5l3.2 3.2L17 9"/></svg>
                Verified Buy
              </span>
            )}
          </div>
          <div className="rv-card-sub">
            <Stars value={r.stars} />
            <span className="rv-when">{r.source ? `${r.source} · ${r.when}` : r.when}</span>
          </div>
          <div className="rv-specs">
            {r.specs.map((s) => <span className="rv-spec" key={s}>{s}</span>)}
          </div>
          <div className="rv-viewprod">
            <span>Dual core memory</span>
            <button className="rv-vp-link">View product <Chev className="rv-vp-chev" /></button>
          </div>
          <div className="rv-title">{r.title}</div>
          <p className="rv-body">{r.body} <span className="rv-more">{r.more}</span></p>
          <button className="rv-translate">Translate to <span className="rv-ar">عربي</span></button>
          <div className="rv-card-photos">
            {r.photos.map((src, i) => <img key={i} src={src} alt="review" />)}
          </div>
          <button className="rv-helpful">
            <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden><path fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" d="M7 11v9H4a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1zM7 11l4-8a2 2 0 0 1 2 2v3h5a2 2 0 0 1 2 2.3l-1.2 7A2 2 0 0 1 17.8 20H7"/></svg>
            Helpful ({r.helpful})
          </button>
        </div>
      ))}

      <button className="rv-all">All customer reviews <Chev className="rv-all-chev" /></button>
    </section>
  )
}

/* --------------------------------- helpers --------------------------------- */
function Chev({ className = '' }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden className={`chev ${className}`}>
      <path fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="m9 6 6 6-6 6"/>
    </svg>
  )
}
