try{history.scrollRestoration='manual'}catch(e){}
(function(){function top(){if(!location.hash||!document.getElementById(location.hash.slice(1)))window.scrollTo(0,0)}
top();addEventListener('DOMContentLoaded',top);addEventListener('load',function(){top();setTimeout(top,60);setTimeout(top,300)});addEventListener('pageshow',top)})();
