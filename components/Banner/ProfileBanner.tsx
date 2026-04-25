"use client";
import LinkOpenNewTab from "@/components/Buttons/LinkOpenNewTab";
import InstagramIcon from "@/components/Icons/InstagramIcon";
import LinkedinIcon from "@/components/Icons/LinkedinIcon";
import CopyToClipboard from "@/components/Inputs/CopyToClipboard";
import Shape from "@/components/Shape";
import Image from "next/image";
import React, { FunctionComponent, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Profile } from "@/payload-types";
import imageUrl from "@/utils/imageUrl";
import sanitize from "@/utils/sanitize";
import parseMd from "@/utils/parseMd";
import imageLoader from "@/lib/constans/image-loader";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin( ScrollTrigger );

interface Props {
  sectionData: Profile;
}

const ProfileBanner: FunctionComponent<Props> = ( { sectionData } ) => {
  const sectionRef = useRef<HTMLElement>( null );
  const avatarRef = useRef<HTMLDivElement>( null );
  const contentRef = useRef<HTMLDivElement>( null );

  useEffect( () => {
    const ctx = gsap.context( () => {
      const section = sectionRef.current;
      if ( !section ) return;

      // Fade out section as user scrolls away
      gsap.to( section, {
        opacity       : 0,
        ease          : "none",
        scrollTrigger : {
          trigger : section,
          start   : "top top",
          end     : "bottom top",
          scrub   : true,
        },
      } );

      // Avatar parallax — moves up faster
      gsap.to( avatarRef.current, {
        y             : 130,
        ease          : "none",
        scrollTrigger : {
          trigger : section,
          start   : "top top",
          end     : "bottom top",
          scrub   : 1,
        },
      } );

      // Content parallax — moves up slower
      gsap.to( contentRef.current, {
        y             : 130,
        ease          : "none",
        scrollTrigger : {
          trigger : section,
          start   : "top top",
          end     : "bottom top",
          scrub   : 1.5,
        },
      } );
    }, sectionRef ); // scope to sectionRef

    return () => ctx.revert(); // cleanup on unmount
  }, [] );

  return (
    <section
      ref={sectionRef}
      id="home"
      className={cn( "main__section !px-0 sm:px-0 md:px-0 bg-dark relative overflow-clip" )}
    >
      <Shape myposy={0} />

      {/* Mobile banner */}
      <div
        className={cn(
          "flex w-full h-56 relative bg-cover bg-center bg-no-repeat md:hidden",
        )}
        style={{
          backgroundImage : `url(${imageUrl( sectionData.bannerImage )})`,
        }}
      >
        <div
          ref={avatarRef}
          className="aspect-square w-48 border border-none rounded-full overflow-hidden inset-x-0 mx-auto absolute -bottom-24"
        >
          {imageUrl( sectionData.avatar ) && (
            <Image
              src={imageUrl( sectionData.avatar )!}
              alt="Profile image"
              fill
              priority
              sizes="auto"
              className="object-cover"
              placeholder={imageLoader}
            />
          )}
        </div>
      </div>

      {/* Desktop banner */}
      <div
        className={cn(
          "w-full h-56 relative bg-cover bg-center bg-no-repeat hidden md:flex",
        )}
        style={{
          backgroundImage : `url(${imageUrl( sectionData.bannerImage )})`,
        }}
      >
        <div
          ref={avatarRef}
          className="aspect-square w-48 border border-none rounded-full overflow-hidden inset-x-0 mx-auto absolute -bottom-24"
        >
          {imageUrl( sectionData.avatar ) && (
            <Image
              src={imageUrl( sectionData.avatar )!}
              alt="Profile image"
              fill
              priority
              sizes="auto"
              className="object-cover"
              placeholder={imageLoader}
            />
          )}
        </div>
      </div>

      {/* Content */}
      <div
        ref={contentRef}
        className="w-full grow-[1] max-w-3xl relative overflow-hidden mt-32 mb-20 flex flex-col gap-4 sm:px-4 px-4 md:px-4 lg:px-0 xl:px-0 2xl:px-0"
      >
        <h1 className="text-center m-0">{sectionData.name}</h1>
        <div
          className="text-center text-white/75 body-copy"
          dangerouslySetInnerHTML={{
            __html : sanitize( parseMd( sectionData.bio || "" ), "richtext" ),
          }}
        />
        <div className="text-lg flex gap-4 text-center w-full justify-center items-center flex-wrap">
          {(
            ( sectionData.socialPlatformLinks ||
              ( sectionData as any ).socialPlatformLinks ||
              [] ) as any[]
          ).map( ( item, i ) => {
            const platform =
              item?.attributes?.social?.platform || item?.platform;
            const url = item?.attributes?.social?.url || item?.url;

            switch ( platform ) {
            case "LinkedIn":
              return (
                <React.Fragment key={`linkedin-${i}`}>
                  <LinkOpenNewTab
                    url={url}
                    label="LinkedIn"
                    className="text-md"
                    icon={<LinkedinIcon size={20} />}
                  />
                  <span className="last:hidden">•</span>
                </React.Fragment>
              );

            case "Instagram":
              return (
                <React.Fragment key={`instagram-${i}`}>
                  <LinkOpenNewTab
                    url={url}
                    label="Instagram"
                    className="text-md"
                    icon={<InstagramIcon size={20} />}
                  />
                  <span className="last:hidden">•</span>
                </React.Fragment>
              );

            case "Email":
              return (
                <React.Fragment key={`email-${i}`}>
                  <div className="flex flex-row items-center gap-2">
                    <CopyToClipboard copyText={url}
                      className="text-md"
                    />
                  </div>
                  <span className="last:hidden">•</span>
                </React.Fragment>
              );

            default:
              return null;
            }
          } )}
        </div>
      </div>

      {/* Shadow inset bottom */}
      <div className="absolute w-full bottom-0 bg-gradient-to-t from-dark/100 to-transparent h-1/3 z-0 pointer-events-none">
      </div>
    </section>
  );
};

export default ProfileBanner;