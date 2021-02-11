import fs from 'fs';
import { execSync as shell } from 'child_process';
import path from 'path';
import dirTree, { DirectoryTree } from 'directory-tree';
import yaml from 'js-yaml';

import { Route } from 'react-static';

import { Register } from '@riboseinc/paneron-registry-kit/types';

import { ConceptData } from '@riboseinc/paneron-extension-glossarist/classes/concept';
import { DesignationData } from '@riboseinc/paneron-extension-glossarist/classes/designation';
import { DefinitionData } from '@riboseinc/paneron-extension-glossarist/classes/definition';

import {
  ReactStaticState,
  PluginConfig,
  ConceptPageRouteData,
} from './types';

import SimpleCache from './SimpleCache';



const cache = new SimpleCache();


const UNIVERSAL_REGISTER_NAME = 'universal';


interface LanguageSpecificDirEntries {
  [langID: string]: {
    definitions: { [uuid: string]: string }
    designations: { [uuid: string]: string }
  }
}


export default ({
  datasetSourcePath, urlPrefix, template, conceptTemplate,
  footerBanner, headerBanner, footerBannerLink,
}: PluginConfig) => {

  return {

    getRoutes: async (routes: Route[], _state: ReactStaticState) => {
      const subregisterRoot = path.join(datasetSourcePath, 'subregisters');
      const subregisterDirEntries = dirTree(subregisterRoot).children!;

      const universalConceptRoot = path.join(
        subregisterRoot,
        UNIVERSAL_REGISTER_NAME,
        'concept');

      const languageRoots = subregisterDirEntries.
        map(entry => entry.name).
        filter(n => n !== UNIVERSAL_REGISTER_NAME);

      const languageSpecificDirEntries: LanguageSpecificDirEntries =
      languageRoots.map(langDirName => {
        const langRoot = path.join(subregisterRoot, langDirName);

        let designations: { [uuid: string]: string } = {};
        try {
          for (const dirent of (dirTree(path.join(langRoot, 'designation')).children ?? [])) {
            designations[noExt(dirent.name)] = path.join(langRoot, 'designation', dirent.name);
          }
        } catch (e) {
          console.error("Couldn’t collect designation paths", e);
        }

        let definitions: { [uuid: string]: string } = {};
        try {
          for (const dirent of (dirTree(path.join(langRoot, 'definition')).children ?? [])) {
            designations[noExt(dirent.name)] = path.join(langRoot, 'definition', dirent.name);
          }
        } catch (e) {
          console.error("Couldn’t collect definition paths", e);
        }

        return {
          [langDirName]: {
            designations,
            definitions,
          },
        };
      }).reduce((prev, curr) => ({ ...prev, ...curr }), {});

      const universalConceptEntries = dirTree(
        universalConceptRoot,
        { extensions: /\.yaml$/ },
      ).children;

      const registerMeta = await getFileData<Register>(path.join(datasetSourcePath, 'register.yaml'));

      const basePath = _state.config.basePath || '';

      if (universalConceptEntries) {

        let effectiveTemplate: string;

        if (!conceptTemplate) {
          const _defaultTemplateSrc = path.join(__dirname, 'DefaultConceptPage');
          const _defaultTemplate = path.join(process.cwd(), '_ConceptPage');
          shell(`mkdir -p "${_defaultTemplate}"`);
          shell(`cp -r "${_defaultTemplateSrc}/"* "${_defaultTemplate}"`)
          effectiveTemplate = '_ConceptPage/index';
        } else {
          effectiveTemplate = conceptTemplate;
        }

        //const [docsNav, redirectRoutes] = await Promise.all([
        //  await Promise.all(
        //    (universalConceptEntries.children || []).filter(isValid).map(c => getDocsPageItems(c))
        //  ),
        //  await Promise.all(
        //    (universalConceptEntries.children || []).filter(isValid).map(c => getRedirects(urlPrefix, c, urlPrefix))
        //  ),
        //]);

        return [
          ...routes,
          ...universalConceptEntries.map(entry => datasetDirEntryToConceptRoute(
            entry,
            effectiveTemplate,
            languageSpecificDirEntries,
            {
              siteURLPrefix: basePath,
              glossaryURLPrefix: urlPrefix,
              register: registerMeta,
              headerBanner,
              footerBanner,
              footerBannerLink,
            },
          )),
        ];
      } else {
        return routes;
      }
    },

    afterExport: async (state: ReactStaticState) => {
      // const docsURLPrefix = `${urlPrefix}/`;
      // const docsSrcPrefix = path.basename(sourcePath);
      // const docsOutPrefix = `dist/${urlPrefix}`;

      // console.debug("After export: Processing page media…");
      // console.debug("| URL prefix", docsURLPrefix);
      // console.debug("| Source path prefix", docsSrcPrefix);
      // console.debug("| output path prefix", docsOutPrefix);

      // console.debug("| Copying banners…");

      // fs.copyFileSync(path.join(headerBanner), path.join(docsOutPrefix, headerBanner));
      // fs.copyFileSync(path.join(footerBanner), path.join(docsOutPrefix, footerBanner));

      // console.debug("| | Done");

      // console.debug("| Processing routes…");

      // for (const r of state.routes) {
      //   if (docsURLPrefix === '/' || r.path === urlPrefix || r.path.indexOf(docsURLPrefix) === 0) {
      //     const id = r.path.startsWith(docsURLPrefix)
      //       ? r.path.replace(docsURLPrefix, '')
      //       : r.path;
      //     const _data = r.data?.docPage?.data;
      //     console.debug("| | Processing docs page route with path", r.path, "and parsed ID", id);
      //     if (!_data) {
      //       console.debug("| | | No route data found, skipping");
      //     } else {
      //       const media = (_data.media || []);
      //       const pageSourcePath = (r._isIndexFile && r.path !== urlPrefix) ? id : path.dirname(id);
      //       const pageTargetPath = (r.path !== urlPrefix) ? id : path.dirname(id);
      //       console.debug("| | | Page source path", pageSourcePath);
      //       console.debug("| | | Page target path", pageTargetPath);
      //       console.debug("| | | Copying media files…");
      //       for (const f of media) {
      //         const mediaSource = `${docsSrcPrefix}/${pageSourcePath}/${f.filename}`;
      //         const mediaTarget = `${docsOutPrefix}/${pageTargetPath}/${f.filename}`;
      //         console.debug("| | | | Copying file", mediaSource, mediaTarget);
      //         fs.copyFileSync(mediaSource, mediaTarget);
      //         console.debug("| | | | | Done");
      //       }
      //     }
      //   } else {
      //     console.debug("| | Skipping non-docs-page route with path", r.path);
      //   }
      // }

      // return state;
    },

  };

};


