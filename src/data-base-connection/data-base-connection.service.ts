import { Injectable } from '@nestjs/common';
import { orderDTO } from 'src/DTO/order.dto';
import { ShopperDTO } from 'src/DTO/shopper';
import { UserDTO } from 'src/DTO/user.dto';
const { MongoClient } = require('mongodb');
import { group, log } from 'console';
import { inviteDTO } from 'src/DTO/invite.dto';
import { groupDTO } from 'src/DTO/group.dto';
import { EmailService } from 'src/email/email.service';
const client = new MongoClient("mongodb://shopforcommunity:pnina&hm@ac-tnsyddv-shard-00-00.tq3q4yi.mongodb.net:27017,ac-tnsyddv-shard-00-01.tq3q4yi.mongodb.net:27017,ac-tnsyddv-shard-00-02.tq3q4yi.mongodb.net:27017/?replicaSet=atlas-b1zzr7-shard-0&ssl=true&authSource=admin");
// const client = new MongoClient("mongodb://localhost:27017");
client.connect(err => {
    if (err) {
        console.error('Failed to connect to MongoDB!', err);
        return;
    }
}
)
const db = client.db('project');

@Injectable()
export class DataBaseConnectionService {

    getUser = async (id: Number) => {
        let col = await db.collection('users').findOne({ id: id })

        return col;
    }

    getUserByEmail = async (email: string) => {
        return await db.collection('users').findOne({ email: email })
    }

    getGroup = async (id: Number) => {
        let col = await db.collection('groups').findOne({ id: id })
        return col;
    }

    getInvite = async (id: Number) => {
        let col = await db.collection('invites').findOne({ id: id })
        return col;
    }

    getShop = async (id: Number) => {
        let col = await db.collection('shoppers').findOne({ shopId: id });
        return col;
    }

    updateUser = async (user: UserDTO) => {
        let u = await this.getUser(user.id)

        db.collection('users').deleteOne({ id: user.id }).then(
            db.collection('users').insertOne({ ...u, ...user })
        )
        //TODO AFTER change delete-insert to replace
        // u = { ...u, ...user}
        //db.collection('users').replaceOne({ id: user.id },{...u})

        return 200;
    }

    emailAvailable = async (email: string) => {
        let used = await db.collection('users').findOne({ email: email })
        if (used)
            return false
        else
            return true
    }

    insertUser = async (user: UserDTO) => {
        let newId = await this.getNextSequenceValue('users')
        user.saveOrder = user.saveOrder

        db.collection('users').insertMany([{ ...user, id: newId, groups: [], chat: [], orders: [], shopId: -1 }])
        return newId
    }

    getAllOrders = async (user_groups: any, prevTime: Date) => {
        let orders = []
        let allOrders = await db.collection('orders').find({ active: true, beginDate: { $gt: prevTime } }).toArray()
        for (let i = 0; i < allOrders.length; i++) { //orders
            for (let j = 0; j < user_groups.length; j++) { //groups of shopper
                for (let k = 0; k < allOrders[i].groups.length; k++) { //groups of order
                    if (user_groups[j] == allOrders[i].groups[k]) {
                        orders.push(allOrders[i])
                        break
                    }
                }

            }

        }

        return {
            col: orders, newPrevDate: new Date()
        }


    }


    insertOrder = async (order: orderDTO, userId) => {
        try {
            let newId = await this.getNextSequenceValue('orders')

            order.orderId = newId

            let u = await this.getUser(order.userId)
            let ms = u.saveOrder * 60 * 1000 * 60 * 60

            db.collection('orders').insertMany([{ ...order }])
            db.collection('users').updateOne({ id: u.id }, { $set: { orders: [...u.orders, order.orderId] } })

            setTimeout(() => {
                this.deactivateOrder(order.orderId, userId)
            }, ms);

            return { stat: 201, orderId: newId };

        }
        catch {
            return { stat: 500, orderId: null };
        }
    }

