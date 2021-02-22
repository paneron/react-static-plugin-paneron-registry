import fs from 'fs';
//import { execSync as shell } from 'child_process';
import path from 'path';
import dirTree, { DirectoryTree } from 'directory-tree';
import yaml from 'js-yaml';

import type { Route } from 'react-static';
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


interface ItemCache {
  itemID: string
  itemClassID: string
  subregisterID?: string
  dataPath: string
}


type ItemCallback = (item: ItemCache) => void


export default ({
  datasetSourcePath, urlPrefix,
  itemClassConfiguration,
  subregisters,
  footerBanner, headerBanner, footerBannerLink,

  itemClassPageTemplate,
  itemPageTemplate,
  subregisterPageTemplate,
  homePageTemplate,
}: PluginConfig) => {

  const itemCache: ItemCache[] = [];


  function getTemplate(what: 'RegisterItem' | 'ItemClass' | 'Subregister' | 'Home'): string {
    //console.debug("Getting template", __dirname, what);

    if (what === 'RegisterItem' && itemPageTemplate) {
      return itemPageTemplate;
    } else if (what === 'ItemClass' && itemClassPageTemplate) {
      return itemClassPageTemplate;
    } else if (what === 'Subregister' && subregisterPageTemplate) {
      return subregisterPageTemplate;
    } else if (what === 'Home' && homePageTemplate) {
      return homePageTemplate;
    }
    return path.join(__dirname, `Default${what}Page/index`);
  }

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

      const registerItem: ItemCallback = function (item: ItemCache) {
        itemCache.push(item);
        statistics.totalItemCount += 1;
        //console.debug("Registered item in cache", item, statistics.totalItemCount);
      }

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
        const subregDirents = (dirTree(subregisterRoot).children ?? []).
          filter(dirent => subregisters[dirent.name] !== undefined);
        for (const subregID of Object.keys(commonRouteData.subregisters)) {
          if (!subregDirents.find(dirent => dirent.name === subregID)) {
            delete commonRouteData.subregisters[subregID];
          }
        }
        registerContentRoutes = subregDirents.
          map(dirent => direntToSubregRoute(
            registerItem,
            dirent,
            subregisterTemplate,
            itemClassTemplate,
            itemTemplate,
            commonRouteData));
      } else {
        commonRouteData.subregisters = {};
        const itemClassDirents = dirTree(
          datasetSourcePath,
          { attributes: ['isDirectory'] },
        ).children ?? [];
        registerContentRoutes = itemClassDirents.
          map(dirent => direntToItemClassRoute(
            registerItem,
            dirent,
            itemClassTemplate,
            itemTemplate,
            commonRouteData));
      }

      let routes: Route[] = [
        ...routesBefore,
        {
          path: urlPrefix || '/',
          template: getTemplate('Home'),
          getData: async (): Promise<MainRegistryPageRouteData> => ({
            ...commonRouteData,
            statistics,
          }),
          children: registerContentRoutes,
        },
      ];

      return routes;
    },

    afterExport: async (state: ReactStaticState) => {
      const registerOutPrefix = `dist/${urlPrefix}`;

      for (const cachedItem of itemCache) {
        const itemData = await getFileData<RegisterItem<any>>(cachedItem.dataPath);
        const itemJSONDirPath = cachedItem.subregisterID
          ? path.join(registerOutPrefix, cachedItem.subregisterID, cachedItem.itemClassID, cachedItem.itemID)
          : path.join(registerOutPrefix, cachedItem.itemClassID, cachedItem.itemID);
        const itemJSONPath = path.join(itemJSONDirPath, 'item.json');
        const itemJSON = JSON.stringify(itemData);

        fs.mkdirSync(itemJSONDirPath, { recursive: true });
        fs.writeFileSync(itemJSONPath, itemJSON, 'utf8');
      }

      return state;
    },

  };

};


function direntToSubregRoute(
  registerItem: ItemCallback,
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
    children: (dirent.children ?? []).
      map(dirent => direntToItemClassRoute(
        registerItem,
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
  registerItem: ItemCallback,
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
    children: (dirent.children ?? []).
      slice(0, 10).
      map(dirent => direntToItemRoute(
        registerItem,
        dirent,
        itemTemplate,
        context,
        classID,
        subregisterID,
      )),
    getData: getItemClassPageRouteData(dirent, context, subregisterID),
  };
}


function direntToItemRoute(
  registerItem: ItemCallback,
  dirent: DirectoryTree,
  itemTemplate: string,
  context: CommonRouteData,
  itemClassID: string,
  subregisterID?: string,
): Route {
  const itemID = noExt(dirent.name);

  registerItem({ itemID, itemClassID, subregisterID, dataPath: dirent.path });

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
      subregisterID,
      subregister,
    };
  };
}


function getItemClassPageRouteData(
  dirent: DirectoryTree,
  context: CommonRouteData,
  subregisterID?: string,
): () => Promise<ItemClassPageRouteData> {
  const itemClassID = dirent.name;
  const itemClass = context.itemClassConfiguration[itemClassID];
  const itemPaths = (dirent.children ?? []).
    slice(0, 10).
    map(dirent => path.join(
      path.dirname(dirent.path),
      dirent.name));

  return async () => {
    const items = await Promise.all(itemPaths.map(async (itemPath) => await getFileData<RegisterItem<any>>(itemPath)));

    return {
      ...context,
      itemClassID,
      subregisterID,
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
