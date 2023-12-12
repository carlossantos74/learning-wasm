const arquivo = './target/wasm32-unknown-unknown/release/editor.wasm';

WebAssembly.instantiateStreaming(fetch(arquivo))
.then(wasm => {

  const { instance } = wasm;

  const { 
    memory, 
    criar_memoria_inicial,
    malloc, 
    acumular,
    filtro_preto_e_branco,
    filtro_vermelho, 
    filtro_azul,
    filtro_verde,
    filtro_opacidade,
    filtro_inversao,
    filtro_sepia,
    filtro_super_azul,
  } = instance.exports;

  adicionarFiltro('Inversão WASM', '#inversao-wasm', {
    instance, 
    filtro: filtro_inversao
  });

  adicionarFiltro('Opacidade WASM', '#opacidade-wasm', {
    instance, 
    filtro: filtro_opacidade
  })

  adicionarFiltro('Preto e Branco WASM', '#preto-e-branco-wasm', {
    instance, 
    filtro: filtro_preto_e_branco
  });

  adicionarFiltro('Vermelho WASM', '#vermelho-wasm', {
    instance, 
    filtro: filtro_vermelho
  });

  adicionarFiltro('Azul WASM', '#azul-wasm', {
    instance, 
    filtro: filtro_azul
  });

  adicionarFiltro('Verde WASM', '#verde-wasm', {
    instance, 
    filtro: filtro_verde
  });

  adicionarFiltro('Sépia WASM', '#sepia-wasm', {
    instance, 
    filtro: filtro_sepia
  });

  adicionarFiltro('Super Azul WASM', '#super-azul-wasm', {
    instance, 
    filtro: filtro_super_azul
  });

  criar_memoria_inicial();

  const arrayMemoria = new Uint8Array(memory.buffer, 0).slice(0, 10);
  console.log(arrayMemoria);

  // cria o typedArray com valores em u8
  const jsLista = Uint8Array.from([20, 50, 80]);

  // o comprimento do typedArray jsLista: 3
  const comprimento = jsLista.length;

  // Retorna o endereço da memória
  const wasmListaPonteiro = malloc(comprimento);

  const wasmLista = new Uint8Array(
    memory.buffer,
    wasmListaPonteiro,
    comprimento
  );

  wasmLista.set(jsLista);

  const somaEntreItensDaLista = acumular(wasmListaPonteiro, comprimento);

  console.log(somaEntreItensDaLista); 


  const input = document.querySelector('input');
  const botaoResetarFiltro = document.querySelector('#remover');
  const botaoPBFiltroJs = document.querySelector('#preto-e-branco-js');
  const botaoSepiaJs = document.querySelector('#sepia-js');


  // Salva o atributo 'src' da imagem original.
  let imagemOriginal = document.getElementById('imagem').src;

  // Sempre que o valor do botão "input" for alterado,
  // o código desta função será executado.
  input.addEventListener('change', (event) => {
    const arquivo = event.target.files[0];
    const reader = new FileReader();

    // o título baseado no arquivo.
    const imagem = document.getElementById('imagem');
    imagem.title = arquivo.name;

    reader.onload = (event) => {
      // Quando o processo for finalizado salva o resultado no
      // atributo 'src' da imagem.
      // Também atualiza a variável imagemOriginal.
        imagem.src = event.target.result;
        imagemOriginal = event.target.result;
    };

    reader.readAsDataURL(arquivo);
  });

  // Sempre que o botão "#remover" for clicado,
  // esta função será executada
  botaoResetarFiltro.addEventListener('click', (event) => {
    const imagem = document.getElementById('imagem');
    imagem.src = imagemOriginal;
    console.log('Imagem voltou ao original');
  });

  botaoPBFiltroJs.addEventListener('click', (event) => {
    // Seleciona a imagem
    const imagem = document.getElementById('imagem');
    // Converte a imagem para canvas
    const { canvas, contexto } = converteImagemParaCanvas(imagem);
    // Recebe o base64
    const base64 = filtroPretoBrancoJS(canvas, contexto);
    // Coloca o novo base64 na imagem
    imagem.src = base64;
  });

  function converteImagemParaCanvas(imagem) {
    // cria a referência do canvas
    const canvas = document.createElement('canvas');

    // Seleciona o context 2d do canvas
    const contexto = canvas.getContext('2d');
    
    // Coloca a largura e altura do canvas similar à imagem
    canvas.width = imagem.naturalWidth || imagem.width;
    canvas.height = imagem.naturalHeight || imagem.height;

    // Desenha a imagem no contexto 2d
    contexto.drawImage(imagem, 0, 0);
    
    // Retorna tanto o canvas como seu cont
    return { canvas, contexto }
  }

  function filtroSepia(canvas, contexto) {
    const dadosDaImagem = contexto.getImageData(
      0, 0, canvas.width, canvas.height);
    const pixels  = dadosDaImagem.data;
    const inicio = performance.now();
    for (let i = 0; i < pixels.length; i += 4) {
      let r = pixels[i];
      let g = pixels[i + 1];
      let b = pixels[i + 2];
  
      pixels[i] = (r * 0.393) + (g * 0.769) + (b * 0.189);
      pixels[i + 1] = (r * 0.349) + (g * 0.686) + (b * 0.168);
      pixels[i + 2] = (r * 0.272) + (g * 0.534) + (b * 0.131);
    }
    const fim = performance.now();
    tempoDaOperacao(inicio, fim, 'JavaScript Sepia');
    contexto.putImageData(dadosDaImagem, 0, 0);
    return canvas.toDataURL('image/jpeg');
  };
  
  botaoSepiaJs.addEventListener('click', (event) => {
    const imagem = document.getElementById('imagem');
    const { canvas, contexto } = converteImagemParaCanvas(imagem);
    const base64 = filtroSepia(canvas, contexto);
    imagem.src = base64;
  });

  function filtroPretoBrancoJS(canvas, contexto) { 
    const inicio = performance.now();

    const dadosDaImagem = contexto.getImageData(0, 0, canvas.width, canvas.height);
    
    const pixels = dadosDaImagem.data;
    
    for(let i = 0, n = pixels.length; i < n; i += 4) {
      // Formula: FiltroPeB = R / 3 + G / 3 + B / 3
      const filtro = pixels[i] / 3 + pixels[i + 1] / 3 + pixels[i + 3] / 3;


      pixels[i] = filtro;
      pixels[i + 1] = filtro;
      pixels[i + 2] = filtro;
    }
    
    const fim = performance.now();

    tempoDaOperacao(inicio, fim, 'JavaScript preto e branco')

    contexto.putImageData(dadosDaImagem, 0, 0);

    return canvas.toDataURL('image/jpeg');
  }

  function tempoDaOperacao(inicio, fim, nomeDaOperacao) {
    // Seleciona o elemento #performance
    const performance = document.querySelector('#performance');
    // Muda o texto de #performance para o tempo da execução
    performance.textContent = `${nomeDaOperacao}: ${fim - inicio} ms`;
  }

  function executarFiltro(image, processImageFn) {
    const { canvas } = converteImagemParaCanvas(image);

    if (!processImageFn) {
     return canvas.toDataURL();
    }
    
    if (typeof processImageFn === 'function') {
      processImageFn(canvas, canvas.getContext('2d'));
      return canvas.toDataURL('image/jpeg');
    }
  }

  function adicionarFiltro(text, selector, { instance, filtro }) { 
    const button = document.querySelector(selector);
    const imagem = document.getElementById('imagem');

    button.addEventListener('click', () => { 
      executarFiltro(imagem, (canvas, context) => { 
        const image = document.getElementById('imagem');
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const buffer = imageData.data.buffer;
        const u8Array = new Uint8Array(buffer);
        
        let wasmCampledPtr = instance.exports.malloc(u8Array.length);
        let wasmCampledArray = new Uint8ClampedArray(
          instance.exports.memory.buffer,
          wasmCampledPtr,
          u8Array.length
        );
        wasmCampledArray.set(u8Array);

        const startTime = performance.now();
        filtro(wasmCampledPtr, u8Array.length);
        const endTime = performance.now();
        tempoDaOperacao(startTime, endTime, text);

        const width = image.naturalWidth || image.width;
        const height = image.naturalHeight || image.height;

        const newImageData = context.createImageData(width, height);
        newImageData.data.set(wasmCampledArray);
        context.putImageData(newImageData, 0, 0);
        image.src = canvas.toDataURL('image/jpeg');
      });
    });
  }
});
