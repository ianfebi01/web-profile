"use client";

import { Link } from "@/i18n/navigation";
import imageLoader from "@/lib/constans/image-loader";
import { ApiPortofolioPortofolio } from "@/types/generated/contentTypes";
import imageUrl from "@/utils/imageUrl";
import { getPlainText } from "@/utils/parseMd";
import Image from "next/image"; // Update this import as needed

interface PortofolioCardProps {
  portofolio: any;
}

const PortofolioCard = ({ portofolio }: PortofolioCardProps) => {
  return (
    <Link
      href={`/portofolio/${portofolio.slug}`}
      className="bg-dark-secondary rounded-lg w-full overflow-hidden flex flex-col !no-underline group h-full"
    >
      <div className="relative w-full overflow-hidden aspect-video shrink-0 bg bg-dark/50">
        <Image
          alt={`Image ${portofolio?.title}`}
          src={
            imageUrl(
              portofolio.thumbnail?.data || portofolio.thumbnail,
              "original",
            ) || ""
          }
          fill
          sizes="auto"
          className="object-contain object-center group-hover:scale-110 transition-default"
          loading="lazy"
          placeholder={imageLoader}
        />
      </div>

      <div className="relative flex flex-col h-full px-4 py-6">
        {!!portofolio.year && (
          <small className="px-2 py-1 mb-2 text-xs rounded-md lg:text-sm line-clamp-1 bg-dark w-fit">
            {portofolio.year}
          </small>
        )}

        <h3 className="pt-0 text-xl xxl:text-3xl xxl:leading-[2rem] font-extra-bold lg:mb-6 lg:mt-2">
          {portofolio.title}
        </h3>

        {!!getPlainText(portofolio.description) && (
          <div className="xxl:text-xl">
            <p className="m-0 line-clamp-3 text-white/80">
              {getPlainText(portofolio.description)}
            </p>
          </div>
        )}
      </div>
    </Link>
  );
};

export default PortofolioCard;
