import * as Realm from "realm-web";
import {
  IEmployee,
  IChild,
  ITrackingDataDocument,
  ObjectId,
} from "@/database/documents";

type collection = "time-tracking" | "employees" | "children";

interface DBResult<T> {
  result: T;
}

export interface IUser {
  functions: any;
}

interface ICheckPasswordResult {
  success: boolean;
  username: string;
  isAdmin: boolean;
  isEducator: boolean;
  isParent: boolean;
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
  read(user, "employees", { isEducator: true });

export const getTrackingData = async (
  user: any,
  employee: string,
  dateFrom?: Date,
  dateTo?: Date
): Promise<ITrackingDataDocument[]> => {
  const filter: {
    employee?: string;
    startTime?: { $gte?: Date; $lte?: Date };
  } = {};
  if (employee) {
    filter.employee = employee;
  }
  if (dateFrom || dateTo) {
    filter.startTime = {};
    if (dateFrom) {
      filter.startTime.$gte = dateFrom;
    }
    if (dateTo) {
      filter.startTime.$lte = dateTo;
    }
  }
  return read<ITrackingDataDocument[]>(user, "time-tracking", filter);
};

export const getChildren = async (
  user: any,
  username: string
): Promise<IChild[]> => {
  return read<IChild[]>(user, "children", { parent: username });
};

export const updateChildren = async (
  user: any,
  children: IChild[]
): Promise<void> => {
  const promises: Promise<ObjectId | undefined>[] = [];
  children.forEach(async (child) =>
    promises.push(write<IChild>(user, "children", child))
  );
  await Promise.all(promises);
};

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
