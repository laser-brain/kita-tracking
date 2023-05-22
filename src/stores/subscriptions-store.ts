import useUsers from "@/stores/user-store";
import useDatabase from "@/stores/database-store";

import { defineStore } from "pinia";
import {
  subscribeToPush,
  unsubscribeFromPush,
  loadSubscription,
} from "@/database/mongodb.connect";
import { ISubscription } from "@/database/documents";

const publicVapidKey =
  "BL6FOoHVZKQOhwQ-qMZ893uy9TgpzSDTu_HnnPIIqdbCKqY1qO7UrmWUCWUbkPYeXZXry6QW0UpJ5qmTHk7QMzc";

const urlBase64ToUint8Array = (base64String: string) => {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

const store = defineStore("subscriptions", () => {
  const dbStore = useDatabase();
  const user = useUsers();

  let userSubscription: ISubscription | null = null;

  const getSubscription = async () => {
    userSubscription = await loadSubscription(
      await dbStore.getDbUser(),
      user.username
    );

    return userSubscription;
  };

  const subscribe = async (): Promise<ISubscription | null> => {
    if (!("serviceWorker" in navigator)) return null;

    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
    });
    const jsonData = subscription.toJSON();
    if (!jsonData.keys) {
      console.error(
        `could not parse subscription data from ${JSON.stringify(subscription)}`
      );
      return null;
    }

    userSubscription = {
      username: user.username,
      endpoint: subscription.endpoint,
      p256dh: jsonData.keys["p256dh"] || "",
      auth: jsonData.keys["auth"] || "",
    };

    await subscribeToPush(await dbStore.getDbUser(), userSubscription);

    return getSubscription();
  };

  const unsubscribe = async (): Promise<ISubscription | null> => {
    if (!userSubscription?._id) {
      return null;
    }
    unsubscribeFromPush(await dbStore.getDbUser(), userSubscription._id);

    return getSubscription();
  };

  return {
    getSubscription,
    subscribe,
    unsubscribe,
  };
});

export default store;
