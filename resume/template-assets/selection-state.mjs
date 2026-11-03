export const STORAGE_KEY='kelen-template-exclusions-v1';
export const STAR_STORAGE_KEY='kelen-template-stars-v1';
export function parseStars(raw,ids){if(!raw)return new Set();const data=JSON.parse(raw);if(data.version!==1||!Array.isArray(data.starred))throw new Error('Invalid stars');return new Set(data.starred.filter(id=>typeof id==='string'&&ids.has(id)));}
export function serializeStars(starred){return JSON.stringify({version:1,starred:[...starred].sort()});}
export function parseSelection(raw,ids){
  if(!raw)return new Set();
  const data=JSON.parse(raw);
  if(data.version!==1||!Array.isArray(data.excluded))throw new Error('Invalid selection');
  return new Set(data.excluded.filter(id=>typeof id==='string'&&ids.has(id)));
}
export function serializeSelection(excluded){return JSON.stringify({version:1,excluded:[...excluded].sort()});}
export function changeSelection(previous,id,exclude,ids){const next=new Set(previous);if(!ids.has(id))return next;if(exclude)next.add(id);else next.delete(id);return next;}
export function makeExport(items,excluded,version,starred=new Set()){return {version:1,catalogVersion:version,savedAt:new Date().toISOString(),starred:items.filter(x=>starred.has(x.id)&&!excluded.has(x.id)).map(x=>({id:x.id,title:x.title,source:x.source})),excluded:items.filter(x=>excluded.has(x.id)).map(x=>({id:x.id,title:x.title,source:x.source})),kept:items.filter(x=>!excluded.has(x.id)).map(x=>({id:x.id,title:x.title,source:x.source})),sources:['https://github.com/larashero3-dotcom/lieflat-charts','https://github.com/feitangyuan/motion-web']};}
