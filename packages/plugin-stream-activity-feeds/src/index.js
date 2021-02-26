export const onTicketCreated = (event, { gql, request }) => {
	const { fullDocument } = event.data.body;
    try {
        const userId = fullDocument.user.toString();
        const organizationId = fullDocument.organization.toString();
        const ticketId = fullDocument._id.toString();

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

export const onTicketAssigned = (event, { gql, request }) => {
	const { fullDocument } = event.data.body;

    const organizationId = fullDocument.organization.toString();
    const ticketId = fullDocument._id.toString();

    const ticketFeed = `ticket:${ticketId}`;

    const baseActivity = {
        object: ticketId,
        entity: 'Ticket',
        verb: event.trigger,
    };

	const agentId = fullDocument.agents[0].toString();
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

export const onTicketUnassigned = (event, { gql, request }) => {
	const { fullDocument } = event.data.body;

    const organizationId = fullDocument.organization.toString();
    const ticketId = fullDocument._id.toString();

    const ticketFeed = `ticket:${ticketId}`;

    const baseActivity = {
        object: ticketId,
        entity: 'Ticket',
        verb: event.trigger,
    };

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
	);
}

