'use client'

import { Project } from '@/payload-types'
import ProjectCard from './Cards/ProjectCard'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
gsap.registerPlugin( ScrollTrigger )

interface Props {
  portofolios: Project[]
}

const PortofoliosWrapper = ( { portofolios }: Props ) => {
  const containerRef = useRef( null )
  const cards = useRef<HTMLSpanElement[] | null[]>( [] )

  useEffect( () => {
    const ctx = gsap.context( () => {
      gsap.to( cards.current, {
        y             : 0,
        opacity       : 1,
        ease          : 'power2.out',
        stagger       : 0.2,
        duration      : 0.75,
        delay         : 0.2,
        scrollTrigger : {
          trigger       : containerRef.current,
          start         : 'top 80%',
          toggleActions : 'play none none none',
        },
      } )
    }, containerRef )

    return () => ctx.revert()
  }, [] )

  return (
    <div
      ref={containerRef}
      className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3"
    >
      {portofolios?.map( ( item, i ) => (
        <div ref={el => {
          ( cards.current[i] = el );
        }}
        key={item.slug}
        className='translate-y-[75px] opacity-0'
        >
          <ProjectCard data={item} />
        </div>
      ) )}
    </div>
  );
}

export default PortofoliosWrapper
