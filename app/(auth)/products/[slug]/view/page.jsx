"use client"
import { useParams } from "next/navigation";
import ViewCompo from "./ViewCompo";


const page = async() => {
  
const {slug}= useParams()
  return (
    <div>


<ViewCompo slug={slug} />

    </div>
  )
}

export default page