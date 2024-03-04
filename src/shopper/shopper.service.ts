import { Injectable } from '@nestjs/common';
import { orderDTO } from 'src/DTO/order.dto';
import { ShopperDTO } from 'src/DTO/shopper';
import { UserDTO } from 'src/DTO/user.dto';
import { DataBaseConnectionService } from 'src/data-base-connection/data-base-connection.service';

@Injectable()
export class ShopperService {

    constructor(private srv: DataBaseConnectionService) { }

    async insertShopper(shopper: ShopperDTO) {
        shopper.active = true;
        shopper.datetime = new Date();

        const status = await this.srv.insertShopper(shopper);
        return status;
    }

    async findPotentialCustomer(userId: Number, prevTime: Date, shopId: Number) {
        // let myGroups = await this.srv.getMyGroups(userId)
        let shop: ShopperDTO = await this.srv.getShop(shopId)
        let myGroups = shop.groups
        console.log(myGroups);


        let ordersUsers = []
        return this.srv.getAllOrders(myGroups, prevTime).then(
            async (o) => {
                let orders: orderDTO[] = o['col']
                for (let i = 0; i < orders.length; i++) {
                    let order = orders[i]
                    let user = await this.srv.getUser(order.userId)

                    ordersUsers.push({ order, user })
                }
            }).then(r => {
                return { col: ordersUsers, newPrevDate: new Date() }
            })
    }

    async saveBuy(shopId: number, orderId: number) {

        const status = await this.srv.updateOrder_addShopperId(shopId, orderId)
        return status
    }

    async IfInShop(userId: Number) {
        return await this.srv.IfInShop(userId)
    }

    async leaveShop(userId: Number) {
        let user: UserDTO = await this.srv.getUser(userId)
        console.log(user, 'ser - user');

        await this.srv.deactivateShopper(user.shopId)
    }

}