    //TODO לשמור את השעה של saveOrder saveStore int not string
    deactivateOrder = async (orderId: Number, userId) => {
        db.collection('orders').updateOne({ orderId: orderId }, { $set: { active: false } })
        let user = await this.getUser(userId)
        db.collection('users').updateOne({ id: userId }, { $set: { orders: [...user.orders.filter(o => o != orderId)] } })

        return 200;
    }

    deactivateShopper = async (shopId: Number) => {
        db.collection('shoppers').updateOne({ shopId: shopId }, { $set: { active: false } })
        return 200;
    }

    private getOrder = async (orderId) => {
        let col = db.collection('orders').findOne({ orderId: orderId });
        return col;
    }

    updateOrder_addShopperId = async (shopId: number, orderId: Number) => {
        let o = await this.getOrder(orderId)
        if (!o.active)
            return 404;

        await db.collection('orders').updateOne({ orderId: orderId }, { $set: { active: false, shopId: shopId } })
        return 200;
    }

    async insertShopper(shopper: ShopperDTO) {
        let newId = await this.getNextSequenceValue('shoppers')
        db.collection('shoppers').insertMany([{ ...shopper, shopId: newId }])
        db.collection('users').updateOne({ id: shopper.userId }, { $set: { shopId: newId } })
        let u = await this.getUser(shopper.userId)
        let ms = u.saveStore * 60 * 60 * 1000

        setTimeout(() => {
            this.deactivateShopper(newId)
        }, ms);
        return newId;
    }

    async getNextSequenceValue(sequenceName) {
    // Get a reference to the sequence collection
    const sequenceCollection = db.collection('sequence');

    // Find the sequence document and update its value
    const result = await sequenceCollection.findOneAndUpdate(
        { collection: sequenceName },
        { $inc: { nextId: 1 } },
        { upsert: true, returnOriginal: false }
    );

    // Return the updated sequence value
    return result.value.nextId;
}

getOrder_hasShopperId = (orderId) => {
    //TODO find where shopperId not null
    let col = db.collection('orders').find({ orderId: orderId }).toArray();
    return col;
}

getGroupName = async (groupId) => {
    let group = await this.getGroup(groupId)
    return group.name
}

getMyGroups = async (userId) => {
    let user = await db.collection('users').findOne({ id: userId })

    if (user) {
        let groups_id = user['groups']

        let groups = []
        for (let i = 0; i < groups_id.length; i++) {
            let g_id = parseInt(groups_id[i])
            let groupName = await this.getGroupName(g_id)
            let groupIdName = { id: g_id, name: groupName }

            groups.push(groupIdName)

        }
        return groups
    }
}

getMembers = async (group_id) => {
    let group = await db.collection('groups').findOne({ id: group_id })
    if (group) {

        let members = []

        for (let i = 0; i < group['members'].length; i++) {
            let member_id = parseInt(group['members'][i])

            let member = await this.getUser(member_id)
            members.push({ id: member_id, name: member['name'], email: member['email'], member: true })
        }

        return members
    }

}

getInvites = async (group_id) => {
    let group = await db.collection('groups').findOne({ id: group_id })
    if (group) {
        let invites = []

        for (let i = 0; i < group['invites'].length; i++) {
            let invite_id = parseInt(group['invites'][i])

            let member = await this.getInvite(invite_id)
            invites.push({ id: invite_id, name: member['name'], email: member['email'], member: false })
        }

        return invites
    }

}

    async insertinvite(invite: inviteDTO) {
    let newId = await this.getNextSequenceValue('invites')

    await db.collection('invites').insertMany([{ ...invite, id: newId }])
    return newId;
}

    async addToGroupInvite(group_id, invite_id) {
    let group = await this.getGroup(group_id)

    await db.collection('groups').updateOne({ id: group_id }, { $set: { invites: [...group['invites'], invite_id] } })
    return 201;
}

