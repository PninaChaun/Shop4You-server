import { Injectable } from '@nestjs/common';
import { groupDTO } from 'src/DTO/group.dto';
import { inviteDTO } from 'src/DTO/invite.dto';
import { DataBaseConnectionService } from 'src/data-base-connection/data-base-connection.service';
import { EmailService } from 'src/email/email.service';

@Injectable()
export class GroupsService {

    constructor(private srv:DataBaseConnectionService, private email:EmailService){}

    getMyGroups = async(userId)=>{
        let groups = await this.srv.getMyGroups(userId)
        return groups
    }

    getMembers =async (group_id)=>{
        return await this.srv.getMembers(group_id)
    }

    getInvites =async (group_id)=>{
        return await this.srv.getInvites(group_id)
    }

    async isMember(group_id,email){
        let members =await this.srv.getMembers(group_id)
        if(members)
        {
            for(let i =0; i< members.length; i++){
            let member =members[i]
            // let member = await this.srv.getUser(member_id)
            if(member.email == email){
                return true
            }
        }
        
        }
        return false
    }

    async isInvite(group_id,email){
        let invites =await this.srv.getInvites(group_id)
        
        if(invites){
            for(let i =0; i< invites.length; i++){
                let invite =invites[i]
                // let member = await this.srv.getUser(member_id)
                if(invite.email == email){
                    return true
                }
            }
        }
       
        return false
    }

    async insertinvite(invite:inviteDTO){

        let invite_id = await this.srv.insertinvite(invite);
        let response = this.srv.addToGroupInvite(invite.groupId, invite_id)
        
        let inviterName = await this.srv.getUserName(invite.inviterId)
        let groupName =await this.srv.getGroupName(invite.groupId)
        this.email.sendEmail(invite.email,' shop4you הצטרפות לקבוצה באפלקצית ', 'היי' + invite.name+","+'\n הוזמנת ע"י '+inviterName +'\n להצטרף לקבוצת: '+ groupName)

        return response;
    }

    async CreateGroup(group:groupDTO, member_id){
        let group_Id = await this.srv.CreateGroup(group, member_id)
        return await this.srv.addMember(group_Id, member_id)
        
    }
    
    async DeleteMember(group_Id, member_id){
        return await this.srv.DeleteMember(group_Id, member_id)
    }
}
