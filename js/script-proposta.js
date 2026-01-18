// script-proposta.js
import { buscarProposta } from "./storage.js";

document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  if (!id) {
    alert("Proposta não encontrada (ID ausente)");
    return;
  }

  const dados = await buscarProposta(id);
  if (!dados) {
    alert("Proposta não encontrada no banco");
    return;
  }

  // ===============================
  // HELPERS
  // ===============================
  const setText = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value || "";
  };

  const setTextMultiline = (id, value) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = value || "";
    el.style.whiteSpace = "pre-line";
  };

  const setImg = (id, url) => {
    const img = document.getElementById(id);
    if (!img) return;
    if (url) {
      img.src = url;
      img.style.display = "block";
    } else {
      img.style.display = "none";
    }
  };

  const formatarMoedaBR = (valor) => {
    if (valor === null || valor === undefined || valor === "") return "R$ 0,00";

    return Number(valor).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2
    });
  };

  // ===============================
  // FUNÇÃO UNIVERSAL DE SWIPE
  // ===============================
  function aplicarSwipe(elemento, onPrev, onNext) {
    let startX = 0;
    let isDown = false;

    // Touch
    elemento.addEventListener("touchstart", e => {
      startX = e.touches[0].clientX;
    });

    elemento.addEventListener("touchend", e => {
      const endX = e.changedTouches[0].clientX;
      const diff = endX - startX;

      if (Math.abs(diff) > 50) {
        diff > 0 ? onPrev() : onNext();
      }
    });

    // Mouse
    elemento.addEventListener("mousedown", e => {
      isDown = true;
      startX = e.clientX;
      elemento.style.cursor = "grabbing";
    });

    window.addEventListener("mouseup", e => {
      if (!isDown) return;
      isDown = false;
      elemento.style.cursor = "grab";

      const diff = e.clientX - startX;
      if (Math.abs(diff) > 50) {
        diff > 0 ? onPrev() : onNext();
      }
    });
  }

  // ===============================
  // DADOS PRINCIPAIS
  // ===============================
  setText("destinoCampo", dados.destino);
  setText("mesAnoCampo", dados.mesAno);
  setText("chegadaCampo", dados.chegada);
  setText("trasladoCampo", dados.traslado);

  setImg("imgFoto01", dados.foto01);
  setImg("imgFoto02", dados.foto02);
  setImg("imgFoto03", dados.foto03);

  setText("tituloHospedagemCampo", dados.tituloHospedagemCampo);
  setText("hotelCheckinCampo", dados.hotelCheckinCampo);
  setText("hotelCheckoutCampo", dados.hotelCheckoutCampo);
  setText("descricaoCampo", dados.descricaoCampo);
  setText("hotelServicosCampo", dados.hotelServicosCampo);
  setText("enderecoCampo", dados.enderecoCampo);
  setTextMultiline("dicasCampo", dados.dicasCampo);

  // ===============================
  // CARROSSEL DO HOTEL
  // ===============================
  let currentHotel = 0;
  const hotelImages = (dados.carrosselImagensHotel || []).filter(Boolean);

  const hotelBox = document.getElementById("carrossel-images-hotel");
  const hotelDots = document.getElementById("carrossel-dots-hotel");
  const hotelCounter = document.getElementById("carrossel-counter-hotel");

  function renderHotel() {
    if (!hotelBox || hotelImages.length === 0) return;

    hotelBox.innerHTML = "";
    hotelDots.innerHTML = "";

    hotelImages.forEach((url, i) => {
      const img = document.createElement("img");
      img.src = url;
      img.className = "carrossel-image" + (i === currentHotel ? " active" : "");
      hotelBox.appendChild(img);

      const dot = document.createElement("span");
      dot.className = "carrossel-dot" + (i === currentHotel ? " active" : "");
      dot.onclick = () => {
        currentHotel = i;
        renderHotel();
      };
      hotelDots.appendChild(dot);
    });

    hotelCounter.textContent = `${currentHotel + 1} / ${hotelImages.length}`;
  }

  window.prevSlideHotel = () => {
    currentHotel = (currentHotel - 1 + hotelImages.length) % hotelImages.length;
    renderHotel();
  };

  window.nextSlideHotel = () => {
    currentHotel = (currentHotel + 1) % hotelImages.length;
    renderHotel();
  };

  const hotelCarrossel = document.getElementById("carrossel-hotel");

  if (hotelCarrossel) {
    const arrowLeftHotel = document.createElement("button");
    arrowLeftHotel.className = "carrossel-arrow left";
    arrowLeftHotel.innerHTML = `<span>❮</span>`;
    arrowLeftHotel.onclick = () => window.prevSlideHotel();

    const arrowRightHotel = document.createElement("button");
    arrowRightHotel.className = "carrossel-arrow right";
    arrowRightHotel.innerHTML = `<span>❯</span>`;
    arrowRightHotel.onclick = () => window.nextSlideHotel();

    hotelCarrossel.appendChild(arrowLeftHotel);
    hotelCarrossel.appendChild(arrowRightHotel);
  }

  aplicarSwipe(hotelBox, window.prevSlideHotel, window.nextSlideHotel);
  renderHotel();

  // ===============================
  // MULTIDESTINOS
  // ===============================
  const destinosContainer = document.getElementById("destinos-container");

  if (destinosContainer && dados.destinosMultiplos?.length) {
    destinosContainer.innerHTML = "";

    dados.destinosMultiplos.forEach((destino, index) => {
      const page = document.createElement("div");
      page.className = "page destino-pagina";
      page.style.display = "block";

      page.innerHTML = `
  <img src="./assets/logo.png" class="logo">
  <h1>Destino ${index + 1}: ${destino.nome || ""}</h1>
  <div class="bloco">
    <h2>Passeios</h2>
    <p>${destino.passeios || ""}</p>
  </div>
  <div class="bloco">
    <h2>Dicas</h2>
    <p>${destino.dicas || ""}</p>
  </div>
`;

      if (destino.imagens?.length) {
        let current = 0;
        const imagens = destino.imagens.filter(Boolean);

        const carrossel = document.createElement("div");
        carrossel.className = "carrossel";

        const imgs = document.createElement("div");
        imgs.className = "carrossel-images";

        const dots = document.createElement("div");
        dots.className = "carrossel-dots";

        const counter = document.createElement("div");
        counter.className = "carrossel-counter";

        const prev = () => {
          current = (current - 1 + imagens.length) % imagens.length;
          renderDestino();
        };

        const next = () => {
          current = (current + 1) % imagens.length;
          renderDestino();
        };

        // ✅ AGORA SIM: SETAS
        const arrowLeft = document.createElement("button");
        arrowLeft.className = "carrossel-arrow left";
        arrowLeft.innerHTML = `<span>❮</span>`;
        arrowLeft.onclick = prev;

        const arrowRight = document.createElement("button");
        arrowRight.className = "carrossel-arrow right";
        arrowRight.innerHTML = `<span>❯</span>`;
        arrowRight.onclick = next;

        function renderDestino() {
          imgs.innerHTML = "";
          dots.innerHTML = "";

          imagens.forEach((url, i) => {
            const img = document.createElement("img");
            img.src = url;
            img.className = "carrossel-image" + (i === current ? " active" : "");
            imgs.appendChild(img);

            const dot = document.createElement("span");
            dot.className = "carrossel-dot" + (i === current ? " active" : "");
            dot.onclick = () => {
              current = i;
              renderDestino();
            };
            dots.appendChild(dot);
          });

          counter.textContent = `${current + 1} / ${imagens.length}`;
        }

        aplicarSwipe(imgs, prev, next);

        carrossel.append(imgs, dots, counter, arrowLeft, arrowRight);
        page.appendChild(carrossel);
        renderDestino();
      }

      destinosContainer.appendChild(page);
    });
  }

  // ===============================
  // VALORES
  // ===============================
  const itemsList = document.getElementById("itemsList");
  if (itemsList) {
    const valores = [
      { label: "Hotel", value: dados.valorHotel },
      { label: "Passagem Aérea", value: dados.valorAereo },
      { label: "Traslado", value: dados.valorTraslado },
      { label: "Seguro Viagem", value: dados.valorSeguro }
    ];

    itemsList.innerHTML = "";

    valores.forEach(item => {
      const row = document.createElement("div");
      row.className = "row";
      row.innerHTML = `
        <span class="label">${item.label}</span>
        <span class="dots"></span>
        <span class="price">${formatarMoedaBR(item.value)}</span>
      `;
      itemsList.appendChild(row);
    });

    const total = valores.reduce((acc, cur) => acc + Number(cur.value || 0), 0);

    const totalRow = document.createElement("div");
    totalRow.className = "row total";
    totalRow.innerHTML = `
      <span class="label">TOTAL</span>
      <span class="dots"></span>
      <span class="price">${formatarMoedaBR(total)}</span>
    `;
    itemsList.appendChild(totalRow);
  }

  // ===============================
  // OTIMIZAÇÃO MOBILE DEFINITIVA
  // ===============================

  function otimizarMobileDefinitivo() {
    const isMobile = window.innerWidth <= 768;
    
    if (isMobile) {
      console.log("📱 Aplicando otimizações mobile definitivas...");
      
      const pages = document.querySelectorAll('.page');
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      
      // ========== GARANTIR LARGURA 100% ==========
      document.documentElement.style.width = '100vw';
      document.body.style.width = '100vw';
      document.body.style.overflowX = 'hidden';
      
      pages.forEach((page, index) => {
        const contentHeight = page.scrollHeight;
        
        // ========== ESTRATÉGIA DE ALTURA INTELIGENTE ==========
        // Página 1 (geralmente curta): altura fixa = tela inteira
        if (index === 0 && contentHeight < viewportHeight * 0.9) {
          page.style.height = viewportHeight + 'px';
          page.style.minHeight = viewportHeight + 'px';
          page.style.maxHeight = viewportHeight + 'px';
          page.style.overflowY = 'hidden';
          page.style.display = 'flex';
          page.style.flexDirection = 'column';
          page.style.justifyContent = 'center';
        }
        // Outras páginas curtas: altura mínima 100svh
        else if (contentHeight < viewportHeight * 0.8) {
          page.style.height = 'auto';
          page.style.minHeight = '100svh';
          page.style.maxHeight = 'none';
          page.style.overflowY = 'hidden';
        }
        // Páginas longas: altura automática
        else {
          page.style.height = 'auto';
          page.style.minHeight = 'auto';
          page.style.overflowY = 'visible';
          page.style.paddingBottom = '50px';
        }
        
        // ========== GARANTIR LARGURA COMPLETA ==========
        page.style.width = '100vw';
        page.style.maxWidth = '100vw';
        page.style.marginLeft = '0';
        page.style.marginRight = '0';
        page.style.paddingLeft = '20px';
        page.style.paddingRight = '20px';
        page.style.boxSizing = 'border-box';
        
        // ========== TIPOGRAFIA RESPONSIVA ==========
        const titles = page.querySelectorAll('h1');
        titles.forEach(title => {
          title.style.fontSize = 'clamp(32px, 9vw, 48px)';
          title.style.lineHeight = '1.2';
          title.style.wordWrap = 'break-word';
        });
        
        const subtitles = page.querySelectorAll('h2');
        subtitles.forEach(subtitle => {
          subtitle.style.fontSize = 'clamp(20px, 6vw, 28px)';
          subtitle.style.lineHeight = '1.3';
        });
        
        const paragraphs = page.querySelectorAll('p');
        paragraphs.forEach(p => {
          p.style.fontSize = 'clamp(16px, 4.5vw, 18px)';
          p.style.lineHeight = '1.5';
        });
        
        // ========== IMAGENS RESPONSIVAS ==========
        // Todas as imagens
        const allImages = page.querySelectorAll('img');
        allImages.forEach(img => {
          img.style.maxWidth = '100%';
          img.style.height = 'auto';
          img.style.display = 'block';
        });
        
        // Molduras
        const molduras = page.querySelectorAll('.moldura');
        molduras.forEach(moldura => {
          moldura.style.height = Math.min(viewportHeight * 0.4, 300) + 'px';
          moldura.style.width = '100%';
          moldura.style.maxWidth = '100%';
          moldura.style.margin = '15px auto';
        });
        
        // Carrossel
        const carrossels = page.querySelectorAll('.carrossel-images');
        carrossels.forEach(carrossel => {
          carrossel.style.height = Math.min(viewportHeight * 0.5, 350) + 'px';
          carrossel.style.width = '100%';
          carrossel.style.maxWidth = '100%';
        });
        
        // Logo
        const logos = page.querySelectorAll('.logo');
        logos.forEach(logo => {
          logo.style.width = 'clamp(150px, 40vw, 250px)';
          logo.style.height = 'auto';
          logo.style.margin = '0 auto';
        });
      });
      
      // ========== ELEMENTOS ESPECÍFICOS ==========
      // Price Card
      const priceCard = document.querySelector('.price-card');
      if (priceCard) {
        priceCard.style.width = '100%';
        priceCard.style.maxWidth = '100%';
        priceCard.style.padding = '25px 20px';
        priceCard.style.margin = '30px 0';
        priceCard.style.boxSizing = 'border-box';
        
        const labels = priceCard.querySelectorAll('.label');
        const prices = priceCard.querySelectorAll('.price');
        const rows = priceCard.querySelectorAll('.row');
        
        rows.forEach(row => {
          row.style.gridTemplateColumns = '1fr auto';
          row.style.gap = '10px';
        });
        
        labels.forEach(label => {
          label.style.fontSize = 'clamp(18px, 5vw, 22px)';
        });
        
        prices.forEach(price => {
          price.style.fontSize = 'clamp(18px, 5vw, 22px)';
          price.style.minWidth = 'auto';
          price.style.textAlign = 'right';
        });
      }
      
      // Rodapé
      const rodapes = document.querySelectorAll('.rodape');
      rodapes.forEach(rodape => {
        rodape.style.position = 'relative';
        rodape.style.bottom = 'auto';
        rodape.style.marginTop = '40px';
        rodape.style.paddingBottom = '30px';
        rodape.style.width = '100%';
        
        const rodapeImg = rodape.querySelector('img');
        if (rodapeImg) {
          rodapeImg.style.width = '90%';
          rodapeImg.style.maxWidth = '300px';
          rodapeImg.style.height = 'auto';
        }
      });
      
      // Linha de fotos
      const linhasFotos = document.querySelectorAll('.linha-fotos');
      linhasFotos.forEach(linha => {
        linha.style.flexDirection = 'column';
        linha.style.gap = '20px';
        linha.style.width = '100%';
        
        const moldurasLinha = linha.querySelectorAll('.moldura');
        moldurasLinha.forEach(moldura => {
          moldura.style.height = Math.min(viewportHeight * 0.3, 250) + 'px';
          moldura.style.width = '100%';
        });
      });
      
      console.log(`✅ ${pages.length} páginas otimizadas para ${viewportWidth}x${viewportHeight}`);
    } else {
      // ========== DESKTOP: RESETAR ESTILOS ==========
      const pages = document.querySelectorAll('.page');
      pages.forEach(page => {
        page.style.height = '';
        page.style.minHeight = '';
        page.style.maxHeight = '';
        page.style.overflowY = '';
        page.style.width = '';
        page.style.marginLeft = '';
        page.style.marginRight = '';
        page.style.paddingLeft = '';
        page.style.paddingRight = '';
      });
    }
  }

  // ===============================
  // EXECUÇÃO DAS OTIMIZAÇÕES
  // ===============================

  // Executar imediatamente após renderização
  setTimeout(otimizarMobileDefinitivo, 100);
  
  // Executar quando carregar completamente
  window.addEventListener('load', function() {
    otimizarMobileDefinitivo();
    setTimeout(otimizarMobileDefinitivo, 300);
    setTimeout(otimizarMobileDefinitivo, 1000);
  });
  
  // Executar ao redimensionar (com debounce para performance)
  let resizeTimeout;
  window.addEventListener('resize', function() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(otimizarMobileDefinitivo, 200);
  });
  
  // Executar quando conteúdo dinâmico for adicionado
  const observer = new MutationObserver(function() {
    setTimeout(otimizarMobileDefinitivo, 100);
  });
  
  // Observar mudanças no body
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  console.log("✅ Proposta renderizada com otimização mobile definitiva");
});