    async CreateGroup(group: groupDTO, member_id) {
    let newId = await this.getNextSequenceValue('groups')

    await db.collection('groups').insertMany([{ ...group, id: newId, members: [], invites: [] }])

    return newId;
}

    async addMember(group_id, user_id) {
    let group: groupDTO = await this.getGroup(group_id)
    let user = await this.getUser(user_id)
    if (group && user) {
        await db.collection('users').updateOne({ id: user_id }, { $set: { groups: [...user['groups'], group_id] } })
        await db.collection('groups').updateOne({ id: group_id }, { $set: { members: [...group['members'], user_id] } })
        return 200
    }
}

    async DeleteMember(group_id, user_id) {
    let group = await this.getGroup(group_id)
    let user = await this.getUser(user_id)
    if (group && user) {
        await db.collection('users').updateOne({ id: user_id }, { $set: { groups: [...user['groups'].filter((g) => g != group_id)] } })
        await db.collection('groups').updateOne({ id: group_id }, { $set: { members: [...group['members'].filter((m) => m != user_id)] } })

        return 200
    }
    else {
        return 400
    }
}

getMyInvites = async (userId) => {
    let user = await this.getUser(userId)
    let invites = await db.collection('invites').find({ email: user.email }).toArray()
    return invites
}

getUserName = async (userId) => {
    let user = await this.getUser(userId);
    return user.name
}

removeInvite = async (groupId, inviteId) => {
    let group: groupDTO = await this.getGroup(groupId)
    await db.collection('groups').updateOne({ id: groupId }, { $set: { invites: [...group['invites'].filter((g) => g != inviteId)] } })
    await db.collection('invites').deleteOne({ id: inviteId })
    return 201
}

addChat = async (userId1, userId2) => {
    let user1: UserDTO = await this.getUser(userId1)
    let user2: UserDTO = await this.getUser(userId2)
    if (user1 && user2) {
        if (!user1.chat.includes(userId2))
            await db.collection('users').updateOne({ id: userId1 }, { $set: { chat: [...user1.chat, userId2] } })
        if (!user2.chat.includes(userId1))
            await db.collection('users').updateOne({ id: userId2 }, { $set: { chat: [...user2.chat, userId1] } })

    }

}

getMyChats = async (userId) => {
    let user: UserDTO = await db.collection('users').findOne({ id: userId })

    if (user) {
        let chat_ids = user['chat']
        let chat = []
        for (let i = 0; i < chat_ids.length; i++) {
            let c_id = chat_ids[i]


            let userName = await this.getUserName(c_id)
            let chatIdName = { id: c_id, name: userName }

            chat.push(chatIdName)

        }
        return chat
    }
}

deleteChat = async (userId, otherId) => {
    let user = await this.getUser(userId)
    db.collection('users').updateOne({ id: userId }, { $set: { chat: [...user.chat.filter(c => c != otherId)] } })
    return 201
}

getMyOrders = async (userId) => {
    let user = await db.collection('users').findOne({ id: userId })

    if (user) {
        let orderIds = user['orders']

        let orders = []
        for (let i = 0; i < orderIds.length; i++) {
            let orderId = parseInt(orderIds[i])
            let order: orderDTO = await this.getOrder(orderId)
            if (order.active) {
                orders.push(order)
            }
        }
        return orders
    }
}

dropCollections = async () => {
    db.collection('users').drop()
    db.collection('orders').drop()
    db.collection('invites').drop()
    db.collection('groups').drop()
    db.collection('shoppers').drop()

}

IfInShop = async (userId: Number) => {
    let user = await this.getUser(userId)

    let shop = await this.getShop(user.shopId)

    return shop ?? { active: false }
}

changePassword = async (email, newPassword) => {
    let user: UserDTO = await this.getUserByEmail(email)
    await db.collection('users').updateOne({ id: user.id }, { $set: { password: newPassword } })

    return { id: user.id, username: user.name }
}
}

//TODO maybe save once user in group