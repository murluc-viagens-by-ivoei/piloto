import { salvarProposta } from "./storage.js";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formCotacao");
  if (!form) return;

  // =========================
  // CARROSSEL HOTEL
  // =========================
  const carrosselContainer = document.getElementById("carrossel-hotel-container");
  const adicionarImagemBtn = document.getElementById("adicionar-imagem-hotel-btn");

  function atualizarTextoBotao() {
    const total = carrosselContainer.querySelectorAll(".carrossel-imagem").length;
    adicionarImagemBtn.textContent = `+ Adicionar imagem (${total}/8)`;
    adicionarImagemBtn.disabled = total >= 8;
  }

  adicionarImagemBtn.addEventListener("click", () => {
    const total = carrosselContainer.querySelectorAll(".carrossel-imagem").length;
    if (total >= 8) return;

    const div = document.createElement("div");
    div.className = "carrossel-item";
    div.innerHTML = `
      <h4>Imagem ${total + 1}</h4>
      <input type="text" class="carrossel-imagem" placeholder="URL da imagem">
      <button type="button" class="remover-imagem">Remover</button>
    `;

    div.querySelector(".remover-imagem").onclick = () => {
      div.remove();
      atualizarTextoBotao();
    };

    carrosselContainer.appendChild(div);
    atualizarTextoBotao();
  });

  atualizarTextoBotao();

  // =========================
  // MULTIDESTINOS
  // =========================
  const destinosContainer = document.getElementById("multidestinos-container");
  const adicionarDestinoBtn = document.getElementById("adicionar-destino-btn");

  function criarDestino(index) {
    const div = document.createElement("div");
    div.className = "destino-item";

    div.innerHTML = `
      <h3>Destino ${index}</h3>

      <label>Nome:</label>
      <input type="text" class="destino-nome">

      <label>Passeios:</label>
      <textarea class="destino-passeios"></textarea>

      <label>Dicas:</label>
      <textarea class="destino-dicas"></textarea>

      <label>Imagens do destino:</label>
      <div class="destino-carrossel-container"></div>

      <button type="button" class="adicionar-imagem-destino-btn">
        + Adicionar imagem
      </button>

      <button type="button" class="remover-destino">Remover Destino</button>
    `;

    const imagensContainer = div.querySelector(".destino-carrossel-container");
    div.querySelector(".adicionar-imagem-destino-btn").onclick = () => {
      const input = document.createElement("input");
      input.type = "text";
      input.placeholder = "URL da imagem";
      input.className = "carrossel-imagem-destino";
      imagensContainer.appendChild(input);
    };

    div.querySelector(".remover-destino").onclick = () => div.remove();
    return div;
  }

  adicionarDestinoBtn.onclick = () => {
    const total = destinosContainer.querySelectorAll(".destino-item").length;
    destinosContainer.appendChild(criarDestino(total + 1));
  };

  // =========================
  // SUBMIT
  // =========================
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    try {
      const dados = {
        destino: document.getElementById("destino")?.value || "",
        mesAno: document.getElementById("mesAno")?.value || "",
        chegada: document.getElementById("chegada")?.value || "",
        traslado: document.getElementById("traslado")?.value || "",
        foto01: document.getElementById("foto01")?.value || "",
        foto02: document.getElementById("foto02")?.value || "",
        foto03: document.getElementById("foto03")?.value || "",
        tituloHospedagemCampo: document.getElementById("tituloHospedagemCampo")?.value || "",
        hotelCheckinCampo: document.getElementById("hotelCheckinCampo")?.value || "",
        hotelCheckoutCampo: document.getElementById("hotelCheckoutCampo")?.value || "",
        enderecoCampo: document.getElementById("enderecoCampo")?.value || "",
        descricaoCampo: document.getElementById("descricaoCampo")?.value || "",
        hotelServicosCampo: document.getElementById("hotelServicosCampo")?.value || "",
        dicasCampo: document.getElementById("dicasCampo")?.value || "",
        valorHotel: Number(document.getElementById("valorHotel")?.value || 0),
        valorAereo: Number(document.getElementById("valorAereo")?.value || 0),
        valorTraslado: Number(document.getElementById("valorTraslado")?.value || 0),
        valorSeguro: Number(document.getElementById("valorSeguro")?.value || 0),
        carrosselImagensHotel: [],
        destinosMultiplos: []
      };

      // hotel
      carrosselContainer.querySelectorAll(".carrossel-imagem").forEach(i => {
        if (i.value) dados.carrosselImagensHotel.push(i.value);
      });

      // destinos
      destinosContainer.querySelectorAll(".destino-item").forEach(div => {
        const imagens = [];
        div.querySelectorAll(".carrossel-imagem-destino").forEach(i => {
          if (i.value) imagens.push(i.value);
        });

        dados.destinosMultiplos.push({
          nome: div.querySelector(".destino-nome")?.value || "",
          passeios: div.querySelector(".destino-passeios")?.value || "",
          dicas: div.querySelector(".destino-dicas")?.value || "",
          imagens
        });
      });

      const id = await salvarProposta(dados);
      window.location.href = `proposta.html?id=${id}`;

    } catch (err) {
      console.error("Erro ao salvar proposta:", err);
      alert("Erro ao gerar proposta. Verifique o console.");
    }
  });
});
