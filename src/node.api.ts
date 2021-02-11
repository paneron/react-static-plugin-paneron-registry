import fs from 'fs';
import { execSync as shell } from 'child_process';
import path from 'path';
import dirTree, { DirectoryTree } from 'directory-tree';
import yaml from 'js-yaml';

import { Route } from 'react-static';

import type { Register, RegisterItem } from '@riboseinc/paneron-registry-kit/types';

import {
  ReactStaticState,
  PluginConfig,
  RegisterItemPageRouteData,
  MainRegistryPageRouteData,
  RegistryStatistics,
  CommonRouteData,
  ItemClassPageRouteData,
  SubregisterPageRouteData,
} from './types';

import SimpleCache from './SimpleCache';


const cache = new SimpleCache();


function getTemplate(what: string = 'RegisterItem'): string {
  const _defaultTemplateSrc = path.join(__dirname, `Default${what}Page`);
  const _defaultTemplate = path.join(process.cwd(), `_${what}Page`);
  shell(`mkdir -p "${_defaultTemplate}"`);
  shell(`cp -r "${_defaultTemplateSrc}/"* "${_defaultTemplate}"`)
  return `_${what}Page/index`;
}


export default ({
  datasetSourcePath, urlPrefix,
  itemClassConfiguration, subregisters,
  footerBanner, headerBanner, footerBannerLink,
}: PluginConfig) => {

  return {

    getRoutes: async (routesBefore: Route[], _state: ReactStaticState) => {
      const subregisterRoot = path.join(datasetSourcePath, 'subregisters');

      let hasSubregisters: boolean;
      try {
        hasSubregisters = fs.statSync(subregisterRoot).isDirectory();
      } catch (e) {
        hasSubregisters = false;
      }

      const statistics: RegistryStatistics = { totalItemCount: 0 };

      let registerContentRoutes: Route[];

      const register = await getFileData<Register>(path.join(datasetSourcePath, 'register.yaml'));

      const commonRouteData: CommonRouteData = {
        siteURLPrefix: _state.config.basePath || '',
        registerURLPrefix: urlPrefix,
        register,
        subregisters,
        itemClassConfiguration,
        headerBanner,
        footerBanner,
        footerBannerLink,
        hasSubregisters,
      };

      const itemTemplate = getTemplate('RegisterItem');
      const itemClassTemplate = getTemplate('ItemClass');
      const subregisterTemplate = getTemplate('Subregister');

      if (hasSubregisters) {
        const subregDirents = dirTree(subregisterRoot).children || [];
        registerContentRoutes = subregDirents.map(dirent => direntToSubregRoute(
          dirent,
          subregisterTemplate,
          itemClassTemplate,
          itemTemplate,
          commonRouteData));
      } else {
        const itemClassDirents = dirTree(datasetSourcePath, { attributes: ['isDirectory'] }).children || [];
        registerContentRoutes = itemClassDirents.map(dirent => direntToItemClassRoute(
          dirent,
          itemClassTemplate,
          itemTemplate,
          commonRouteData));
      }

      let routes: Route[] = [
        ...routesBefore,
        {
          path: urlPrefix,
          template: getTemplate('Home'),
          getData: async (): Promise<MainRegistryPageRouteData> => ({
            ...commonRouteData,
            statistics,
          }),
        },
        ...registerContentRoutes,
      ];

      return routes;
    },
  };

};


function direntToSubregRoute(
  dirent: DirectoryTree,
  subregisterTemplate: string,
  itemClassTemplate: string,
  itemTemplate: string,
  context: CommonRouteData,
): Route {
  const subregisterID = dirent.name;

  return {
    path: subregisterID,
    template: subregisterTemplate,
    children: (dirent.children ?? []).map(dirent => direntToItemClassRoute(
      dirent,
      itemClassTemplate,
      itemTemplate,
      context,
      subregisterID,
    )),
    getData: getSubregisterPageRouteData(dirent, context),
  };
}


function direntToItemClassRoute(
  dirent: DirectoryTree,
  itemClassTemplate: string,
  itemTemplate: string,
  context: CommonRouteData,
  subregisterID?: string,
): Route {
  const classID = dirent.name;

  return {
    path: classID,
    template: itemClassTemplate,
    children: (dirent.children ?? []).map(dirent => direntToItemRoute(
      dirent,
      itemTemplate,
      context,
      classID,
      subregisterID,
    )),
    getData: getItemClassPageRouteData(dirent, context),
  };
}


function direntToItemRoute(
  dirent: DirectoryTree,
  itemTemplate: string,
  context: CommonRouteData,
  itemClassID: string,
  subregisterID?: string,
): Route {
  const itemID = noExt(dirent.name);

  return {
    path: itemID,
    template: itemTemplate,
    getData: getItemPageRouteData(dirent, context, itemClassID, subregisterID),
  };
}


function getSubregisterPageRouteData(
  dirent: DirectoryTree,
  context: CommonRouteData,
): () => Promise<SubregisterPageRouteData> {
  const subregisterID = dirent.name;
  const subregister = context.subregisters[subregisterID];

  return async () => {
    return {
      ...context,
      subregister,
    };
  };
}


function getItemClassPageRouteData(
  dirent: DirectoryTree,
  context: CommonRouteData,
): () => Promise<ItemClassPageRouteData> {
  const classID = dirent.name;
  const itemClass = context.itemClassConfiguration[classID];
  const itemPaths = (dirent.children ?? []).map(dirent => noExt(dirent.name));

  return async () => {
    const items = await Promise.all(itemPaths.map(async (itemPath) => await getFileData<RegisterItem<any>>(itemPath)));

    return {
      ...context,
      itemClass,
      items,
    };
  };
}


function getItemPageRouteData(
  dirent: DirectoryTree,
  context: CommonRouteData,
  itemClassID: string,
  subregisterID?: string,
): () => Promise<RegisterItemPageRouteData> {

  return async () => {
    const dataPath = dirent.path;
    const item = await getFileData<RegisterItem<any>>(dataPath);

    return {
      ...context,
      itemClassID,
      subregisterID,
      item,
    };
  };
}


const DATA_FILE_EXT = '.yaml';


// function getDataFilePathForDirTreeEntry(entry: DirectoryTree): string {
//   return entry.path;
// }


function noExt(filename: string): string {
  return path.basename(filename, DATA_FILE_EXT);
}


// function datasetDirEntryNameToRoutePath(name: string): string {
//   return `${noExt(name) || '/'}`;
// }


/* Getting data from YAML per dir tree entry */
async function getFileData<T>(dataFilePath: string): Promise<T> {
  return await cache.get(`file-${dataFilePath}`, async () => {
    return await yaml.load(fs.readFileSync(dataFilePath, { encoding: 'utf-8' }));
  });
}


/* Getting media */
// async function getMedia(dataFilePath: string): Promise<MediaItem[]> {
//   return await cache.get(`media-${dataFilePath}`, async () => {
//     const directoryPath = path.dirname(dataFilePath);
//     const _data = await getFileData(dataFilePath);
//     return await prepareMedia(directoryPath, _data.media);
//   });
// }
