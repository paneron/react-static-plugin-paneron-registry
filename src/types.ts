import type { ItemClassConfiguration, ItemClassConfigurationSet, RegisterItem, Subregisters } from '@riboseinc/paneron-registry-kit/types';


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



export interface CommonRouteData {
  siteURLPrefix: string
  registerURLPrefix: string
  footerBanner: string
  headerBanner: string
  footerBannerLink: string

  itemClassConfiguration: ItemClassConfigurationSet
  subregisters: Subregisters
}


export interface PluginConfig {
  datasetSourcePath: string
  urlPrefix: string
  headerBanner: string
  footerBanner: string
  footerBannerLink: string

  itemClassConfiguration: ItemClassConfigurationSet
  subregisters: Subregisters
  itemListPageTemplate?: string
  itemPageTemplate?: string
}


export interface RegisterItemPageRouteData extends CommonRouteData {
  item: RegisterItem<any>
}


export interface RegistryStatistics {
  totalItemCount: number
}


export interface ItemClassPageRouteData extends CommonRouteData {
  subregister?: { title: string }
  itemClass: ItemClassConfiguration<any>
  items: RegisterItem<any>[]
  statistics?: RegistryStatistics
}


export interface SubregisterPageRouteData extends CommonRouteData {
  subregister: { title: string, itemClasses: string[] }
  statistics?: RegistryStatistics
}


export interface MainRegistryPageRouteData {
  statistics: RegistryStatistics
}
