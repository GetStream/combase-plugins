import gql from 'graphql-tag';

export const setAgentUnavailable = (...args) => console.log('set unavailable', ...args);
export const addToChat = (agent, ticketId) => [
    gql`
        mutation assignTicket($agent: MongoID!, $ticket: MongoID!, $status: EnumTicketStatus) {
            ticketAssign(agent: $agent, ticket: $ticket, status: $status) {
                _id
            }
        }
    `,
    {
        agent: agent._id.toString(),
        ticket: ticketId,
        status: "open",
    }
];

export const assignTicket = async (event, {request}) => {
    const ticketId = event._id?.toString?.();
    const organization = event.data?.fullDocument?.organization?.toString?.();

    try {
        const { agents } = await request(
            gql`
                query getAvailableAgents {
                    agents: agentsAvailable {
                        _id
                        name {
                            display
                        }
                        available
                        email
                        role
                        avatar
                    }
                }
            `
        );
        
        let agent;

		/** No Agents - Set Unavailable */
		if (!agents?.length) return setAgentUnavailable(ticketId, organization);

		/** Only 1 agent - Assign to this agent */
		if (agents.length === 1) agent = agents[0];

		/** Multiple Available Agents - Decide on the most suitable agent */
		if (agents.length > 1) {
			/*
			 * should handle an array available agents (more than 1)
			 * need to balance by tickets open/completed
			 * then pick rand
			 */

			const randIdx = Math.floor(Math.random() * agents.length);

			// TEMP: Replace with the above sorting/find mechanism.
			agent = agents[randIdx];
		}

        return request(...addToChat(agent, ticketId.toString()));
        
    } catch (error) {
        console.log(error);
    }
};