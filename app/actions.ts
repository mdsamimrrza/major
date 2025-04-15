"use server";
import { currentUser } from "@clerk/nextjs/server";

export async function getEmail() {
  const user = await currentUser();

  if (!user) return null;

  return user.emailAddresses.map((email) => ({
    emailAddress: email.emailAddress,
  }));
}
