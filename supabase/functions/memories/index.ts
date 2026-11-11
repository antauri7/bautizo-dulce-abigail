import { createClient } from 'npm:@supabase/supabase-js@2.95.3';
import { Image } from 'https://deno.land/x/imagescript@1.3.0/mod.ts';
const required=(name:string)=>{const value=Deno.env.get(name);if(!value)throw Error(`Falta ${name}`);return value;};
const db=createClient(required('SUPABASE_URL'),required('SUPABASE_SERVICE_ROLE_KEY'),{auth:{persistSession:false}});
const origin=required('ALLOWED_ORIGIN');const host=required('TURNSTILE_HOSTNAME');const salt=required('RATE_LIMIT_SALT');const secret=required('TURNSTILE_SECRET_KEY');
const maxFiles=Math.min(5,Math.max(1,Number(Deno.env.get('MAX_FILES')||5)));const maxSize=6*1024*1024;
const headers={'Access-Control-Allow-Origin':origin,'Access-Control-Allow-Headers':'apikey, content-type, authorization','Access-Control-Allow-Methods':'GET, POST, OPTIONS','Vary':'Origin','Cache-Control':'no-store'};
const json=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:{...headers,'Content-Type':'application/json'}});
const hash=async(text:string)=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text)))).map(b=>b.toString(16).padStart(2,'0')).join('');
Deno.serve(async(req)=>{
 if(req.headers.get('origin')!==origin)return new Response('Origen no permitido',{status:403});
 if(req.method==='OPTIONS')return new Response(null,{status:204,headers});
 try{
  if(req.method==='GET'){
   const {data,error}=await db.from('memories').select('id,path').eq('status','approved').order('created_at',{ascending:false}).limit(100);if(error)throw error;
   const photos=[];
   for(const p of data??[]){const {data:signed,error}=await db.storage.from('memories-private').createSignedUrl(p.path,600);if(!error&&signed)photos.push({id:p.id,url:signed.signedUrl});}
   return json({photos});
  }
  if(req.method!=='POST')return json({error:'Método no permitido'},405);
  const contentType=req.headers.get('content-type')||'';if(!contentType.startsWith('multipart/form-data'))return json({error:'Formato de envío incorrecto.'},415);
  // Límite previo a procesar multipart, incluso si falta Content-Length.
  const ip=req.headers.get('x-forwarded-for')?.split(',')[0].trim();if(!ip)return json({error:'No se pudo verificar la conexión.'},403);
  const hour=Math.floor(Date.now()/3600000);const ipKey=await hash(`${salt}:${ip}:${hour}`);
  const {data:allowed,error:rateError}=await db.rpc('reserve_upload',{p_key:ipKey,p_max:6,p_expires:new Date((hour+2)*3600000).toISOString()});if(rateError)throw rateError;if(!allowed)return json({error:'Alcanzaste el límite de envíos. Inténtalo dentro de una hora.'},429);
  const {data:globalAllowed,error:globalError}=await db.rpc('reserve_upload',{p_key:`global:${hour}`,p_max:100,p_expires:new Date((hour+2)*3600000).toISOString()});if(globalError)throw globalError;if(!globalAllowed)return json({error:'La recepción está ocupada. Inténtalo más tarde.'},429);
  const reader=req.body?.getReader();if(!reader)return json({error:'Envío vacío.'},400);const chunks:Uint8Array[]=[];let bytes=0;
  while(true){const {done,value}=await reader.read();if(done)break;bytes+=value.length;if(bytes>maxFiles*maxSize+65536){await reader.cancel();return json({error:'El envío supera el límite permitido.'},413);}chunks.push(value);}
  const body=new Uint8Array(bytes);let offset=0;for(const chunk of chunks){body.set(chunk,offset);offset+=chunk.length;}
  const form=await new Response(body,{headers:{'Content-Type':contentType}}).formData();
  if(form.get('consent')!=='true')return json({error:'Es necesario aceptar el consentimiento.'},400);
  const token=form.get('token');if(typeof token!=='string'||token.length>2048)return json({error:'Verificación requerida.'},400);
  const verified=await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify',{method:'POST',body:new URLSearchParams({secret,response:token,remoteip:ip})}).then(r=>r.json());
  if(!verified.success||verified.hostname!==host||verified.action!=='memories')return json({error:'La verificación expiró. Vuelve a intentarlo.'},403);
  const files=form.getAll('photos');if(!files.length||files.length>maxFiles)return json({error:`Selecciona entre 1 y ${maxFiles} fotografías.`},400);
  const processed:{path:string;data:Uint8Array}[]=[];
  for(const f of files){
   if(!(f instanceof File)||f.size===0||f.size>maxSize||!['image/jpeg','image/png'].includes(f.type)||! /\.(jpe?g|png)$/i.test(f.name))return json({error:'Usa imágenes JPG o PNG de máximo 6 MB.'},400);
   const b=new Uint8Array(await f.arrayBuffer());const jpeg=b[0]===255&&b[1]===216&&b[2]===255;const png=b[0]===137&&b[1]===80&&b[2]===78&&b[3]===71&&b[4]===13&&b[5]===10&&b[6]===26&&b[7]===10;
   if(!(f.type==='image/jpeg'&&jpeg||f.type==='image/png'&&png))return json({error:'El contenido no coincide con el formato de la imagen.'},400);
   // Decodificar y recodificar elimina EXIF/GPS y contenido añadido. Nunca se publica el original.
   let image:Image;try{image=await Image.decode(b);}catch{return json({error:'No pudimos leer una imagen. Expórtala como JPG y vuelve a intentarlo.'},400);}
   if(image.width*image.height>24000000)return json({error:'La imagen supera los 24 megapíxeles. Reduce su tamaño.'},400);
   if(Math.max(image.width,image.height)>2000)image.resize(Math.round(image.width*2000/Math.max(image.width,image.height)),Math.round(image.height*2000/Math.max(image.width,image.height)));
   processed.push({path:`pending/${crypto.randomUUID()}.jpg`,data:await image.encodeJPEG(85)});
  }
  const stored:string[]=[];const ids:string[]=[];
  try{for(const f of processed){const {error}=await db.storage.from('memories-private').upload(f.path,f.data,{contentType:'image/jpeg',upsert:false});if(error)throw error;stored.push(f.path);const {data,error:insertError}=await db.from('memories').insert({path:f.path,mime:'image/jpeg',bytes:f.data.length,status:'pending'}).select('id').single();if(insertError)throw insertError;ids.push(data.id);}}
  catch(e){if(ids.length)await db.from('memories').delete().in('id',ids);if(stored.length)await db.storage.from('memories-private').remove(stored);throw e;}
  return json({received:processed.length,status:'pending'},201);
 }catch(e){console.error('Error en recuerdos:',e instanceof Error?e.message:'error');return json({error:'No se pudieron guardar las fotografías. Inténtalo más tarde.'},500);}
});
