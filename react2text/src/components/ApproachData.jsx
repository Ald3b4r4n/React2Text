// src/components/ApproachData.jsx
import { useState, useEffect } from "react";

const ApproachData = ({
  formData,
  onFieldChange,
  onEditField,
  onSearchBnmp,
  onSearchPlate,
  ocrText,
}) => {
  const [showVehicleFields, setShowVehicleFields] = useState(
    formData.veiculoCheck
  );
  const [showAnkleBraceletField, setShowAnkleBraceletField] = useState(
    formData.tornozeleiraCheck
  );
  const [showNicknameField, setShowNicknameField] = useState(
    formData.inserirApelido
  );

  // Função para copiar texto para a área de transferência
  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error("Erro ao copiar:", err);
    }
  };

  // Sincroniza os checkboxes de apelido
  const handleApelidoChange = (field, value) => {
    if (field === "inserirApelido" && value) {
      onFieldChange("inserirApelido", true);
      onFieldChange("naoAplicaApelido", false);
      setShowNicknameField(true);
    } else if (field === "naoAplicaApelido" && value) {
      onFieldChange("naoAplicaApelido", true);
      onFieldChange("inserirApelido", false);
      setShowNicknameField(false);
      onFieldChange("apelido", "");
    }
  };

  // Sincroniza os checkboxes de tornozeleira
  const handleTornozeleiraChange = (field, value) => {
    if (field === "tornozeleiraCheck" && value) {
      onFieldChange("tornozeleiraCheck", true);
      onFieldChange("naoAplicaTornozeleira", false);
      setShowAnkleBraceletField(true);
    } else if (field === "naoAplicaTornozeleira" && value) {
      onFieldChange("naoAplicaTornozeleira", true);
      onFieldChange("tornozeleiraCheck", false);
      setShowAnkleBraceletField(false);
      onFieldChange("tornozeleiraNumero", "");
    }
  };

  // Sincroniza os checkboxes de veículo
  const handleVeiculoChange = (field, value) => {
    if (field === "veiculoCheck" && value) {
      onFieldChange("veiculoCheck", true);
      onFieldChange("naoAplicaVeiculo", false);
      setShowVehicleFields(true);
    } else if (field === "naoAplicaVeiculo" && value) {
      onFieldChange("naoAplicaVeiculo", true);
      onFieldChange("veiculoCheck", false);
      setShowVehicleFields(false);
      onFieldChange("veiculoPlaca", "");
      onFieldChange("veiculoCor", "");
      onFieldChange("veiculoModelo", "");
    }
  };

  // Função para extrair placa do texto OCR
  const extractPlateFromOCR = () => {
    if (!ocrText) return;

    const platePatterns = [/[A-Z]{3}[-\s]?\d{4}/, /[A-Z]{3}\d[A-Z]\d{2}/];
    let plateFound = false;

    for (const pattern of platePatterns) {
      const match = ocrText.match(pattern);
      if (match) {
        let plate = match[0]
          .toUpperCase()
          .replace(/\s/g, "")
          .replace(/([A-Z]{3})(\d{4})/, "$1-$2");

        onFieldChange("veiculoPlaca", plate);
        // Só marca "Sim" se uma placa válida foi encontrada
        handleVeiculoChange("veiculoCheck", true);
        plateFound = true;
        break;
      }
    }

    // Se nenhuma placa foi encontrada, mantém "não se aplica"
    if (!plateFound) {
      handleVeiculoChange("naoAplicaVeiculo", true);
    }
  };

  // Extrai placa automaticamente quando o OCR text muda
  useEffect(() => {
    if (ocrText && !formData.veiculoPlaca) {
      extractPlateFromOCR();
    }
  }, [ocrText]);

  // Atualiza a visibilidade quando o formData muda
  useEffect(() => {
    setShowNicknameField(formData.inserirApelido);
    setShowAnkleBraceletField(formData.tornozeleiraCheck);
    setShowVehicleFields(formData.veiculoCheck);
  }, [formData]);

  return (
    <div className="card bg-white bg-opacity-95 rounded-xl shadow-lg border border-blue-200 mb-6">
      <div className="card-body p-6">
        <h5 className="card-title text-blue-900 font-semibold text-center text-xl mb-4 pb-2 border-b-2 border-blue-400 flex items-center justify-center gap-2">
          2. Dados da Abordagem
        </h5>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="form-label text-blue-900 font-medium">
              Abordado:
            </label>
            <div className="flex gap-2">
              <input
                value={formData.abordado}
                onChange={(e) => onFieldChange("abordado", e.target.value)}
                className="form-control flex-1 p-2 border border-gray-300 rounded-lg text-black bg-white"
              />
              <button
                onClick={() => onEditField("abordado")}
                className="btn bg-green-900 hover:bg-green-600 text-white p-2 rounded-lg transition-colors"
              >
                Corrigir
              </button>
              <button
                onClick={() => {
                  copyToClipboard(formData.abordado);
                  onSearchBnmp();
                }}
                className="btn bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg transition-colors"
              >
                <span className="mr-1">🔍</span> BNMP
              </button>
            </div>
          </div>

          <div>
            <label className="form-label text-blue-900 font-medium">
              Naturalidade:
            </label>
            <div className="flex gap-2">
              <input
                value={formData.naturalidade}
                onChange={(e) => onFieldChange("naturalidade", e.target.value)}
                className="form-control flex-1 p-2 border border-gray-300 rounded-lg text-black bg-white"
              />
              <button
                onClick={() => onEditField("naturalidade")}
                className="btn bg-green-900 hover:bg-green-600 text-white p-2 rounded-lg transition-colors"
              >
                Corrigir
              </button>
            </div>
          </div>

          <div>
            <label className="form-label text-blue-900 font-medium">
              Genitora:
            </label>
            <div className="flex gap-2">
              <input
                value={formData.genitora}
                onChange={(e) => onFieldChange("genitora", e.target.value)}
                className="form-control flex-1 p-2 border border-gray-300 rounded-lg text-black bg-white"
              />
              <button
                onClick={() => onEditField("genitora")}
                className="btn bg-green-900 hover:bg-green-600 text-white p-2 rounded-lg transition-colors"
              >
                Corrigir
              </button>
            </div>
          </div>

          <div>
            <label className="form-label text-blue-900 font-medium">
              Apelido:
            </label>
            <div className="flex gap-4 mb-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.inserirApelido}
                  onChange={(e) =>
                    handleApelidoChange("inserirApelido", e.target.checked)
                  }
                  className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-gray-700 text-sm">Inserir apelido</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.naoAplicaApelido}
                  onChange={(e) =>
                    handleApelidoChange("naoAplicaApelido", e.target.checked)
                  }
                  className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-gray-700 text-sm">Não se aplica</span>
              </label>
            </div>
            <input
              value={formData.apelido}
              onChange={(e) => onFieldChange("apelido", e.target.value)}
              disabled={!showNicknameField}
              className="form-control w-full p-2 border border-gray-300 rounded-lg disabled:bg-gray-100 text-black bg-white"
            />
          </div>

          <div>
            <label className="form-label text-blue-900 font-medium">
              Data de Nasc.:
            </label>
            <div className="flex gap-2">
              <input
                value={formData.dn}
                onChange={(e) => onFieldChange("dn", e.target.value)}
                className="form-control flex-1 p-2 border border-gray-300 rounded-lg text-black bg-white"
              />
              <button
                onClick={() => onEditField("dn")}
                className="btn bg-green-900 hover:bg-green-600 text-white p-2 rounded-lg transition-colors"
              >
                Corrigir
              </button>
            </div>
          </div>

          <div>
            <label className="form-label text-blue-900 font-medium">CPF:</label>
            <div className="flex gap-2">
              <input
                value={formData.cpf}
                onChange={(e) => onFieldChange("cpf", e.target.value)}
                className="form-control flex-1 p-2 border border-gray-300 rounded-lg text-black bg-white"
              />
              <button
                onClick={() => onEditField("cpf")}
                className="btn bg-green-900 hover:bg-green-600 text-white p-2 rounded-lg transition-colors"
              >
                Corrigir
              </button>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <label className="form-label text-blue-900 font-medium">
            Antecedentes:
          </label>
          <input
            value={formData.antecedentes}
            onChange={(e) => onFieldChange("antecedentes", e.target.value)}
            className="form-control w-full p-2 border border-gray-300 rounded-lg text-black bg-white"
          />
        </div>

        <div className="mb-4">
          <label className="form-label text-blue-900 font-medium">
            Endereço:
          </label>
          <input
            value={formData.endereco}
            onChange={(e) => onFieldChange("endereco", e.target.value)}
            className="form-control w-full p-2 border border-gray-300 rounded-lg text-black bg-white"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="form-label text-blue-900 font-medium">
              Local da abordagem:
            </label>
            <input
              value={formData.local}
              onChange={(e) => onFieldChange("local", e.target.value)}
              className="form-control w-full p-2 border border-gray-300 rounded-lg text-black bg-white"
            />
          </div>
          <div>
            <label className="form-label text-blue-900 font-medium">
              Equipe:
            </label>
            <input
              value={formData.equipe}
              onChange={(e) => onFieldChange("equipe", e.target.value)}
              className="form-control w-full p-2 border border-gray-300 rounded-lg text-black bg-white"
            />
          </div>
        </div>

        <div className="observation-section bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
          <h6 className="observation-title text-blue-900 font-semibold text-lg mb-3">
            Observações Adicionais
          </h6>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="form-label text-blue-900 font-medium block mb-2">
                Possui tornozeleira?
              </label>
              <div className="flex gap-4 mb-3">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.tornozeleiraCheck}
                    onChange={(e) =>
                      handleTornozeleiraChange(
                        "tornozeleiraCheck",
                        e.target.checked
                      )
                    }
                    className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-gray-700">Sim</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.naoAplicaTornozeleira}
                    onChange={(e) =>
                      handleTornozeleiraChange(
                        "naoAplicaTornozeleira",
                        e.target.checked
                      )
                    }
                    className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-gray-700">Não se aplica</span>
                </label>
              </div>

              {showAnkleBraceletField && (
                <div className="mt-2">
                  <label className="form-label text-blue-900 font-medium">
                    Número:
                  </label>
                  <input
                    value={formData.tornozeleiraNumero}
                    onChange={(e) =>
                      onFieldChange("tornozeleiraNumero", e.target.value)
                    }
                    className="form-control w-full p-2 border border-gray-300 rounded-lg text-black bg-white"
                  />
                </div>
              )}
            </div>

            <div className="overflow-hidden">
              <label className="form-label text-blue-900 font-medium block mb-2">
                Está de veículo?
              </label>
              <div className="flex gap-4 mb-3">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.veiculoCheck}
                    onChange={(e) =>
                      handleVeiculoChange("veiculoCheck", e.target.checked)
                    }
                    className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-gray-700">Sim</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.naoAplicaVeiculo}
                    onChange={(e) =>
                      handleVeiculoChange("naoAplicaVeiculo", e.target.checked)
                    }
                    className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-gray-700">Não se aplica</span>
                </label>
              </div>

              {showVehicleFields && (
                <div className="mt-2 space-y-2">
                  <div>
                    <label className="form-label text-blue-900 font-medium">
                      Placa:
                    </label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        value={formData.veiculoPlaca}
                        onChange={(e) =>
                          onFieldChange("veiculoPlaca", e.target.value)
                        }
                        className="form-control flex-1 p-2 border border-gray-300 rounded-lg text-black bg-white min-w-0"
                      />
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => onEditField("veiculoPlaca")}
                          className="btn bg-green-900 hover:bg-green-600 text-white px-3 py-2 rounded-lg transition-colors text-sm whitespace-nowrap"
                        >
                          Corrigir
                        </button>
                        <button
                          onClick={() => {
                            copyToClipboard(formData.veiculoPlaca);
                            onSearchPlate();
                          }}
                          className="btn bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg transition-colors text-sm whitespace-nowrap"
                        >
                          <span className="mr-1">🔍</span> Consultar
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="form-label text-blue-900 font-medium">
                        Cor:
                      </label>
                      <input
                        value={formData.veiculoCor}
                        onChange={(e) =>
                          onFieldChange("veiculoCor", e.target.value)
                        }
                        className="form-control w-full p-2 border border-gray-300 rounded-lg text-black bg-white"
                      />
                    </div>
                    <div>
                      <label className="form-label text-blue-900 font-medium">
                        Modelo:
                      </label>
                      <input
                        value={formData.veiculoModelo}
                        onChange={(e) =>
                          onFieldChange("veiculoModelo", e.target.value)
                        }
                        className="form-control w-full p-2 border border-gray-300 rounded-lg text-black bg-white"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApproachData;
