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


export interface CommonRouteData {
  siteURLPrefix: string
  registerURLPrefix: string
  footerBanner?: string
  headerBanner?: string
  footerBannerLink?: string

  register: Register
  itemClassConfiguration: ItemClassConfigurationSet
  subregisters: Subregisters
  hasSubregisters: boolean
}


export interface PluginConfig {
  datasetSourcePath: string
  urlPrefix: string
  headerBanner?: string
  footerBanner?: string
  footerBannerLink?: string

  itemClassConfiguration: ItemClassConfigurationSet
  subregisters: Subregisters

  itemClassPageTemplate?: string
  itemPageTemplate?: string
  subregisterPageTemplate?: string
  homePageTemplate?: string
}


export interface RegisterItemPageRouteData extends CommonRouteData {
  item: RegisterItem<any>

  subregisterID?: string
  itemClassID: string
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
