import React from 'react';
import { useRouteData } from 'react-static';
import { CommonRouteData } from '../types';
import { Link } from './linksButtons';


const ItemClassNav: React.FC<{
  itemClassIDs: string[]
  relative: string
}> = function ({ itemClassIDs, relative }) {
  const {
    itemClassConfiguration,
  }: CommonRouteData = useRouteData();

  return <ul>
    {itemClassIDs.map(itemClassID =>
      <li>
        <Link to={itemClassID} relative={relative}>
          {itemClassConfiguration[itemClassID].meta.title}
        </Link>
      </li>
    )}
  </ul>;
}


export default () => {
  const {
    siteURLPrefix,
    registerURLPrefix,
    hasSubregisters,
    subregisters,
    itemClassConfiguration,
  }: CommonRouteData = useRouteData();

  //const loc = useLocation().pathname;
  //const routePath = (useRoutePath as () => string)();
  //function pathIsCurrent(path: string, relative?: string | boolean) {
  //  const normalizedRoutePath = normalizeInternalHRef(loc, path, relative);
  //  return normalizedRoutePath === `/${prefix ? `${prefix}/` : ''}${routePath}/`;
  //}

  const prefix = `${siteURLPrefix}/${registerURLPrefix}`.replace(/^\//, '').replace(/\/$/, '');
  //const rootURLPath = prefix === '' ? prefix : `/${prefix}/`;
  //const bannerSrcPrefix = prefix === '' ? '/' : `/${prefix}/`;

  let nav: JSX.Element;
  if (hasSubregisters) {
    nav = (
      <>
        {Object.entries(subregisters).map(([subregID, subregData]) =>
          <div>
            <Link to={subregID} relative={prefix}>{subregData.title}</Link>
            <ItemClassNav
              relative={`${prefix}/${subregID}`}
              itemClassIDs={subregData.itemClasses}
            />
          </div>
        )}
      </>
    );
  } else {
    nav = <ItemClassNav
      itemClassIDs={Object.keys(itemClassConfiguration)}
      relative={prefix}
    />
  }

  return <nav>{nav}</nav>;
};
