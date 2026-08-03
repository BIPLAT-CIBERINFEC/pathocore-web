import Head from "next/head";
import SignInPage from "@/components/Layouts/UseCaseSignIn";

export default function SignIn() {
  return (
    <>
      <Head>
        <title>Sign In | Request Access</title>
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
        <SignInPage />
      </main>
    </>
  );
}
