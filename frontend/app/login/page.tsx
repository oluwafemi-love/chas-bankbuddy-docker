"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { loginUser } from "../lib/client";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");

  async function handleSubmit(
    event: React.SubmitEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    try {
      const response = await loginUser({ username, password });

      //save token in a storage upon loggin in
      sessionStorage.setItem("token", response.session.token);
      //save username in a storage
      sessionStorage.setItem("username", username);

      //create dispatchEvent. //Todo: learn more about this
      window.dispatchEvent(new Event("auth-change"));
      
      //redirect or link to account page
      router.push("/account");

      // console.log("Logged in successfully: ", response);
      // console.log("TOKEN: ", response.session.token);
    } catch (error) {
      console.error("Problem encountered with login: ", error);
    }

    setUsername("");
    setPassword("");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto flex w-full max-w-md flex-col gap-6 rounded-xl border border-gray-200 bg-background p-6 shadow-sm"
    >
      <div className="flex flex-col gap-2">
        <label
          htmlFor="username"
          className="text-sm font-medium text-foreground"
        >
          Username
        </label>

        <input
          type="text"
          name="username"
          id="username"
          placeholder="John-Smith"
          autoComplete="username"
          required
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          className="rounded-lg border border-gray-300 px-4 py-3 text-foreground outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
        />

        <span className="text-sm leading-5 text-muted-foreground">
          Your username by default is your firstname-lastname, if you have not set it.
          Example: John Smith → john-smith
        </span>
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="password"
          className="text-sm font-medium text-foreground"
        >
          Password
        </label>

        <input
          type="password"
          name="password"
          id="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="rounded-lg border border-gray-300 px-4 py-3 text-foreground outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
        />
      </div>

      <button
        type="submit"
        className="rounded-lg bg-primary px-4 py-3 font-medium text-primary-foreground transition hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 active:bg-blue-800"
      >
        Login
      </button>
    </form>
  );
}
