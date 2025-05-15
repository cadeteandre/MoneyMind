module.exports = {
  i18n: {
    defaultLocale: 'pt', // Idioma padrão
    locales: ['pt', 'en', 'es', 'de'], // Idiomas suportados
    localeDetection: false, // Desativar detecção automática
  },
  reloadOnPrerender: process.env.NODE_ENV === 'development', // Recarrega traduções em desenvolvimento
};