import React from 'react'
import clsx from 'clsx'
import AliceCarousel from 'react-alice-carousel'
import 'react-alice-carousel/lib/scss/alice-carousel.scss'
import sponsors from './sponsors.json'

const handleDragStart = (e) => e.preventDefault()

const items = sponsors.map((sponsor, index) => {
  const containerStyle = { maxHeight: 75, maxWidth: 250, textAlign: 'center' }
  const imageStyle = { maxHeight: 75 };
  return (
    <div className={clsx('item padding-horiz--md ')} key={sponsor.name} style={containerStyle}>
      <a
        href={sponsor.url}
        title={sponsor.name}
        target="_blank"
        rel="noreferrer noopener"
        className="sponsor-item"
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
  console.log(items)
  return (
    <div className={clsx('cipp-home container padding-vert--lg')}>
      <h2><span className={clsx('cipp-home--title')}>Sponsored By</span></h2>
      <AliceCarousel
        autoPlay
        autoPlayInterval={1000}
        autoWidth
        disableDotsControls
        disableButtonsControls
        items={items}
        mouseTracking
        responsive={{
          0: {
            items: 1,
          },
          568: {
            items: 2,
          },
          1024: {
            items: 3,
          },
        }}
      />
    </div>
  )
}
