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
  RelationSet,
} from './types';

import SimpleCache from './SimpleCache';
import { Payload } from '@riboseinc/paneron-registry-kit/types/item';


const cache = new SimpleCache();


type ReverseRelationGetter =
  (itemID: string, classID: string, subregisterID?: string) =>
    RelationSet;


interface ItemCache {
  itemID: string
  itemClassID: string
  subregisterID?: string
  dataPath: string
}


interface ItemRef {
  itemID: string
  classID: string
  subregisterID?: string
}


type ItemCallback = (item: ItemCache) => void


function detectRelations(itemData: Payload, relationSet?: RelationSet): RelationSet {
  const result: RelationSet = relationSet ?? {};
  for (const i in itemData) {
    if (Object.prototype.hasOwnProperty.call(itemData, i)) {
      if (typeof itemData[i] === 'object' && itemData[i] !== null) {
        if (itemData[i].itemID && itemData[i].classID) {
          const relation: ItemRef = itemData[i];
          result[relation.itemID] = { classID: relation.itemID, subregisterID: relation.subregisterID };
        } else {
          detectRelations(itemData[i], result);
        }
      } else if (typeof itemData[i] === 'string' && isUUIDv4(itemData[i])) {
        result[itemData[i]] = { classID: '', subregisterID: '' };
      }
    }
  }
  return result;
}


function isUUIDv4(value: string): boolean {
  const result = (
    value.match(/^[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i) ?? // v4
    value.match(/^[0-9A-F]{8}-[0-9A-F]{4}-[3][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i) ?? // v3
    value.match(/^[0-9A-F]{8}-[0-9A-F]{4}-[2][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i) ?? // v2
    value.match(/^[0-9A-F]{8}-[0-9A-F]{4}-[1][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i) ?? // v1
    value.match(/^[0-9A-F]{8}-[0-9A-F]{4}-[5][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i)    // v5
  );
  return result !== null;
}


export default ({
  datasetSourcePath, urlPrefix,
  itemClassConfiguration,
  subregisters,
  iconURL, footerBanner, headerBanner, footerBannerLink,

  itemClassPageTemplate,
  itemPageTemplate,
  subregisterPageTemplate,
  homePageTemplate,
}: PluginConfig) => {

  const itemCache: ItemCache[] = [];
  const reverseRelationCache: { [toItemID: string]: RelationSet } = {};

  const reverseRelationGetter: ReverseRelationGetter = function (toItemID, ofClassID, inSubregisterID) {
    return reverseRelationCache[toItemID] ?? {};
  };

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
    throw new Error("Unknown template requested");
    //return path.join(__dirname, `Default${what}Page/index`);
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
        iconURL,
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
            commonRouteData,
            reverseRelationGetter));
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
            commonRouteData,
            reverseRelationGetter));
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

      for (const item of itemCache) {
        const itemData = await getFileData<RegisterItem<any>>(item.dataPath);
        const outgoingRelations = detectRelations(itemData);
        for (const itemID of Object.keys(outgoingRelations)) {
          if (itemID !== item.itemID) {
            reverseRelationCache[itemID] ||= {};
            reverseRelationCache[itemID][item.itemID] = {
              classID: item.itemClassID,
              subregisterID: item.subregisterID,
            };
          }
        }
      }

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
  reverseRelationGetter: ReverseRelationGetter,
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
        reverseRelationGetter,
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
  reverseRelationGetter: ReverseRelationGetter,
  subregisterID?: string,
): Route {
  const classID = dirent.name;

  return {
    path: classID,
    template: itemClassTemplate,
    children: (dirent.children ?? []).
      map(dirent => direntToItemRoute(
        registerItem,
        dirent,
        itemTemplate,
        context,
        classID,
        reverseRelationGetter,
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
  reverseRelationGetter: ReverseRelationGetter,
  subregisterID?: string,
): Route {
  const itemID = noExt(dirent.name);

  registerItem({ itemID, itemClassID, subregisterID, dataPath: dirent.path });

  return {
    path: itemID,
    template: itemTemplate,
    getData: getItemPageRouteData(dirent, context, itemClassID, reverseRelationGetter, subregisterID),
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
    map(dirent => path.join(
      path.dirname(dirent.path),
      dirent.name));

  return async () => {
    const items = await Promise.all(itemPaths.map(async (itemPath) => await getFileData<RegisterItem<any>>(itemPath)));

    let itemsSorted: RegisterItem<any>[];
    if (itemClass.itemSorter) {
      itemsSorted = items.sort((i1, i2) => itemClass.itemSorter!(i1.data, i2.data));
    } else {
      itemsSorted = items;
    }

    return {
      ...context,
      itemClassID,
      subregisterID,
      itemClass,
      items: itemsSorted,
    };
  };
}


function getItemPageRouteData(
  dirent: DirectoryTree,
  context: CommonRouteData,
  itemClassID: string,
  reverseRelationGetter: ReverseRelationGetter,
  subregisterID?: string,
): () => Promise<RegisterItemPageRouteData> {

  return async () => {
    const dataPath = dirent.path;
    const item = await getFileData<RegisterItem<any>>(dataPath);
    const reverseRelations = reverseRelationGetter(item.id, itemClassID, subregisterID);

    return {
      ...context,
      itemClassID,
      subregisterID,
      item,
      reverseRelations,
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
