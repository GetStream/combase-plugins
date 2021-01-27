"use strict";

exports.__esModule = true;
exports.testZendesk = void 0;

const testZendesk = async ({
  data,
  organization
}, {
  gql,
  request,
  log
}) => {
  const [name, email, message, ticketID] = data.body.message.split(',');
  const {
    user
  } = await request(gql`
		mutation ($record: UserInput!) {
			user: getOrCreateUser(record: $record) {
				_id
			}
		}
	`, {
    record: {
      email,
      organization,
      name
    }
  });
  log.info(`☎️  Zendesk Event from User: ${user._id} for Org: ${organization}`);
  const ticket = await request(gql`
		mutation ($message: String, $user: MongoID!) {
			ticket: createTicket(message: $message, user: $user) {
				_id
			}
		}
	`, {
    message,
    user: user._id
  });
};

exports.testZendesk = testZendesk;