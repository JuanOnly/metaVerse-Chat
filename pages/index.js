import Head from "next/head";
import Login from "../components/Login";
import { useMoralis } from "react-moralis";

export default function Home() {
  const { isAuthenticated, logout } = useMoralis();
  // const isAuthenticated = false;
  if (!isAuthenticated) return <Login />;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <Head>
        <title>MetaVerse Chat</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <h1>Welcome to the app</h1>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
