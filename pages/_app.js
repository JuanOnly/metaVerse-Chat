import "../styles/globals.css";
import { MoralisProvider } from "react-moralis";

function MyApp({ Component, pageProps }) {
  return (
    <MoralisProvider
      apiKey={process.env.NEXT_PUBLIC_MORALIS_API_KEY}
    >
      <Component {...pageProps} />
    </MoralisProvider>
  );
}

export default MyApp;
