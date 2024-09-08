import {useMemo, useEffect, useState, useRef} from "react";
import { subscribe, type QueryOptions as QO, type Result, getSortedID, addQuery, removeQuery } from 'adax-core';


export interface QueryOptions extends QO {
  dependencyArray?: any[];
};

const getDependencyArray = (readFn: Function, paramsObj?: any, options: QueryOptions = {}) => {
  if (options?.dependencyArray) {
    return options.dependencyArray;
  }
  if (!paramsObj) {
    return [readFn];
  }
  let ret: any[]= [readFn];
  Object.keys(paramsObj).sort().map((k) => {
    const argType = typeof paramsObj[k];
    if (argType === 'string' || argType === 'number' || argType === 'boolean' || argType === 'symbol') {
      ret.push(k+':'+paramsObj[k]);
    } else {
      try {
        ret.push(k+':'+JSON.stringify(paramsObj[k]));
        console.error('WARNING: non scalar prop '+k+' was stringified for the dependency array! Consider providing a custom dependencyArray!');
      } catch (err) {
        console.error('ERROR: unable to stringify ['+k+']! You MUST provide a custom dependencyArray! Details below ...');
        console.error(err);
        throw err;
      }
    }
  });
  return ret;
}
// IAK 6!
export const useSync = <FnType extends (x: any) => any>(
  readFn: FnType,
  paramsObj?: Parameters<FnType>[0],
  options: QueryOptions = {}
): Readonly<ReturnType<FnType>> => {
  const [_, forceUpdate] = useState<number>(0);
  const result = useRef<ReturnType<FnType>>(options?.skipInitalQuerying ? undefined : readFn(paramsObj));
  const isCleanedUp = useRef(false);
  const paramsArr = getDependencyArray(readFn, paramsObj, options);
  const readTrigger = (res: Result) => {
    result.current = res.data;
    //console.info('result.current is now: ', res);
    forceUpdate((d) => d + 1);
  };
  useEffect(() => {
    const { onMounted, onBeforeUnmount } = subscribe(readTrigger, readFn, paramsObj, {...options, skipInitalQuerying: true});
    onMounted();
    if (isCleanedUp.current) {
      //cleanedUp function called and this code line reached. 
      //  I.e. paramsArr dependency array changed! Thus we must re-initiate the results!
      readTrigger({data: options?.skipInitalQuerying ? undefined : readFn(paramsObj), prevData: result.current ?? undefined, version: 0});
    }
    return () => {
      isCleanedUp.current = true;
      onBeforeUnmount();
    };
    // eslint-disable-next-line 
  }, paramsArr);
  return result.current;
};


// Extra comment to force new version 0.0.6
// export const useSync = <FnType extends (x: any) => any>(
//   readFn: FnType,
//   paramsObj?: Parameters<FnType>[0],
//   options: QueryOptions = {}
// ) => {
//   const initResult = useRef<{ data: ReturnType<FnType>, prevData: ReturnType<FnType> | undefined, version: number }>({
//     data: readFn(paramsObj || undefined),
//     prevData: undefined,
//     version: 0,
//   });
//   const [_, forceUpdate] = useState<number>(0);
//   const cmpId = useRef(options.cmpId ?? getSortedID());
//   const paramsArr = paramsObj
//     ? Object.keys(paramsObj).map((k) => paramsObj[k])
//     : [];
//   //paramsArr.push(Kernel.read2writeListMap?.has(readFn));
//   useEffect(() => {
//     // Better useEffect ? https://stackoverflow.com/questions/54095994/react-useeffect-comparing-objects
//     addQuery({ queryFn: readFn, queryInstance: {
//       instanceKey: cmpId.current,
//       readTrigger: (res: Result) => {
//         initResult.current = res;
//         forceUpdate((d) => d + 1);
//       },
//       paramsObj: paramsObj || {},
//       options,
//       //TODO: Make sure below is correct (Trying to have a valid prevData before the first write)
//       result: initResult.current
//     }});
//     return () => {
//       removeQuery({ queryFn: readFn, queryInstance: {
//         // eslint-disable-next-line 
//         instanceKey: cmpId.current,
//         readTrigger: undefined,
//         paramsObj: paramsObj || {},
//         options,
//         result: { data: undefined, prevData: undefined, version: 0 }
//       }});
//     };
//     // eslint-disable-next-line 
//   }, paramsArr);
//   useMemo(
//     () => {
//       initResult.current.data =
//         initResult.current.data || readFn(paramsObj || undefined);
//     },
//     // eslint-disable-next-line 
//     paramsArr
//   );
//   const { data, version, prevData } = initResult.current;
//   return {
//     data,
//     version,
//     prevData
//   };
// };