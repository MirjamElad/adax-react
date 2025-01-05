import { useEffect, useState, useRef } from "react";
import { trigger as origTrigger, subscribe, type QueryOptions as QO, type Result } from 'adax-core';

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

const useSync = <FnType extends (x: any) => any>(
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

const add = (a: number,b: number) => a+b;
const xxx = origTrigger;
export { add, xxx, useSync };