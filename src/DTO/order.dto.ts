export class orderDTO{
    orderId:Number;
    userId:Number;
    productName:String;
    details:String;
    shopId:Number;
    beginDate:Date;
    active:boolean;
    groups:Array<Number>;
}