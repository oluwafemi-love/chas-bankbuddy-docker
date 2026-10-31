"use client";
import React from "react";
import { createUser } from "@/app/lib/client";

export default function RegisterPage() {
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");

  async function handleSubmit(
    event: React.SubmitEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    // console.log("REGISTER FORM SUBMITTED");

    const finalUsername =
      username.trim() ||
      `${firstName.toLowerCase()}-${lastName.toLowerCase()}`;

    // console.log("Username being sent:", finalUsername);

    try {
      const user = await createUser({
        username: finalUsername,
        password,
      });

      console.log("User Created: ", user);

      //Clear the UI after submission
      clearUI();
    } catch (error) {
      console.error("Registeration failed: ", error);
    }
  }

  return (
    <form
      className="mx-auto my-8 flex w-full max-w-md flex-col gap-5 rounded-xl border border-gray-200 bg-background p-6 shadow-sm"
      onSubmit={(event) => handleSubmit(event)}
    >
      <div className="flex flex-col gap-2">
        <label
          htmlFor="user-first-name"
          className="text-sm font-medium text-foreground"
        >
          First Name
        </label>

        <input
          type="text"
          name="user-first-name"
          id="user-first-name"
          placeholder="Your First Name"
          className="rounded-lg border border-gray-300 px-4 py-3 text-foreground outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          value={firstName}
          autoComplete="name"
          onChange={(event) => setFirstName(event.target.value)}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="user-last-name"
          className="text-sm font-medium text-foreground"
        >
          Last Name
        </label>

        <input
          type="text"
          name="user-last-name"
          id="user-last-name"
          placeholder="Your Last Name"
          className="rounded-lg border border-gray-300 px-4 py-3 text-foreground outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          value={lastName}
          autoComplete="name"
          onChange={(event) => setLastName(event.target.value)}
        />
      </div>

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
          placeholder="Your Username"
          className="rounded-lg border border-gray-300 px-4 py-3 text-foreground outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
        />
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
          className="rounded-lg border border-gray-300 px-4 py-3 text-foreground outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </div>

      <button
        type="submit"
        className="mt-2 rounded-lg bg-blue-600 px-4 py-3 font-medium text-foreground transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 active:bg-blue-800"
      >
        Create Account
      </button>
    </form>
  );

  function clearUI() {
    setFirstName("");
    setLastName("");
    setUsername("");
    setPassword("");
  }
}
