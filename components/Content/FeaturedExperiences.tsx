import { fetchAPI } from '@/utils/fetch-api';
import { FunctionComponent } from 'react';
import Experience from '../Experience';
import { getLocale } from 'next-intl/server';
import NoDataFound from '../NoDataFound';

const FeaturedExperiences: FunctionComponent = async ( ) => {
  return <NoDataFound />
}

export default FeaturedExperiences
