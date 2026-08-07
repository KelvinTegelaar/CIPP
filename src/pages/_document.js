import { Children } from 'react';
import Document, { Head, Html, Main, NextScript } from 'next/document';
import createEmotionServer from '@emotion/server/create-instance';
import { createEmotionCache } from '../utils/create-emotion-cache';

class CustomDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          {/* Runs before first paint. The served HTML is the light prerender - a
              fully drawn light page plus SSR'd CssBaseline body background - so
              for dark-mode users it flashes white for as long as the bundle takes
              to load and hydrate. When the effective theme resolves dark (stored
              explicit choice wins, 'browser'/no stored settings falls back to the
              OS preference - same order as _app.js), paint the page dark and hide
              the stale light prerender. _app.js removes the style once React has
              painted the themed UI; a timeout failsafe unhides if hydration never
              completes. Hex is dark high-contrast background.default. */}
          <script
            dangerouslySetInnerHTML={{
              __html:
                "(function(){try{var m='light';var s=null;try{s=JSON.parse(localStorage.getItem('app.settings')||'null')}catch(e){}var v=s&&s.currentTheme&&s.currentTheme.value;if(v==='dark'){m='dark'}else if(!v||v==='browser'){if(window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches){m='dark'}}document.documentElement.style.colorScheme=m;if(m==='dark'){var st=document.createElement('style');st.id='cipp-color-init';st.textContent='html{background-color:#0A0F18}body{background-color:#0A0F18!important;visibility:hidden}';document.head.appendChild(st);setTimeout(function(){var e=document.getElementById('cipp-color-init');if(e){e.textContent='html{background-color:#0A0F18}body{background-color:#0A0F18!important}'}},4000)}}catch(e){}})()",
            }}
          />
          <link rel="manifest" href="/manifest.json" />
          <meta name="theme-color" content="#ffffff" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
          <meta name="apple-mobile-web-app-title" content="CIPP" />
          <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
          <link
            rel="preconnect"
            href="https://fonts.googleapis.com"
          />
          <link
            rel="preconnect"
            href="https://fonts.gstatic.com"
          />
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          />
        </Head>
        <body>
        <Main />
        <NextScript />
        </body>
      </Html>
    );
  }
}

CustomDocument.getInitialProps = async (ctx) => {
  const originalRenderPage = ctx.renderPage;
  const cache = createEmotionCache();
  const { extractCriticalToChunks } = createEmotionServer(cache);

  ctx.renderPage = () => originalRenderPage({
    enhanceApp: (App) => (props) => (
      <App
        emotionCache={cache}
        {...props} />
    )
  });

  const initialProps = await Document.getInitialProps(ctx);
  const emotionStyles = extractCriticalToChunks(initialProps.html);
  const emotionStyleTags = emotionStyles.styles.map((style) => (
    <style
      data-emotion={`${style.key} ${style.ids.join(' ')}`}
      key={style.key}
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: style.css }}
    />
  ));

  return {
    ...initialProps,
    styles: [...Children.toArray(initialProps.styles), ...emotionStyleTags]
  };
};

export default CustomDocument;
