import {useEffect,useRef,useState} from 'react';
import {Camera,Upload,Check,ImagePlus} from 'lucide-react';
import {memoriesService} from '../config/services';
const {url,key,sitekey}=memoriesService;
const enabled=Boolean(url&&key&&sitekey);const MAX=5;const SIZE=6*1024*1024;
declare global{interface Window{turnstile?:{render:(el:HTMLElement,options:Record<string,unknown>)=>string;remove:(id:string)=>void;reset:(id:string)=>void}}}
export default function MemoriesUpload(){
 const [files,setFiles]=useState<File[]>([]);const [previews,setPreviews]=useState<string[]>([]);const [consent,setConsent]=useState(false);const [token,setToken]=useState('');const [status,setStatus]=useState('');const [progress,setProgress]=useState(0);const [busy,setBusy]=useState(false);const [approved,setApproved]=useState<{id:string;url:string}[]>([]);const widget=useRef<HTMLDivElement>(null);const widgetId=useRef<string|undefined>(undefined);
 useEffect(()=>{const next=files.map(f=>URL.createObjectURL(f));setPreviews(next);return()=>next.forEach(URL.revokeObjectURL);},[files]);
 useEffect(() => {
  if (!enabled) return;
  let attempts = 0;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let disposed = false;
  const reportError = () => {
   if (disposed) return;
   setToken('');
   setStatus('No se pudo cargar la verificación de seguridad. Recarga la página para reintentar.');
  };
  const renderWhenReady = () => {
   if (disposed || !widget.current || widgetId.current) return;
   const api = window.turnstile;
   if (typeof api?.render !== 'function') {
    if (++attempts < 60) timer = setTimeout(renderWhenReady, 250);
    else reportError();
    return;
   }
   try {
    widgetId.current = api.render(widget.current, {
     sitekey,
     action: 'memories',
     callback: (value: string) => setToken(value),
     'expired-callback': () => setToken(''),
     'error-callback': reportError,
    });
   } catch {
    reportError();
   }
  };
  let script = document.querySelector<HTMLScriptElement>('#turnstile');
  if (!script) {
   script = document.createElement('script');
   script.id = 'turnstile';
   script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
   script.async = true;
   document.head.appendChild(script);
  }
  script.addEventListener('error', reportError);
  renderWhenReady();
  return () => {
   disposed = true;
   clearTimeout(timer);
   script.removeEventListener('error', reportError);
   const id = widgetId.current;
   if (id && typeof window.turnstile?.remove === 'function') window.turnstile.remove(id);
   widgetId.current = undefined;
  };
 }, []);
 useEffect(()=>{if(!url||!key)return;fetch(`${url}/functions/v1/memories`,{headers:{apikey:key}}).then(r=>{if(!r.ok)throw Error();return r.json();}).then(data=>setApproved(data.photos??[])).catch(()=>{});},[]);
 const upload=async(e:React.FormEvent)=>{e.preventDefault();if(!consent||!files.length||!token)return;setBusy(true);setStatus('');setProgress(0);try{const body=new FormData();files.forEach(f=>body.append('photos',f));body.append('token',token);body.append('consent','true');await new Promise<void>((resolve,reject)=>{const xhr=new XMLHttpRequest();xhr.open('POST',`${url}/functions/v1/memories`);xhr.setRequestHeader('apikey',key);xhr.upload.onprogress=e=>{if(e.lengthComputable)setProgress(Math.round(e.loaded/e.total*100));};xhr.onload=()=>{if(xhr.status>=200&&xhr.status<300)resolve();else{let message='No se pudieron recibir las fotografías. Inténtalo nuevamente.';try{message=JSON.parse(xhr.responseText).error??message;}catch{}reject(Error(message));}};xhr.onerror=()=>reject(Error('No hay conexión. Revisa tu internet e inténtalo de nuevo.'));xhr.timeout=120000;xhr.ontimeout=()=>reject(Error('La carga tardó demasiado. Inténtalo con menos fotografías.'));xhr.send(body);});setStatus('¡Recibimos tus fotografías! Se mostrarán después de ser revisadas por la familia.');setFiles([]);setConsent(false);}catch(e){setStatus(e instanceof Error?e.message:'Ocurrió un error.');}finally{setBusy(false);setToken('');if(widgetId.current)window.turnstile?.reset?.(widgetId.current);}};
 return <section className="memories section" id="recuerdos"><div className="memory-illustration"><div className="polaroid"><Camera size={54} strokeWidth={.8}/><span>Instantes para siempre</span></div><span className="little-star">✧</span></div><div><p className="eyebrow">EL ÁLBUM LO HACEMOS JUNTOS</p><h2>Comparte tus<br/><em>recuerdos</em></h2><p>Cada fotografía guarda una historia. Ayúdanos a conservar las sonrisas y los momentos más bonitos de este día compartiendo las fotografías que captures.</p>{!enabled?<div className="upload-disabled"><ImagePlus size={23}/><div><strong>Pronto podremos recibir tus fotografías</strong><p>La recepción aún no está habilitada. Vuelve a visitarnos para compartir tus recuerdos, también después de la celebración.</p></div></div>:<form onSubmit={upload}><label className="file-label"><Upload size={18}/> Seleccionar mis fotografías<input type="file" accept="image/jpeg,image/png" multiple disabled={busy} onChange={e=>{const chosen=Array.from(e.target.files??[]);if(chosen.length>MAX||chosen.some(f=>f.size>SIZE||!['image/jpeg','image/png'].includes(f.type))){setStatus('Selecciona hasta 5 imágenes JPG o PNG, de máximo 6 MB cada una.');setFiles([]);e.target.value='';return;}setStatus('');setFiles(chosen);}}/></label><small>Hasta 5 fotografías · JPG o PNG · 6 MB por imagen</small><div className="upload-previews">{previews.map((p,i)=><img key={p} src={p} alt={`Vista previa ${i+1}`}/>)}</div><label className="consent"><input type="checkbox" required checked={consent} disabled={busy} onChange={e=>setConsent(e.target.checked)}/>Tengo permiso de las personas que aparecen y acepto que la familia revise estas fotografías y pueda mostrarlas en la galería pública.</label><div ref={widget}/><button className="button" disabled={busy||!files.length||!consent||!token}>{busy?'Enviando…':'Subir mis fotografías'}<Upload size={16}/></button>{busy&&<><progress value={progress} max="100" aria-label="Progreso de envío"/><small>{progress===100?'Procesando y guardando las fotografías…':`${progress}% enviado`}</small></>}</form>}<p role="status" className="upload-status">{status}</p><p className="fine-print"><Check size={13}/> Tus recuerdos se publicarán únicamente con aprobación de la familia.</p></div>{approved.length>0&&<div className="approved-gallery"><h3>Recuerdos de nuestra celebración</h3>{approved.map(p=><a key={p.id} href={p.url} target="_blank" rel="noopener noreferrer"><img src={p.url} alt="Recuerdo compartido y aprobado por la familia" loading="lazy"/></a>)}</div>}</section>;
}
