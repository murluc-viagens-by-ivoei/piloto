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
  // OTIMIZAÇÃO PARA MOBILE
  // ===============================

  function otimizarParaMobile() {
    if (window.innerWidth <= 768) {
      console.log("📱 Aplicando otimizações mobile...");
      
      // Ajustar todas as páginas
      const pages = document.querySelectorAll('.page');
      const viewportHeight = window.innerHeight;
      
      pages.forEach((page, index) => {
        const contentHeight = page.scrollHeight;
        
        // Se conteúdo for menor que 70% da tela, ocupa tela inteira
        // Se for maior, altura automática
        if (contentHeight < viewportHeight * 0.7) {
          page.style.minHeight = '100svh';
        } else {
          page.style.minHeight = 'auto';
          page.style.paddingBottom = '40px';
        }
        
        // Ajustar tamanho de fonte para mobile
        const titles = page.querySelectorAll('h1');
        titles.forEach(title => {
          if (title.textContent.length > 20) {
            title.style.fontSize = '28px';
          }
        });
        
        // Ajustar subtítulos
        const subtitles = page.querySelectorAll('h2');
        subtitles.forEach(subtitle => {
          subtitle.style.fontSize = '20px';
        });
        
        // Ajustar imagens do carrossel para mobile
        const carrosselImages = page.querySelectorAll('.carrossel-images');
        carrosselImages.forEach(carrossel => {
          carrossel.style.height = Math.min(viewportHeight * 0.45, 350) + 'px';
        });
        
        // Ajustar molduras
        const molduras = page.querySelectorAll('.moldura');
        molduras.forEach(moldura => {
          moldura.style.height = Math.min(viewportHeight * 0.35, 250) + 'px';
        });
      });
      
      // Ajustar o preço card para mobile
      const priceCard = document.querySelector('.price-card');
      if (priceCard) {
        priceCard.style.width = '95%';
        priceCard.style.padding = '20px 15px';
        priceCard.style.margin = '20px auto';
        
        // Ajustar textos dentro do price card
        const labels = priceCard.querySelectorAll('.label');
        const prices = priceCard.querySelectorAll('.price');
        
        labels.forEach(label => {
          label.style.fontSize = '18px';
        });
        
        prices.forEach(price => {
          price.style.fontSize = '18px';
          price.style.minWidth = '120px';
        });
      }
      
      console.log(`✅ ${pages.length} páginas otimizadas para mobile`);
    }
  }

  // Executar quando carregar e quando redimensionar
  window.addEventListener('load', function() {
    setTimeout(otimizarParaMobile, 100);
    setTimeout(otimizarParaMobile, 500); // Duplo check para conteúdo dinâmico
  });

  window.addEventListener('resize', otimizarParaMobile);

  // Ajustar após renderização completa
  setTimeout(otimizarParaMobile, 1000);

  console.log("✅ Proposta renderizada com otimização mobile");
});