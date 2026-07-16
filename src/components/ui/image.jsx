import * as React from "react"
import { cn } from "@/lib/utils"

const FALLBACK_IMAGE_URL =
  "https://static.wixstatic.com/media/12d367_4f26ccd17f8f4e3a8958306ea08c2332~mv2.png"

const Image = React.forwardRef(
  (
    {
      src,
      ...props
    },
    ref
  ) => {
    const [imgSrc, setImgSrc] = React.useState(src)

    React.useEffect(() => {
      setImgSrc(src)
    }, [src])

    const imageProps = {
      ...props,
      onError: () => setImgSrc(FALLBACK_IMAGE_URL),
    }

    if (!src) {
      return <img ref={ref} src={FALLBACK_IMAGE_URL} {...imageProps} data-empty-image />
    }

    const isErrorUrl = imgSrc === FALLBACK_IMAGE_URL
    return (
      <img ref={ref} src={imgSrc} {...imageProps} data-error-image={isErrorUrl || undefined} />
    )
  }
)
Image.displayName = "Image"

export { Image }

