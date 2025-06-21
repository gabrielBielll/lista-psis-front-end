// src/utils/logger.js
import { initializeFaro, getWebInstrumentations } from '@grafana/faro-web-sdk';

// Lê a URL do endpoint do Grafana a partir das suas variáveis de ambiente
const GRAFANA_FARO_URL = import.meta.env.VITE_GRAFANA_FARO_URL;

let faro;

// Inicia o Grafana Faro apenas se a URL estiver configurada
if (GRAFANA_FARO_URL) {
  faro = initializeFaro({
    url: GRAFANA_FARO_URL,
    app: {
      name: 'lista-psis-frontend', // Pode customizar o nome da sua aplicação
      version: '1.0.0', // Pode customizar a versão
    },
    instrumentations: [
      // Captura automaticamente erros, performance, etc. (Opcional, mas recomendado)
      ...getWebInstrumentations(),
    ],
  });
} else {
  // Aviso para o caso de a variável não estar configurada
  console.warn("URL do Grafana Faro não encontrada. Logs serão enviados apenas para o console.");
}

/**
 * logger.js
 * Versão atualizada para enviar logs para o Grafana Cloud (Loki) usando o Faro SDK.
 */
const logger = {
  log: (message, context = {}) => {
    // Mantém o log no console para depuração local
    console.log(message, context);
    // Envia o log para o Grafana se estiver configurado
    if (faro) {
      faro.api.pushLog([message], {
        level: 'info',
        context: context,
      });
    }
  },
  info: (message, context = {}) => {
    console.info(message, context);
    if (faro) {
      faro.api.pushLog([message], {
        level: 'info',
        context: context,
      });
    }
  },
  warn: (message, context = {}) => {
    console.warn(message, context);
    if (faro) {
      faro.api.pushLog([message], {
        level: 'warn',
        context: context,
      });
    }
  },
  error: (message, context = {}) => {
    console.error(message, context);
    if (faro) {
      faro.api.pushLog([message], {
        level: 'error',
        context: context,
      });
    }
  },
};

// Exporta o objeto logger para ser usado em toda a aplicação
export default logger;
