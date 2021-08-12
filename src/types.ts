import type {
  ItemClassConfigurationSet,
  Register,
  RegisterItem,
  Subregisters,
} from '@riboseinc/paneron-registry-kit/types';


export interface ReactStaticState {
  config: {
    basePath?: string
  }
  routes: {
    path: string
    data: any
    [key: string]: any
  }[]
}


export interface DefaultPageProps {
  itemClassConfiguration: ItemClassConfigurationSet
}


/* Content that is not part of ISO 19135-1 register metadata,
   but is specific for register representation on e.g. website and other materials. */
export interface ExtraContent {
  contentSummaryHTML?: string
  usageNoticeHTML?: string
  sponsorsSupportersHTML?: string
  contactNoticeHTML?: string
  registrationAuthorityNoticeHTML?: string
}


export interface CommonRouteData {
  siteURLPrefix: string
  registerURLPrefix: string
  iconURL?: string
  footerBanner?: string
  headerBanner?: string
  footerBannerLink?: string

  register: Register
  itemClassConfiguration: ItemClassConfigurationSet
  subregisters: Subregisters
  hasSubregisters: boolean

  extraContent: ExtraContent
}


export interface PluginConfig {
  datasetSourcePath: string
  urlPrefix: string
  iconURL?: string
  headerBanner?: string
  footerBanner?: string
  footerBannerLink?: string

  itemClassConfiguration: ItemClassConfigurationSet
  subregisters: Subregisters

  extraContent?: ExtraContent

  itemClassPageTemplate?: string
  itemPageTemplate?: string
  subregisterPageTemplate?: string
  homePageTemplate?: string
}


export interface RegisterItemPageRouteData extends CommonRouteData {
  item: RegisterItem<any>

  subregisterID?: string
  itemClassID: string

  reverseRelations: RelationSet
}


export interface RelationSet {
  [itemID: string]: { classID: string, subregisterID?: string }
}


export interface RegistryStatistics {
  totalItemCount: number
}


export interface ItemClassPageRouteData extends CommonRouteData {
  itemClassID: string
  subregisterID?: string

  //subregister?: { title: string }
  //itemClass: ItemClassConfiguration<any>
  items: RegisterItem<any>[]
  statistics?: RegistryStatistics
}


export interface SubregisterPageRouteData extends CommonRouteData {
  subregisterID: string
  subregister: { title: string, itemClasses: string[] }
  statistics?: RegistryStatistics
}


export interface MainRegistryPageRouteData extends CommonRouteData {
  statistics: RegistryStatistics
}
