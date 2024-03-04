
export class UserDTO{
    id:number;
    email:string;
    name:string;
    password:string;
    saveOrder:Number;
    saveStore:Number;
    groups:Array<Number>;
    chat:Array<Number>;
    orders:Array<Number>;
    shopId:Number;
}