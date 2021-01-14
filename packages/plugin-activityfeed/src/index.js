import gql from 'graphql-tag';

export const onTicketCreated = (event, { request }) => {
    try {
        const userId = event.data.fullDocument.user.toString();
        const organizationId = event.data.fullDocument.organization.toString();
        const ticketId = event.data.fullDocument._id.toString();

        const userFeed = `user:${userId}`;
        const ticketFeed = `ticket:${ticketId}`;
        const organizationFeed = `organization:${organizationId}`;

        const activity = {
            actor: userId,
            object: ticketId,
            entity: 'Ticket',
            text: 'New Ticket',
            verb: event.trigger,
        };

        return request(gql`
            mutation createTicketCreatedActivity($userFeed: StreamID!, $organizationFeed: StreamID!, $ticketFeed: StreamID!, $activity: StreamAddActivityInput!) {
                userFollowTicket: follow(feed: $userFeed, toFollow: $ticketFeed) {
                    id
                }

                orgFollowTicket: follow(feed: $organizationFeed, toFollow: $ticketFeed) {
                    id
                }

                addActivity(feed: $ticketFeed, activity: $activity) {
                    id
                }
            }
        `, {
            userFeed,
            organizationFeed,
            ticketFeed,
            activity,
        })
    } catch (error) {
        console.error(error);
    }
};

export const onTicketUpdated = (event, { request }) => {

    const organizationId = event.data.fullDocument.organization.toString();
    const ticketId = event.data.fullDocument._id.toString();

    const ticketFeed = `ticket:${ticketId}`;

    const baseActivity = {
        object: ticketId,
        entity: 'Ticket',
        verb: event.trigger,
    };

    /** Unassigned Ticket */
    if (event.data.updateDescription.updatedFields.status === 'unassigned') {
       const activity = {
           ...baseActivity,
           text: 'Missed Ticket',
           actor: organizationId,
       };

       return request(
            gql`
                mutation createTicketCreatedActivity($ticketFeed: StreamID!, $activity: StreamAddActivityInput!) {
                    addActivity(feed: $ticketFeed, activity: $activity) {
                        id
                    }
                }
            `,
            {
                ticketFeed,
                activity,
            }
       )
    }

    /** Assigned Ticket */
    if (event.data.updateDescription.updatedFields.status === 'open' && event.data.fullDocument.agents.length > 0) {
       const agentId = event.data.fullDocument.agents[0].toString();
       const activity = {
           ...baseActivity,
           object: agentId,
           entity: 'Agent',
           text: 'Assigned Ticket',
           actor: organizationId, // "Org Bot" assigns the ticket.
       };

       return request(
            gql`
                mutation createTicketCreatedActivity($ticketFeed: StreamID!, $activity: StreamAddActivityInput!) {
                    addActivity(feed: $ticketFeed, activity: $activity) {
                        id
                    }
                }
            `,
            {
                ticketFeed,
                activity,
            }
       )
    }
};

