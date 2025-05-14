module.exports = {
    i18n: {
      defaultLocale: 'pt', // Idioma padrão
      locales: ['pt', 'en', 'es', 'de'], // Idiomas suportados
      localeDetection: true, // Detecta o idioma do navegador automaticamente
    },
    reloadOnPrerender: process.env.NODE_ENV === 'development', // Recarrega traduções em desenvolvimento
  };