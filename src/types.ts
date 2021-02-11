import type { ConceptData } from '@riboseinc/paneron-extension-glossarist/classes/concept';
import type { DesignationData } from '@riboseinc/paneron-extension-glossarist/classes/designation';
import type { DefinitionData } from '@riboseinc/paneron-extension-glossarist/classes/definition';
import type { Register } from '@riboseinc/paneron-registry-kit/types';


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


export interface PluginConfig {
  datasetSourcePath: string
  urlPrefix: string
  template?: string
  conceptTemplate?: string
  headerBanner: string
  footerBanner: string
  footerBannerLink: string
}


export interface ConceptPageRouteData {
  siteURLPrefix: string
  glossaryURLPrefix: string
  concept: ConceptData
  relatedItemData: {
    designations: { [langID: string]: { [uuid: string]: DesignationData } }
    definitions: { [langID: string]: { [uuid: string]: DefinitionData } }
  }
  register: Register
  footerBanner: string
  headerBanner: string
  footerBannerLink: string
}


export interface LanguageStatistics {
  conceptCount: number
  designationCount: number
}


export interface LanguagePageRouteData {
  siteURLPrefix: string
  glossaryURLPrefix: string
  languageName: string
  statistics: LanguageStatistics
  register: Register
  title: string
  footerBanner: string
  headerBanner: string
  footerBannerLink: string
}
