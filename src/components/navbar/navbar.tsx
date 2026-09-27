"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpLeft, ChevronDown, LayoutDashboard, LogIn, Menu, UserRound, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { marketingNavigation } from "@/constants/app-navigation";
import { iconRegistry } from "@/constants/icon-registry";
import { usePublicServices } from "@/hooks/use-public-services";
import { getMeApi } from "@/lib/api-client/auth";

export default function Navbar(){
  const [open,setOpen]=useState(false);
  const [productsOpen,setProductsOpen]=useState(false);
  const [authState,setAuthState]=useState<"checking"|"guest"|"authenticated">("checking");
  const productsRef=useRef<HTMLDivElement>(null);
  const {services:catalogServices}=usePublicServices();
  const services=catalogServices??[];

  useEffect(()=>{
    let active=true;

    getMeApi()
      .then(()=>{
        if(active)setAuthState("authenticated");
      })
      .catch(()=>{
        if(active)setAuthState("guest");
      });

    return()=>{active=false};
  },[]);

  useEffect(()=>{
    function outside(e:MouseEvent){
      if(productsRef.current&&!productsRef.current.contains(e.target as Node))setProductsOpen(false)
    }
    function key(e:KeyboardEvent){
      if(e.key==='Escape'){
        setProductsOpen(false);
        setOpen(false)
      }
    }
    document.addEventListener('mousedown',outside);
    document.addEventListener('keydown',key);
    return()=>{
      document.removeEventListener('mousedown',outside);
      document.removeEventListener('keydown',key)
    }
  },[]);

  return <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-6 sm:pt-4 lg:px-8"><nav aria-label="ناوبری اصلی" className="mx-auto max-w-7xl rounded-panel border border-marketing-border bg-marketing-background/78 px-3 shadow-[0_12px_36px_rgba(0,0,0,.2)] backdrop-blur-2xl sm:px-4"><div className="flex h-16 items-center justify-between gap-3"><Link href="/" className="flex min-w-0 items-center gap-2.5" onClick={()=>setOpen(false)}><Image src="/img/Binix-Logo.png" alt="BINIX" width={65} height={65} priority className="h-9 w-auto object-contain"/><div className="flex items-center gap-2"><span className="font-display text-lg font-bold tracking-tight text-marketing-text">BINIX</span><span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.85)]"/></div></Link><div className="hidden items-center gap-1 lg:flex"><div ref={productsRef} className="relative"><button type="button" onClick={()=>setProductsOpen(v=>!v)} aria-expanded={productsOpen} aria-haspopup="menu" className="font-ui inline-flex items-center gap-1 rounded-control px-3 py-2 text-[13px] text-marketing-text-muted transition hover:bg-white/[0.04] hover:text-marketing-text">سرویس‌ها <ChevronDown size={14} className={productsOpen?'rotate-180 transition':'transition'}/></button>{productsOpen&&<div role="menu" className="absolute right-0 top-11 w-80 rounded-card border border-marketing-border bg-marketing-surface p-2 shadow-binix-lg">{services.map((service)=>{const Icon=iconRegistry[service.iconKey]??iconRegistry["layout-grid"];return <Link key={service.id} role="menuitem" href={service.marketingHref} onClick={()=>setProductsOpen(false)} className="flex items-start gap-3 rounded-control p-3 transition hover:bg-white/[0.04]"><div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-control border" style={{color:service.accent,borderColor:`color-mix(in srgb, ${service.accent} 24%, transparent)`,background:`color-mix(in srgb, ${service.accent} 9%, transparent)`}}><Icon size={17}/></div><div><div className="font-display text-sm font-bold text-marketing-text">{service.name}</div><div className="mt-1 font-ui text-[11px] leading-5 text-marketing-text-subtle">{service?.availability==='coming-soon'?'در نقشه راه':service.category}</div></div></Link>})}</div>}</div>{marketingNavigation.map((item)=><Link key={item.href} href={item.href} className="font-ui rounded-control px-3 py-2 text-[13px] text-marketing-text-muted transition hover:bg-white/[0.04] hover:text-marketing-text">{item.label}</Link>)}</div><div className="flex items-center gap-2">{authState==="checking" ? (
  <div
    aria-hidden="true"
    className="hidden h-10 w-[78px] animate-pulse rounded-control border border-marketing-border bg-white/[0.025] sm:block"
  />
) : authState==="authenticated" ? (
  <Link
    href="/app"
    className="font-ui hidden h-10 items-center gap-2 rounded-control border border-primary/20 bg-primary/[0.07] px-3 text-xs font-semibold text-marketing-text transition hover:border-primary/30 hover:bg-primary/[0.11] sm:inline-flex"
  >
    <UserRound size={15} className="text-primary"/>
    پنل کاربری
  </Link>
) : (
  <Link
    href="/login"
    className="font-ui hidden h-10 items-center gap-2 rounded-control border border-marketing-border px-3 text-xs font-semibold text-marketing-text-muted transition hover:bg-white/[0.04] hover:text-marketing-text sm:inline-flex"
  >
    <LogIn size={15}/>
    ورود
  </Link>
)}<motion.a href="/#consultation" whileHover={{y:-1}} whileTap={{scale:.98}} className="font-ui hidden h-10 items-center gap-2 rounded-control bg-marketing-text px-4 text-xs font-bold text-marketing-background transition hover:opacity-90 md:inline-flex">مشاوره رایگان <ArrowUpLeft size={14}/></motion.a><button type="button" onClick={()=>setOpen(v=>!v)} aria-label={open?"بستن منو":"باز کردن منو"} aria-expanded={open} className="flex size-10 items-center justify-center rounded-control border border-marketing-border text-marketing-text-muted transition hover:bg-white/[0.04] hover:text-marketing-text lg:hidden">{open?<X size={19}/>:<Menu size={19}/>}</button></div></div><AnimatePresence initial={false}>{open&&<motion.div initial={{height:0,opacity:0}} animate={{height:"auto",opacity:1}} exit={{height:0,opacity:0}} className="overflow-hidden lg:hidden"><div className="max-h-[calc(100dvh-6rem)] overflow-y-auto border-t border-marketing-border py-3"><div className="px-3 pb-2 font-ui text-[11px] font-semibold text-marketing-text-subtle">سرویس‌ها</div><div className="grid gap-1">{services.map((service)=><Link key={service.id} href={service.marketingHref} onClick={()=>setOpen(false)} className="font-ui rounded-control px-3 py-2.5 text-sm text-marketing-text-muted transition hover:bg-white/[0.04] hover:text-marketing-text">{service.name}{service?.availability==='coming-soon'&&<span className="mr-2 text-[10px] text-marketing-text-subtle">به‌زودی</span>}</Link>)}</div><div className="my-2 border-t border-marketing-border"/><div className="grid gap-1">{marketingNavigation.map((item)=><Link key={item.href} href={item.href} onClick={()=>setOpen(false)} className="font-ui rounded-control px-3 py-3 text-sm text-marketing-text-muted transition hover:bg-white/[0.04] hover:text-marketing-text">{item.label}</Link>)}</div><div className="mt-3 grid grid-cols-2 gap-2 border-t border-marketing-border pt-3 sm:hidden">{authState==="checking" ? (
  <div
    aria-hidden="true"
    className="h-10 animate-pulse rounded-control border border-marketing-border bg-white/[0.025]"
  />
) : authState==="authenticated" ? (
  <Link
    href="/app"
    onClick={()=>setOpen(false)}
    className="font-ui flex h-10 items-center justify-center gap-2 rounded-control border border-primary/20 bg-primary/[0.07] text-xs font-semibold text-marketing-text"
  >
    <LayoutDashboard size={14} className="text-primary"/>
    پنل کاربری
  </Link>
) : (
  <Link
    href="/login"
    onClick={()=>setOpen(false)}
    className="font-ui flex h-10 items-center justify-center gap-2 rounded-control border border-marketing-border text-xs font-semibold text-marketing-text"
  >
    <LogIn size={14}/>
    ورود
  </Link>
)}<Link href="/#consultation" onClick={()=>setOpen(false)} className="font-ui flex h-10 items-center justify-center rounded-control bg-marketing-text text-xs font-bold text-marketing-background">مشاوره رایگان</Link></div></div></motion.div>}</AnimatePresence></nav></header>}
