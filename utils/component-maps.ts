import BannerStandard from '@/components/Banner/BannerStandard'
import ProfileBanner from '@/components/Banner/ProfileBanner'
import Accordian from '@/components/Content/Accordian'
import ArticleSearch from '@/components/Content/ArticleSearch'
import BodyCopy from '@/components/Content/BodyCopy'
import FeaturedExperiences from '@/components/Content/FeaturedExperiences'
import FeaturedPortofolios from '@/components/Content/FeaturedPortofolios'
import IconTexts from '@/components/Content/IconTexts'
import PortofolioSearch from '@/components/Content/PortofolioSearch'
import Quote from '@/components/Content/Quote'
import SimpleCards from '@/components/Content/SimpleCards'
import TextLeftImageRight from '@/components/Content/TextLeftImageRight'

export const componentMap: Record<string, React.FC<{ sectionData: any }>> = {
  'banner-components.banner-standard'        : BannerStandard,
  'banner-components.profile-banner'         : ProfileBanner,
  'content-components.article-search'        : ArticleSearch,
  'content-components.body-copy'             : BodyCopy,
  'content-components.featured-experiences'  : FeaturedExperiences,
  'content-components.featured-portofolios'  : FeaturedPortofolios,
  'content-components.icon-texts'            : IconTexts,
  'content-components.portofolio-search'     : PortofolioSearch,
  'content-components.quote'                 : Quote,
  'content-components.simple-cards'          : SimpleCards,
  'content-components.text-left-image-right' : TextLeftImageRight,
  'content-components.accordian' : Accordian,
}
