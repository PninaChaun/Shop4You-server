import { Controller, Post, Delete, Body, Request, Res, Param, Get, UseGuards, Put } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { orderDTO } from 'src/DTO/order.dto';
import { Response } from 'express';
import { AutenticationService } from 'src/autentication/autentication.service';
import { get } from 'http';
import { UserDTO } from 'src/DTO/user.dto';

@Controller('orders')
export class OrdersController {

    constructor(private srv: OrdersService) { }

    @UseGuards(AutenticationService)
    @Post() //Create order
    async create_order(@Request() req, @Body() order: orderDTO, @Res() res: Response) {
        order.userId = req['user'].id;
        let response = await this.srv.insertOrder(order, order.userId)
        res.status(response.stat).send({ orderId: response.orderId })
    }

    @UseGuards(AutenticationService)
    @Get(':orderId') //See who volunteered to buy this order
    async getShopperForOrder(@Request() req, @Param('orderId') order_Id: string, @Res() res: Response) {
        let userId = req['user'].id;
        let orderId = Number.parseInt(order_Id)

        let response = await this.srv.hasShopperId(orderId)

        res.status(response.stat).send(response.shopper)

    }

    @UseGuards(AutenticationService)
    @Post(':otherId') //Get order info
    async getOrderDetails(@Request() req, @Param('otherId') order_Id: string, @Res() res: Response) {
        let userId = req['user'].id;
        let otherId = Number.parseInt(order_Id)

        let response = await this.srv.getOrderDetails(otherId, userId)

        res.status(response.status).send({ current: response.current, other: response.other })
    }

    @UseGuards(AutenticationService)
    @Get() //The orders I placed and not taken
    async getMyOrders(@Request() req, @Res() res: Response) {
        let userId = req['user'].id;
        let response = await this.srv.getMyOrders(userId)

        res.send(response)
    }

    @UseGuards(AutenticationService)
    @Delete(':orderId') //Delete order
    async deleteOrder(@Request() req, @Param('orderId') orderId: string, @Res() res: Response) {
        let userId = req['user'].id;

        let response = await this.srv.deleteOrder(parseInt(orderId), userId)

        res.send(response)
    }

}
