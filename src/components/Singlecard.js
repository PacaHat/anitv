import React from 'react'
import Image from 'next/image'

function Singlecard({item}) {
  return (
    <div>
    <Image src={item.coverImage.extraLarge} alt={item.title || "Anime cover"} width={500} height={300} />
    </div>
  )
}

export default Singlecard
