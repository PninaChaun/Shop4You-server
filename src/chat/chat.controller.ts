import { ChatService } from './chat.service';
import { Body, Controller, Post, Request, Res, Param, Get, UseGuards, Put } from '@nestjs/common';
import { Response } from 'express';
import { AutenticationService } from 'src/autentication/autentication.service';

@Controller('chat')
export class ChatController {

    constructor(private srv: ChatService) { }

    @UseGuards(AutenticationService)
    @Get() //All open chats
    async getMyChats(@Request() req, @Res() res: Response) {
        let userId = req['user'].id;
        let chats = await this.srv.getMyChats(userId)
        res.send(chats)

    }

    @UseGuards(AutenticationService)
    @Post(':otherId') //Add chat to my-chats
    async addChat(@Request() req, @Param('otherId') otherId: string, @Res() res: Response) {
        let userId = req['user'].id;

        await this.srv.addChat(userId, parseInt(otherId))
        res.send()
    }

    @UseGuards(AutenticationService)
    @Put(':chatId') //Remove chat from my-chats
    async deleteChat(@Request() req, @Param('chatId') chatId: string, @Res() res: Response) {
        let userId = req['user'].id;
        let stat = await this.srv.deleteChat(userId, parseInt(chatId))
        res.status(stat).send()
    }
}
