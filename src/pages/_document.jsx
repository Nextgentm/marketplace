import Document, { Html, Head, Main, NextScript } from "next/document";

class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps };
  }

  render() {
    return (
      <Html>
        <Head>
          <script async defer src="https://static.moonpay.com/web-sdk/v1/moonpay-web-sdk.min.js" />

          <script async src="https://www.googletagmanager.com/gtag/js?id=G-3GQ2PWGVXR"></script>
          <script dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-3GQ2PWGVXR');`}}
          />

          <script defer dangerouslySetInnerHTML={{
            __html:
              ` var clevertap = { event: [], profile: [], account: [], onUserLogin:[] };
        
              clevertap.account.push({ "id": "${process.env.NEXT_PUBLIC_CLEVER_TAP_PROJECT}" });// prod
              (function () {
                var wzrk = document.createElement('script');
                wzrk.type = 'text/javascript';
                wzrk.async = true;
                wzrk.src = ('https:' == document.location.protocol ? 'https://d2r1yp2w7bby2u.cloudfront.net' : 'http://static.clevertap.com') + '/js/a.js';
                var s = document.getElementsByTagName('script')[0];
                s.parentNode.insertBefore(wzrk, s);
            })();`,
          }}
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

export default MyDocument;
