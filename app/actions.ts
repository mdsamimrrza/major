"use server";
import { currentUser } from "@clerk/nextjs/server";

export async function getEmail() {
  try {
    const user = await currentUser();

    if (!user) return null;

    return user.emailAddresses.map((email) => ({
      emailAddress: email.emailAddress,
    }));
  } catch (error) {
    console.error("Error fetching user email:", error);
    return null;
  }
}
