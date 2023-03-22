import * as Realm from "realm-web";
import { IEmployee, ITrackingDataDocument } from "@/database/documents";

interface DBResult<T> {
  result: T;
}

export interface IUser {
  functions: any;
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

export const addTrackingData = async (user: any, data: ITrackingDataDocument) =>
  write(user, "time-tracking", data);

const write = async <T>(
  user: any,
  collection: string,
  document: T
): Promise<void> => {
  await user.functions.insertDocument(collection, document);
};

const read = async <T>(
  user: any,
  collection: string,
  filter?: any
): Promise<T> => {
  console.log(collection, filter);

  const data: DBResult<T> = await user.functions.collectionRequest(
    collection,
    filter
  );
  console.log(data);

  return data.result;
};
