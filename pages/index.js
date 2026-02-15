import Head from "next/head";
import Login from "../components/Login";
import { useMoralis } from "react-moralis";
import Header from "../components/Header";
import Messages from "../components/Messages";

export default function Home() {
  const { isAuthenticated, logout } = useMoralis();
  // const isAuthenticated = false;
  if (!isAuthenticated) return <Login />;

  return (
    <div className="lg:px-14 h-screen overflow-y-scroll bg-gradient-to-b from-black to-blue-900 overflow-hidden">
      <Head>
        <title>MetaVerse Chat</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="max-w-screen-2xl mx-auto">
        <Header />
        <Messages />
      </div>

      <a href="/about" className="fixed bottom-5 right-5 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-full text-sm z-50">
        About
      </a>
    </div>
  );
}
