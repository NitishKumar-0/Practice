import { useEffect, useState } from 'react'
export function useReducedMotion(){ const [reduced,setReduced]=useState(false); useEffect(()=>{const q=matchMedia('(prefers-reduced-motion: reduce)'); const f=()=>setReduced(q.matches);f();q.addEventListener('change',f);return()=>q.removeEventListener('change',f)},[]);return reduced }
