import { Page } from "@/payload-types"
import { NavItemType } from "@/components/Layouts/Navbar"
import { parseUrl } from "./parse-url"

const constructNavUrl = ( navItem: NavItemType | any ) => {
  let url: string = ''
  
  if ( navItem?.page && typeof navItem.page === 'object' && ( navItem.page as Page )?.slug ) {
    url = `/${( navItem.page as Page )?.slug}`
  } else {
    url = parseUrl(navItem?.url || '')
  }
  if ( navItem?.pageAnchor ) {
    url = url + '#' + navItem.pageAnchor
  }
  
  return url
}

export default constructNavUrl
