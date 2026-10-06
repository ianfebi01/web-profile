'use client'
import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import imageUrl from '@/utils/imageUrl'
import imageLoader from '@/lib/constans/image-loader'
import { getPlainText } from '@/utils/parseMd'
import { useLocale } from 'next-intl'
import { Project, Skill } from '@/payload-types'

interface Props {
  data: Project
  headingLevel?: 'h2' | 'h3'
}

// Medium-style project card: thumbnail, title, excerpt, then date and skills
const ProjectCard = ( { data, headingLevel: Heading = 'h2' }: Props ) => {
  const locale = useLocale()

  const thumbnail = imageUrl( data.thumbnail )
  const skills = ( data.skills ?? [] ).filter( ( skill ): skill is Skill => typeof skill === 'object' )
  const excerpt = getPlainText( data.description || '' )

  return (
    <article className="h-full">
      <Link
        data-name="proj"
        data-text="View"
        href={`/portofolio/${data.slug}`}
        aria-label={data.title}
        className="group flex flex-col gap-3 h-full no-underline text-black dark:text-white"
      >
        <div className="relative w-full aspect-video overflow-hidden bg-light-secondary dark:bg-dark-secondary">
          {!!thumbnail && (
            <Image
              src={thumbnail}
              alt=""
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 320px"
              className="object-contain object-center group-hover:scale-105 transition-default"
              loading="lazy"
              placeholder={imageLoader}
            />
          )}
        </div>

        <Heading className="m-0 mt-2 font-bold tracking-tight leading-snug text-xl line-clamp-2 group-hover:underline underline-offset-4 decoration-1">
          {data.title}
        </Heading>
        {!!excerpt && (
          <p className="m-0 font-serif text-sm sm:text-base leading-normal line-clamp-2 text-black/65 dark:text-white/60">
            {excerpt}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-2 mt-auto pt-2 text-[13px] text-black/65 dark:text-white/55">
          <span>
            {new Date( data.createdAt ).toLocaleDateString( locale, {
              month : 'short',
              year  : 'numeric',
            } )}
          </span>
          {skills.slice( 0, 2 ).map( ( skill ) => (
            <span
              key={skill.id}
              className="px-2.5 py-0.5 rounded-full bg-light-secondary dark:bg-dark-secondary text-black/70 dark:text-white/70"
            >
              {skill.name}
            </span>
          ) )}
        </div>
      </Link>
    </article>
  )
}

export default ProjectCard
