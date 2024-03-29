import { useEffect, useState } from 'react';

import axios from 'axios';

import {
  ItemClassConfiguration,
  RegisterItemDataHook,
  RelatedItemClassConfiguration,
} from '@riboseinc/paneron-registry-kit/types';


export const _getRelatedClass = (classes: Record<string, ItemClassConfiguration<any>>) => {
  return (clsID: string): RelatedItemClassConfiguration => {
    const cfg = classes[clsID];
    return {
      title: cfg.meta.title,
      itemView: cfg.views.listItemView,
    };
  };
};


function itemPathToJSONPath(itemPath: string) {
  if (itemPath.startsWith('subregisters') || itemPath.startsWith('/subregisters')) {
    return `/${itemPath.replace('/subregisters/', '').replace('subregisters/', '').replace('.yaml', '')}/item.json`;
  } else {
    return `/${itemPath.replace('.yaml', '').replace(/^\//, '')}/item.json`;
  }
}


//export function makeRegisterItemDataHook(baseURL: string): RegisterItemDataHook {

export const useRegisterItemData: RegisterItemDataHook = ({ itemPaths: requestedPaths }) => {
  const [data, setData] = useState<Record<string, any>>({});
  const [isUpdating, setIsUpdating] = useState(false);
  const [errors, setErrors] = useState<Error[]>([]);

  useEffect(() => {
    setIsUpdating(true);
    (async () => {
      try {
        const data = (
          await Promise.all(requestedPaths.map(async (p) => ({
            [p]: (await axios.get(itemPathToJSONPath(p))).data,
          })))
        ).reduce((prev, curr) => ({ ...prev, ...curr }), {});
        setData(data);
        setErrors([]);
      } catch (e) {
        setErrors([e]);
      } finally {
        setIsUpdating(false);
      }
    })();
  }, [JSON.stringify(requestedPaths)]);


  //console.debug("Fetched register item data", paths, data);

  return {
    value: data,
    errors,
    isUpdating,
    refresh: () => void 0,
    _reqCounter: 0,
  };
};
