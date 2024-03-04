import { Injectable } from '@nestjs/common';
import { async } from 'rxjs';
import { DataBaseConnectionService } from 'src/data-base-connection/data-base-connection.service';

@Injectable()
export class ChatService {

    constructor(private srv: DataBaseConnectionService) { }

    getMyChats = async (userId: Number) => {
        let chats = await this.srv.getMyChats(userId)
        return chats
    }

    addChat = async (userId, otherId) => {
        await this.srv.addChat(userId, otherId)
    }

    deleteChat = async (userId, otherId) => {
        return await this.srv.deleteChat(userId, otherId)
    }
}
