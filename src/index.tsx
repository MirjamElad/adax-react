import { useEffect, useState, useRef } from "react";
import { subscribe, type QueryOptions as QO, type Result } from 'adax-core';
export { trigger, addRule, removeRule } from 'adax-core';


export interface QueryOptions extends QO {
  dependencyArray?: any[];
};

const getDependencyArray = (readFn: Function, paramsObj?: any, options: QueryOptions = {}) => {
  /* istanbul ignore next */
  if (options?.dependencyArray) {
    /* istanbul ignore next */
    return options.dependencyArray;
  }
  if (!paramsObj) {
    return [readFn];
  }
  let ret: any[]= [readFn];
  Object.keys(paramsObj).sort().map((k) => {
    const argType = typeof paramsObj[k];
    if (!paramsObj[k] || argType === 'string' || argType === 'number' || argType === 'boolean' || argType === 'symbol') {
      ret.push(k+':'+paramsObj[k]);
    } 
    /* istanbul ignore next */
    else {
    /* istanbul ignore next */
      try {
        ret.push(k+':'+JSON.stringify(paramsObj[k]));
        console.error('WARNING: non scalar prop '+k+' was stringified for the dependency array! Consider providing a custom dependencyArray!');
      } 
    /* istanbul ignore next */ catch (err) {
        console.error('ERROR: unable to stringify ['+k+']! You MUST provide a custom dependencyArray! Details below ...');
        console.error(err);
        throw err;
      }
    }
  });
  return ret;
}

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
    forceUpdate((d) => d + 1);
  };
  useEffect(() => {
    const { on, off } = subscribe(readTrigger, readFn, paramsObj, {...options, skipInitalQuerying: true});
    on();
    if (isCleanedUp.current) {
      //cleanedUp function called and this code line reached. 
      //  I.e. paramsArr dependency array changed! Thus we must re-initiate the results!
      readTrigger({
        data: options?.skipInitalQuerying ? undefined : readFn(paramsObj),
        prevData: result.current ?? undefined,
        version: 0,
        writeFn: undefined,
        writeParamsObj: undefined
      });
    }
    return () => {
      isCleanedUp.current = true;
      off();
    };
    // eslint-disable-next-line 
  }, paramsArr);
  return result.current;
};
