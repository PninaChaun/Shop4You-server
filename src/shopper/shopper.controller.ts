import { Body, Controller, Post, Get, Request, Res, UseGuards, Param, Put } from '@nestjs/common';
import { ShopperService } from './shopper.service';
import { AutenticationService } from 'src/autentication/autentication.service';
import { ShopperDTO } from 'src/DTO/shopper';
import { Response } from 'express';

@Controller('shopper')
export class ShopperController {

    constructor(private srv: ShopperService) { }

    @UseGuards(AutenticationService)
    @Post() //Save go to store
    async goToStore(@Request() req, @Body() shopper: ShopperDTO, @Res() res: Response) {
        shopper.userId = req['user'].id;

        let shopId = await this.srv.insertShopper(shopper)

        res.send(JSON.stringify(shopId))
    }

    @UseGuards(AutenticationService)
    @Put(':date') //Looking for new orders
    async getPotentialCustomers(@Request() req, @Param('date') dateTime: string, @Body() body: any, @Res() res: Response) {
        let id = req['user'].id;
        let shopId = parseInt(body.shopId)
        let date = new Date(dateTime)
        let response = await this.srv.findPotentialCustomer(id, date, shopId);
        res.send(response);

    }

    @UseGuards(AutenticationService)
    @Post(':orderId') //Buying an order
    async saveBuy(@Request() req, @Param('orderId') oId: string, @Body() body: any, @Res() res: Response) {
        let orderId = Number.parseInt(oId)
        let status = await this.srv.saveBuy(Number.parseInt(body.shopId), orderId)
        res.status(status).send()
    }

    @UseGuards(AutenticationService)
    @Get() //Check if in shop now
    async IfInShop(@Request() req, @Res() res: Response) {
        let userId = req['user'].id;

        let shop = await this.srv.IfInShop(userId)


        res.send(shop)
    }

    @UseGuards(AutenticationService)
    @Put() //Leave shop
    async leaveShop(@Request() req, @Res() res: Response) {
        let userId = req['user'].id;

        let response = await this.srv.leaveShop(userId);
        res.send(response);

    }
}