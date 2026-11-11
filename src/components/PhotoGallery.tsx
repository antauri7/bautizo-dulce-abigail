import {useEffect,useRef,useState} from 'react';
import {X,ChevronLeft,ChevronRight,Expand} from 'lucide-react';
import {photo,descriptions} from '../config/event';
import photos from '../config/photos.json';
export default function PhotoGallery(){
 const [active,setActive]=useState<number|null>(null);const dialog=useRef<HTMLDialogElement>(null);const start=useRef(0);
 const move=(delta:number)=>setActive(n=>n===null?n:(n+delta+photos.length)%photos.length);
 useEffect(()=>{if(active!==null){dialog.current?.showModal();const prev=document.body.style.overflow;document.body.style.overflow='hidden';return()=>{document.body.style.overflow=prev;};}dialog.current?.close();},[active]);
 return <><div className="gallery">{photos.map((p,i)=><button className="gallery-photo" key={p.id} onClick={()=>setActive(i)} aria-label={`Ampliar: ${descriptions[i]}`}><img src={photo(p.id,480)} srcSet={`${photo(p.id,480)} 480w, ${photo(p.id)} 960w`} sizes="(max-width: 600px) 45vw, 25vw" width={p.width} height={p.height} loading="lazy" alt={descriptions[i]}/><span><Expand size={18}/></span></button>)}</div><dialog className="lightbox" ref={dialog} onCancel={()=>setActive(null)} onClick={e=>{if(e.target===e.currentTarget)setActive(null);}} onKeyDown={e=>{if(e.key==='ArrowRight')move(1);if(e.key==='ArrowLeft')move(-1);}}><button autoFocus className="close" onClick={()=>setActive(null)} aria-label="Cerrar fotografía"><X/></button><button className="previous" onClick={()=>move(-1)} aria-label="Fotografía anterior"><ChevronLeft/></button>{active!==null&&<figure onTouchStart={e=>{start.current=e.touches[0].clientX;}} onTouchEnd={e=>{const delta=e.changedTouches[0].clientX-start.current;if(Math.abs(delta)>45)move(delta<0?1:-1);}}><img src={photo(active+1,1440)} alt={descriptions[active]}/><figcaption>{active+1} / 11 · {descriptions[active]}</figcaption></figure>}<button className="next" onClick={()=>move(1)} aria-label="Siguiente fotografía"><ChevronRight/></button></dialog></>;
}
