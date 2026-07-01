import Head from 'next/head';
import VehicleRetirementForm from '../VehicleRetirementForm';

export default function Home() {
  return (
    <>
      <Head>
        <title>Vehicle Retirement Portal | Frontline Pest Control</title>
        <meta name="description" content="Submit vehicles for retirement and disposal" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#003366" />

        {/* PWA Meta Tags */}
        <meta name="apple-mobile-web-app-capable" content="true" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Vehicle Retirement" />
        <link rel="apple-touch-icon" href="/icon-192.png" />

        {/* Manifest */}
        <link rel="manifest" href="/manifest.json" />

        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />

        {/* Preconnect */}
        <link rel="preconnect" href="https://api.monday.com" />
      </Head>

      <VehicleRetirementForm />

      {/* Service Worker Registration */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js').then(
                  function(registration) {
                    console.log('Service Worker registered:', registration);
                  },
                  function(error) {
                    console.log('Service Worker registration failed:', error);
                  }
                );
              });
            }
          `,
        }}
      />
    </>
  );
}
