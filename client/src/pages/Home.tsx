import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, Wand2, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

/**
 * Design Philosophy: Modern Professional Tool
 * - Clean, functional interface with focus on the canvas preview
 * - Two-column layout: input form on left, live preview on right
 * - Professional color palette: blue accent with green highlights for success
 * - Smooth interactions with immediate visual feedback
 */

interface Fornecedor {
  valor: string;
  ganho: string;
}

type ModoCalculo = "fornecedor" | "direto";

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [vendedor, setVendedor] = useState("");
  const [data, setData] = useState(new Date().toISOString().split("T")[0]);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [canGenerate, setCanGenerate] = useState(false);
  const [fornecedores, setFornecedores] = useState<Record<string, Fornecedor>>({});
  const [fornecedorInput, setFornecedorInput] = useState("");
  const [valorInput, setValorInput] = useState("");
  const [ganhoInput, setGanhoInput] = useState("");
  const [totais, setTotais] = useState({ valores: 0, ganhos: 0, aLiberar: 0 });
  
  // Novo estado para controlar o modo de cálculo
  const [modoCalculo, setModoCalculo] = useState<ModoCalculo>("fornecedor");
  
  // Valores diretos
  const [totalValoresDireto, setTotalValoresDireto] = useState("");
  const [totalGanhosDireto, setTotalGanhosDireto] = useState("");

  const FORNECEDORES_LISTA = ["GIRO", "CP", "SUPRA", "BIOXYZ", "SHS", "ILSA", "PRIMAZ"];

  // Initialize canvas on mount
  useEffect(() => {
    initCanvas();
  }, []);

  // Update totals whenever fornecedores change OR modo direto values change
  useEffect(() => {
    calcularTotais();
  }, [fornecedores, modoCalculo, totalValoresDireto, totalGanhosDireto]);

  // Initialize canvas with placeholder
  const initCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#f3f4f6";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#9ca3af";
    ctx.font = "30px Inter";
    ctx.textAlign = "center";
    ctx.fillText("Sua arte aparecerá aqui", canvas.width / 2, canvas.height / 2);
  };

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setUploadedImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Draw rounded rectangle helper
  const roundRect = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number | Record<string, number>,
    fill: boolean,
    stroke: boolean
  ) => {
    const r = typeof radius === "number" ? { tl: radius, tr: radius, br: radius, bl: radius } : radius;
    ctx.beginPath();
    ctx.moveTo(x + r.tl, y);
    ctx.lineTo(x + width - r.tr, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + r.tr);
    ctx.lineTo(x + width, y + height - r.br);
    ctx.quadraticCurveTo(x + width, y + height, x + width - r.br, y + height);
    ctx.lineTo(x + r.bl, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - r.bl);
    ctx.lineTo(x, y + r.tl);
    ctx.quadraticCurveTo(x, y, x + r.tl, y);
    ctx.closePath();
    if (fill) ctx.fill();
    if (stroke) ctx.stroke();
  };

  // Calculate totals
  const calcularTotais = () => {
    let totalValores = 0;
    let totalGanhos = 0;

    if (modoCalculo === "fornecedor") {
      // Calcula a partir dos fornecedores
      Object.values(fornecedores).forEach((dados) => {
        const valor = parseFloat(dados.valor.replace("R$", "").replace(",", "."));
        const ganho = parseFloat(dados.ganho.replace("R$", "").replace(",", "."));
        totalValores += isNaN(valor) ? 0 : valor;
        totalGanhos += isNaN(ganho) ? 0 : ganho;
      });
    } else {
      // Usa os valores diretos
      totalValores = parseFloat(totalValoresDireto.replace("R$", "").replace(",", ".")) || 0;
      totalGanhos = parseFloat(totalGanhosDireto.replace("R$", "").replace(",", ".")) || 0;
    }

    const aLiberar = totalValores - totalGanhos;
    setTotais({ valores: totalValores, ganhos: totalGanhos, aLiberar });
  };

  // Add fornecedor
  const adicionarFornecedor = () => {
    const fornecedor = fornecedorInput.toUpperCase();
    if (!fornecedor || !valorInput || !ganhoInput) {
      alert("Preencha fornecedor, valor e ganho");
      return;
    }

    setFornecedores({
      ...fornecedores,
      [fornecedor]: { valor: valorInput, ganho: ganhoInput },
    });

    setFornecedorInput("");
    setValorInput("");
    setGanhoInput("");
  };

  // Remove fornecedor
  const removerFornecedor = (fornecedor: string) => {
    const novosFornecedores = { ...fornecedores };
    delete novosFornecedores[fornecedor];
    setFornecedores(novosFornecedores);
  };

  // Draw the art on canvas
  const drawArt = (img: HTMLImageElement | null) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background
    if (img) {
      const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
      const x = canvas.width / 2 - (img.width / 2) * scale;
      const y = canvas.height / 2 - (img.height / 2) * scale;
      ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

      // Dark overlay for readability
      ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else {
      const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      grad.addColorStop(0, "#1e3a8a");
      grad.addColorStop(1, "#1e40af");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Draw central card
    const margin = 50;
    const cardWidth = canvas.width - margin * 2;
    const cardHeight = 1100;
    const cardY = canvas.height / 2 - cardHeight / 2 + 30;

    // Card shadow
    ctx.shadowColor = "rgba(0,0,0,0.3)";
    ctx.shadowBlur = 40;
    ctx.shadowOffsetY = 20;

    // Draw card
    ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
    roundRect(ctx, margin, cardY, cardWidth, cardHeight, 40, true, false);

    // Reset shadow
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    // Draw seller name
    ctx.fillStyle = "#111827";
    ctx.font = "bold 40px Inter";
    ctx.textAlign = "center";
    ctx.fillText(vendedor.toUpperCase() || "VENDEDOR", canvas.width / 2, cardY + 60);

    // Draw date
    const dataFormatada = new Date(data).toLocaleDateString("pt-BR");
    ctx.fillStyle = "#6b7280";
    ctx.font = "18px Inter";
    ctx.fillText(dataFormatada, canvas.width / 2, cardY + 90);

    // Draw divider
    ctx.strokeStyle = "#e5e7eb";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(margin + 40, cardY + 120);
    ctx.lineTo(canvas.width - margin - 40, cardY + 120);
    ctx.stroke();

    // Draw fornecedores (apenas se estiver no modo fornecedor)
    let yOffset = cardY + 180;
    
    if (modoCalculo === "fornecedor") {
      const fornecedoresList = Object.entries(fornecedores);

      if (fornecedoresList.length === 0) {
        ctx.fillStyle = "#9ca3af";
        ctx.font = "20px Inter";
        ctx.fillText("Nenhum fornecedor adicionado", canvas.width / 2, yOffset);
      } else {
        fornecedoresList.forEach(([fornecedor, dados]) => {
          // Fornecedor name
          ctx.fillStyle = "#111827";
          ctx.font = "bold 26px Inter";
          ctx.textAlign = "left";
          ctx.fillText(fornecedor, margin + 50, yOffset);

          // Valor
          ctx.fillStyle = "#374151";
          ctx.font = "20px Inter";
          ctx.fillText("Valor: " + dados.valor, margin + 50, yOffset + 35);

          // Ganho
          ctx.fillStyle = "#059669";
          ctx.font = "bold 22px Inter";
          ctx.fillText("Ganho: " + dados.ganho, margin + 50, yOffset + 65);

          yOffset += 100;
        });
      }
    } else {
      // Modo direto - apenas mostra uma mensagem indicativa
      ctx.fillStyle = "#6b7280";
      ctx.font = "italic 22px Inter";
      ctx.textAlign = "center";
      ctx.fillText("Valores informados diretamente", canvas.width / 2, yOffset + 50);
      yOffset += 100;
    }

    // Draw divider before totals
    ctx.strokeStyle = "#e5e7eb";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(margin + 40, yOffset + 20);
    ctx.lineTo(canvas.width - margin - 40, yOffset + 20);
    ctx.stroke();

    yOffset += 60;

    // Total Valores
    ctx.fillStyle = "#374151";
    ctx.font = "600 28px Inter";
    ctx.textAlign = "left";
    ctx.fillText("Total Valores:", margin + 50, yOffset);
    ctx.fillStyle = "#1f2937";
    ctx.font = "bold 32px Inter";
    ctx.textAlign = "right";
    ctx.fillText("R$ " + totais.valores.toFixed(2).replace(".", ","), canvas.width - margin - 50, yOffset);

    yOffset += 60;

    // Total Ganhos
    ctx.fillStyle = "#059669";
    ctx.font = "600 28px Inter";
    ctx.textAlign = "left";
    ctx.fillText("Total Ganhos:", margin + 50, yOffset);
    ctx.fillStyle = "#059669";
    ctx.font = "bold 32px Inter";
    ctx.textAlign = "right";
    ctx.fillText("R$ " + totais.ganhos.toFixed(2).replace(".", ","), canvas.width - margin - 50, yOffset);

    yOffset += 60;

    // A Liberar
    ctx.fillStyle = "#dc2626";
    ctx.font = "600 28px Inter";
    ctx.textAlign = "left";
    ctx.fillText("A LIBERAR:", margin + 50, yOffset);
    ctx.fillStyle = "#dc2626";
    ctx.font = "bold 40px Inter";
    ctx.textAlign = "right";
    ctx.fillText("R$ " + totais.aLiberar.toFixed(2).replace(".", ","), canvas.width - margin - 50, yOffset);

    // Draw piggy bank icon
    ctx.fillStyle = "white";
    ctx.font = "bold 80px Inter";
    ctx.textAlign = "center";
    ctx.fillText("💰", canvas.width / 2, cardY - 30);

    setCanGenerate(true);
  };

  // Generate art
  const handleGenerate = () => {
    if (uploadedImage) {
      const img = new Image();
      img.onload = () => {
        drawArt(img);
      };
      img.src = uploadedImage;
    } else {
      drawArt(null);
    }
  };

  // Download art
  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const nomeArquivo = `cofrinho-${vendedor || "vendedor"}-${data}.png`;
    const link = document.createElement("a");
    link.download = nomeArquivo;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div
      className="min-h-screen p-4 md:p-8"
      style={{
        backgroundImage:
          "url(https://d2xsxph8kpxj0f.cloudfront.net/310519663323847690/C46y2oydaTHXV986UqMsFN/agro-background-kqhpaNBP4ce9DzPWEwWqrY.webp)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="max-w-6xl mx-auto backdrop-blur-sm">
        {/* Header */}
        <div className="text-center mb-12 bg-white/90 rounded-2xl p-8 shadow-lg">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Wand2 className="w-6 h-6 text-blue-600" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-700 to-yellow-600 bg-clip-text text-transparent">
              Gerador de Arte "Cofrinho"
            </h1>
          </div>
          <p className="text-lg text-gray-700 font-medium">
            Personalize sua arte de vendas por fornecedor
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-2 bg-white/95 rounded-2xl shadow-2xl p-8 border border-green-100 h-fit backdrop-blur-md">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-green-700 to-green-600 bg-clip-text text-transparent mb-8">
              Dados da Arte
            </h2>

            <div className="space-y-6">
              {/* Image Upload */}
              <div>
                <Label htmlFor="image" className="text-sm font-semibold text-gray-700 mb-2 block">
                  Foto/Imagem de Fundo
                </Label>
                <div className="relative">
                  <input
                    ref={fileInputRef}
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full px-4 py-3 border-2 border-dashed border-blue-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-sm text-gray-600 font-medium"
                  >
                    {uploadedImage ? "✓ Imagem carregada" : "Clique para fazer upload"}
                  </button>
                </div>
              </div>

              {/* Seller Name */}
              <div>
                <Label htmlFor="vendedor" className="text-sm font-semibold text-gray-700 mb-2 block">
                  Nome do Vendedor
                </Label>
                <Input
                  id="vendedor"
                  type="text"
                  placeholder="Ex: João Silva"
                  value={vendedor}
                  onChange={(e) => setVendedor(e.target.value)}
                  className="text-base"
                />
              </div>

              {/* Date */}
              <div>
                <Label htmlFor="data" className="text-sm font-semibold text-gray-700 mb-2 block">
                  Data
                </Label>
                <Input
                  id="data"
                  type="date"
                  value={data}
                  onChange={(e) => setData(e.target.value)}
                  className="text-base"
                />
              </div>

              {/* Modo de Cálculo - NOVO */}
              <div>
                <Label className="text-sm font-semibold text-gray-700 mb-3 block">
                  Modo de Entrada de Valores
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setModoCalculo("fornecedor")}
                    className={`px-4 py-3 rounded-lg font-medium transition-all ${
                      modoCalculo === "fornecedor"
                        ? "bg-blue-600 text-white shadow-lg"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    📦 Por Fornecedor
                  </button>
                  <button
                    onClick={() => setModoCalculo("direto")}
                    className={`px-4 py-3 rounded-lg font-medium transition-all ${
                      modoCalculo === "direto"
                        ? "bg-blue-600 text-white shadow-lg"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    💰 Valor Direto
                  </button>
                </div>
              </div>

              {/* Conteúdo Condicional baseado no modo */}
              {modoCalculo === "fornecedor" ? (
                <>
                  {/* Add Fornecedor */}
                  <div>
                    <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                      Adicionar Fornecedor Manual
                    </Label>
                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        placeholder="Fornecedor"
                        value={fornecedorInput}
                        onChange={(e) => setFornecedorInput(e.target.value)}
                        list="fornecedorList"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                      <datalist id="fornecedorList">
                        {FORNECEDORES_LISTA.map((f) => (
                          <option key={f} value={f} />
                        ))}
                      </datalist>
                      <input
                        type="text"
                        placeholder="Valor (R$)"
                        value={valorInput}
                        onChange={(e) => setValorInput(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Ganho (R$)"
                        value={ganhoInput}
                        onChange={(e) => setGanhoInput(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        onKeyPress={(e) => {
                          if (e.key === "Enter") adicionarFornecedor();
                        }}
                      />
                      <button
                        onClick={adicionarFornecedor}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm"
                      >
                        +
                      </button>
                    </div>

                    {/* Fornecedores List */}
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {Object.keys(fornecedores).length === 0 ? (
                        <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-500">
                          Nenhum fornecedor adicionado
                        </div>
                      ) : (
                        Object.entries(fornecedores).map(([fornecedor, dados]) => (
                          <div
                            key={fornecedor}
                            className="flex justify-between items-center bg-blue-50 p-3 rounded-lg text-sm"
                          >
                            <span className="font-medium text-gray-800 flex-1">{fornecedor}</span>
                            <span className="text-gray-600 flex-1">Valor: {dados.valor}</span>
                            <span className="text-green-600 font-semibold flex-1">Ganho: {dados.ganho}</span>
                            <button
                              onClick={() => removerFornecedor(fornecedor)}
                              className="text-red-600 hover:text-red-800 ml-2"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Valores Diretos */}
                  <div>
                    <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                      Informar Valores Totais Diretamente
                    </Label>
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="totalValoresDireto" className="text-xs text-gray-600 mb-1 block">
                          Total de Valores
                        </Label>
                        <Input
                          id="totalValoresDireto"
                          type="text"
                          placeholder="Ex: 15000.00"
                          value={totalValoresDireto}
                          onChange={(e) => setTotalValoresDireto(e.target.value)}
                          className="text-base"
                        />
                      </div>
                      <div>
                        <Label htmlFor="totalGanhosDireto" className="text-xs text-gray-600 mb-1 block">
                          Total de Ganhos
                        </Label>
                        <Input
                          id="totalGanhosDireto"
                          type="text"
                          placeholder="Ex: 3000.00"
                          value={totalGanhosDireto}
                          onChange={(e) => setTotalGanhosDireto(e.target.value)}
                          className="text-base"
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Totals */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                <div>
                  <Label className="text-sm font-semibold text-gray-700 mb-2 block">Total Valores</Label>
                  <Input
                    type="text"
                    value={"R$ " + totais.valores.toFixed(2).replace(".", ",")}
                    readOnly
                    className="text-base bg-blue-50"
                  />
                </div>
                <div>
                  <Label className="text-sm font-semibold text-gray-700 mb-2 block">Total Ganhos</Label>
                  <Input
                    type="text"
                    value={"R$ " + totais.ganhos.toFixed(2).replace(".", ",")}
                    readOnly
                    className="text-base bg-green-50"
                  />
                </div>
                <div>
                  <Label className="text-sm font-semibold text-gray-700 mb-2 block">A Liberar</Label>
                  <Input
                    type="text"
                    value={"R$ " + totais.aLiberar.toFixed(2).replace(".", ",")}
                    readOnly
                    className="text-base bg-yellow-50"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="pt-4 space-y-3">
                <Button
                  onClick={handleGenerate}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 text-base rounded-lg shadow-lg shadow-blue-200 transition-all"
                >
                  <Wand2 className="w-4 h-4 mr-2" />
                  Gerar Arte
                </Button>

                {canGenerate && (
                  <Button
                    onClick={handleDownload}
                    variant="outline"
                    className="w-full border-2 border-green-600 text-green-600 hover:bg-green-50 font-bold py-3 text-base rounded-lg transition-all"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Baixar Imagem
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Canvas Preview Section */}
          <div className="flex flex-col">
            <h2 className="text-2xl font-bold text-white drop-shadow-lg mb-6">Prévia</h2>
            <div className="flex-1 bg-white/95 rounded-2xl shadow-2xl p-6 border border-green-100 flex flex-col items-center justify-center backdrop-blur-md">
              <canvas
                ref={canvasRef}
                width={1080}
                height={1350}
                className="max-w-full h-auto rounded-xl shadow-md"
              />
              <p className="mt-6 text-sm text-gray-500 italic text-center">
                Formato 1080x1350 (Instagram/WhatsApp)
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
