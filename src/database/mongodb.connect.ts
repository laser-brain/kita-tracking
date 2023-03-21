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

export const getEmployees = async (user: any): Promise<IEmployee[]> => {
  const employees: DBResult<IEmployee[]> = await user.functions.loadEmployees();
  return employees.result;
};

export const getTrackingData = async (
  user: any,
  employee: string,
  dateFrom: Date
): Promise<ITrackingDataDocument[]> => {
  const data: DBResult<ITrackingDataDocument[]> =
    await user.functions.loadTrackingData(employee, dateFrom);
  return data.result;
};
