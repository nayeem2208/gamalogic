import React, { useState } from 'react'
import LoadingBar from 'react-top-loading-bar'
function TopLoader({ loading }) {
    // const [progress, setProgress] = useState(0)
  return (
    <div className='ml-96'>
      <LoadingBar
        color='#f74c41'
        progress={loading ? 30 : 0} // Set the progress value based on the loading state
        onLoaderFinished={() => {}} // No need to reset progress here
      />
    </div>
  )
}

export default TopLoader
