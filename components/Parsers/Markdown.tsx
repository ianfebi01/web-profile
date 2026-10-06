'use client'
import parseMd from '@/utils/parseMd'
import sanitize from '@/utils/sanitize'
import truncate from '@/utils/truncate'
import a11yHtml from '@/utils/a11y-html'
import { useRef } from 'react';

interface Props {
  content: string
  excerpt?: number
  // Level of the closest heading above this content; content headings start one below it
  headingLevel?: number
}

const Markdown = ( { content, excerpt, headingLevel = 1 }: Props ) => {
  const bodyCopyRef = useRef<HTMLDivElement>( null )

  return (
    <div ref={bodyCopyRef}
      className="body-copy w-full"
    >
      {!excerpt && !!content ? (
        <div
          dangerouslySetInnerHTML={{
            __html : a11yHtml( sanitize( parseMd( content ), 'richtext' ), headingLevel ),
          }}
        ></div>
      ) : !!content ? (
        <div
          dangerouslySetInnerHTML={{
            __html : truncate( sanitize( parseMd( content ), 'richtext' ), excerpt ),
          }}
        ></div>
      ) : (
        ''
      )}
    </div>
  )
}

export default Markdown
