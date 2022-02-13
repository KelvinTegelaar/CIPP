import React from 'react'
import clsx from 'clsx'
import AliceCarousel from 'react-alice-carousel'
import 'react-alice-carousel/lib/scss/alice-carousel.scss'
import sponsors from '@site/data/sponsors.json'

const handleDragStart = (e) => e.preventDefault()

const responsive = {
  0: { items: 1 },
  568: { items: 3 },
  1024: { items: 5 },
}

const items = sponsors.map((sponsor, index) => {
  const containerStyle = { maxHeight: 75, maxWidth: 250, textAlign: 'center' }
  const imageStyle = { maxHeight: 75 };
  return (
    <div className={clsx('item')} key={sponsor.name} style={containerStyle}>
      <a
        href={sponsor.link}
        title={sponsor.name}
        target="_blank"
        rel="noreferrer noopener"
        className="sponsor-item item-inner"
        key={sponsor.name}
      >
        <img
          src={sponsor.logo}
          alt={sponsor.name}
          onDragStart={handleDragStart}
          role="presentation"
          style={imageStyle}
        />
      </a>
    </div>
  )
})

export default function Sponsors() {
  return (
    <div className={clsx('container padding-vert--lg sponsors-carousel')}>
      <h2><span className={clsx('pre-footer--title')}>Sponsored By</span></h2>
      <AliceCarousel
        autoPlay
        autoPlayInterval={2000}
        disableButtonsControls
        items={items}
        infinite
        mouseTracking
        paddingLeft={50}
        paddingRight={50}
        responsive={responsive}
      />
    </div>
  )
}
