export type ResponseHandler<T = Record<string, any>> = Promise<ResponseMessage<T>>
export interface ResponseMessage<T> {
    success: boolean;
    result?: boolean| string| T;
    message?: string;
}
 