function datasetDirEntryToConceptRoute(
  entry: DirectoryTree,
  template: string,
  relatedItems: LanguageSpecificDirEntries,
  context: Omit<ConceptPageRouteData, 'concept' | 'relatedItemData'>,
): Route {
  return {
    path: datasetDirEntryNameToRoutePath(entry.name),
    template,
    getData: getConceptPageRouteData(entry, relatedItems, context),
  };
}


function getConceptPageRouteData(
  universalConceptEntry: DirectoryTree,
  relatedItems: LanguageSpecificDirEntries,
  context: Omit<ConceptPageRouteData, 'concept' | 'relatedItemData'>,
): () => Promise<ConceptPageRouteData> {

  return async () => {
    const dataPath = universalConceptEntry.path;
    const _conceptData = await getFileData<ConceptData>(dataPath);

    const _relatedItemData: ConceptPageRouteData["relatedItemData"] = {
      'designations': {},
      'definitions': {},
    };

    for (const [langID, designations] of Object.entries(_conceptData.designations)) {
      _relatedItemData.designations[langID] ||= {};
      for (const uuid of designations) {
        _relatedItemData.designations[langID][uuid] =
          await getFileData<DesignationData>(relatedItems[langID].designations[uuid]);
      }
    }

    for (const [langID, definitions] of Object.entries(_conceptData.definitions)) {
      _relatedItemData.definitions[langID] ||= {};
      for (const uuid of definitions) {
        _relatedItemData.definitions[langID][uuid] =
          await getFileData<DefinitionData>(relatedItems[langID].definitions[uuid]);
      }
    }

    return {
      ...context,
      concept: _conceptData,
      relatedItemData: _relatedItemData,
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


function datasetDirEntryNameToRoutePath(name: string): string {
  return `${noExt(name) || '/'}`;
}


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
