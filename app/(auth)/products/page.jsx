"use client"
import ProductCompo from '@/app/components/ProductCompo'
import { useSearchParams } from 'next/navigation'
import React, { Suspense } from 'react'

const page = () => {


 const searchParam = useSearchParams()
 const pageNumber = searchParam.get("page") || 1

  return (
    <div>

<Suspense fallback={<div>loading....</div>}>

<ProductCompo page={pageNumber} />
</Suspense>


    </div>
  )
}

export default page