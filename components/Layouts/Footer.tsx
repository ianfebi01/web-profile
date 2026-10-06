'use client'
import LinkOpenNewTab from '@/components/Buttons/LinkOpenNewTab'
import InstagramIcon from '@/components/Icons/InstagramIcon'
import LinkedinIcon from '@/components/Icons/LinkedinIcon'
import CopyToClipboard from '@/components/Inputs/CopyToClipboard'
import Image from 'next/image'

const Footer = () => {
  return (
    <footer
      id="footer"
      className="main__section h-fit bg-white dark:bg-dark overflow-hidden"
    >
      <div className="main__container my-8 md:my-16 h-full">
        <div className="w-fit mx-auto mb-4">
          <div className="flex flex-col gap-2 max-w-2xl items-center text-center">
            <Image src="/Logo.svg"
              alt=""
              width={40}
              height={40}
            />
            <p className="text-lg font-bold">Ian Febi Sastrataruna</p>
          </div>
        </div>

        <div className="text-lg flex gap-4 text-center w-full justify-center items-center flex-wrap">
          <LinkOpenNewTab
            url={'https://www.instagram.com/ianfebi01/'}
            label={'Instagram'}
            className="text-md"
            icon={<InstagramIcon size={20} />}
          />
          <span aria-hidden="true">•</span>
          <LinkOpenNewTab
            url={'https://www.linkedin.com/in/ian-febi-sastrataruna-895598149/'}
            label={'LinkedIn'}
            className="text-md"
            icon={<LinkedinIcon size={20} />}
          />
          <span aria-hidden="true">•</span>
          <div className=" flex flex-row items-center gap-2">
            <CopyToClipboard
              copyText="ianfebi01@gmail.com"
              className="text-md"
            />
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
