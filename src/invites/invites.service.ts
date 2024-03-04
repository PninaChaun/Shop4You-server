import { Injectable } from '@nestjs/common';
import { inviteDTO } from 'src/DTO/invite.dto';
import { DataBaseConnectionService } from 'src/data-base-connection/data-base-connection.service';

@Injectable()
export class InvitesService {
    constructor(private srv: DataBaseConnectionService) { }

    getMyInvites = async (userId) => {
        let invites: inviteDTO[] = await this.srv.getMyInvites(userId)


        let invitesDetails = []
        for (let i = 0; i < invites.length; i++) {
            let currentInvite = invites[i]
            let inviterName = await this.srv.getUserName(currentInvite.inviterId)
            let name = await this.srv.getUserName(userId)

            let groupName = await this.srv.getGroupName(currentInvite.groupId)

            invitesDetails.push({ id: currentInvite.id, name: name, email: currentInvite.email, inviterName: inviterName, groupName: groupName, groupId: currentInvite.groupId })
        }

        return invitesDetails
    }

    JoinGroup = async (inviteId, userId) => {
        let invite: inviteDTO = await this.srv.getInvite(inviteId)

        await this.srv.addMember(invite.groupId, userId)
        return await this.srv.removeInvite(invite.groupId, invite.id)
    }

    leaveInvite = async (inviteId) => {
        let invite: inviteDTO = await this.srv.getInvite(inviteId)
        return await this.srv.removeInvite(invite.groupId, inviteId)
    }
}
