export type ClientDataType = {
  name: string;
  room: string;
};

export type ResponseType = {
  status: boolean;
  message?: string;
};

export enum SocketStateEnum {
  'idle',
  'joining',
  'joined',
}
