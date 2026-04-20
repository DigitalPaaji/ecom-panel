"use client"
import { useSearchParams } from 'next/navigation'
import React, { Suspense } from 'react'
import UserCompo from './UserCompo'

const page = () => {

    const searchQueries = useSearchParams()
    const pageNumber = searchQueries.get("page") || 1;

  return (
    <div>


<Suspense fallback={<div>loading...</div>}>
<UserCompo page={pageNumber} />
</Suspense>

    </div>
  )
}

export default page