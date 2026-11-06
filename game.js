import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.161.0/build/three.module.js';

const canvas=document.getElementById('game');
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'}); renderer.setPixelRatio(Math.min(devicePixelRatio,2)); renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFSoftShadowMap; renderer.outputColorSpace=THREE.SRGBColorSpace; renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=1.1;
const scene=new THREE.Scene(); scene.background=new THREE.Color(0x9bb9a5); scene.fog=new THREE.Fog(0x789b87,55,180);
const camera=new THREE.PerspectiveCamera(54,innerWidth/innerHeight,.1,350); camera.position.set(0,7,12);
const clock=new THREE.Clock(); const world=new THREE.Group(); scene.add(world);
scene.add(new THREE.HemisphereLight(0xcfe8e0,0x29443a,2.1)); const sun=new THREE.DirectionalLight(0xffe6bc,3.8); sun.position.set(-35,70,25); sun.castShadow=true; sun.shadow.mapSize.set(2048,2048); sun.shadow.camera.left=-80;sun.shadow.camera.right=80;sun.shadow.camera.top=80;sun.shadow.camera.bottom=-80; scene.add(sun);
const mat=(color,rough=1)=>new THREE.MeshStandardMaterial({color,roughness:rough});
const grass=mat(0x365f45), grass2=mat(0x477653), soil=mat(0x6a543c), stone=mat(0x64766b), gold=mat(0xe4b958), wood=mat(0x674832), dark=mat(0x172b24);
function box(x,y,z,sx,sy,sz,m,group=world){const o=new THREE.Mesh(new THREE.BoxGeometry(sx,sy,sz),m);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;group.add(o);return o}
function cyl(x,y,z,r,h,m,group=world){const o=new THREE.Mesh(new THREE.CylinderGeometry(r,r*.86,h,8),m);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;group.add(o);return o}
function cone(x,y,z,r,h,m,group=world){const o=new THREE.Mesh(new THREE.ConeGeometry(r,h,7),m);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;group.add(o);return o}
// broad open terrain
box(0,-1.7,0,190,2,190,grass); for(let i=0;i<16;i++){const x=(Math.random()-.5)*170,z=(Math.random()-.5)*170; const s=3+Math.random()*8; box(x,-.65,z,s,.18,s*.55,soil)}
// river and stepping stones
const river=box(18,-.55,0,16,.12,190,new THREE.MeshStandardMaterial({color:0x285e68,roughness:.18,metalness:.1}));
for(let z=-68;z<70;z+=10) cyl(10,-.35,z,1.3,.35,stone);
// distant mountain silhouettes
for(let i=0;i<12;i++){const x=-80+i*15; cone(x,10,-70,18+Math.random()*10,40,mat(0x3c5a50));}
// forest props
function tree(x,z,scale=1){const g=new THREE.Group();g.position.set(x,0,z);g.scale.setScalar(scale); world.add(g);cyl(0,2.2,0,.65,4.4,wood,g); for(let i=0;i<3;i++) cone((Math.random()-.5)*.8,4.2+i*1.65,(Math.random()-.5)*.6,3.2-i*.35,4.7, i===2?mat(0x477b52):mat(0x2d6847),g)}
for(let i=0;i<85;i++){let x=(Math.random()-.5)*165,z=(Math.random()-.5)*165;if(Math.abs(x)<20&&Math.abs(z)<18)continue;tree(x,z,.65+Math.random()*.65)}
// paths
for(let z=-70;z<75;z+=5) box(-9,-.6,z,3,.12,4,mat(0x786b4f)); for(let x=-70;x<70;x+=5) box(x,-.59,14,4,.12,2.5,mat(0x786b4f));
// shrine grove, prominent landmark
const shrine=new THREE.Group(); shrine.position.set(-28,0,-33); world.add(shrine); box(0,.35,0,13,.7,10,stone,shrine); for(const x of [-5,5]){cyl(x,3,-3.5,1.05,5.3,stone,shrine);cyl(x,3,3.5,1.05,5.3,stone,shrine)} box(0,6.1,0,13,.9,11,mat(0x465b55),shrine); box(0,4.5,0,5,.3,.5,gold,shrine); const rune=cone(0,4.8,0,1.2,2,gold,shrine); rune.rotation.x=Math.PI/2;
// glowing shrine orb
const orb=new THREE.Mesh(new THREE.SphereGeometry(1.05,16,16),new THREE.MeshBasicMaterial({color:0xffdd71}));orb.position.set(0,7.6,0);shrine.add(orb); const glow=new THREE.PointLight(0xffc64f,8,18);glow.position.copy(orb.position);shrine.add(glow);
// player
const player=new THREE.Group(); world.add(player); player.position.set(0,0,28); const body=box(0,1.15,0,1.05,1.8,.7,mat(0x4e7890),player); cyl(0,2.45,0,.42,.7,mat(0xc78e68),player); cone(0,3,-.05,.64,.45,mat(0x243b35),player); box(0,.22,0,.9,.22,.55,wood,player); const sword=box(.7,1.35,0,.12,1.4,.12,gold,player); sword.rotation.z=-.5;
const marker=new THREE.Mesh(new THREE.RingGeometry(1.2,1.45,24),new THREE.MeshBasicMaterial({color:0xf0c85e,transparent:true,opacity:.8,side:THREE.DoubleSide}));marker.rotation.x=-Math.PI/2;marker.position.y=.12; shrine.add(marker);
// enemies / collectibles
const spirits=[]; for(let i=0;i<3;i++){const g=new THREE.Group();g.position.set([-17,34,40][i],0,[-10,-24,-48][i]);world.add(g); const orb2=new THREE.Mesh(new THREE.SphereGeometry(.65,12,12),new THREE.MeshStandardMaterial({color:0x9ce5d2,emissive:0x2a8871,emissiveIntensity:2,transparent:true,opacity:.9}));orb2.position.y=1.3;g.add(orb2); const ring=new THREE.Mesh(new THREE.TorusGeometry(1, .07,8,20),new THREE.MeshBasicMaterial({color:0x9ee8d7}));ring.rotation.x=Math.PI/2;ring.position.y=1.3;g.add(ring); spirits.push(g)}
// controls/state
const keys={}; addEventListener('keydown',e=>{keys[e.key.toLowerCase()]=true;if(e.key===' ')e.preventDefault(); if(e.key.toLowerCase()==='e')interact(); if(e.key.toLowerCase()==='q')pulse(); if(e.key==='Escape')togglePause()});addEventListener('keyup',e=>keys[e.key.toLowerCase()]=false);
document.querySelectorAll('.mobile-controls button').forEach(b=>{const k=b.dataset.key;b.addEventListener('pointerdown',()=>keys[k]=true);b.addEventListener('pointerup',()=>keys[k]=false);b.addEventListener('pointerleave',()=>keys[k]=false)});
let paused=false, collected=0, stamina=78, pulseTime=0; const toastEl=document.getElementById('toast');
function toast(t){toastEl.textContent=t;toastEl.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>toastEl.classList.remove('show'),2500)}
function interact(){for(let i=spirits.length-1;i>=0;i--){if(spirits[i].position.distanceTo(player.position)<4){world.remove(spirits[i]);spirits.splice(i,1);collected++;document.getElementById('questCount').textContent=collected+' / 3';document.querySelector('.quest-progress span').style.width=(collected/3*100)+'%';toast(collected===3?'The shrine awakens. Quest complete!':'A spirit joins your memory.');if(collected===3)marker.material.color.set(0x83e8d0)}} if(player.position.distanceTo(shrine.position)<8&&collected===3)toast('The old oak whispers: “You are not alone.”')}
function pulse(){if(pulseTime>0)return;pulseTime=1.2;toast('Spirit Pulse — the wilds answer.');}
function togglePause(){paused=!paused;document.getElementById('pausePanel').classList.toggle('active',paused)} document.getElementById('pauseBtn').onclick=togglePause;document.getElementById('resumeBtn').onclick=togglePause;
function resize(){renderer.setSize(innerWidth,innerHeight,false);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix()} addEventListener('resize',resize);resize();
function updateMinimap(){const c=document.getElementById('minimap'),x=c.getContext('2d');x.clearRect(0,0,184,184);x.fillStyle='#315844';x.fillRect(0,0,184,184);x.fillStyle='#28616a';x.fillRect(83,0,16,184);x.strokeStyle='#8c7655';x.lineWidth=3;x.beginPath();x.moveTo(0,112);x.lineTo(184,112);x.stroke();x.fillStyle='#cfaa55';x.beginPath();x.arc(38,42,5,0,7);x.fill();x.fillStyle='#75e0df';x.beginPath();x.arc(92+player.position.x*.7,92+player.position.z*.7,4,0,7);x.fill();for(const s of spirits){x.fillStyle='#b9eedb';x.beginPath();x.arc(92+s.position.x*.7,92+s.position.z*.7,2,0,7);x.fill()}}
function animate(){requestAnimationFrame(animate);const dt=Math.min(clock.getDelta(),.05);if(!paused){let dx=0,dz=0;if(keys.w||keys.arrowup)dz-=1;if(keys.s||keys.arrowdown)dz+=1;if(keys.a||keys.arrowleft)dx-=1;if(keys.d||keys.arrowright)dx+=1;const len=Math.hypot(dx,dz)||1;let speed=keys.shift?9:5.8;if(keys[' ']&&stamina>0){speed=8;stamina-=dt*22}else stamina=Math.min(78,stamina+dt*11);player.position.x+=dx/len*speed*dt;player.position.z+=dz/len*speed*dt;player.position.x=THREE.MathUtils.clamp(player.position.x,-82,82);player.position.z=THREE.MathUtils.clamp(player.position.z,-82,82);if(dx||dz)player.rotation.y=Math.atan2(dx,dz);const target=new THREE.Vector3(player.position.x,5.8,player.position.z+10);camera.position.lerp(target,.09);camera.lookAt(player.position.x,1.4,player.position.z);spirits.forEach((s,i)=>{s.position.y=Math.sin(clock.elapsedTime*2+i)*.3;s.children[1].rotation.z+=dt});marker.rotation.z+=dt; if(pulseTime>0){pulseTime-=dt;player.scale.setScalar(1+Math.sin(pulseTime*18)*.06)} else player.scale.setScalar(1);document.getElementById('staminaFill').style.width=stamina+'%';updateMinimap()}renderer.render(scene,camera)} animate();setTimeout(()=>{document.getElementById('loading').style.opacity=0;setTimeout(()=>document.getElementById('loading').remove(),900)},900);
