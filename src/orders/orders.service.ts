import { Injectable, UseGuards } from '@nestjs/common';
import { request } from 'http';
import { orderDTO } from 'src/DTO/order.dto';
import { ShopperDTO } from 'src/DTO/shopper';
import { UserDTO } from 'src/DTO/user.dto';
import { DataBaseConnectionService } from 'src/data-base-connection/data-base-connection.service';

@Injectable()
export class OrdersService {
    constructor(private srv: DataBaseConnectionService) { }

    insertOrder(order: orderDTO, userId: Number) {
        order.shopId = null;
        order.active = true;
        order.beginDate = new Date()
        let response = this.srv.insertOrder(order, userId);
        return response;
    }

    async hasShopperId(orderId: Number) {
        let col = await this.srv.getOrder_hasShopperId(orderId);

        col = col[0]
        if (col.shopId) {
            let shopper = await this.srv.getShop(col.shopId)
            let user = await this.srv.getUser(shopper.userId)

            return { stat: 201, shopper: { shopper, user } };
        }
        return { stat: 200, shopper: null };
    }

    async getOrderDetails(otherId, userId) {
        let user: UserDTO = await this.srv.getUser(userId)
        let other: UserDTO = await this.srv.getUser(otherId)

        if (user && other) {

            if (user.id == userId)
                return { current: user, other: other, status: 200 }
            else if (other.id == userId)
                return { current: other, other: user, status: 200 }
            else
                return { current: null, other: null, status: 400 }
        }
        else {
            return { current: null, other: null, status: 400 }

        }
    }

    async getMyOrders(userId) {
        return await this.srv.getMyOrders(userId)
    }

    async deleteOrder(orderId, userId) {
        await this.srv.deactivateOrder(orderId, userId)

    }

}
