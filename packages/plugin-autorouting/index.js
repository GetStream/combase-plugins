"use strict";

exports.__esModule = true;
exports.assignTicket = void 0;

const setAgentUnavailable = ticketId => gql => [gql`
        mutation assignTicket($ticket: MongoID!, $status: EnumTicketStatus) {
            ticketAssign(ticket: $ticket, status: $status) {
                _id
            }
        }
    `, {
  ticket: ticketId,
  status: "unassigned"
}];

const addToChat = (agent, ticketId) => gql => [gql`
        mutation assignTicket($agent: MongoID, $ticket: MongoID!, $status: EnumTicketStatus) {
            ticketAssign(agent: $agent, ticket: $ticket, status: $status) {
                _id
            }
        }
    `, {
  agent: agent._id.toString(),
  ticket: ticketId,
  status: "open"
}];

const assignTicket = async (event, {
  gql,
  log,
  request
}) => {
  var _event$data$_id, _event$data$_id$toStr;

  const ticketId = (_event$data$_id = event.data._id) === null || _event$data$_id === void 0 ? void 0 : (_event$data$_id$toStr = _event$data$_id.toString) === null || _event$data$_id$toStr === void 0 ? void 0 : _event$data$_id$toStr.call(_event$data$_id);

  try {
    const {
      agents
    } = await request(gql`
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
            `);
    let agent;
    /** No Agents - Set Unavailable */

    if (!(agents !== null && agents !== void 0 && agents.length)) return request(...setAgentUnavailable(ticketId)(gql));
    /** Only 1 agent - Assign to this agent */

    if (agents.length === 1) agent = agents[0];
    /** Multiple Available Agents - Decide on the most suitable agent */

    if (agents.length > 1) {
      /*
       * should handle an array available agents (more than 1)
       * need to balance by tickets open/completed
       * then pick rand
       */
      const randIdx = Math.floor(Math.random() * agents.length); // TEMP: Replace with the above sorting/find mechanism.

      agent = agents[randIdx];
    }

    return request(...addToChat(agent, ticketId.toString())(gql));
  } catch (error) {
    log.error(error);
  }
};

exports.assignTicket = assignTicket;