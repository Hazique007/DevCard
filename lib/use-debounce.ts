"use client"

import { useEffect, useState } from "react"



export function useDebounce<T>(value:T,delay:400):T{

    const [debounced,setDeboucned] = useState(value)

    useEffect(()=>{
        const timeout = setTimeout(()=>setDeboucned(value),delay)
        return()=>clearTimeout(timeout)
    },[value,delay])

    return debounced

}

