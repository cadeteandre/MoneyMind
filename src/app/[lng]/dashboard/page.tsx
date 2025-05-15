// import { Locale } from '../../i18n/settings';
// import { useTranslation } from '../../i18n';
// import Link from 'next/link';

// export default async function Dashboard({
//   params: { lng }
// }: {
//   params: { lng: Locale }
// }) {
//   // eslint-disable-next-line react-hooks/rules-of-hooks
//   const { t } = await useTranslation(lng);

//   return (
//     <div className="container mx-auto p-4">
//       <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
//       <div className="mb-4">
//         <Link href={`/${lng}`} className="text-blue-500 hover:underline">
//           &larr; {t('common.backToHome')}
//         </Link>
//       </div>
//       <div className="bg-white p-6 rounded-lg shadow-md">
//         <p>{t('common.dashboardWelcome')}</p>
//       </div>
//     </div>
//   );
// } 