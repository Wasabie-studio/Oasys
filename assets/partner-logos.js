/* Partner logo ticker shared by the homepage and the About page (styles in
   partner-logos.css).

   Partner logos arrive from the CMS in every shape: square badges, long
   wordmarks, files padded with empty space, JPGs on a white box. fit() makes
   any set of them read as one consistent row:
   1. trims the empty/white margin baked into the file, so the mark itself
      is what gets measured;
   2. removes a solid white background, so no white rectangle shows on the
      page's tinted background;
   3. sizes each mark by visual AREA rather than by height, so a square badge
      and a 6:1 wordmark carry the same weight instead of one dwarfing the
      other. */
(function(){
  document.documentElement.classList.add('logo-fit');
  var MAX_SIDE=1000, fitted=[], cache={};

  function analyse(img){
    var k=Math.min(1,MAX_SIDE/Math.max(img.naturalWidth,img.naturalHeight));
    var w=Math.max(1,Math.round(img.naturalWidth*k)), h=Math.max(1,Math.round(img.naturalHeight*k));
    var c=document.createElement('canvas'); c.width=w; c.height=h;
    var ctx=c.getContext('2d'); ctx.drawImage(img,0,0,w,h);
    var d; try{ d=ctx.getImageData(0,0,w,h); }catch(e){ return null; } /* cross-origin URL: can't read pixels */
    var p=d.data, n, x, y;
    function white(i){ return p[i*4+3]>200 && p[i*4]>236 && p[i*4+1]>236 && p[i*4+2]>236; }

    /* opaque light border all round = a background box, not part of the mark:
       flood it out from the edges (enclosed white, e.g. inside letters, stays) */
    var edge=0, lit=0;
    for(x=0;x<w;x++){ edge+=2; lit+=white(x)+white((h-1)*w+x); }
    for(y=0;y<h;y++){ edge+=2; lit+=white(y*w)+white(y*w+w-1); }
    if(lit/edge>0.85){
      var seen=new Uint8Array(w*h), stack=[];
      var push=function(i){ if(!seen[i] && white(i)){ seen[i]=1; stack.push(i); } };
      for(x=0;x<w;x++){ push(x); push((h-1)*w+x); }
      for(y=0;y<h;y++){ push(y*w); push(y*w+w-1); }
      while(stack.length){
        n=stack.pop(); p[n*4+3]=0; x=n%w;
        if(x>0)push(n-1); if(x<w-1)push(n+1); if(n>=w)push(n-w); if(n<w*(h-1))push(n+w);
      }
      ctx.putImageData(d,0,0);
    }

    /* tight box around what is actually visible. Near-transparent pixels
       (a soft drop-shadow haze) are cleared rather than kept, so they neither
       widen the box nor show as a grey square around the mark. */
    var x0=w, y0=h, x1=-1, y1=-1;
    for(y=0;y<h;y++) for(x=0;x<w;x++){
      n=(y*w+x)*4+3;
      if(p[n]>48){ if(x<x0)x0=x; if(x>x1)x1=x; if(y<y0)y0=y; if(y>y1)y1=y; }
      else p[n]=0;
    }
    if(x1<0) return null;
    ctx.putImageData(d,0,0);
    var bw=x1-x0+1, bh=y1-y0+1, out=document.createElement('canvas');
    out.width=bw; out.height=bh;
    out.getContext('2d').drawImage(c,x0,y0,bw,bh,0,0,bw,bh);
    return {src:out.toDataURL('image/png'), ratio:bw/bh};
  }

  /* box() returns, in CSS px: s = side of a perfectly square logo, the max
     height/width any logo may take, and minH so a very long one-line
     wordmark never shrinks too thin to read (minH wins over maxW). Exponent
     0.4 rather than a strict equal-area 0.5 keeps wordmarks a bit taller. */
  function size(item){
    var b=item.box(), r=item.ratio;
    var h=Math.min(b.maxH, Math.max(b.minH, b.s*Math.pow(r,-0.4)));
    if(h*r>b.maxW) h=Math.max(b.minH, b.maxW/r);
    var w=h*r;
    item.img.style.width=Math.round(w)+'px';
    item.img.style.height=Math.round(h)+'px';
  }

  function fit(img, box){
    var original=img.getAttribute('src');
    function go(){
      if(img.dataset.fitted) return;
      img.dataset.fitted='1';
      var a=cache[original];
      if(a===undefined){ try{ a=analyse(img); }catch(e){ a=null; } cache[original]=a; }
      var item={img:img, box:box, ratio:a ? a.ratio : (img.naturalWidth/img.naturalHeight || 1)};
      if(a) img.src=a.src;
      fitted.push(item); size(item);
      img.classList.add('is-fitted');
    }
    img.addEventListener('error',function(){ img.classList.add('is-fitted'); },{once:true});
    if(img.complete && img.naturalWidth) go(); else img.addEventListener('load',go,{once:true});
  }

  var t;
  addEventListener('resize',function(){
    clearTimeout(t);
    t=setTimeout(function(){
      fitted=fitted.filter(function(i){ return i.img.isConnected; });
      fitted.forEach(size);
    },120);
  });

  function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

  /* The partner ticker used on both the homepage and the About page.
     track = .pmarquee-track, items = data/partners.json "items". */
  function ticker(track, items){
    var marquee=track.parentElement;
    /* a partner with no logo uploaded yet is simply not shown -- a row of
       empty "Logo" boxes reads as broken, not as work in progress */
    var withLogo=(items||[]).filter(function(p){ return p.logo; });
    if(!withLogo.length){ track.innerHTML=''; marquee.hidden=true; return; }
    marquee.hidden=false;
    function set(hidden){
      return '<div class="pmarquee-set"'+(hidden?' aria-hidden="true"':'')+'>'+withLogo.map(function(p){
        return '<span class="plogo" title="'+esc(p.name)+'"><img src="'+esc(p.logo)+'" alt="'+(hidden?'':esc(p.name))+'" loading="lazy"></span>';
      }).join('')+'</div>';
    }
    track.innerHTML=set(false)+set(true);
    track.querySelectorAll('.plogo img').forEach(function(img){
      var box=img.parentNode;
      fit(img,function(){
        var cs=getComputedStyle(box);
        var h=box.clientHeight-parseFloat(cs.paddingTop)-parseFloat(cs.paddingBottom);
        return {s:h*0.78, maxH:h, maxW:h*4.6, minH:h*0.3};
      });
    });
    /* scrolling a row that does not even fill the screen just shows a gap
       looping past, so hold it still and centre it until there are enough.
       Re-checked whenever widths change: logos load in and get sized one by
       one, and the window can be resized. */
    var first=track.firstElementChild;
    function mode(){ marquee.classList.toggle('is-static', first.scrollWidth<=marquee.clientWidth); }
    if(window.ResizeObserver){ var ro=new ResizeObserver(mode); ro.observe(first); ro.observe(marquee); }
    else mode();
  }

  window.OasysLogo={fit:fit, ticker:ticker};
})();
