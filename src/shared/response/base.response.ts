export interface IBaseResponse {
  statusCode: number;
  message: string;
}

export interface ISuccessResponse<T> extends IBaseResponse {
  data: T;
}
