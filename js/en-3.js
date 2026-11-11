(function(){
  var b=document.getElementById('burger'),n=document.getElementById('navLinks');
  if(!b||!n)return;
  function set(open){b.setAttribute('aria-expanded',open?'true':'false');n.classList.toggle('open',open);b.setAttribute('aria-label',open?'Cerrar menú':'Abrir menú');}
  b.addEventListener('click',function(){set(b.getAttribute('aria-expanded')!=='true');});
  n.addEventListener('click',function(e){if(e.target.closest('a'))set(false);});
  document.addEventListener('keydown',function(e){if(e.key==='Escape')set(false);});
})();
