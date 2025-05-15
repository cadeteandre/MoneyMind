import { Locale } from '../i18n/settings';
import { useTranslation } from '../i18n';
import Link from 'next/link';
import { i18n } from '../i18n/settings';

export default async function Home({
  params: { lng }
}: {
  params: { lng: Locale }
}) {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { t } = await useTranslation(lng);

  return (
    <main>
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold">MoneyMind</h1>
        <div className="mt-4">
          <Link href={`/${lng}/dashboard`} className="bg-blue-500 text-white px-4 py-2 rounded">
            {t('common.goDashboard')}
          </Link>
        </div>
        <div className="mt-4">
          <h2 className="text-xl font-semibold mb-2">{t('common.switchLanguage')}</h2>
          <div className="flex gap-3">
            {i18n.locales.map((locale) => (
              <Link 
                key={locale} 
                href={`/${locale}`}
                className={`px-3 py-1 border rounded ${locale === lng ? 'bg-blue-100' : ''}`}
              >
                {locale.toUpperCase()}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}