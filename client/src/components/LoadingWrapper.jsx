import { useState, useEffect } from 'react'
import LoadingAnimation from './LoadingAnimation.jsx'
import { SkeletonWrapper } from './SkeletonComponents.jsx'

export default function LoadingWrapper({ 
  children, 
  isLoading, 
  skeletonComponent,
  loadingMessage = "Loading...",
  minDuration = 1500,
  maxDuration = 3000 
}) {
  const [showContent, setShowContent] = useState(false)
  const [randomDuration, setRandomDuration] = useState(0)

  useEffect(() => {
    if (!isLoading) {
      // Generate random duration between minDuration and maxDuration
      const duration = Math.random() * (maxDuration - minDuration) + minDuration
      setRandomDuration(duration)
      
      const timer = setTimeout(() => {
        setShowContent(true)
      }, duration)

      return () => clearTimeout(timer)
    } else {
      setShowContent(false)
    }
  }, [isLoading, minDuration, maxDuration])

  if (isLoading) {
    return <LoadingAnimation message={loadingMessage} />
  }

  if (!showContent && skeletonComponent) {
    return (
      <SkeletonWrapper minDuration={minDuration} maxDuration={maxDuration}>
        {skeletonComponent}
      </SkeletonWrapper>
    )
  }

  return children
}
