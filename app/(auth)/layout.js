"use client"
import React, { useEffect, useState } from 'react'
import { NextIntlClientProvider } from 'next-intl'
import Sidebar from '../components/Sidebar'

const layout = ({children}) => {
const [allmessage,setAllmessage]= useState()
const [locale,setlocale]=useState("en")
const fetchLAnguage= async(locals)=>{
 try {
 let   messages = (await import(`../../messages/${locals}.json`)).default;
 setAllmessage(messages)
  } catch (error) {
    notFound();
  }
}
useEffect(async()=>{
const lang = localStorage.getItem("lang") || "en"
fetchLAnguage(lang)
setlocale(lang)

},[ ])

  return (
    <div>
      
                <NextIntlClientProvider locale={locale} messages={allmessage && allmessage}>
                  
                    <div className='flex h-screen'>
                      <div className='h-screen '>
               <Sidebar />
                      </div>
                  
                        <div className='w-full h-screen overflow-auto'>
                             {children}
                        </div>
                    </div>

       
                </NextIntlClientProvider>

        
        </div>
  )
}

export default layout