import Hero from "./components/Hero";

export default function Home() {
  return (
    <>
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-background">
        <Hero
          title="Banking Buddy"
          subtitle="Banking App of the now and future"
          primaryCtaText="Create Account"
          primaryCtaLink="/register"
          secondaryCtaText="Login"
          secondaryCtaLink="/login"
          align="center"
        />
      </div>
    </>
  );
}
