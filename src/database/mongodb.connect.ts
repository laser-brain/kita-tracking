import * as Realm from "realm-web";
import {
  IEmployee,
  ITrackingDataDocument,
  ObjectId,
} from "@/database/documents";

type collection = "time-tracking" | "employees";

interface DBResult<T> {
  result: T;
}

export interface IUser {
  functions: any;
}

interface ICheckPasswordResult {
  success: boolean;
}

export const authenticate = async (): Promise<IUser | null> => {
  const app = new Realm.App({ id: "time-tracking-mptdz" });
  const credentials = Realm.Credentials.anonymous();
  try {
    const user = (await app.logIn(credentials)) as IUser;
    return user;
  } catch (err) {
    console.error("Failed to log in", err);
    return null;
  }
};

export const getEmployees = async (user: any): Promise<IEmployee[]> =>
  read(user, "employees");

export const getTrackingData = async (
  user: any,
  employee: string,
  dateFrom: Date
): Promise<ITrackingDataDocument[]> =>
  read<ITrackingDataDocument[]>(user, "time-tracking", {
    employee: employee,
    startTime: { $gte: dateFrom },
  });

export const addTrackingData = async (
  user: any,
  data: ITrackingDataDocument
): Promise<ObjectId | undefined> => write(user, "time-tracking", data);

export const removeTrackingData = async (
  user: any,
  id: ObjectId | undefined
) => {
  if (!id) {
    console.error("No id was provided for deletion request");
    return;
  }
  del(user, "time-tracking", id);
};

export const checkPassword = async (
  user: any,
  username: string,
  password: string
) => {
  const result = await user.functions.checkPassword(username, password);
  console.log(result);

  return result as ICheckPasswordResult;
};

const write = async <T>(
  user: any,
  collection: collection,
  document: T
): Promise<ObjectId | undefined> => {
  const data = await user.functions.insertDocument(collection, document);
  return data.upsertedId as ObjectId;
};

const read = async <T>(
  user: any,
  collection: collection,
  filter?: any
): Promise<T> => {
  const data: DBResult<T> = await user.functions.collectionRequest(
    collection,
    filter
  );

  return data.result;
};

const del = async (
  user: any,
  collection: collection,
  id: ObjectId
): Promise<void> => {
  await user.functions.deleteRequest(collection, id);
};
